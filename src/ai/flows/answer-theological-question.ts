'use server';
/**
 * @fileOverview Answers theological questions based on a provided library of Bible interpretations.
 *
 * - answerTheologicalQuestion - A function that answers theological questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import { AnswerTheologicalQuestionInputSchema, AnswerTheologicalQuestionOutputSchema, type AnswerTheologicalQuestionInput, type AnswerTheologicalQuestionOutput } from '@/ai/schemas';

export async function answerTheologicalQuestion(input: AnswerTheologicalQuestionInput): Promise<AnswerTheologicalQuestionOutput> {
  return answerTheologicalQuestionFlow(input);
}

const PromptInputSchema = z.object({
  question: z.string().describe('The theological question to answer.'),
  documents: z.array(z.object({
    content: z.string(),
    fileName: z.string(),
  })).describe('A library of documents to search for answers.'),
});

const answerTheologicalQuestionPrompt = ai.definePrompt({
  name: 'answerTheologicalQuestionPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: AnswerTheologicalQuestionOutputSchema },
  prompt: `You are a friendly and wise theological expert. Your goal is to help users understand complex topics by providing clear, elaborate, and conversational answers.

Engage the user in a thoughtful way. Your answer should be comprehensive and well-structured. Start with a friendly opening. Use paragraphs to explain concepts and feel free to use bullet points or lists if it helps clarify information.

Base your answer ONLY on the content of the provided documents. Do not use any other information.

If you cannot answer the question based on the documents, politely explain that the provided library does not contain the information needed to answer the question fully.

Your final output must be a JSON object that includes two keys: "answer" (your full, conversational response) and "sourceFiles" (an array of the file names from the provided documents that you used).

User's Question: {{{question}}}

Relevant Documents:
{{#each documents}}
---
File: {{{fileName}}}
Content:
{{{content}}}
---
{{/each}}

Now, please provide your thoughtful answer in the specified JSON format.`,
});

const answerTheologicalQuestionFlow = ai.defineFlow(
  {
    name: 'answerTheologicalQuestionFlow',
    inputSchema: AnswerTheologicalQuestionInputSchema,
    outputSchema: AnswerTheologicalQuestionOutputSchema,
  },
  async (input) => {
    if (!input || typeof input !== 'object' || input === null) {
      throw new Error('Invalid input to flow: input must be an object.');
    }

    const result = await ai.embed({
      embedder: 'googleai/text-embedding-004',
      content: input.question,
    });
    const embedding = result[0].embedding;

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
        answer: "I couldn't find any relevant information in my knowledge base to answer your question. Please try rephrasing it.",
        sourceFiles: [],
      };
    }

    const relevantDocuments = documents.map((doc: { content: string; file_name: string }) => ({
      content: doc.content,
      fileName: doc.file_name,
    }));

    const augmentedInput = { ...input, documents: relevantDocuments };
    const response = await answerTheologicalQuestionPrompt(augmentedInput);
    const output = response?.output;

    if (!output || typeof output !== 'object' || output === null) {
      return {
        answer: "I'm sorry, I had trouble generating a complete response. The AI model might be overloaded. Could you please try asking again?",
        sourceFiles: [],
      };
    }

    const finalOutput = {
      answer: output.answer || 'The AI returned a response without an answer text.',
      sourceFiles: Array.isArray(output.sourceFiles) ? output.sourceFiles : [],
    };

    if (finalOutput.sourceFiles.length > 0) {
      const retrievedFileNames = relevantDocuments.map(d => d.fileName);
      finalOutput.sourceFiles = finalOutput.sourceFiles.filter(fileName => retrievedFileNames.includes(fileName));
    }

    return finalOutput;
  }
);
