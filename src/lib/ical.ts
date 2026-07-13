import * as Sharing from 'expo-sharing';
import type { Tables } from '../types/database';

let cacheDir = '';
try {
  const FileSystem = require('expo-file-system');
  cacheDir = FileSystem.cacheDirectory || '';
} catch {
  cacheDir = '';
}

type Booking = Tables<'bookings'>;

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export function generateICalEvent(booking: Booking, roomName: string): string {
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const now = new Date();

  return `BEGIN:VEVENT
UID:${booking.id}@guestos.app
DTSTAMP:${formatICalDate(now)}
DTSTART;VALUE=DATE:${booking.check_in.replace(/-/g, '')}
DTEND;VALUE=DATE:${booking.check_out.replace(/-/g, '')}
SUMMARY:${escapeICalText(booking.guest_name)} - ${escapeICalText(roomName)}
DESCRIPTION:Guest: ${escapeICalText(booking.guest_name)}\\nPhone: ${booking.guest_phone || 'N/A'}\\nEmail: ${booking.guest_email || 'N/A'}\\nNights: ${booking.total_nights || 'N/A'}\\nTotal: ${booking.total_amount?.toLocaleString() || 'N/A'}
LOCATION:${escapeICalText(roomName)}
STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : booking.status === 'cancelled' ? 'CANCELLED' : 'TENTATIVE'}
END:VEVENT`;
}

export function generateICalCalendar(
  bookings: Booking[],
  roomsMap: Record<string, string>,
  guesthouseName: string
): string {
  const events = bookings
    .map((b) => generateICalEvent(b, roomsMap[b.room_id] || 'Unknown Room'))
    .join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GuestOS//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${escapeICalText(guesthouseName)} Bookings
X-WR-TIMEZONE:Indian/Maldives
${events}
END:VCALENDAR`;
}

export async function exportCalendarToFile(
  bookings: Booking[],
  roomsMap: Record<string, string>,
  guesthouseName: string
): Promise<void> {
  const icalContent = generateICalCalendar(bookings, roomsMap, guesthouseName);
  const filename = `${guesthouseName.replace(/[^a-zA-Z0-9]/g, '_')}_bookings.ics`;
  const filePath = `${cacheDir}${filename}`;

  const FileSystem = require('expo-file-system');
  await FileSystem.writeAsStringAsync(filePath, icalContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/calendar',
      dialogTitle: 'Export Calendar',
      UTI: 'public.ics',
    });
  }
}

export function generateICalUrl(guesthouseId: string): string {
  return `https://hyjgwmhmyhnqollkgcuk.supabase.co/functions/v1/ical?guesthouse=${guesthouseId}`;
}
