'use server';

/**
 * @fileOverview Provides interpretations of a specific Bible verse based on the interpretation library.
 *
 * - interpretVerse - A function that handles the verse interpretation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import { InterpretVerseInputSchema, InterpretVerseOutputSchema, type InterpretVerseInput, type InterpretVerseOutput } from '@/ai/schemas';


export async function interpretVerse(input: InterpretVerseInput): Promise<InterpretVerseOutput> {
  return interpretVerseFlow(input);
}

const PromptInputSchema = InterpretVerseInputSchema.extend({
  documents: z.array(z.object({
    content: z.string(),
    fileName: z.string(),
  })).describe('A library of documents to search for interpretations.'),
});

const prompt = ai.definePrompt({
  name: 'interpretVersePrompt',
  input: { schema: PromptInputSchema },
  output: { schema: InterpretVerseOutputSchema },
  prompt: `You are a friendly and knowledgeable Bible scholar. Your goal is to help users understand Bible verses by providing clear, elaborate, and conversational interpretations based on a curated library.

Engage the user in a thoughtful way. Start with a friendly opening. Your interpretation should be comprehensive and well-structured, using only the information available in the provided library documents.

If the library doesn't contain relevant information, politely explain that you cannot provide an interpretation based on the available materials.

Your final output must be a JSON object that includes two keys: "interpretation" (your full, conversational response) and "sourceFiles" (an array of the file names from the provided documents that you used).

Verse Reference: {{{verseReference}}}
User Question: {{{userQuestion}}}

Relevant Interpretation Library:
{{#each documents}}
---
File: {{{fileName}}}
Content:
{{{content}}}
---
{{/each}}

Now, please provide your thoughtful interpretation in the specified JSON format.
  `,
});

const interpretVerseFlow = ai.defineFlow(
  {
    name: 'interpretVerseFlow',
    inputSchema: InterpretVerseInputSchema,
    outputSchema: InterpretVerseOutputSchema,
  },
  async input => {
    if (!input || typeof input !== 'object' || input === null) {
      throw new Error('Invalid input to flow: input must be an object.');
    }

    const query = `Interpretation for ${input.verseReference}: ${input.userQuestion}`;

    const { embedding } = await ai.embed({
      model: 'googleai/text-embedding-004',
      content: query,
    });

    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 10,
      match_threshold: 0.7,
    });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return {
        interpretation: "I couldn't find any relevant information in my knowledge base to answer this. Please try rephrasing your question.",
        sourceFiles: [],
      };
    }

    const relevantDocuments = documents.map((doc: { content: string; file_name: string }) => ({
      content: doc.content,
      fileName: doc.file_name,
    }));

    const augmentedInput = { ...input, documents: relevantDocuments };
    const response = await prompt(augmentedInput);
    const output = response?.output;

    if (!output || typeof output !== 'object' || output === null) {
      return {
        interpretation: "I'm sorry, I had trouble generating a complete interpretation. The AI model might be overloaded. Could you please try asking again?",
        sourceFiles: [],
      };
    }

    const finalOutput = {
      interpretation: output.interpretation || 'The AI returned a response without an interpretation text.',
      sourceFiles: Array.isArray(output.sourceFiles) ? output.sourceFiles : [],
    };

    if (finalOutput.sourceFiles.length > 0) {
      const retrievedFileNames = relevantDocuments.map(d => d.fileName);
      finalOutput.sourceFiles = finalOutput.sourceFiles.filter(fileName => retrievedFileNames.includes(fileName));
    }

    return finalOutput;
  }
);
