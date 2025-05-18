
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Eye, Copy as CopyIcon, Smartphone, Monitor, WandSparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateTestCasesFromUrl, type GenerateTestCasesFromUrlOutput } from '@/ai/flows/generate-test-cases-from-url';
import { cn } from '@/lib/utils';

const resolutions = [
  { label: "Auto (Responsive)", value: "auto", type: "Responsive", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1920x1080 (Full HD)", value: "1920x1080", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1366x768 (HD)", value: "1366x768", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1440x900", value: "1440x900", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1280x720 (HD)", value: "1280x720", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "375x812 (iPhone X/XS)", value: "375x812", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "414x896 (iPhone XR/11 Max)", value: "414x896", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "360x780 (Tall Android)", value: "360x780", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1080x2400 (Modern Android)", value: "1080x2400", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
];


export default function HomePage(): ReactElement {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlForForm, setUrlForForm] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string>("auto");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);
  const { toast } = useToast();

  const handleSetPreviewOnly = (url: string) => {
    setPreviewUrl(url);
    setUrlForForm(url); // Keep form in sync
    if (error?.includes("Could not load preview")) setError(null);
  };

  const handleGenerateTests = async (url: string, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    if (!append) {
      setTestCases([]); // Clear previous test cases only if not appending
    }
    setPreviewUrl(url); // Update preview URL
    setUrlForForm(url); // Keep form in sync

    try {
      const result: GenerateTestCasesFromUrlOutput = await generateTestCasesFromUrl({ url });
      if (result.testCases && result.testCases.length > 0) {
        // Ensure unique IDs before setting state
        const uniqueTestCases = result.testCases.map(tc => ({
          ...tc,
          id: crypto.randomUUID() // Assign new UUID
        })) as TestCase[];
        
        setTestCases(prev => append ? [...prev, ...uniqueTestCases] : uniqueTestCases);
        toast({
          title: "Success!",
          description: `${uniqueTestCases.length} test cases ${append ? 'added' : 'generated'}.`,
          className: "bg-accent text-accent-foreground",
        });
      } else {
        toast({
          title: append ? "No more test cases" : "No test cases generated.",
          description: "The AI couldn't find any new test cases for this URL, or the URL might be inaccessible for AI analysis.",
          variant: "default",
        });
        if (!append) setTestCases([]);
      }
    } catch (err) {
      console.error("Error generating test cases:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate test cases: ${errorMessage}`);
      toast({
        title: "Error Generating Tests",
        description: `Failed to generate test cases. ${errorMessage}. The preview might still work.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    // Clear iframe error if previewUrl changes (e.g. user types a new one in main input or preview input)
    if (previewUrl && error?.includes("Could not load preview")) {
        setError(null); 
    }
  }, [previewUrl, error]);


  const iframeDimensions = (() => {
    if (selectedResolution === "auto" || !previewUrl) {
      return { width: "100%", height: "100%", isFixed: false };
    }
    const [width, height] = selectedResolution.split('x').map(Number);
    return { width: `${width}px`, height: `${height}px`, isFixed: true };
  })();

  const iframeDynamicStyles = iframeDimensions.isFixed
  ? {
      minWidth: iframeDimensions.width,
      minHeight: iframeDimensions.height,
      maxWidth: iframeDimensions.width,
      maxHeight: iframeDimensions.height,
    }
  : {
      // For auto/responsive mode, CSS classes (w-full, h-full) handle sizing.
    };


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
            Provide the URL of the web application you want to test. Use "Preview" to load the site below, or "Generate Tests" to preview and create test cases. If you navigate within the preview, update the URL in this field or the preview URL field to generate tests for the new page.
          </p>
          <UrlInputForm
            onGenerateTests={(url) => handleGenerateTests(url, false)}
            onPreview={handleSetPreviewOnly}
            isLoading={isLoading}
            initialUrl={urlForForm}
          />
          {error && !error.startsWith("Could not load preview") && ( 
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        {/* Section 2: Website Preview */}
        <section aria-labelledby="website-preview-heading" className="flex flex-col">
          <Card className="shadow-lg flex-grow flex flex-col min-h-[600px]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle id="website-preview-heading" className="flex items-center">
                  <Eye className="mr-2 h-6 w-6 text-primary" />
                  Website Preview
                </CardTitle>
                <div className="w-full sm:w-auto">
                 <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                    <SelectTrigger className="w-full sm:w-[280px]" aria-label="Select preview resolution">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutions.map(res => (
                        <SelectItem key={res.value} value={res.value}>
                          <div className="flex items-center">
                            {res.icon}
                            {res.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {previewUrl ? (
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    type="url"
                    value={previewUrl}
                    onChange={(e) => {
                        const newUrl = e.target.value;
                        setPreviewUrl(newUrl);
                        setUrlForForm(newUrl); // Keep form in sync
                        if (error?.includes("Could not load preview")) setError(null);
                    }}
                    placeholder="Enter URL to preview"
                    className="text-sm flex-grow"
                    aria-label="Preview URL"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyPreviewUrl} aria-label="Copy preview URL">
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CardDescription className="mt-2">
                  The panel below displays a live preview of the entered URL. Interact with the webpage here to verify UI elements and navigate through features. Any changes made within the iframe will be reflected here.
                </CardDescription>
              )}
               {error && error.startsWith("Could not load preview") && (
                <Alert variant="destructive" className="mt-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Preview Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0 sm:p-2 md:p-4 overflow-auto">
              {previewUrl ? (
                <div 
                    className="w-full flex items-center justify-center"
                    style={{ 
                        overflow: iframeDimensions.isFixed ? 'auto' : 'hidden', 
                        flexGrow: 1 
                    }}
                >
                    <iframe
                        id="website-preview-iframe"
                        key={previewUrl + selectedResolution} 
                        src={previewUrl}
                        title="Website Preview"
                        width={iframeDimensions.isFixed ? iframeDimensions.width.replace('px', '') : "100%"}
                        height={iframeDimensions.isFixed ? iframeDimensions.height.replace('px', '') : "100%"}
                        style={{
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            ...iframeDynamicStyles 
                        }}
                        className={cn(iframeDimensions.isFixed ? '' : 'w-full h-full')} 
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals" 
                        onError={(e) => {
                            console.error("Iframe loading error:", e);
                            setError("Could not load preview. The site might block embedding (X-Frame-Options), the URL is invalid/inaccessible, or it's a network issue.");
                        }}
                        onLoad={() => {
                             if (error?.includes("Could not load preview")) setError(null); 
                        }}
                    />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed text-center p-6 flex-grow">
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
                    Enter a valid URL in the form above to see a live preview here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Test Cases */}
        <section aria-labelledby="test-cases-heading" className="flex flex-col">
          {isLoading && testCases.length === 0 ? ( 
            <div className="space-y-4 p-1 flex-grow flex flex-col">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <Skeleton className="h-96 w-full flex-grow" />
            </div>
          ) : (
            <TestCaseTable
              testCases={testCases}
              onAdd={() => setIsAddDialogOpen(true)}
              onEdit={handleEditTestCase}
              onDelete={handleDeleteTestCase}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onGenerateMore={() => {
                if (previewUrl) {
                  handleGenerateTests(previewUrl, true);
                } else {
                  toast({
                    title: "No URL to use",
                    description: "Please enter or preview a URL first before generating more test cases.",
                    variant: "destructive",
                  });
                }
              }}
              isLoading={isLoading}
              canGenerateMore={!!previewUrl && testCases.length > 0}
            />
          )}
        </section>
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

