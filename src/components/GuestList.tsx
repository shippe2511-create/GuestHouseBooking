import { View, Text, useColorScheme } from 'react-native';
import { colors } from '../constants/theme';

interface Guest {
  id: string;
  name: string;
  room: string;
  time: string;
}

interface GuestListProps {
  title: string;
  guests: Guest[];
  type: 'arrival' | 'departure';
}

export default function GuestList({ title, guests, type }: GuestListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarBg = type === 'arrival' ? theme.status.okBg : theme.status.busyBg;
  const avatarText = type === 'arrival' ? theme.status.okText : theme.status.busyText;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.line,
      }}
    >
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 14,
          color: theme.ink,
          marginBottom: 16,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 12 }}>
        {guests.map((guest) => (
          <View
            key={guest.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: avatarBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12,
                    color: avatarText,
                  }}
                >
                  {getInitials(guest.name)}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13.5,
                  color: theme.ink,
                }}
              >
                {guest.name}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: theme.muted,
              }}
            >
              Room {guest.room} · {guest.time}
            </Text>
          </View>
        ))}
        {guests.length === 0 && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.muted,
              textAlign: 'center',
              paddingVertical: 12,
            }}
          >
            No {type === 'arrival' ? 'arrivals' : 'departures'} today
          </Text>
        )}
      </View>
    </View>
  );
}
