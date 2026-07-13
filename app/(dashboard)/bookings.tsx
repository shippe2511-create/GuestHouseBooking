import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { useRooms } from '../../src/hooks/useRooms';
import { useBookings } from '../../src/hooks/useBookings';
import type { RoomStatus } from '../../src/types/database';

const DEMO_GUESTHOUSE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

interface DisplayRoom {
  id: string;
  number: string;
  status: RoomStatus;
  guestName: string | null;
  checkOut: Date | null;
  pricePerNight: number;
}

export default function RoomInventoryScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { currentGuesthouse } = useCurrentGuesthouse();
  const guesthouseId = currentGuesthouse?.id || DEMO_GUESTHOUSE_ID;

  const { rooms, loading: roomsLoading, updateRoomStatus } = useRooms(guesthouseId);
  const { bookings, checkOutGuest } = useBookings(guesthouseId);

  const [searchQuery, setSearchQuery] = useState('');

  const displayRooms: DisplayRoom[] = rooms.map((room) => {
    const activeBooking = bookings.find(
      (b) => b.room_id === room.id && (b.status === 'confirmed' || b.status === 'checked_in')
    );
    return {
      id: room.id,
      number: room.number,
      status: room.status,
      guestName: activeBooking?.guest_name || null,
      checkOut: activeBooking ? new Date(activeBooking.check_out) : null,
      pricePerNight: Number(room.price_per_night),
    };
  });

  const filteredRooms = displayRooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    return (
      room.number.toLowerCase().includes(query) ||
      room.guestName?.toLowerCase().includes(query) ||
      room.status.toLowerCase().includes(query)
    );
  });

  const handleCheckOut = async (room: DisplayRoom) => {
    const activeBooking = bookings.find(
      (b) => b.room_id === room.id && (b.status === 'confirmed' || b.status === 'checked_in')
    );
    if (activeBooking) {
      await checkOutGuest(activeBooking.id, room.id);
    }
  };

  const handleMarkCleaned = async (roomId: string) => {
    await updateRoomStatus(roomId, 'available');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (roomsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 19,
              color: theme.ink,
            }}
          >
            Room Inventory
          </Text>
          {!isMobile && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.chip,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                width: 280,
              }}
            >
              <Search size={18} color={theme.muted} strokeWidth={1.7} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search rooms or guests..."
                placeholderTextColor={theme.muted2}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.ink,
                }}
              />
            </View>
          )}
        </View>

        {/* Mobile Search */}
        {isMobile && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.chip,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <Search size={18} color={theme.muted} strokeWidth={1.7} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search rooms or guests..."
              placeholderTextColor={theme.muted2}
              style={{
                flex: 1,
                marginLeft: 10,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.ink,
              }}
            />
          </View>
        )}

        {isMobile ? (
          <MobileRoomList
            rooms={filteredRooms}
            theme={theme}
            onCheckOut={handleCheckOut}
            onMarkCleaned={handleMarkCleaned}
            formatDate={formatDate}
          />
        ) : (
          <DesktopRoomTable
            rooms={filteredRooms}
            theme={theme}
            onCheckOut={handleCheckOut}
            onMarkCleaned={handleMarkCleaned}
            formatDate={formatDate}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface RoomListProps {
  rooms: DisplayRoom[];
  theme: typeof colors.light;
  onCheckOut: (room: DisplayRoom) => void;
  onMarkCleaned: (roomId: string) => void;
  formatDate: (date: Date | null) => string;
}

function DesktopRoomTable({
  rooms,
  theme,
  onCheckOut,
  onMarkCleaned,
  formatDate,
}: RoomListProps) {
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.line,
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.tableHead,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <Text style={[headerStyle, { width: 90, color: theme.tableHeader }]}>
          ROOM
        </Text>
        <Text style={[headerStyle, { width: 150, color: theme.tableHeader }]}>
          STATUS
        </Text>
        <Text style={[headerStyle, { flex: 1, color: theme.tableHeader }]}>
          GUEST
        </Text>
        <Text style={[headerStyle, { width: 130, color: theme.tableHeader }]}>
          CHECK-OUT
        </Text>
        <Text
          style={[
            headerStyle,
            { width: 230, textAlign: 'right', color: theme.tableHeader },
          ]}
        >
          ACTIONS
        </Text>
      </View>

      {/* Table Rows */}
      {rooms.map((room, index) => (
        <View
          key={room.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 18,
            backgroundColor: index % 2 === 0 ? theme.surface : theme.altRow,
            borderBottomWidth: index < rooms.length - 1 ? 1 : 0,
            borderBottomColor: theme.rowLine,
          }}
        >
          <Text
            style={{
              width: 90,
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 14,
              color: theme.ink,
            }}
          >
            {room.number}
          </Text>
          <View style={{ width: 150 }}>
            <StatusPill status={room.status} theme={theme} />
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: room.guestName ? theme.ink : theme.faint,
            }}
          >
            {room.guestName || '—'}
          </Text>
          <Text
            style={{
              width: 130,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: room.checkOut ? theme.ink2 : theme.faint,
            }}
          >
            {formatDate(room.checkOut)}
          </Text>
          <View
            style={{
              width: 230,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <RoomActions
              room={room}
              theme={theme}
              onCheckOut={() => onCheckOut(room)}
              onMarkCleaned={() => onMarkCleaned(room.id)}
            />
          </View>
        </View>
      ))}

      {rooms.length === 0 && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.muted,
            }}
          >
            No rooms found
          </Text>
        </View>
      )}
    </View>
  );
}

function MobileRoomList({
  rooms,
  theme,
  onCheckOut,
  onMarkCleaned,
}: RoomListProps) {
  return (
    <View style={{ gap: 12 }}>
      {rooms.map((room) => (
        <View
          key={room.id}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 17,
                    color: theme.ink,
                  }}
                >
                  Room {room.number}
                </Text>
                <StatusPill status={room.status} theme={theme} />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: room.guestName ? theme.ink2 : theme.faint,
                }}
              >
                {room.guestName || 'No guest'}
                {room.checkOut && ` · Check-out ${room.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <MobileRoomAction
                room={room}
                theme={theme}
                onCheckOut={() => onCheckOut(room)}
                onMarkCleaned={() => onMarkCleaned(room.id)}
              />
            </View>
          </View>
        </View>
      ))}

      {rooms.length === 0 && (
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            padding: 40,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.muted,
            }}
          >
            No rooms found
          </Text>
        </View>
      )}
    </View>
  );
}

interface StatusPillProps {
  status: RoomStatus;
  theme: typeof colors.light;
}

function StatusPill({ status, theme }: StatusPillProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return { bg: theme.status.okBg, text: theme.status.okText, dot: theme.status.ok };
      case 'occupied':
        return { bg: theme.status.busyBg, text: theme.status.busyText, dot: theme.status.busy };
      case 'cleaning':
        return { bg: theme.status.warnBg, text: theme.status.warnText, dot: theme.status.warn };
    }
  };

  const style = getStatusStyle();
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: style.dot,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11.5,
          color: style.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface RoomActionsProps {
  room: DisplayRoom;
  theme: typeof colors.light;
  onCheckOut: () => void;
  onMarkCleaned: () => void;
}

function RoomActions({ room, theme, onCheckOut, onMarkCleaned }: RoomActionsProps) {
  if (room.status === 'occupied') {
    return (
      <Pressable
        onPress={onCheckOut}
        style={({ pressed }) => ({
          backgroundColor: pressed ? theme.chip : theme.surface,
          borderWidth: 1,
          borderColor: theme.inputLine,
          borderRadius: 9,
          paddingVertical: 9,
          paddingHorizontal: 14,
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: theme.ink3,
          }}
        >
          Check out
        </Text>
      </Pressable>
    );
  }

  if (room.status === 'cleaning') {
    return (
      <Pressable
        onPress={onMarkCleaned}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
          borderRadius: 9,
          paddingVertical: 9,
          paddingHorizontal: 14,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3,
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: '#ffffff',
          }}
        >
          Mark cleaned
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.chip : theme.surface,
        borderWidth: 1,
        borderColor: theme.inputLine,
        borderRadius: 9,
        paddingVertical: 9,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      })}
    >
      <Plus size={16} color={colors.light.primary} strokeWidth={2} />
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 13,
          color: colors.light.primary,
        }}
      >
        Book
      </Text>
    </Pressable>
  );
}

function MobileRoomAction({ room, theme, onCheckOut, onMarkCleaned }: RoomActionsProps) {
  if (room.status === 'occupied') {
    return (
      <Pressable
        onPress={onCheckOut}
        style={({ pressed }) => ({
          backgroundColor: pressed ? theme.chip : theme.surface,
          borderWidth: 1,
          borderColor: theme.inputLine,
          borderRadius: 9,
          paddingVertical: 10,
          paddingHorizontal: 16,
          minHeight: 44,
          justifyContent: 'center',
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: theme.ink3,
          }}
        >
          Check out
        </Text>
      </Pressable>
    );
  }

  if (room.status === 'cleaning') {
    return (
      <Pressable
        onPress={onMarkCleaned}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
          borderRadius: 9,
          paddingVertical: 10,
          paddingHorizontal: 16,
          minHeight: 44,
          justifyContent: 'center',
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3,
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: '#ffffff',
          }}
        >
          Mark cleaned
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.chip : theme.surface,
        borderWidth: 1,
        borderColor: theme.inputLine,
        borderRadius: 9,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
      })}
    >
      <Plus size={16} color={colors.light.primary} strokeWidth={2} />
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 13,
          color: colors.light.primary,
        }}
      >
        Book
      </Text>
    </Pressable>
  );
}

const headerStyle = {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 11.5,
  letterSpacing: 0.5,
};
