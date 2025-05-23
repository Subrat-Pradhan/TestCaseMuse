
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
  prompt: `You are an expert QA Engineer specializing in web application testing. Your task is to analyze the webpage found at the URL: {{{url}}} and generate comprehensive test cases.

Analyze the page to identify key interactive elements and user actions. Based on this, generate test cases.

Focus on the following types of test cases:
1.  **Click Action Tests**: For every button and actionable link identified, create a test case to verify what happens when it's clicked.
    *   *Title*: Should clearly state the action, e.g., "Verify 'Submit' button functionality."
    *   *Description*: Explain what is being tested, e.g., "Test that clicking the 'Submit' button on the login form attempts to log the user in."
    *   *Steps*: Provide clear, numbered steps, e.g., "1. Navigate to the page. 2. Locate the 'Submit' button. 3. Click the 'Submit' button."
    *   *Expected Result*: Describe the observable outcome, e.g., "User is redirected to the dashboard page," or "An error message 'Invalid credentials' is displayed."
2.  **Element Presence Tests**: For important elements (both interactive and key static elements that confirm page context), create test cases to verify they are present and visible.
    *   *Title*: e.g., "Verify 'Username' input field is present."
    *   *Description*: e.g., "Check that the username input field is visible on the login form."
    *   *Steps*: e.g., "1. Navigate to the page. 2. Look for the 'Username' input field."
    *   *Expected Result*: e.g., "The 'Username' input field is visible."
3.  **Basic Form Interaction Tests**: For forms, verify the presence of key input fields and the general submission action (this might be covered by button click tests if there's a submit button).

Output Format:
*   Return your findings as a JSON object with a single key: 'testCases' (an array of test case objects).
*   Each test case object in the 'testCases' array MUST conform to the following schema:
    *   \`id\`: (This will be overridden by the client)
    *   \`title\`: A descriptive title for the test case.
    *   \`description\`: A detailed description of the test case.
    *   \`steps\`: An array of strings, where each string is a step to execute the test case.
    *   \`expectedResult\`: A string describing the expected result after executing the test case.

Focus on creating practical, actionable test cases based on the elements and interactions you can identify from the webpage's content. If the page is very complex, prioritize the most obvious and critical interactions. Ensure your entire output strictly adheres to the defined output schema.
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
    // Ensure output is not null and testCases array exists, even if empty.
    return output || { testCases: [] };
  }
);
