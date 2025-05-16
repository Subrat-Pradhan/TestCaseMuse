
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateTestCasesFromUrl, type GenerateTestCasesFromUrlOutput } from '@/ai/flows/generate-test-cases-from-url';
import type { TestCase } from '@/types/test-case';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

type UrlFormValues = z.infer<typeof formSchema>;

interface UrlInputFormProps {
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setPreviewUrl: Dispatch<SetStateAction<string | null>>;
}

export function UrlInputForm({ setTestCases, setIsLoading, setError, isLoading, setPreviewUrl }: UrlInputFormProps) {
  const { toast } = useToast();
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: UrlFormValues) {
    setIsLoading(true);
    setError(null);
    setTestCases([]); // Clear previous test cases
    setPreviewUrl(values.url); // Set preview URL immediately

    try {
      const result: GenerateTestCasesFromUrlOutput = await generateTestCasesFromUrl({ url: values.url });
      if (result.testCases && result.testCases.length > 0) {
        setTestCases(result.testCases as TestCase[]); // Assuming AI output matches TestCase structure
        toast({
          title: "Success!",
          description: `${result.testCases.length} test cases generated.`,
          className: "bg-accent text-accent-foreground",
        });
      } else {
        toast({
          title: "No test cases generated.",
          description: "The AI couldn't find any test cases for this URL, or the URL might be inaccessible for AI analysis.",
          variant: "default",
        });
        setTestCases([]);
      }
    } catch (error) {
      console.error("Error generating test cases:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setError(`Failed to generate test cases: ${errorMessage}`);
      // Don't clear previewUrl on AI error, but do on iframe error (handled in page.tsx)
      toast({
        title: "Error Generating Tests",
        description: `Failed to generate test cases. ${errorMessage}. The preview might still work.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="url-input" className="text-base">Enter Webpage URL</FormLabel>
              <div className="flex w-full items-center space-x-2">
                <FormControl>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                    className="text-base"
                    aria-label="Webpage URL"
                  />
                </FormControl>
                <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Generating..." : "Generate Tests"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
