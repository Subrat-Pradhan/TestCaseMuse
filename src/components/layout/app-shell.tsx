
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { TestTubeDiagonal, LogIn, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center">
            <TestTubeDiagonal className="mr-2 h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              Test Case Muse
            </span>
          </Link>
          
          <nav className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24 rounded-md" />
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Hi, {user?.displayName || user?.email?.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js and Genkit.
          </p>
        </div>
      </footer>
    </div>
  );
}
