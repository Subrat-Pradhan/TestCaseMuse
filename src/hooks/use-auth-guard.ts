
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useAuthGuard(redirectTo = '/login'): boolean {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) { // Only run check once auth state is resolved
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Returns true if still checking/loading or if redirection is imminent,
  // allowing the calling component to show a loading state.
  return isLoading || isChecking;
}
