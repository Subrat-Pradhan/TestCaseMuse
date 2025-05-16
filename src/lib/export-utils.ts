import type { TestCase } from '@/types/test-case';

function downloadFile(filename: string, content: string, mimeType: string) {
  const element = document.createElement('a');
  element.setAttribute('href', `${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function exportToCSV(testCases: TestCase[]): void {
  if (testCases.length === 0) return;

  const header = ['ID', 'Title', 'Description', 'Steps', 'Expected Result'];
  const rows = testCases.map(tc => [
    tc.id,
    `"${tc.title.replace(/"/g, '""')}"`,
    `"${tc.description.replace(/"/g, '""')}"`,
    `"${tc.steps.join('\\n').replace(/"/g, '""')}"`, // Steps joined by newline within a single CSV field
    `"${tc.expectedResult.replace(/"/g, '""')}"`
  ]);

  const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadFile('test-cases.csv', csvContent, 'data:text/csv');
}

export function exportToJSON(testCases: TestCase[]): void {
  if (testCases.length === 0) return;

  const jsonContent = JSON.stringify(testCases, null, 2);
  downloadFile('test-cases.json', jsonContent, 'data:application/json');
}
