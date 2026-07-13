import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Search, Eye, Settings, RefreshCw, ArrowLeft } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import type { GuestHouseStatus, Tables } from '../../src/types/database';

interface Guesthouse {
  id: string;
  name: string;
  island: string;
  ownerName: string;
  ownerEmail: string;
  totalRooms: number;
  occupancyPercent: number;
  status: GuestHouseStatus;
}

const mockGuesthouses: Guesthouse[] = [
  { id: '1', name: 'Hudhu Veli', island: 'Maafushi', ownerName: 'Ibrahim Nashid', ownerEmail: 'ibrahim@hudhuveli.mv', totalRooms: 12, occupancyPercent: 67, status: 'active' },
  { id: '2', name: 'Raalhu Lodge', island: 'Thulusdhoo', ownerName: 'Ahmed Fazeel', ownerEmail: 'fazeel@raalhu.mv', totalRooms: 8, occupancyPercent: 75, status: 'active' },
  { id: '3', name: 'Finolhu Inn', island: 'Dhiffushi', ownerName: 'Mariyam Shifa', ownerEmail: 'shifa@finolhu.mv', totalRooms: 6, occupancyPercent: 83, status: 'active' },
  { id: '4', name: 'Veli Beach House', island: 'Huraa', ownerName: 'Hassan Manik', ownerEmail: 'manik@velibeach.mv', totalRooms: 10, occupancyPercent: 40, status: 'trial' },
  { id: '5', name: 'Coral View', island: 'Gulhi', ownerName: 'Aishath Noor', ownerEmail: 'noor@coralview.mv', totalRooms: 5, occupancyPercent: 60, status: 'trial' },
  { id: '6', name: 'Sunset Lodge', island: 'Guraidhoo', ownerName: 'Mohamed Ali', ownerEmail: 'ali@sunsetlodge.mv', totalRooms: 7, occupancyPercent: 0, status: 'suspended' },
];

const adminDarkTheme = {
  headerBg: '#0f172a',
  headerText: '#f1f5f9',
  badgeBg: 'rgba(255, 255, 255, 0.14)',
};

export default function AdminConsoleScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { setCurrentGuesthouse } = useCurrentGuesthouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [guesthouses, setGuesthouses] = useState<Guesthouse[]>(mockGuesthouses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuesthouses();
  }, []);

  const fetchGuesthouses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guesthouses')
        .select(`
          *,
          memberships!inner (
            role,
            users (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Guesthouse[] = data.map((g: any) => {
          const owner = g.memberships?.find((m: any) => m.role === 'owner');
          return {
            id: g.id,
            name: g.name,
            island: g.island,
            ownerName: owner?.users?.full_name || 'Unknown',
            ownerEmail: owner?.users?.email || 'N/A',
            totalRooms: g.total_rooms,
            occupancyPercent: Math.round(Math.random() * 100),
            status: g.status as GuestHouseStatus,
          };
        });
        setGuesthouses(mapped);
      }
    } catch (err) {
      console.error('Error fetching guesthouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: guesthouses.length,
    active: guesthouses.filter((g) => g.status === 'active').length,
    trial: guesthouses.filter((g) => g.status === 'trial').length,
    suspended: guesthouses.filter((g) => g.status === 'suspended').length,
  };

  const filteredGuesthouses = guesthouses.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(query) ||
      g.island.toLowerCase().includes(query) ||
      g.ownerName.toLowerCase().includes(query) ||
      g.ownerEmail.toLowerCase().includes(query)
    );
  });

  const handleReactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guesthouses')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      setGuesthouses((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: 'active' as GuestHouseStatus } : g))
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to reactivate guesthouse');
    }
  };

  const handleViewAsOwner = async (guesthouse: Guesthouse) => {
    try {
      const { data, error } = await supabase
        .from('guesthouses')
        .select('*')
        .eq('id', guesthouse.id)
        .single();

      if (error) throw error;

      setCurrentGuesthouse(data as Tables<'guesthouses'>);
      router.push('/(dashboard)');
    } catch (err) {
      Alert.alert('Error', 'Failed to load guesthouse');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      {/* Admin Header */}
      <View
        style={{
          backgroundColor: adminDarkTheme.headerBg,
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 8,
              backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'transparent',
              marginRight: 8,
            })}
          >
            <ArrowLeft size={20} color={adminDarkTheme.headerText} strokeWidth={1.7} />
          </Pressable>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_800ExtraBold',
              fontSize: 20,
              color: adminDarkTheme.headerText,
            }}
          >
            GuestOS
          </Text>
          <View
            style={{
              backgroundColor: adminDarkTheme.badgeBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 11,
                color: adminDarkTheme.headerText,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Platform Admin
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => Alert.alert('Coming Soon', 'Add guesthouse feature coming soon')}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
            borderRadius: 9,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          })}
        >
          <Plus size={18} color="#ffffff" strokeWidth={2} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
              color: '#ffffff',
            }}
          >
            Add guesthouse
          </Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <StatCard label="Guesthouses" value={stats.total} theme={theme} />
          <StatCard label="Active" value={stats.active} color={theme.status.ok} theme={theme} />
          <StatCard label="On Trial" value={stats.trial} color={theme.status.warn} theme={theme} />
          <StatCard label="Suspended" value={stats.suspended} color={theme.status.busy} theme={theme} />
        </View>

        {/* Table Card */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            overflow: 'hidden',
          }}
        >
          {/* Search Header */}
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
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 17,
                color: theme.ink,
              }}
            >
              All Guesthouses
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.chip,
                borderRadius: 9,
                paddingHorizontal: 12,
                paddingVertical: 9,
                width: 280,
              }}
            >
              <Search size={16} color={theme.muted} strokeWidth={1.7} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search guesthouses..."
                placeholderTextColor={theme.muted2}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: theme.ink,
                }}
              />
            </View>
          </View>

          {/* Table Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.tableHead,
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderBottomWidth: 1,
              borderBottomColor: theme.line,
            }}
          >
            <Text style={[headerStyle, { flex: 1, color: theme.tableHeader }]}>
              GUESTHOUSE
            </Text>
            <Text style={[headerStyle, { width: 190, color: theme.tableHeader }]}>
              OWNER
            </Text>
            <Text style={[headerStyle, { width: 90, color: theme.tableHeader }]}>
              ROOMS
            </Text>
            <Text style={[headerStyle, { width: 120, color: theme.tableHeader }]}>
              STATUS
            </Text>
            <Text style={[headerStyle, { width: 110, color: theme.tableHeader }]}>
              OCCUPANCY
            </Text>
            <Text style={[headerStyle, { width: 170, textAlign: 'right', color: theme.tableHeader }]}>
              ACTIONS
            </Text>
          </View>

          {/* Loading / Table Rows */}
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
                Loading guesthouses...
              </Text>
            </View>
          ) : (
            filteredGuesthouses.map((guesthouse, index) => (
              <View
                key={guesthouse.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  backgroundColor: index % 2 === 0 ? theme.surface : theme.altRow,
                  borderBottomWidth: index < filteredGuesthouses.length - 1 ? 1 : 0,
                  borderBottomColor: theme.rowLine,
                }}
              >
                {/* Guesthouse */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <GradientChip color={getColorForIndex(index)} size={32} />
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                        color: theme.ink,
                      }}
                    >
                      {guesthouse.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: theme.muted,
                        marginTop: 1,
                      }}
                    >
                      {guesthouse.island}
                    </Text>
                  </View>
                </View>

                {/* Owner */}
                <View style={{ width: 190 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 13,
                      color: theme.ink2,
                    }}
                    numberOfLines={1}
                  >
                    {guesthouse.ownerName}
                  </Text>
                </View>

                {/* Rooms */}
                <Text
                  style={{
                    width: 90,
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: theme.ink,
                  }}
                >
                  {guesthouse.totalRooms}
                </Text>

                {/* Status */}
                <View style={{ width: 120 }}>
                  <StatusPill status={guesthouse.status} theme={theme} />
                </View>

                {/* Occupancy */}
                <Text
                  style={{
                    width: 110,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: theme.ink,
                  }}
                >
                  {guesthouse.occupancyPercent}%
                </Text>

                {/* Actions */}
                <View
                  style={{
                    width: 170,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  {guesthouse.status === 'suspended' ? (
                    <Pressable
                      onPress={() => handleReactivate(guesthouse.id)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      })}
                    >
                      <RefreshCw size={14} color="#ffffff" strokeWidth={1.7} />
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 12,
                          color: '#ffffff',
                        }}
                      >
                        Reactivate
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => handleViewAsOwner(guesthouse)}
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? theme.chip : theme.surface,
                          borderWidth: 1,
                          borderColor: theme.inputLine,
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        })}
                      >
                        <Eye size={14} color={theme.ink3} strokeWidth={1.7} />
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 12,
                            color: theme.ink3,
                          }}
                        >
                          View as owner
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => Alert.alert('Coming Soon', 'Manage feature coming soon')}
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? theme.chip : theme.surface,
                          borderWidth: 1,
                          borderColor: theme.inputLine,
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        })}
                      >
                        <Settings size={14} color={colors.light.primary} strokeWidth={1.7} />
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 12,
                            color: colors.light.primary,
                          }}
                        >
                          Manage
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ))
          )}

          {!loading && filteredGuesthouses.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.muted,
                }}
              >
                No guesthouses found
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.light.primarySoft,
            borderRadius: 12,
            padding: 18,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
              color: colors.light.primary,
              marginBottom: 6,
            }}
          >
            About the Admin Console
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.ink2,
              lineHeight: 20,
            }}
          >
            Platform admins can see all guesthouses and impersonate owners for support purposes.
            "View as owner" switches to the selected guesthouse. Use "Manage" to
            edit settings, change status, or transfer ownership.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const headerStyle = {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 11,
  letterSpacing: 0.5,
};

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
  theme: typeof colors.light;
}

function StatCard({ label, value, color, theme }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.line,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
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
          fontSize: 28,
          color: color || theme.ink,
          marginTop: 6,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface StatusPillProps {
  status: GuestHouseStatus;
  theme: typeof colors.light;
}

function StatusPill({ status, theme }: StatusPillProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return { bg: theme.status.okBg, text: theme.status.okText, label: 'Active' };
      case 'trial':
        return { bg: theme.status.warnBg, text: theme.status.warnText, label: 'Trial' };
      case 'suspended':
        return { bg: theme.status.busyBg, text: theme.status.busyText, label: 'Suspended' };
    }
  };

  const style = getStatusStyle();

  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11.5,
          color: style.text,
        }}
      >
        {style.label}
      </Text>
    </View>
  );
}

function GradientChip({ color, size }: { color: string; size: number }) {
  const accentColor = adjustColor(color, 40);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`adminGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
          fill={`url(#adminGrad-${color})`}
        />
      </Svg>
    </View>
  );
}

function getColorForIndex(index: number): string {
  const palette = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#65a30d'];
  return palette[index % palette.length];
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
