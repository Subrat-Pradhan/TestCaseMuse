
"use client";

import { useState, type ReactElement, useEffect } from 'react';
import type { TestCase } from '@/types/test-case';
import { UrlInputForm } from '@/components/features/test-generator/url-input-form';
import { TestCaseTable } from '@/components/features/test-generator/test-case-table';
import { AddTestCaseDialog } from '@/components/features/test-generator/add-test-case-dialog';
import { EditTestCaseDialog } from '@/components/features/test-generator/edit-test-case-dialog';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Terminal, Eye, Copy as CopyIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function HomePage(): ReactElement {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);
  const { toast } = useToast();

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

  const handleCopyPreviewUrl = async () => {
    if (previewUrl) {
      try {
        await navigator.clipboard.writeText(previewUrl);
        toast({
          title: "URL Copied!",
          description: "The preview URL has been copied to your clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy URL: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the URL to your clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (previewUrl && error?.includes("Could not load preview")) {
        setError(null);
    }
  }, [previewUrl, error]);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-8">
        {/* Section 1: URL Input */}
        <section
          aria-labelledby="url-input-heading"
          className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <h1 id="url-input-heading" className="text-2xl font-semibold mb-4">
            Generate Test Cases with AI
          </h1>
          <p className="text-muted-foreground mb-6">
            Provide the URL of the web application you want to test. Once entered, the application will be previewed on the right. If you navigate to a different page within the preview, update the URL in this field accordingly.
          </p>
          <UrlInputForm
            setTestCases={setTestCases}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
            setPreviewUrl={setPreviewUrl}
          />
          {error && !error.startsWith("Could not load preview") && ( // Only show AI errors here
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        {/* Section 2: Test Cases */}
        <section aria-labelledby="test-cases-heading" className="flex flex-col">
          {isLoading && testCases.length === 0 ? ( 
            <div className="space-y-4 p-1 flex-grow flex flex-col"> {/* Added padding for consistency and flex for skeleton */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <Skeleton className="h-96 w-full flex-grow" /> {/* flex-grow for skeleton body */}
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

        {/* Section 3: Website Preview */}
        <div className="flex flex-col">
          <Card className="shadow-lg flex-grow flex flex-col min-h-[600px]"> {/* Added min-h for better default preview height */}
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-6 w-6 text-primary" />
                Website Preview
              </CardTitle>
              {previewUrl ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="url"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="Enter URL to preview"
                    className="text-sm"
                    aria-label="Preview URL"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyPreviewUrl} aria-label="Copy preview URL">
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CardDescription>
                  The right panel displays a live preview of the entered URL. Interact with the webpage here to verify UI elements and navigate through features. Any changes made within the iframe will be reflected here.
                </CardDescription>
              )}
               {error && error.startsWith("Could not load preview") && ( // Show iframe specific errors here
                <Alert variant="destructive" className="mt-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Preview Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0 sm:p-2 md:p-4"> {/* Adjusted padding */}
              {previewUrl ? (
                <iframe
                  id="website-preview-iframe"
                  src={previewUrl}
                  title="Website Preview"
                  className="w-full h-full border rounded-md flex-grow"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals" 
                  onError={(e) => {
                    console.error("Iframe loading error:", e);
                    setError("Could not load preview. The site might block embedding (X-Frame-Options), or the URL is invalid/inaccessible, or it might be a network issue.");
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed text-center p-6">
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
