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
import { Plus, ChevronRight, Check } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse, useUserGuesthouses } from '../../src/contexts/GuesthouseContext';
import type { Currency, Tables } from '../../src/types/database';

interface Property {
  id: string;
  name: string;
  island: string;
  totalRooms: number;
  occupiedRooms: number;
  todayRevenue: number;
  currency: Currency;
  color: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Hudhu Veli',
    island: 'Maafushi',
    totalRooms: 12,
    occupiedRooms: 8,
    todayRevenue: 38500,
    currency: 'MVR',
    color: '#2563eb',
  },
  {
    id: '2',
    name: 'Raalhu Lodge',
    island: 'Thulusdhoo',
    totalRooms: 8,
    occupiedRooms: 6,
    todayRevenue: 24200,
    currency: 'MVR',
    color: '#0d9488',
  },
  {
    id: '3',
    name: 'Finolhu Inn',
    island: 'Dhiffushi',
    totalRooms: 6,
    occupiedRooms: 4,
    todayRevenue: 18600,
    currency: 'MVR',
    color: '#7c3aed',
  },
];

const colorPalette = ['#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

export default function PropertiesScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { guesthouses, loading } = useUserGuesthouses();
  const { currentGuesthouse, setCurrentGuesthouse } = useCurrentGuesthouse();

  const [activePropertyId, setActivePropertyId] = useState<string | null>(currentGuesthouse?.id || null);

  const properties: Property[] = useMemo(() => {
    if (guesthouses.length > 0) {
      return guesthouses.map((g: Tables<'guesthouses'>, index: number) => ({
        id: g.id,
        name: g.name,
        island: g.island,
        totalRooms: g.total_rooms,
        occupiedRooms: Math.round(g.total_rooms * 0.67),
        todayRevenue: Math.round(g.total_rooms * 3200),
        currency: g.currency,
        color: colorPalette[index % colorPalette.length],
      }));
    }
    return mockProperties;
  }, [guesthouses]);

  const handleSelectProperty = (property: Property) => {
    setActivePropertyId(property.id);
    const gh = guesthouses.find((g: Tables<'guesthouses'>) => g.id === property.id);
    if (gh) {
      setCurrentGuesthouse(gh);
    }
  };

  const activeId = activePropertyId || (properties.length > 0 ? properties[0].id : null);
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, p) => sum + p.totalRooms, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.todayRevenue, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 19,
                color: theme.ink,
              }}
            >
              My Properties
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.muted,
                marginTop: 4,
              }}
            >
              Manage all your guesthouses
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View
          style={{
            flexDirection: 'row',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard
            label="Properties"
            value={totalProperties.toString()}
            theme={theme}
          />
          <SummaryCard
            label="Total Rooms"
            value={totalRooms.toString()}
            theme={theme}
          />
          <SummaryCard
            label="Revenue Today"
            value={`MVR ${totalRevenue.toLocaleString()}`}
            theme={theme}
          />
        </View>

        {/* Property Cards */}
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.light.primary} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: theme.muted,
                marginTop: 12,
              }}
            >
              Loading properties...
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isActive={property.id === activeId}
                onSelect={() => handleSelectProperty(property)}
                theme={theme}
                isDesktop={isDesktop}
              />
            ))}

            {/* Add Property Card */}
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: theme.line,
                borderStyle: 'dashed',
                padding: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              })}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: theme.chip,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Plus size={18} color={theme.muted} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: theme.muted,
                }}
              >
                Add another guesthouse
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  theme: typeof colors.light;
}

function SummaryCard({ label, value, theme }: SummaryCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.line,
        padding: 18,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11.5,
          color: theme.muted2,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 24,
          color: theme.ink,
          marginTop: 8,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

interface PropertyCardProps {
  property: Property;
  isActive: boolean;
  onSelect: () => void;
  theme: typeof colors.light;
  isDesktop: boolean;
}

function PropertyCard({
  property,
  isActive,
  onSelect,
  theme,
  isDesktop,
}: PropertyCardProps) {
  const occupancyPercent = Math.round(
    (property.occupiedRooms / property.totalRooms) * 100
  );

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => ({
        backgroundColor: isActive
          ? colors.light.primarySoft
          : pressed
          ? theme.chip
          : theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isActive ? colors.light.primary : theme.line,
        padding: 20,
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: isDesktop ? 'center' : 'stretch',
        gap: isDesktop ? 20 : 16,
      })}
    >
      {/* Property Info */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          flex: isDesktop ? 1 : undefined,
        }}
      >
        <GradientChip color={property.color} size={46} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 16,
                color: isActive ? colors.light.primary : theme.ink,
              }}
            >
              {property.name}
            </Text>
            {isActive && (
              <View
                style={{
                  backgroundColor: colors.light.primary,
                  borderRadius: 10,
                  padding: 2,
                }}
              >
                <Check size={12} color="#ffffff" strokeWidth={3} />
              </View>
            )}
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.muted,
              marginTop: 2,
            }}
          >
            {property.island} · {property.totalRooms} rooms
          </Text>
        </View>
      </View>

      {/* Occupancy Bar */}
      <View style={{ width: isDesktop ? 160 : '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 12,
              color: theme.muted,
            }}
          >
            Occupancy
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: theme.ink,
            }}
          >
            {occupancyPercent}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: theme.track,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${occupancyPercent}%`,
              height: '100%',
              backgroundColor: property.color,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Revenue */}
      <View
        style={{
          alignItems: isDesktop ? 'flex-end' : 'flex-start',
          minWidth: isDesktop ? 120 : undefined,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          Today
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 18,
            color: theme.ink,
            marginTop: 2,
          }}
        >
          {property.currency} {property.todayRevenue.toLocaleString()}
        </Text>
      </View>

      {/* Open Button */}
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: pressed ? theme.lineSoft : theme.surface,
          borderWidth: 1,
          borderColor: theme.inputLine,
          borderRadius: 9,
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: isDesktop ? 'center' : 'flex-start',
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: theme.ink2,
          }}
        >
          Open
        </Text>
        <ChevronRight size={16} color={theme.muted} strokeWidth={1.7} />
      </Pressable>
    </Pressable>
  );
}

interface GradientChipProps {
  color: string;
  size: number;
}

function GradientChip({ color, size }: GradientChipProps) {
  const accentColor = adjustColor(color, 40);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={accentColor} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={size}
          height={size}
          rx={size * 0.27}
          fill={`url(#grad-${color})`}
        />
      </Svg>
    </View>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
