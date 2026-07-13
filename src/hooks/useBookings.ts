import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { BookingStatus, Currency } from '../types/database';

interface Room {
  id: string;
  number: string;
  status: string;
  price_per_night: number;
}

interface Booking {
  id: string;
  guesthouse_id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  price: number;
  currency: Currency;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  rooms: Room;
}

export function useBookings(guesthouseId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }

    fetchBookings();

    const subscription = supabase
      .channel(`bookings:${guesthouseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `guesthouse_id=eq.${guesthouseId}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [guesthouseId]);

  const fetchBookings = async () => {
    if (!guesthouseId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (*)
        `)
        .eq('guesthouse_id', guesthouseId)
        .order('check_in', { ascending: true });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (booking: {
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    pricePerNight: number;
    currency: Currency;
  }) => {
    if (!guesthouseId) return;

    try {
      const nights = Math.ceil(
        (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const { error } = await supabase.from('bookings').insert({
        guesthouse_id: guesthouseId,
        room_id: booking.roomId,
        guest_name: booking.guestName,
        guest_phone: booking.guestPhone,
        guest_email: booking.guestEmail,
        check_in: booking.checkIn.toISOString().split('T')[0],
        check_out: booking.checkOut.toISOString().split('T')[0],
        guests: booking.guests,
        price: booking.pricePerNight * nights,
        currency: booking.currency,
        status: 'confirmed',
      });

      if (error) throw error;

      await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', booking.roomId);

      await fetchBookings();
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking:', err);
      throw err;
    }
  };

  const checkOutGuest = async (bookingId: string, roomId: string) => {
    try {
      await supabase
        .from('bookings')
        .update({ status: 'checked_out' })
        .eq('id', bookingId);

      await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', roomId);

      await fetchBookings();
    } catch (err) {
      console.error('Error checking out:', err);
      throw err;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const todayArrivals = bookings.filter((b) => {
    return b.check_in === today && b.status === 'confirmed';
  });

  const todayDepartures = bookings.filter((b) => {
    return b.check_out === today && b.status === 'checked_in';
  });

  return {
    bookings,
    todayArrivals,
    todayDepartures,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBookingStatus,
    checkOutGuest,
  };
}
