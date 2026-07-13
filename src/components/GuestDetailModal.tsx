import {
  View,
  Text,
  Pressable,
  Modal,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../constants/theme';

interface GuestDetailModalProps {
  visible: boolean;
  onClose: () => void;
  guest: {
    name: string;
    phone: string;
    email: string;
    roomNumber: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    pricePerNight: number;
    currency: string;
  } | null;
}

export default function GuestDetailModal({
  visible,
  onClose,
  guest,
}: GuestDetailModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  if (!guest) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const nights = Math.ceil(
    (guest.checkOut.getTime() - guest.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total = nights * guest.pricePerNight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.42)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            width: '100%',
            maxWidth: 460,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 24 },
            shadowOpacity: 0.3,
            shadowRadius: 60,
            elevation: 10,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.line,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: theme.status.busyBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.status.busyText,
                  }}
                >
                  {getInitials(guest.name)}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 17,
                    color: theme.ink,
                  }}
                >
                  {guest.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: theme.muted,
                    marginTop: 2,
                  }}
                >
                  Room {guest.roomNumber} · {nights} nights
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  backgroundColor: theme.status.busyBg,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 11.5,
                    color: theme.status.busyText,
                  }}
                >
                  Checked in
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: pressed ? theme.chip : theme.chip,
                })}
              >
                <X size={18} color={theme.ink3} strokeWidth={1.7} />
              </Pressable>
            </View>
          </View>

          {/* Details Grid */}
          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginHorizontal: -8,
              }}
            >
              <DetailItem
                label="Check-in"
                value={formatDate(guest.checkIn)}
                theme={theme}
              />
              <DetailItem
                label="Check-out"
                value={formatDate(guest.checkOut)}
                theme={theme}
              />
              <DetailItem label="Phone" value={guest.phone} theme={theme} />
              <DetailItem
                label="Guests"
                value={`${guest.guests} ${guest.guests === 1 ? 'guest' : 'guests'}`}
                theme={theme}
              />
              <DetailItem
                label="Email"
                value={guest.email}
                theme={theme}
                fullWidth
              />
            </View>

            {/* Price Summary */}
            <View
              style={{
                backgroundColor: theme.tableHead,
                borderRadius: 10,
                padding: 16,
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.ink2,
                }}
              >
                {nights} nights × {guest.currency} {guest.pricePerNight.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 16,
                  color: theme.ink,
                }}
              >
                {guest.currency} {total.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 20,
              paddingTop: 0,
            }}
          >
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderWidth: 1,
                borderColor: theme.inputLine,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: theme.ink3,
                }}
              >
                Edit booking
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
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
                  fontSize: 14,
                  color: '#ffffff',
                }}
              >
                Check out guest
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  theme: typeof colors.light;
  fullWidth?: boolean;
}

function DetailItem({ label, value, theme, fullWidth }: DetailItemProps) {
  return (
    <View
      style={{
        width: fullWidth ? '100%' : '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          color: theme.muted2,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 14,
          color: theme.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
