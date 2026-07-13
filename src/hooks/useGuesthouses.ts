import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Tables, Currency } from '../types/database';

type Guesthouse = Tables<'guesthouses'>;

export function useCreateGuesthouse() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createGuesthouse = async (data: {
    name: string;
    island: string;
    totalRooms: number;
    currency: Currency;
    images?: string[];
  }): Promise<Guesthouse | null> => {
    if (!user) {
      setError(new Error('Must be logged in to create a guesthouse'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: guesthouse, error: ghError } = await supabase
        .from('guesthouses')
        .insert({
          name: data.name,
          island: data.island,
          total_rooms: data.totalRooms,
          currency: data.currency,
          status: 'trial',
          settings: {
            images: data.images || [],
          },
        })
        .select()
        .single();

      if (ghError) throw ghError;

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          guesthouse_id: guesthouse.id,
          role: 'owner',
        });

      if (membershipError) throw membershipError;

      for (let i = 1; i <= data.totalRooms; i++) {
        const floor = Math.ceil(i / 4);
        const roomInFloor = ((i - 1) % 4) + 1;
        const roomNumber = `${floor}0${roomInFloor}`;

        await supabase.from('rooms').insert({
          guesthouse_id: guesthouse.id,
          number: roomNumber,
          status: 'available',
          price_per_night: 2500,
        });
      }

      return guesthouse as Guesthouse;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createGuesthouse, loading, error };
}

export function useUpdateGuesthouse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateGuesthouse = async (
    guesthouseId: string,
    data: {
      name?: string;
      island?: string;
      currency?: Currency;
      settings?: Record<string, unknown>;
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('guesthouses')
        .update({
          ...(data.name && { name: data.name }),
          ...(data.island && { island: data.island }),
          ...(data.currency && { currency: data.currency }),
          ...(data.settings && { settings: data.settings }),
        })
        .eq('id', guesthouseId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateGuesthouse, loading, error };
}
