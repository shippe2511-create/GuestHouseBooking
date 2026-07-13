import { supabase } from './supabase';
import type { Tables } from '../types/database';

type Booking = Tables<'bookings'>;
type Payment = Tables<'payments'>;
type Guesthouse = Tables<'guesthouses'>;

interface ReceiptEmailData {
  booking: Booking;
  payment: Payment;
  guesthouse: Guesthouse;
  roomNumber: string;
}

export function generateReceiptHtml(data: ReceiptEmailData): string {
  const { booking, payment, guesthouse, roomNumber } = data;
  const checkIn = new Date(booking.check_in).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const checkOut = new Date(booking.check_out).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 24px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #2563eb; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${guesthouse.name}</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${guesthouse.island}, Maldives</p>
    </div>

    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">Payment Receipt</h2>

      <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Guest</p>
        <p style="margin: 0; font-size: 16px; color: #18181b; font-weight: 600;">${booking.guest_name}</p>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <div style="flex: 1; background: #f4f4f5; border-radius: 8px; padding: 12px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #71717a;">Check-in</p>
          <p style="margin: 0; font-size: 14px; color: #18181b; font-weight: 500;">${checkIn}</p>
        </div>
        <div style="flex: 1; background: #f4f4f5; border-radius: 8px; padding: 12px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #71717a;">Check-out</p>
          <p style="margin: 0; font-size: 14px; color: #18181b; font-weight: 500;">${checkOut}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 14px;">Room</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${roomNumber}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 14px;">Nights</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${booking.total_nights || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 14px;">Amount Paid</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${payment.currency} ${payment.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 14px;">Method</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${payment.method}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #71717a; font-size: 14px;">Date</td>
          <td style="padding: 12px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${new Date(payment.created_at).toLocaleDateString()}</td>
        </tr>
      </table>

      <div style="background: #dcfce7; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #166534;">Total Paid</p>
        <p style="margin: 0; font-size: 24px; color: #166534; font-weight: 700;">${payment.currency} ${payment.amount.toLocaleString()}</p>
      </div>
    </div>

    <div style="padding: 16px 24px; background: #f4f4f5; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #71717a;">Thank you for staying with us!</p>
      <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa;">Receipt #${payment.id.slice(0, 8).toUpperCase()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

interface InviteEmailData {
  guesthouse: Guesthouse;
  inviterName: string;
  role: string;
  inviteLink: string;
}

export function generateInviteHtml(data: InviteEmailData): string {
  const { guesthouse, inviterName, role, inviteLink } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 24px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #2563eb; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 24px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
        <strong>${inviterName}</strong> has invited you to join <strong>${guesthouse.name}</strong> as a <strong>${role}</strong>.
      </p>

      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #71717a;">Property</p>
        <p style="margin: 0 0 4px; font-size: 18px; color: #18181b; font-weight: 600;">${guesthouse.name}</p>
        <p style="margin: 0; font-size: 14px; color: #71717a;">${guesthouse.island}, Maldives</p>
      </div>

      <a href="${inviteLink}" style="display: block; background: #2563eb; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center;">
        Accept Invitation
      </a>

      <p style="margin: 24px 0 0; font-size: 13px; color: #a1a1aa; text-align: center;">
        This invitation will expire in 7 days.
      </p>
    </div>

    <div style="padding: 16px 24px; background: #f4f4f5; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #71717a;">Powered by GuestOS</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendReceiptEmail(data: ReceiptEmailData): Promise<boolean> {
  if (!data.booking.guest_email) return false;

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.booking.guest_email,
        subject: `Payment Receipt - ${data.guesthouse.name}`,
        html: generateReceiptHtml(data),
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    return false;
  }
}

export async function sendInviteEmail(
  email: string,
  data: InviteEmailData
): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: `You're invited to join ${data.guesthouse.name}`,
        html: generateInviteHtml(data),
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return false;
  }
}
