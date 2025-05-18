
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { TestCase } from '@/types/test-case';

const testCaseSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  steps: z.string().min(1, "Steps are required (one per line)."),
  expectedResult: z.string().min(1, "Expected result is required."),
});

type TestCaseFormValues = z.infer<typeof testCaseSchema>;

interface AddTestCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTestCase: (newTestCaseData: Omit<TestCase, 'id'>) => void;
}

export function AddTestCaseDialog({ isOpen, onOpenChange, onAddTestCase }: AddTestCaseDialogProps) {
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      steps: "",
      expectedResult: "",
    },
  });

  const handleSubmit = (values: TestCaseFormValues) => {
    const newTestCaseData: Omit<TestCase, 'id'> = {
      title: values.title,
      description: values.description,
      steps: values.steps.split('\n').map(s => s.trim()).filter(s => s.length > 0),
      expectedResult: values.expectedResult,
    };
    onAddTestCase(newTestCaseData);
    form.reset();
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Test Case</DialogTitle>
          <DialogDescription>
            Fill in the details for your new test case. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 pb-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., User Login Functionality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Verify that a user can successfully log in with valid credentials." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steps (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1. Navigate to login page.\n2. Enter valid username.\n3. Enter valid password.\n4. Click login button."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedResult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Result</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., User is redirected to the dashboard." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Test Case</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

