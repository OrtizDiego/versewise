"use server";

import {
  answerTheologicalQuestion,
} from "@/ai/flows/answer-theological-question";
import {
  findRelevantPassages,
} from "@/ai/flows/find-relevant-passages";
import type { AnswerTheologicalQuestionInput, FindRelevantPassagesInput } from "@/ai/schemas";

function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "An unknown error occurred.";
  if (message.includes('API key not valid') || message.includes('provide an API key') || message.includes('API key is invalid')) {
      return "The Google AI API key is invalid or missing. Please check the GOOGLE_API_KEY in your .env file.";
  }
  if (message.includes('[GoogleGenerativeAI Error]')) {
      return "A connection error occurred with the AI service. Please check your API key and network connection.";
  }
  return `An unexpected error occurred: ${message}`;
}

export async function askQuestion(
  input: AnswerTheologicalQuestionInput
) {
  try {
    const result = await answerTheologicalQuestion(input);
    return result;
  } catch (error) {
    console.error("Error in askQuestion action:", error);
    return { error: getErrorMessage(error) };
  }
}

export async function searchPassages(
  input: FindRelevantPassagesInput
) {
  try {
    const result = await findRelevantPassages(input);
    return result;
  } catch (error) {
    console.error("Error in searchPassages action:", error);
    return { error: getErrorMessage(error) };
  }
}