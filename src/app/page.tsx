"use client";

import { useState, type ReactElement } from 'react';
import type { TestCase } from '@/types/test-case';
import { UrlInputForm } from '@/components/features/test-generator/url-input-form';
import { TestCaseTable } from '@/components/features/test-generator/test-case-table';
import { AddTestCaseDialog } from '@/components/features/test-generator/add-test-case-dialog';
import { EditTestCaseDialog } from '@/components/features/test-generator/edit-test-case-dialog';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage(): ReactElement {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="space-y-8">
        <section
          aria-labelledby="url-input-heading"
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <h1 id="url-input-heading" className="text-2xl font-semibold mb-4">
            Generate Test Cases with AI
          </h1>
          <p className="text-muted-foreground mb-6">
            Enter a URL of a web application, and our AI will analyze it to generate relevant test cases for you.
          </p>
          <UrlInputForm
            setTestCases={setTestCases}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
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
          {isLoading ? (
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
