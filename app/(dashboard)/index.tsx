import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import Logo from '../../src/components/Logo';
import OccupancyDonut from '../../src/components/OccupancyDonut';
import StatCard from '../../src/components/StatCard';
import GuestList from '../../src/components/GuestList';
import AddBookingModal from '../../src/components/AddBookingModal';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { useRooms } from '../../src/hooks/useRooms';
import { useBookings } from '../../src/hooks/useBookings';

const DEMO_GUESTHOUSE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const mockRooms = [
  { id: '1', number: '101', pricePerNight: 2500 },
  { id: '2', number: '102', pricePerNight: 2500 },
  { id: '3', number: '103', pricePerNight: 2500 },
  { id: '4', number: '104', pricePerNight: 2800 },
  { id: '5', number: '105', pricePerNight: 2800 },
  { id: '6', number: '201', pricePerNight: 3200 },
  { id: '7', number: '202', pricePerNight: 3200 },
  { id: '8', number: '203', pricePerNight: 3200 },
  { id: '9', number: '204', pricePerNight: 3500 },
  { id: '10', number: '301', pricePerNight: 4000 },
  { id: '11', number: '302', pricePerNight: 4000 },
  { id: '12', number: '303', pricePerNight: 4500 },
];

const mockArrivals = [
  { id: '1', name: 'Ahmed Hassan', room: '101', time: '2:00 PM' },
  { id: '2', name: 'Sarah Chen', room: '205', time: '4:30 PM' },
];

const mockDepartures = [
  { id: '3', name: 'John Smith', room: '102', time: '11:00 AM' },
  { id: '4', name: 'Maria Garcia', room: '304', time: '12:00 PM' },
];

export default function DashboardScreen() {
  const { theme } = useTheme();

  const { currentGuesthouse } = useCurrentGuesthouse();
  const guesthouseId = currentGuesthouse?.id || DEMO_GUESTHOUSE_ID;

  const { rooms, stats, loading: roomsLoading } = useRooms(guesthouseId);
  const { todayArrivals, todayDepartures, loading: bookingsLoading, createBooking } = useBookings(guesthouseId);

  const [showAddBooking, setShowAddBooking] = useState(false);

  const loading = roomsLoading || bookingsLoading;

  const displayStats = rooms.length > 0 ? stats : {
    total: 12,
    occupied: 8,
    available: 3,
    cleaning: 1,
  };

  const occupancyPercent = displayStats.total > 0
    ? Math.round((displayStats.occupied / displayStats.total) * 100)
    : 0;

  const displayRooms = rooms.length > 0
    ? rooms.map((r) => ({ id: r.id, number: r.number, pricePerNight: Number(r.price_per_night) }))
    : mockRooms;

  const arrivals = todayArrivals.length > 0
    ? todayArrivals.map((b) => ({
        id: b.id,
        name: b.guest_name,
        room: b.rooms?.number || '',
        time: '2:00 PM',
      }))
    : mockArrivals;

  const departures = todayDepartures.length > 0
    ? todayDepartures.map((b) => ({
        id: b.id,
        name: b.guest_name,
        room: b.rooms?.number || '',
        time: '11:00 AM',
      }))
    : mockDepartures;

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveBooking = async (booking: any) => {
    try {
      await createBooking({
        ...booking,
        currency: currentGuesthouse?.currency || 'MVR',
      });
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo size={36} />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 17,
              color: theme.ink,
            }}
          >
            {currentGuesthouse?.name || 'Hudhu Veli'}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: theme.muted,
          }}
        >
          {formatDate()}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.light.primary} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.muted,
              marginTop: 12,
            }}
          >
            Loading...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 20 }}
        >
          {/* Hero Card */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 14,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.line,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
                <OccupancyDonut
                  percent={occupancyPercent}
                  size={100}
                  strokeWidth={12}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_800ExtraBold',
                      fontSize: 36,
                      color: theme.ink,
                      letterSpacing: -0.5,
                    }}
                  >
                    {displayStats.occupied} of {displayStats.total}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      color: theme.muted,
                      marginTop: 4,
                    }}
                  >
                    rooms booked today
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setShowAddBooking(true)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 3,
                })}
              >
                <Plus size={18} color="#ffffff" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: '#ffffff',
                  }}
                >
                  New booking
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Stat Cards */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              label="Total"
              value={displayStats.total}
              status="default"
            />
            <StatCard
              label="Occupied"
              value={displayStats.occupied}
              status="busy"
            />
            <StatCard
              label="Available"
              value={displayStats.available}
              status="ok"
            />
            <StatCard
              label="Cleaning"
              value={displayStats.cleaning}
              status="warn"
            />
          </View>

          {/* Arrivals & Departures */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <GuestList
              title="Arrivals today"
              guests={arrivals}
              type="arrival"
            />
            <GuestList
              title="Departures today"
              guests={departures}
              type="departure"
            />
          </View>
        </ScrollView>
      )}

      <AddBookingModal
        visible={showAddBooking}
        onClose={() => setShowAddBooking(false)}
        onSave={handleSaveBooking}
        rooms={displayRooms}
        currency={currentGuesthouse?.currency || 'MVR'}
      />
    </SafeAreaView>
  );
}
