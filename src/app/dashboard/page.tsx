
"use client"; // This page uses a client hook for auth guard

import type { ReactElement } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage(): ReactElement | null {
  const { isLoading: isAuthLoading, user } = useAuth();
  const isPageLoading = useAuthGuard(); // Handles redirection

  if (isAuthLoading || isPageLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // This should ideally not be reached if useAuthGuard works correctly,
    // but it's a fallback.
    return null; 
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to your Dashboard, {user.displayName || user.email}!</CardTitle>
          <CardDescription>This is a protected area. Only logged-in users can see this.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Here's some super secret dashboard content:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Secret stat 1: 42</li>
            <li>Secret stat 2: Banana</li>
            <li>User UID: {user.uid}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
