
"use client";

import type { User } from 'firebase/auth'; // We'll use the type even if Firebase isn't fully integrated yet
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>; // Keep async for future Firebase integration
  logout: () => Promise<void>;
  setUserLocally: Dispatch<SetStateAction<User | null>>; // For mock purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd check for an existing session here (e.g., from localStorage or Firebase)
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      try {
        setUser(JSON.parse(mockUserStr) as User);
      } catch (e) {
        console.error("Failed to parse mock user from localStorage", e);
        localStorage.removeItem('mockUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Mock login
    console.log("Attempting login with:", email, pass);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    const mockUserData = {
      uid: 'mock-user-uid',
      email: email,
      displayName: email.split('@')[0] || 'Mock User',
      // Add other User properties if needed, keeping them minimal for mock
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-id-token',
      getIdTokenResult: async () => ({
        token: 'mock-id-token',
        claims: {},
        expirationTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      }),
      reload: async () => {},
      toJSON: () => ({}),
      photoURL: null,
      phoneNumber: null,
      providerId: 'password', // Mocking email/password provider
    } as User;
    setUser(mockUserData);
    localStorage.setItem('mockUser', JSON.stringify(mockUserData));
    setIsLoading(false);
    router.push('/dashboard'); // Redirect to dashboard after login
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setUser(null);
    localStorage.removeItem('mockUser');
    setIsLoading(false);
    router.push('/login'); // Redirect to login after logout
  };

  const setUserLocally = (newUser: User | null | ((prevState: User | null) => User | null)) => {
    setUser(newUser);
     if (newUser && typeof newUser !== 'function') {
      localStorage.setItem('mockUser', JSON.stringify(newUser));
    } else if (newUser === null) {
      localStorage.removeItem('mockUser');
    }
    // Handling functional updates to localStorage is more complex and usually not needed for mock.
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, setUserLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
