import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { useRooms } from '../../src/hooks/useRooms';
import { useBookings } from '../../src/hooks/useBookings';
import GuestDetailModal from '../../src/components/GuestDetailModal';
import type { RoomStatus, Currency } from '../../src/types/database';

interface CalendarBooking {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  pricePerNight: number;
  currency: Currency;
}

interface CalendarRoom {
  id: string;
  number: string;
  status: RoomStatus;
}

const mockRooms: CalendarRoom[] = [
  { id: '1', number: '101', status: 'occupied' },
  { id: '2', number: '102', status: 'occupied' },
  { id: '3', number: '103', status: 'available' },
  { id: '4', number: '104', status: 'occupied' },
  { id: '5', number: '105', status: 'cleaning' },
  { id: '6', number: '201', status: 'occupied' },
  { id: '7', number: '202', status: 'occupied' },
  { id: '8', number: '203', status: 'available' },
  { id: '9', number: '204', status: 'occupied' },
  { id: '10', number: '301', status: 'occupied' },
  { id: '11', number: '302', status: 'available' },
  { id: '12', number: '303', status: 'occupied' },
];

const mockBookings: CalendarBooking[] = [
  { id: 'b1', guestName: 'Ahmed Hassan', guestPhone: '+960 772-1234', guestEmail: 'ahmed@email.com', roomId: '1', checkIn: new Date(2026, 6, 10), checkOut: new Date(2026, 6, 15), guests: 2, pricePerNight: 2500, currency: 'MVR' },
  { id: 'b2', guestName: 'Sarah Chen', guestPhone: '+1 555-0123', guestEmail: 'sarah.chen@email.com', roomId: '2', checkIn: new Date(2026, 6, 12), checkOut: new Date(2026, 6, 18), guests: 2, pricePerNight: 2500, currency: 'MVR' },
  { id: 'b3', guestName: 'John Smith', guestPhone: '+44 7911 123456', guestEmail: 'j.smith@email.com', roomId: '4', checkIn: new Date(2026, 6, 8), checkOut: new Date(2026, 6, 14), guests: 1, pricePerNight: 2800, currency: 'MVR' },
  { id: 'b4', guestName: 'Maria Garcia', guestPhone: '+34 612 345 678', guestEmail: 'maria.g@email.com', roomId: '6', checkIn: new Date(2026, 6, 11), checkOut: new Date(2026, 6, 16), guests: 2, pricePerNight: 3200, currency: 'MVR' },
  { id: 'b5', guestName: 'James Wilson', guestPhone: '+1 555-9876', guestEmail: 'jwilson@email.com', roomId: '7', checkIn: new Date(2026, 6, 13), checkOut: new Date(2026, 6, 20), guests: 3, pricePerNight: 3200, currency: 'MVR' },
  { id: 'b6', guestName: 'Lisa Anderson', guestPhone: '+46 70 123 4567', guestEmail: 'lisa.a@email.com', roomId: '9', checkIn: new Date(2026, 6, 9), checkOut: new Date(2026, 6, 13), guests: 2, pricePerNight: 3500, currency: 'MVR' },
  { id: 'b7', guestName: 'David Brown', guestPhone: '+61 412 345 678', guestEmail: 'd.brown@email.com', roomId: '10', checkIn: new Date(2026, 6, 14), checkOut: new Date(2026, 6, 19), guests: 2, pricePerNight: 4000, currency: 'MVR' },
  { id: 'b8', guestName: 'Emma Davis', guestPhone: '+49 151 12345678', guestEmail: 'emma.d@email.com', roomId: '12', checkIn: new Date(2026, 6, 10), checkOut: new Date(2026, 6, 17), guests: 2, pricePerNight: 4500, currency: 'MVR' },
];

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { currentGuesthouse } = useCurrentGuesthouse();

  const { rooms: supabaseRooms, loading: roomsLoading } = useRooms(currentGuesthouse?.id);
  const { bookings: supabaseBookings, loading: bookingsLoading } = useBookings(currentGuesthouse?.id);

  const rooms: CalendarRoom[] = useMemo(() => {
    if (supabaseRooms.length > 0) {
      return supabaseRooms.map((r) => ({
        id: r.id,
        number: r.number,
        status: r.status,
      }));
    }
    return mockRooms;
  }, [supabaseRooms]);

  const bookingsData: CalendarBooking[] = useMemo(() => {
    if (supabaseBookings.length > 0) {
      return supabaseBookings.map((b) => {
        const nights = Math.ceil(
          (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: b.id,
          guestName: b.guest_name,
          guestPhone: b.guest_phone,
          guestEmail: b.guest_email,
          roomId: b.room_id,
          checkIn: new Date(b.check_in),
          checkOut: new Date(b.check_out),
          guests: b.guests,
          pricePerNight: nights > 0 ? b.price / nights : b.price,
          currency: b.currency,
        };
      });
    }
    return mockBookings;
  }, [supabaseBookings]);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedBooking, setSelectedBooking] = useState<{
    name: string;
    phone: string;
    email: string;
    roomNumber: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    pricePerNight: number;
    currency: string;
  } | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })[0],
        dayNumber: i + 1,
      };
    });
  }, [currentDate]);

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getBookingForCell = (roomId: string, date: Date): CalendarBooking | null => {
    return bookingsData.find((b) => {
      if (b.roomId !== roomId) return false;
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const cellDate = new Date(date);
      cellDate.setHours(0, 0, 0, 0);
      return cellDate >= checkIn && cellDate < checkOut;
    }) || null;
  };

  const isFirstNight = (booking: CalendarBooking, date: Date): boolean => {
    const checkIn = new Date(booking.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    return checkIn.getTime() === cellDate.getTime();
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCellStatus = (roomId: string, date: Date): 'available' | 'booked' | 'cleaning' => {
    const room = rooms.find((r) => r.id === roomId);
    if (room?.status === 'cleaning') return 'cleaning';
    const booking = getBookingForCell(roomId, date);
    return booking ? 'booked' : 'available';
  };

  const handleCellPress = (roomId: string, date: Date) => {
    const booking = getBookingForCell(roomId, date);
    const room = rooms.find((r) => r.id === roomId);
    if (booking && room) {
      setSelectedBooking({
        name: booking.guestName,
        phone: booking.guestPhone,
        email: booking.guestEmail,
        roomNumber: room.number,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        pricePerNight: booking.pricePerNight,
        currency: booking.currency,
      });
    }
  };

  const cellWidth = Math.max(36, (width - 74 - 48) / Math.min(daysInMonth.length, 14));
  const isLoading = roomsLoading || bookingsLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: theme.line,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={prevMonth}
                style={({ pressed }) => ({
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: pressed ? theme.chip : 'transparent',
                })}
              >
                <ChevronLeft size={20} color={theme.ink2} strokeWidth={1.7} />
              </Pressable>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 17,
                  color: theme.ink,
                  minWidth: 140,
                  textAlign: 'center',
                }}
              >
                {monthYear}
              </Text>
              <Pressable
                onPress={nextMonth}
                style={({ pressed }) => ({
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: pressed ? theme.chip : 'transparent',
                })}
              >
                <ChevronRight size={20} color={theme.ink2} strokeWidth={1.7} />
              </Pressable>
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <LegendItem label="Available" color={theme.status.ok} theme={theme} />
              <LegendItem label="Booked" color={theme.status.busy} theme={theme} />
              <LegendItem label="Cleaning" color={theme.status.warn} theme={theme} />
            </View>
          </View>

          {/* Calendar Grid */}
          {isLoading ? (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.light.primary} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.muted,
                  marginTop: 12,
                }}
              >
                Loading calendar...
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ padding: 4 }}>
                {/* Day Headers */}
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 74, paddingVertical: 8, paddingHorizontal: 12 }} />
                  {daysInMonth.map((day) => (
                    <View
                      key={day.dayNumber}
                      style={{
                        width: cellWidth,
                        alignItems: 'center',
                        paddingVertical: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_500Medium',
                          fontSize: 10,
                          color: theme.muted2,
                          textTransform: 'uppercase',
                        }}
                      >
                        {day.dayOfWeek}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 13,
                          color: theme.ink,
                          marginTop: 2,
                        }}
                      >
                        {day.dayNumber}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Room Rows */}
                {rooms.map((room) => (
                  <View key={room.id} style={{ flexDirection: 'row', marginTop: 4 }}>
                    <View
                      style={{
                        width: 74,
                        justifyContent: 'center',
                        paddingHorizontal: 12,
                        height: 36,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'PlusJakartaSans_700Bold',
                          fontSize: 13,
                          color: theme.ink,
                        }}
                      >
                        {room.number}
                      </Text>
                    </View>
                    {daysInMonth.map((day) => {
                      const status = getCellStatus(room.id, day.date);
                      const booking = getBookingForCell(room.id, day.date);
                      const showInitials = booking && isFirstNight(booking, day.date);

                      return (
                        <CalendarCell
                          key={`${room.id}-${day.dayNumber}`}
                          status={status}
                          initials={showInitials ? getInitials(booking.guestName) : undefined}
                          width={cellWidth}
                          theme={theme}
                          onPress={() => handleCellPress(room.id, day.date)}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Footer hint */}
          <View
            style={{
              padding: 14,
              borderTopWidth: 1,
              borderTopColor: theme.line,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: theme.muted,
                textAlign: 'center',
              }}
            >
              Tap a cell to view booking details or create a new booking
            </Text>
          </View>
        </View>
      </ScrollView>

      <GuestDetailModal
        visible={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        guest={selectedBooking}
      />
    </SafeAreaView>
  );
}

interface LegendItemProps {
  label: string;
  color: string;
  theme: typeof colors.light;
}

function LegendItem({ label, color, theme }: LegendItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: theme.ink3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface CalendarCellProps {
  status: 'available' | 'booked' | 'cleaning';
  initials?: string;
  width: number;
  theme: typeof colors.light;
  onPress: () => void;
}

function CalendarCell({ status, initials, width, theme, onPress }: CalendarCellProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'available':
        return { bg: theme.status.okBg, text: theme.status.okText };
      case 'booked':
        return { bg: theme.status.busyBg, text: theme.status.busyText };
      case 'cleaning':
        return { bg: theme.status.warnBg, text: theme.status.warnText };
    }
  };

  const statusColors = getStatusColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: width - 4,
        height: 36,
        marginHorizontal: 2,
        borderRadius: 6,
        backgroundColor: statusColors.bg,
        opacity: pressed ? 0.7 : 1,
        justifyContent: 'center',
        alignItems: 'center',
      })}
    >
      {initials && (
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 10.5,
            color: statusColors.text,
          }}
        >
          {initials}
        </Text>
      )}
    </Pressable>
  );
}
