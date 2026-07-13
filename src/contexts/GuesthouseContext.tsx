import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Tables } from '../types/database';

type Guesthouse = Tables<'guesthouses'>;

interface GuesthouseContextType {
  currentGuesthouse: Guesthouse | null;
  setCurrentGuesthouse: (guesthouse: Guesthouse | null) => void;
}

const GuesthouseContext = createContext<GuesthouseContextType | null>(null);

export function GuesthouseProvider({ children }: { children: ReactNode }) {
  const [currentGuesthouse, setCurrentGuesthouse] = useState<Guesthouse | null>(null);

  return (
    <GuesthouseContext.Provider value={{ currentGuesthouse, setCurrentGuesthouse }}>
      {children}
    </GuesthouseContext.Provider>
  );
}

export function useCurrentGuesthouse() {
  const context = useContext(GuesthouseContext);
  if (!context) {
    throw new Error('useCurrentGuesthouse must be used within a GuesthouseProvider');
  }
  return context;
}

export function useUserGuesthouses() {
  const { user } = useAuth();
  const [guesthouses, setGuesthouses] = useState<Guesthouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchGuesthouses();
  }, [user]);

  const fetchGuesthouses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('guesthouse_id')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      if (memberships && memberships.length > 0) {
        const guesthouseIds = memberships.map((m) => m.guesthouse_id);
        const { data: ghData, error: ghError } = await supabase
          .from('guesthouses')
          .select('*')
          .in('id', guesthouseIds);

        if (ghError) throw ghError;
        setGuesthouses((ghData as Guesthouse[]) || []);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { guesthouses, loading, error, refetch: fetchGuesthouses };
}
