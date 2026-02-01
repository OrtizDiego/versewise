// src/ai/flows/find-relevant-passages.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to find relevant Bible passages based on a query.
 *
 * - findRelevantPassages - A function that takes a query and returns a list of relevant Bible passages.
 */

import {ai} from '@/ai/genkit';
import { FindRelevantPassagesInputSchema, FindRelevantPassagesOutputSchema, type FindRelevantPassagesInput, type FindRelevantPassagesOutput } from '@/ai/schemas';
import { searchBibleText } from '@/lib/bible-data';

export async function findRelevantPassages(input: FindRelevantPassagesInput): Promise<FindRelevantPassagesOutput> {
  return findRelevantPassagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRelevantPassagesPrompt',
  input: {schema: FindRelevantPassagesInputSchema},
  output: {schema: FindRelevantPassagesOutputSchema},
  prompt: `You are a helpful assistant that helps users find relevant Bible passages based on their query.

  Given the following query, find relevant Bible passages:
  {{query}}

  Return a JSON array of Bible passages that are relevant to the query. Each passage should include the book, chapter, verse(s), and text.
  Make sure the verses array contains numbers, not strings.
  Example:
  [
    {
      "book": "John",
      "chapter": 3,
      "verses": [16],
      "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
    }
  ]
  `,
});

const findRelevantPassagesFlow = ai.defineFlow(
  {
    name: 'findRelevantPassagesFlow',
    inputSchema: FindRelevantPassagesInputSchema,
    outputSchema: FindRelevantPassagesOutputSchema,
  },
  async input => {
    if (input.matchType === 'exact' || input.matchType === 'partial') {
      return await searchBibleText(input.query, input.matchType);
    }

    const response = await prompt(input);
    const output = response?.output;
    
    if (!Array.isArray(output)) {
      console.error('findRelevantPassagesFlow: AI did not return an array.');
      return [];
    }

    return output;
  }
);
