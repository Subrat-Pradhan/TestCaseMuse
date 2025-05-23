
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
  id: z.string().describe('A unique identifier for the test case. This will be overridden by the client.'),
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
  prompt: `You are an expert test case generator for web applications. Your task is to analyze the webpage content at the given URL: {{{url}}}

Focus on the following:
1.  **Identify Interactive Elements**: Scan the page for all interactive elements such as buttons, links, input fields, forms, dropdown menus, checkboxes, radio buttons, etc.
2.  **Actions & Interactions**: For each interactive element, determine the primary actions a user can perform (e.g., click, submit, type text, select option).
3.  **Test Case Generation**:
    *   For buttons and clickable elements (like links that act like buttons): Generate test cases that verify their presence and the immediate outcome of clicking them (e.g., "Verify 'Submit' button navigates to confirmation page", "Check 'Login' button attempts authentication").
    *   For forms and input fields: Generate test cases for submitting the form with valid/invalid data (if inferable), or simply verifying the presence of key input fields.
    *   For other UI elements: Generate test cases to verify their visibility and, if applicable, their default state.

Your generated test cases should be comprehensive and actionable. Each test case must include:
-   A clear 'title'.
-   A 'description' of what is being tested.
-   A list of 'steps' to perform the test.
-   The 'expectedResult' of performing those steps.

The test cases must be returned as a JSON array, conforming to the provided output schema. Prioritize functionality directly observable from the page content.
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
    // Ensure output is not null and testCases array exists, even if empty
    return output || { testCases: [] };
  }
);

