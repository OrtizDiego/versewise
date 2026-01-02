import {z} from 'genkit';

// Schema for answer-theological-question.ts
export const AnswerTheologicalQuestionInputSchema = z.object({
  question: z.string().describe('The theological question to answer.'),
});
export type AnswerTheologicalQuestionInput = z.infer<typeof AnswerTheologicalQuestionInputSchema>;

export const AnswerTheologicalQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the theological question, grounded in the provided library.'),
  sourceFiles: z.array(z.string()).describe('The list of .md files from the provided documents that you used to formulate the response.'),
});
export type AnswerTheologicalQuestionOutput = z.infer<typeof AnswerTheologicalQuestionOutputSchema>;

// Schema for find-relevant-passages.ts
export const FindRelevantPassagesInputSchema = z.object({
  query: z.string().describe('The query to find relevant Bible passages for.'),
});
export type FindRelevantPassagesInput = z.infer<typeof FindRelevantPassagesInputSchema>;

const PassageSchema = z.object({
  book: z.string().describe('The book of the Bible.'),
  chapter: z.number().describe('The chapter number.'),
  verses: z.array(z.number()).describe('The verse numbers.'),
  text: z.string().describe('The text of the passage.'),
});

export const FindRelevantPassagesOutputSchema = z.array(PassageSchema);
export type FindRelevantPassagesOutput = z.infer<typeof FindRelevantPassagesOutputSchema>;

// Schema for interpret-verse.ts
export const InterpretVerseInputSchema = z.object({
  verseReference: z.string().describe('The Bible verse reference (e.g., John 3:16).'),
  userQuestion: z.string().describe('The specific question about the verse interpretation.'),
});
export type InterpretVerseInput = z.infer<typeof InterpretVerseInputSchema>;

export const InterpretVerseOutputSchema = z.object({
  interpretation: z.string().describe('The interpretation of the Bible verse based on the provided library.'),
  sourceFiles: z.array(z.string()).describe('The list of source files from the provided documents used to generate the interpretation.'),
});
export type InterpretVerseOutput = z.infer<typeof InterpretVerseOutputSchema>;
