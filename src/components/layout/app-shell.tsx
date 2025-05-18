
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { TestTubeDiagonal } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
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
            {/* Future navigation items can go here if needed */}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-2 md:h-20 md:flex-row md:justify-between">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js and Genkit.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="https://github.com/Subrat-Pradhan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              GitHub
            </Link>
            <Link href="https://subrat-pradhan.github.io/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Website
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
