import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Currency, PaymentMethod } from '../types/database';

interface Payment {
  id: string;
  guesthouse_id: string;
  booking_id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  date: string;
  created_at: string;
  bookings?: {
    id: string;
    guest_name: string;
    rooms?: {
      number: string;
    };
  };
}

export function usePayments(guesthouseId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }

    fetchPayments();
  }, [guesthouseId]);

  const fetchPayments = async () => {
    if (!guesthouseId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            id,
            guest_name,
            rooms (number)
          )
        `)
        .eq('guesthouse_id', guesthouseId)
        .order('date', { ascending: false });

      if (error) throw error;
      setPayments((data as Payment[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (payment: {
    bookingId: string;
    amount: number;
    currency: Currency;
    method: PaymentMethod;
  }) => {
    if (!guesthouseId) return;

    try {
      const { error } = await supabase.from('payments').insert({
        guesthouse_id: guesthouseId,
        booking_id: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    payments,
    totalRevenue,
    loading,
    error,
    refetch: fetchPayments,
    createPayment,
  };
}

interface DailyRevenue {
  day: number;
  amount: number;
}

export function useRevenueStats(guesthouseId?: string, month?: Date) {
  const [stats, setStats] = useState({
    total: 0,
    dailyData: [] as DailyRevenue[],
    avgPerNight: 0,
    bestDay: { day: 0, amount: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }

    fetchRevenueStats();
  }, [guesthouseId, month]);

  const fetchRevenueStats = async () => {
    if (!guesthouseId) return;

    try {
      setLoading(true);
      const targetMonth = month || new Date();
      const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('payments')
        .select('amount, date')
        .eq('guesthouse_id', guesthouseId)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (error) throw error;

      const dailyMap = new Map<number, number>();
      ((data as { amount: number; date: string }[]) || []).forEach((p) => {
        const day = new Date(p.date).getDate();
        dailyMap.set(day, (dailyMap.get(day) || 0) + Number(p.amount));
      });

      const daysInMonth = endOfMonth.getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        amount: dailyMap.get(i + 1) || 0,
      }));

      const total = dailyData.reduce((sum, d) => sum + d.amount, 0);
      const daysWithRevenue = dailyData.filter((d) => d.amount > 0).length;
      const avgPerNight = daysWithRevenue > 0 ? Math.round(total / daysWithRevenue) : 0;
      const bestDay = dailyData.reduce(
        (best, d) => (d.amount > best.amount ? d : best),
        { day: 0, amount: 0 }
      );

      setStats({ total, dailyData, avgPerNight, bestDay });
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchRevenueStats };
}
