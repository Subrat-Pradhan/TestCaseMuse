
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
  prompt: `You are an expert system for generating web application test cases. Your task is to analyze the webpage content at the given URL: {{{url}}}

Follow this multi-step process:

1.  **Element Detection Phase**:
    *   Thoroughly scan the page content accessible from the URL.
    *   Identify all significant interactive UI elements. This includes, but is not limited to:
        *   Buttons (e.g., <button>, <input type="button">, <input type="submit">)
        *   Links that function as interactive controls (e.g., <a> tags styled as buttons or triggering actions)
        *   Input fields (text, email, password, number, etc.)
        *   Selection elements (dropdowns/selects, radio buttons, checkboxes)
        *   Forms and their constituent parts.
    *   For each detected element, note its type (e.g., 'button', 'text input'), visible text/label, and any available identifiers (ID, name, classes that might be relevant for testing).

2.  **Interaction Analysis Phase**:
    *   For each interactive element identified in the previous phase, determine the primary user actions that can be performed on it. Focus heavily on:
        *   **Click actions**: What happens or is expected to happen when a button or clickable link is pressed? (e.g., navigation, form submission, modal display, data update).
        *   **Form submissions**: What is the purpose of any forms on the page?
        *   **Input validation (basic)**: For input fields, consider simple presence checks.
    *   Think about the logical sequence of interactions if applicable (e.g., filling a field then clicking submit).

3.  **Test Scenario Generation Phase**:
    *   Based on the detected elements and their analyzed interactions, generate specific, actionable test cases.
    *   Prioritize test cases that verify:
        *   **Presence and Visibility**: "Verify '{Element Label}' {element type} is present on the page."
        *   **Click Actions**: "Verify clicking the '{Button Label}' button {expected action, e.g., navigates to X, submits the form, opens Y dialog}."
        *   **Basic Form Interactions**: "Verify the '{Form Name/Purpose}' form contains an input field for '{Field Label}'."
    *   Each test case MUST include:
        *   A clear 'title'.
        *   A 'description' of what is being tested and why.
        *   A list of 'steps' to perform the test (e.g., "1. Navigate to the page. 2. Locate the '{Element Label}' button. 3. Click the '{Element Label}' button.").
        *   The 'expectedResult' of performing those steps (e.g., "User is redirected to the '/confirmation' page.", "The '{Field Label}' input field is visible.").

The test cases must be returned as a JSON array, conforming to the provided output schema. Be comprehensive and focus on the most valuable test scenarios derivable from the page's content.
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
