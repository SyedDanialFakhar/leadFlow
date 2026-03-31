// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return error.message;
      return null;
    } catch (err) {
      return 'An unexpected error occurred. Please try again.';
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return error.message;
      return null;
    } catch (err) {
      return 'An unexpected error occurred. Please try again.';
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}