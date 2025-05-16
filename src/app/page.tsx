
"use client";

import { useState, type ReactElement } from 'react';
import type { TestCase } from '@/types/test-case';
import { UrlInputForm } from '@/components/features/test-generator/url-input-form';
import { TestCaseTable } from '@/components/features/test-generator/test-case-table';
import { AddTestCaseDialog } from '@/components/features/test-generator/add-test-case-dialog';
import { EditTestCaseDialog } from '@/components/features/test-generator/edit-test-case-dialog';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Terminal, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage(): ReactElement {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);

  const handleAddTestCase = (newTestCase: TestCase) => {
    setTestCases(prev => [...prev, newTestCase]);
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setTestCaseToEdit(testCase);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTestCase = (updatedTestCase: TestCase) => {
    setTestCases(prev => prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc));
    setTestCaseToEdit(null);
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
  };

  const handleExportCSV = () => {
    exportToCSV(testCases);
  };

  const handleExportJSON = () => {
    exportToJSON(testCases);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Controls and Test Cases */}
        <div className="lg:w-1/2 space-y-8">
          <section
            aria-labelledby="url-input-heading"
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
          >
            <h1 id="url-input-heading" className="text-2xl font-semibold mb-4">
              Generate Test Cases with AI
            </h1>
            <p className="text-muted-foreground mb-6">
              Enter a URL to preview the web application on the right.
              Our AI will generate test cases based on the URL currently in this input field.
              If you navigate within the preview to a different page, you'll need to
              manually update the URL in this field to target that new page for test generation.
            </p>
            <UrlInputForm
              setTestCases={setTestCases}
              setIsLoading={setIsLoading}
              setError={setError}
              isLoading={isLoading}
              setPreviewUrl={setPreviewUrl}
            />
            {error && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </section>

          <section aria-labelledby="test-cases-heading">
            {isLoading && !previewUrl ? ( // Show skeleton only if not loading preview for the first time
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <TestCaseTable
                testCases={testCases}
                onAdd={() => setIsAddDialogOpen(true)}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
              />
            )}
          </section>
        </div>

        {/* Right Column: Website Preview */}
        <div className="lg:w-1/2">
          <Card className="shadow-lg sticky top-20"> {/* Sticky for better UX on scroll */}
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-6 w-6 text-primary" />
                Website Preview
              </CardTitle>
              <CardDescription>
                {previewUrl ? `Displaying: ${previewUrl}` : "Enter a URL to see a preview."}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] lg:h-[calc(100vh-16rem)]"> {/* Adjusted height */}
              {previewUrl ? (
                <iframe
                  id="website-preview-iframe" // Added an ID for potential future reference, though not used for URL capture here
                  src={previewUrl}
                  title="Website Preview"
                  className="w-full h-full border rounded-md"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups" // Security for iframe
                  onError={(e) => {
                    console.error("Iframe loading error:", e);
                    setError("Could not load preview. The site might block embedding, or the URL is invalid/inaccessible.");
                    setPreviewUrl(null); // Clear preview on error
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed text-center">
                  <div
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>
                     </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No preview available</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Enter a valid URL in the form on the left to see a live preview here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTestCaseDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTestCase={handleAddTestCase}
      />

      {testCaseToEdit && (
        <EditTestCaseDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          testCaseToEdit={testCaseToEdit}
          onUpdateTestCase={handleUpdateTestCase}
        />
      )}
    </div>
  );
}
