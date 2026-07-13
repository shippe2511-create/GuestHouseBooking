import { generateICalEvent, generateICalCalendar, generateICalUrl } from '../src/lib/ical';
import type { Tables } from '../src/types/database';

type Booking = Tables<'bookings'>;

const mockBooking: Booking = {
  id: 'test-booking-123',
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

describe('iCal utilities', () => {
  describe('generateICalEvent', () => {
    it('should generate valid VEVENT format', () => {
      const event = generateICalEvent(mockBooking, 'Room 101');

      expect(event).toContain('BEGIN:VEVENT');
      expect(event).toContain('END:VEVENT');
      expect(event).toContain('UID:test-booking-123@guestos.app');
      expect(event).toContain('SUMMARY:John Doe - Room 101');
      expect(event).toContain('DTSTART;VALUE=DATE:20260715');
      expect(event).toContain('DTEND;VALUE=DATE:20260718');
      expect(event).toContain('STATUS:CONFIRMED');
    });

    it('should escape special characters', () => {
      const bookingWithSpecialChars: Booking = {
        ...mockBooking,
        guest_name: 'John, Jr.',
      };
      const event = generateICalEvent(bookingWithSpecialChars, 'Room 101');

      expect(event).toContain('John\\, Jr.');
    });
  });

  describe('generateICalCalendar', () => {
    it('should generate valid VCALENDAR format', () => {
      const bookings = [mockBooking];
      const roomsMap = { 'room-456': 'Room 101' };

      const calendar = generateICalCalendar(bookings, roomsMap, 'Test Guesthouse');

      expect(calendar).toContain('BEGIN:VCALENDAR');
      expect(calendar).toContain('END:VCALENDAR');
      expect(calendar).toContain('VERSION:2.0');
      expect(calendar).toContain('PRODID:-//GuestOS//Booking Calendar//EN');
      expect(calendar).toContain('X-WR-CALNAME:Test Guesthouse Bookings');
      expect(calendar).toContain('BEGIN:VEVENT');
    });

    it('should include multiple events', () => {
      const secondBooking: Booking = {
        ...mockBooking,
        id: 'test-booking-456',
        guest_name: 'Jane Smith',
        check_in: '2026-07-20',
        check_out: '2026-07-22',
      };
      const bookings = [mockBooking, secondBooking];
      const roomsMap = { 'room-456': 'Room 101' };

      const calendar = generateICalCalendar(bookings, roomsMap, 'Test Guesthouse');

      const eventCount = (calendar.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(2);
    });
  });

  describe('generateICalUrl', () => {
    it('should generate correct URL format', () => {
      const url = generateICalUrl('gh-123');

      expect(url).toBe(
        'https://hyjgwmhmyhnqollkgcuk.supabase.co/functions/v1/ical?guesthouse=gh-123'
      );
    });
  });
});
