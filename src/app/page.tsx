
"use client";

import { useState, type ReactElement, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
import { Terminal, Eye, Copy as CopyIcon, Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateTestCasesFromUrl, type GenerateTestCasesFromUrlOutput } from '@/ai/flows/generate-test-cases-from-url';

const resolutions = [
  { label: "1366x768 (HD)", value: "1366x768", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1920x1080 (Full HD)", value: "1920x1080", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1440x900", value: "1440x900", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "1280x720 (HD)", value: "1280x720", type: "Desktop", icon: <Monitor className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "375x812 (iPhone X/XS)", value: "375x812", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "414x896 (iPhone XR/11 Max)", value: "414x896", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
  { label: "360x780 (Tall Android)", value: "360x780", type: "Mobile", icon: <Smartphone className="h-4 w-4 mr-2 opacity-50" /> },
];


export default function HomePage(): ReactElement {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlForForm, setUrlForForm] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string>(resolutions[0].value);
  const [testCaseCounter, setTestCaseCounter] = useState<number>(1);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);
  const { toast } = useToast();

  const handleSetPreviewOnly = (url: string) => {
    setPreviewUrl(url);
    setUrlForForm(url); 
    if (error?.includes("Could not load preview")) setError(null);
  };

  const handleGenerateTests = async (url: string, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    let currentIdCounter = append ? testCaseCounter : 1;
    if (!append) {
      setTestCases([]); 
    }
    setPreviewUrl(url); 
    setUrlForForm(url); 

    try {
      const result: GenerateTestCasesFromUrlOutput = await generateTestCasesFromUrl({ url });
      
      if (result.testCases && result.testCases.length > 0) {
        const newTestCases = result.testCases.map(tc => {
          const formattedId = `TC${String(currentIdCounter).padStart(3, '0')}`;
          currentIdCounter++;
          return { ...tc, id: formattedId };
        });
        
        setTestCases(prev => append ? [...prev, ...newTestCases] : newTestCases);
        setTestCaseCounter(currentIdCounter);
        toast({
          title: "Success!",
          description: `${newTestCases.length} test cases ${append ? 'added' : 'generated'}.`,
          className: "bg-accent text-accent-foreground",
        });
      } else {
        toast({
          title: append ? "No more test cases" : "No test cases generated.",
          description: "The AI couldn't find any new test cases for this URL, or the URL might be inaccessible for AI analysis.",
          variant: "default",
        });
        if (!append && testCases.length === 0) setTestCases([]);
      }
    } catch (err) {
      console.error("Error generating test cases:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate test cases: ${errorMessage}. The AI might have issues accessing the URL or interpreting its content.`);
      toast({
        title: "Error Generating Tests",
        description: `Failed to generate test cases. ${errorMessage}. The preview might still work.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestCase = (newTestCaseData: Omit<TestCase, 'id'>) => {
    const formattedId = `TC${String(testCaseCounter).padStart(3, '0')}`;
    const newTestCaseWithId: TestCase = {
      ...newTestCaseData,
      id: formattedId,
    };
    setTestCases(prev => [...prev, newTestCaseWithId]);
    setTestCaseCounter(prevCounter => prevCounter + 1);
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

  const handleResetAll = () => {
    setTestCases([]);
    setPreviewUrl(null);
    setUrlForForm(null); 
    setError(null);
    setTestCaseCounter(1);
    toast({
      title: "Application Reset",
      description: "All test cases, preview, and URL inputs have been cleared.",
    });
  };
  
  useEffect(() => {
    if (previewUrl && error?.includes("Could not load preview")) {
        setError(null); 
    }
  }, [previewUrl, error]);


  const iframeDimensions = (() => {
    if (!selectedResolution) {
      return { width: "0px", height: "0px", isFixed: false }; 
    }
    const [width, height] = selectedResolution.split('x').map(Number);
    return { width: `${width}px`, height: `${height}px`, isFixed: true };
  })();

  const iframeDynamicStyles = {
    minWidth: iframeDimensions.width,
    minHeight: iframeDimensions.height,
    maxWidth: iframeDimensions.width,
    maxHeight: iframeDimensions.height,
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    flexShrink: 0, 
  };
  
  const iframeKey = previewUrl ? `${previewUrl}-${selectedResolution}` : `empty-preview-${selectedResolution}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-8">
        {/* Section 1: URL Input */}
        <section
          aria-labelledby="url-input-heading"
          className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 id="url-input-heading" className="text-2xl font-semibold">
              Generate Test Cases with AI
            </h1>
            <Button variant="outline" onClick={handleResetAll} size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset All
            </Button>
          </div>
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
          <Card className="shadow-lg flex-grow flex flex-col min-h-[600px]"> {/* Ensure card has min height */}
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
                        setUrlForForm(newUrl); 
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
                  The panel below displays a live preview of the entered URL. Interact with the webpage here to verify UI elements and navigate through features.
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
            <CardContent 
              className="flex-grow flex flex-col p-0 sm:p-2 md:p-4 overflow-auto items-center justify-center" // Center content
            >
              {previewUrl ? (
                <div 
                    className="w-full" 
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        flexGrow: 1, 
                        overflow: 'auto', 
                    }}
                >
                    <iframe
                        id="website-preview-iframe"
                        key={iframeKey} 
                        src={previewUrl}
                        title="Website Preview"
                        style={iframeDynamicStyles}
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
