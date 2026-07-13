import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Home,
  Calendar,
  BedDouble,
  DollarSign,
  Receipt,
  Users,
  Building2,
  Settings,
  ChevronDown,
  Check,
  Plus,
  LogOut,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentGuesthouse, useUserGuesthouses } from '../contexts/GuesthouseContext';
import Logo from './Logo';
import type { Tables } from '../types/database';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/(dashboard)', icon: Home },
  { name: 'Calendar', href: '/(dashboard)/calendar', icon: Calendar },
  { name: 'Rooms', href: '/(dashboard)/bookings', icon: BedDouble },
  { name: 'Revenue', href: '/(dashboard)/revenue', icon: DollarSign },
  { name: 'Payments', href: '/(dashboard)/payments', icon: Receipt },
  { name: 'Staff', href: '/(dashboard)/staff', icon: Users },
  { name: 'Properties', href: '/(dashboard)/properties', icon: Building2 },
  { name: 'Settings', href: '/(dashboard)/settings', icon: Settings },
];

interface Property {
  id: string;
  name: string;
  island: string;
}

const mockProperties: Property[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Hudhu Veli', island: 'Maafushi' },
  { id: '2', name: 'Raalhu Lodge', island: 'Thulusdhoo' },
  { id: '3', name: 'Finolhu Inn', island: 'Dhiffushi' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { signOut, profile } = useAuth();
  const { currentGuesthouse, setCurrentGuesthouse } = useCurrentGuesthouse();
  const { guesthouses } = useUserGuesthouses();

  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const properties: Property[] = useMemo(() => {
    if (guesthouses.length > 0) {
      return guesthouses.map((g: Tables<'guesthouses'>) => ({
        id: g.id,
        name: g.name,
        island: g.island,
      }));
    }
    return mockProperties;
  }, [guesthouses]);

  const activeProperty = currentGuesthouse
    ? { id: currentGuesthouse.id, name: currentGuesthouse.name, island: currentGuesthouse.island }
    : properties[0];

  const isActive = (href: string) => {
    if (href === '/(dashboard)') {
      return pathname === '/' || pathname === '/(dashboard)' || pathname === '/index';
    }
    return pathname.startsWith(href);
  };

  const handleSelectProperty = (property: Property) => {
    const fullGuesthouse = guesthouses.find((g: Tables<'guesthouses'>) => g.id === property.id);
    if (fullGuesthouse) {
      setCurrentGuesthouse(fullGuesthouse);
    } else {
      setCurrentGuesthouse({
        id: property.id,
        name: property.name,
        island: property.island,
        total_rooms: 12,
        currency: 'MVR',
        status: 'active',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Tables<'guesthouses'>);
    }
    setShowPropertyPicker(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View
      style={{
        width: 228,
        backgroundColor: theme.surface,
        borderRightWidth: 1,
        borderRightColor: theme.line,
        height: '100%',
      }}
    >
      {/* Logo / Property Switcher */}
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <Pressable
          onPress={() => setShowPropertyPicker(!showPropertyPicker)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: pressed ? theme.chip : colors.light.primarySoft,
            borderRadius: 10,
            padding: 12,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo size={28} />
            <View>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 14,
                  color: theme.ink,
                }}
                numberOfLines={1}
              >
                {activeProperty.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: theme.muted,
                }}
              >
                {activeProperty.island}
              </Text>
            </View>
          </View>
          <ChevronDown
            size={16}
            color={theme.muted}
            strokeWidth={1.7}
            style={{ transform: [{ rotate: showPropertyPicker ? '180deg' : '0deg' }] }}
          />
        </Pressable>

        {showPropertyPicker && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: theme.surface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.line,
              overflow: 'hidden',
            }}
          >
            {properties.map((property, index) => (
              <Pressable
                key={property.id}
                onPress={() => handleSelectProperty(property)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor:
                    activeProperty.id === property.id
                      ? colors.light.primarySoft
                      : pressed
                      ? theme.chip
                      : theme.surface,
                  borderBottomWidth: index < properties.length - 1 ? 1 : 0,
                  borderBottomColor: theme.lineSoft,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <GradientChip size={28} index={index} />
                  <View>
                    <Text
                      style={{
                        fontFamily:
                          activeProperty.id === property.id
                            ? 'Inter_600SemiBold'
                            : 'Inter_500Medium',
                        fontSize: 13,
                        color:
                          activeProperty.id === property.id
                            ? colors.light.primary
                            : theme.ink,
                      }}
                    >
                      {property.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 11,
                        color: theme.muted,
                      }}
                    >
                      {property.island}
                    </Text>
                  </View>
                </View>
                {activeProperty.id === property.id && (
                  <Check size={16} color={colors.light.primary} strokeWidth={2} />
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setShowPropertyPicker(false);
                router.push('/(dashboard)/properties');
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderTopWidth: 1,
                borderTopColor: theme.line,
                borderStyle: 'dashed',
              })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  borderWidth: 1.5,
                  borderColor: theme.muted2,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Plus size={14} color={theme.muted} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: theme.muted,
                }}
              >
                Add guesthouse
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Navigation */}
      <ScrollView style={{ flex: 1, padding: 12 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.href as any)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                marginBottom: 2,
                backgroundColor: active
                  ? colors.light.primarySoft
                  : pressed
                  ? theme.chip
                  : 'transparent',
              })}
            >
              <Icon
                size={18}
                color={active ? colors.light.primary : theme.nav}
                strokeWidth={1.7}
              />
              <Text
                style={{
                  fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
                  fontSize: 14,
                  color: active ? colors.light.primary : theme.nav,
                }}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* User Section */}
      <View
        style={{
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: theme.line,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.chip,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12,
                  color: theme.ink2,
                }}
              >
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: theme.ink,
                }}
                numberOfLines={1}
              >
                {profile?.full_name || 'Demo User'}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: theme.muted,
                }}
                numberOfLines={1}
              >
                {profile?.email || 'demo@guestos.app'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => ({
              padding: 6,
              borderRadius: 6,
              backgroundColor: pressed ? theme.chip : 'transparent',
            })}
          >
            <LogOut size={18} color={theme.muted} strokeWidth={1.7} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const colorPalette = ['#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

function GradientChip({ size, index = 0 }: { size: number; index?: number }) {
  const color = colorPalette[index % colorPalette.length];
  const accentColor = adjustColor(color, 40);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`sidebarGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={accentColor} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={size}
          height={size}
          rx={size * 0.25}
          fill={`url(#sidebarGrad-${index})`}
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
