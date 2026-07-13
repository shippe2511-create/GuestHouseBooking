import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RoomStatus } from '../types/database';

interface Room {
  id: string;
  guesthouse_id: string;
  number: string;
  status: RoomStatus;
  price_per_night: number;
  created_at: string;
  updated_at: string;
}

export function useRooms(guesthouseId?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }

    fetchRooms();

    const subscription = supabase
      .channel(`rooms:${guesthouseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `guesthouse_id=eq.${guesthouseId}`,
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [guesthouseId]);

  const fetchRooms = async () => {
    if (!guesthouseId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('guesthouse_id', guesthouseId)
        .order('number');

      if (error) throw error;
      setRooms((data as Room[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId: string, status: RoomStatus) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', roomId);

      if (error) throw error;
      await fetchRooms();
    } catch (err) {
      console.error('Error updating room status:', err);
      throw err;
    }
  };

  const stats = {
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    available: rooms.filter((r) => r.status === 'available').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
  };

  return { rooms, stats, loading, error, refetch: fetchRooms, updateRoomStatus };
}
