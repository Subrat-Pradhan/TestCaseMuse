
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2, Eye } from 'lucide-react';

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

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")), // Allow empty string for reset
});

type UrlFormValues = z.infer<typeof formSchema>;

interface UrlInputFormProps {
  onGenerateTests: (url: string) => Promise<void>;
  onPreview: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string | null;
}

export function UrlInputForm({ onGenerateTests, onPreview, isLoading, initialUrl }: UrlInputFormProps) {
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: initialUrl || "",
    },
  });

  React.useEffect(() => {
    const currentFormUrl = form.getValues("url");
    const newUrlToSet = initialUrl || "";
    if (newUrlToSet !== currentFormUrl) {
      form.setValue("url", newUrlToSet);
    }
  }, [initialUrl, form]);

  const handlePreviewClick = async () => {
    const isValid = await form.trigger("url");
    if (isValid) {
        const url = form.getValues("url");
        if (url) { // Only call onPreview if URL is not empty
            onPreview(url);
        }
    }
  };

  async function handleSubmit(values: UrlFormValues) {
    if (values.url) { // Only generate if URL is not empty
        await onGenerateTests(values.url);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="url-input" className="text-base">Enter Webpage URL</FormLabel>
              <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <FormControl>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                    className="text-base flex-grow"
                    aria-label="Webpage URL"
                  />
                </FormControl>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handlePreviewClick} disabled={isLoading || !form.getValues("url")} className="w-full sm:w-auto">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Button>
                    <Button type="submit" disabled={isLoading || !form.getValues("url")} className="min-w-[150px] w-full sm:w-auto">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Generating..." : "Generate Tests"}
                    </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
