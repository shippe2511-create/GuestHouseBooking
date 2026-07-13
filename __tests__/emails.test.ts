import { generateReceiptHtml, generateInviteHtml } from '../src/lib/emails';
import type { Tables } from '../src/types/database';

const mockGuesthouse: Tables<'guesthouses'> = {
  id: 'gh-123',
  name: 'Hudhu Veli',
  island: 'Maafushi',
  total_rooms: 12,
  currency: 'MVR',
  status: 'active',
  settings: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockBooking: Tables<'bookings'> = {
  id: 'booking-123',
  guesthouse_id: 'gh-123',
  room_id: 'room-456',
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  guest_phone: '+1234567890',
  check_in: '2026-07-15',
  check_out: '2026-07-18',
  guests: 2,
  price: 7500,
  currency: 'MVR',
  status: 'confirmed',
  total_nights: 3,
  total_amount: 7500,
  notes: null,
  source: 'direct',
  created_at: '2026-07-10T10:00:00Z',
  updated_at: '2026-07-10T10:00:00Z',
};

const mockPayment: Tables<'payments'> = {
  id: 'payment-789',
  guesthouse_id: 'gh-123',
  booking_id: 'booking-123',
  amount: 7500,
  currency: 'MVR',
  method: 'card',
  status: 'completed',
  notes: null,
  created_at: '2026-07-10T10:00:00Z',
  updated_at: '2026-07-10T10:00:00Z',
};

describe('Email templates', () => {
  describe('generateReceiptHtml', () => {
    it('should generate valid HTML receipt', () => {
      const html = generateReceiptHtml({
        booking: mockBooking,
        payment: mockPayment,
        guesthouse: mockGuesthouse,
        roomNumber: '101',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Payment Receipt');
      expect(html).toContain('Hudhu Veli');
      expect(html).toContain('Maafushi');
      expect(html).toContain('John Doe');
      expect(html).toContain('MVR 7,500');
      expect(html).toContain('Room 101');
      expect(html).toContain('3'); // nights
    });

    it('should include receipt ID', () => {
      const html = generateReceiptHtml({
        booking: mockBooking,
        payment: mockPayment,
        guesthouse: mockGuesthouse,
        roomNumber: '101',
      });

      expect(html).toContain('Receipt #PAYMENT-');
    });
  });

  describe('generateInviteHtml', () => {
    it('should generate valid HTML invite', () => {
      const html = generateInviteHtml({
        guesthouse: mockGuesthouse,
        inviterName: 'Admin User',
        role: 'Staff',
        inviteLink: 'https://app.guestos.app/invite/abc123',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain("You're Invited!");
      expect(html).toContain('Admin User');
      expect(html).toContain('Hudhu Veli');
      expect(html).toContain('Staff');
      expect(html).toContain('https://app.guestos.app/invite/abc123');
      expect(html).toContain('Accept Invitation');
    });

    it('should show correct role', () => {
      const html = generateInviteHtml({
        guesthouse: mockGuesthouse,
        inviterName: 'Owner',
        role: 'Manager',
        inviteLink: 'https://example.com',
      });

      expect(html).toContain('Manager');
    });
  });
});
