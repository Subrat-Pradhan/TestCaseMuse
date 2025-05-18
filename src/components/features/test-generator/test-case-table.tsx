
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { FilePenLine, Trash2, PlusCircle, Download, WandSparkles } from 'lucide-react';
import type { TestCase } from '@/types/test-case';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestCaseTableProps {
  testCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCaseId: string) => void;
  onAdd: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onGenerateMore: () => void;
  isLoading: boolean;
  canGenerateMore: boolean;
}

export function TestCaseTable({
  testCases,
  onEdit,
  onDelete,
  onAdd,
  onExportCSV,
  onExportJSON,
  onGenerateMore,
  isLoading,
  canGenerateMore,
}: TestCaseTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-2xl font-semibold tracking-tight" id="test-cases-heading">Generated Test Cases</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onAdd} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Test Case
          </Button>
          {testCases.length > 0 && (
            <>
              <Button onClick={onExportCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button onClick={onExportJSON} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
       Below the preview, generated test cases will be listed, each with a unique ID, title, description, and step-by-step validation. Use the 'Add Test Case' button to create a new one or export the existing test cases as CSV or JSON.
      </p>
      {testCases.length === 0 && !isLoading ? ( 
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div 
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 13 2 2-2 2"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium">No test cases yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Enter a URL above and click "Generate Tests" to see test cases here.
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="rounded-md border shadow-sm">
            <Table>
              <TableCaption className="py-4">
                A list of {testCases.length} generated test case{testCases.length === 1 ? '' : 's'}. You can edit or delete them.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="min-w-[300px]">Steps</TableHead>
                  <TableHead className="min-w-[250px]">Expected Result</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((tc) => (
                  <TableRow key={tc.id}>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{tc.id}</Badge>
                    </TableCell>
                    <TableCell>{tc.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tc.description}</TableCell>
                    <TableCell>
                      {tc.steps && tc.steps.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {tc.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">No steps provided.</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{tc.expectedResult}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(tc)} aria-label="Edit test case">
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(tc.id)} aria-label="Delete test case" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          { (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={onGenerateMore} 
                variant="outline" 
                disabled={isLoading || !canGenerateMore}
                title={!canGenerateMore ? "Preview a URL first" : "Generate more test cases for the current preview URL"}
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                Generate More for Current Preview
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

