'use server';
/**
 * @fileOverview Generates test cases from a given URL by analyzing the webpage content.
 *
 * - generateTestCasesFromUrl - A function that generates test cases from a given URL.
 * - GenerateTestCasesFromUrlInput - The input type for the generateTestCasesFromUrl function.
 * - GenerateTestCasesFromUrlOutput - The return type for the generateTestCasesFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to generate test cases for.'),
});
export type GenerateTestCasesFromUrlInput = z.infer<typeof GenerateTestCasesFromUrlInputSchema>;

const TestCaseSchema = z.object({
  id: z.string().describe('A unique identifier for the test case.'),
  title: z.string().describe('A descriptive title for the test case.'),
  description: z.string().describe('A detailed description of the test case.'),
  steps: z.array(z.string()).describe('A list of steps to execute the test case.'),
  expectedResult: z.string().describe('The expected result after executing the test case.'),
});

const GenerateTestCasesFromUrlOutputSchema = z.object({
  testCases: z.array(TestCaseSchema).describe('An array of generated test cases.'),
});
export type GenerateTestCasesFromUrlOutput = z.infer<typeof GenerateTestCasesFromUrlOutputSchema>;

export async function generateTestCasesFromUrl(input: GenerateTestCasesFromUrlInput): Promise<GenerateTestCasesFromUrlOutput> {
  return generateTestCasesFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesFromUrlPrompt',
  input: {schema: GenerateTestCasesFromUrlInputSchema},
  output: {schema: GenerateTestCasesFromUrlOutputSchema},
  prompt: `You are an expert test case generator for web applications. Analyze the webpage content at the given URL and generate a comprehensive set of test cases.

  Consider various aspects such as functionality, UI elements, user interactions, and potential error scenarios.

  Ensure that the generated test cases cover different scenarios and provide sufficient detail for execution.

  The test cases must be returned as a JSON array.

  URL: {{{url}}}
  `,
});

const generateTestCasesFromUrlFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFromUrlFlow',
    inputSchema: GenerateTestCasesFromUrlInputSchema,
    outputSchema: GenerateTestCasesFromUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
