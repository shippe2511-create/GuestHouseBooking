import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { GuestHouseStatus, Currency } from '../types/database';

interface Guesthouse {
  id: string;
  name: string;
  island: string;
  total_rooms: number;
  currency: Currency;
  settings: any;
  status: GuestHouseStatus;
  created_at: string;
  updated_at: string;
}

export function useGuesthouse(guesthouseId?: string) {
  const [guesthouse, setGuesthouse] = useState<Guesthouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }

    fetchGuesthouse();
  }, [guesthouseId]);

  const fetchGuesthouse = async () => {
    if (!guesthouseId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guesthouses')
        .select('*')
        .eq('id', guesthouseId)
        .single();

      if (error) throw error;
      setGuesthouse(data as Guesthouse);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { guesthouse, loading, error, refetch: fetchGuesthouse };
}

export function useGuesthouses() {
  const [guesthouses, setGuesthouses] = useState<Guesthouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGuesthouses();
  }, []);

  const fetchGuesthouses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guesthouses')
        .select('*')
        .order('name');

      if (error) throw error;
      setGuesthouses((data as Guesthouse[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { guesthouses, loading, error, refetch: fetchGuesthouses };
}

interface GuesthouseWithRole extends Guesthouse {
  role: string;
}

export function useUserGuesthouses(userId?: string) {
  const [guesthouses, setGuesthouses] = useState<GuesthouseWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchUserGuesthouses();
  }, [userId]);

  const fetchUserGuesthouses = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          role,
          guesthouses (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const result = (data || []).map((m: any) => ({
        ...m.guesthouses,
        role: m.role,
      }));

      setGuesthouses(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { guesthouses, loading, error, refetch: fetchUserGuesthouses };
}
