import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '../hooks/useAuth';
import type { Session, User } from '@supabase/supabase-js';
import type { Tables } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Tables<'users'> | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
