import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  signInWithEmail,
  signInWithPassword,
  getSessionJWT,
  getSessionToken,
  clerkSignOut,
  storeSession,
  clearStoredSession,
  loadStoredSession,
} from './clerk-client';

interface ClerkContextValue {
  isSignedIn: boolean;
  signIn: {
    create: (params: { identifier: string }) => Promise<{ status: string }>;
    attemptFirstFactor: (params: {
      strategy: string;
      password: string;
    }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string }) => Promise<void>;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const ClerkContext = createContext<ClerkContextValue | null>(null);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const signInIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadStoredSession().then((stored) => {
      if (stored) {
        sessionTokenRef.current = stored.sessionToken;
        setJwt(stored.jwt);
        setIsSignedIn(true);
      }
    });
  }, []);

  const signIn = {
    create: async ({ identifier }: { identifier: string }) => {
      const result = await signInWithEmail(identifier);
      signInIdRef.current = result.signInId;
      return { status: result.status };
    },
    attemptFirstFactor: async ({ password }: { strategy: string; password: string }) => {
      if (!signInIdRef.current) {
        throw new Error('Must call create() before attemptFirstFactor()');
      }
      const result = await signInWithPassword(signInIdRef.current, password);
      if (result.sessionToken) {
        sessionTokenRef.current = result.sessionToken;
      }
      signInIdRef.current = null;
      return { status: result.status, createdSessionId: result.createdSessionId };
    },
  };

  const setActive = async ({ session }: { session: string }) => {
    const token = sessionTokenRef.current;
    if (!token) return;

    let jwtToken = await getSessionJWT(session, token);
    if (!jwtToken) {
      jwtToken = await getSessionToken(session, token);
    }

    if (jwtToken) {
      setJwt(jwtToken);
      setIsSignedIn(true);
      await storeSession(token, session, jwtToken);
    }
  };

  const getToken = async (): Promise<string | null> => jwt;

  const signOut = async () => {
    await clerkSignOut(sessionTokenRef.current);
    setIsSignedIn(false);
    setJwt(null);
    sessionTokenRef.current = null;
    await clearStoredSession();
  };

  return (
    <ClerkContext.Provider
      value={{ isSignedIn, signIn, setActive, getToken, signOut }}
    >
      {children}
    </ClerkContext.Provider>
  );
};

export function useSignIn() {
  const ctx = useContext(ClerkContext);
  if (!ctx) throw new Error('useSignIn must be used within ClerkAuthProvider');
  return { signIn: ctx.signIn, setActive: ctx.setActive };
}

export function useAuth() {
  const ctx = useContext(ClerkContext);
  if (!ctx) throw new Error('useAuth must be used within ClerkAuthProvider');
  return { getToken: ctx.getToken, isSignedIn: ctx.isSignedIn };
}

export function useSignOut() {
  const ctx = useContext(ClerkContext);
  if (!ctx) throw new Error('useSignOut must be used within ClerkAuthProvider');
  return { signOut: ctx.signOut };
}
