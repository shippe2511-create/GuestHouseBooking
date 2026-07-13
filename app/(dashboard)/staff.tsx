import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, ChevronDown } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { supabase } from '../../src/lib/supabase';
import type { UserRole } from '../../src/types/database';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const mockStaff: StaffMember[] = [
  { id: '1', name: 'Ibrahim Nashid', email: 'ibrahim@hudhuveli.mv', role: 'owner' },
  { id: '2', name: 'Aishath Laila', email: 'laila@hudhuveli.mv', role: 'manager' },
  { id: '3', name: 'Mohamed Farhan', email: 'farhan@hudhuveli.mv', role: 'manager' },
  { id: '4', name: 'Fathimath Shifa', email: 'shifa@hudhuveli.mv', role: 'housekeeping' },
  { id: '5', name: 'Ahmed Riyaz', email: 'riyaz@hudhuveli.mv', role: 'housekeeping' },
];

const roleConfig: Record<UserRole, { label: string; bg: string; text: string; hint: string }> = {
  owner: {
    label: 'Owner',
    bg: colors.light.primarySoft,
    text: colors.light.primary,
    hint: 'Full access',
  },
  manager: {
    label: 'Manager',
    bg: colors.light.status.okBg,
    text: colors.light.status.okText,
    hint: 'Bookings & rooms',
  },
  housekeeping: {
    label: 'Housekeeping',
    bg: colors.light.status.warnBg,
    text: colors.light.status.warnText,
    hint: 'Cleaning status only',
  },
};

export default function StaffScreen() {
  const { theme } = useTheme();
  const { currentGuesthouse } = useCurrentGuesthouse();

  const [supabaseStaff, setSupabaseStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (currentGuesthouse?.id) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [currentGuesthouse?.id]);

  const fetchStaff = async () => {
    if (!currentGuesthouse?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          id,
          role,
          users (
            id,
            full_name,
            email
          )
        `)
        .eq('guesthouse_id', currentGuesthouse.id);

      if (error) throw error;

      const members: StaffMember[] = ((data as any[]) || []).map((m) => ({
        id: m.id,
        name: m.users?.full_name || 'Unknown',
        email: m.users?.email || 'N/A',
        role: m.role as UserRole,
      }));

      setSupabaseStaff(members);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const staff = useMemo(() => {
    if (supabaseStaff.length > 0) {
      return supabaseStaff;
    }
    return mockStaff;
  }, [supabaseStaff]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInvite = async (email: string, role: UserRole) => {
    if (!currentGuesthouse?.id) {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role,
      };
      setSupabaseStaff((prev) => [...prev, newMember]);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        await supabase.from('memberships').insert({
          user_id: existingUser.id,
          guesthouse_id: currentGuesthouse.id,
          role,
        });
      }
      await fetchStaff();
    } catch (err) {
      console.error('Error inviting staff:', err);
      const newMember: StaffMember = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role,
      };
      setSupabaseStaff((prev) => [...prev, newMember]);
    }
  };

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
          <View>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 19,
                color: theme.ink,
              }}
            >
              Staff & Roles
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.muted,
                marginTop: 4,
              }}
            >
              Manage team access to your guesthouse
            </Text>
          </View>
          <Pressable
            onPress={() => setShowInviteModal(true)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
              borderRadius: 10,
              paddingVertical: 11,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
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
              Invite staff
            </Text>
          </Pressable>
        </View>

        {/* Staff List */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            overflow: 'hidden',
          }}
        >
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
                Loading staff...
              </Text>
            </View>
          ) : (
            staff.map((member, index) => {
              const config = roleConfig[member.role];
              return (
                <View
                  key={member.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    borderBottomWidth: index < staff.length - 1 ? 1 : 0,
                    borderBottomColor: theme.rowLine,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: theme.chip,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                          color: theme.ink2,
                        }}
                      >
                        {getInitials(member.name)}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                          color: theme.ink,
                        }}
                      >
                        {member.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 13,
                          color: theme.muted,
                          marginTop: 2,
                        }}
                      >
                        {member.email}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: theme.muted,
                      }}
                    >
                      {config.hint}
                    </Text>
                    <View
                      style={{
                        backgroundColor: config.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 12,
                          color: config.text,
                        }}
                      >
                        {config.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Caption */}
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12.5,
            color: theme.muted,
            marginTop: 16,
            lineHeight: 18,
          }}
        >
          Owners have full access to all settings and data. Managers can handle bookings and room
          status. Housekeeping staff can only update cleaning status for rooms.
        </Text>
      </ScrollView>

      <InviteStaffModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        theme={theme}
      />
    </SafeAreaView>
  );
}

interface InviteStaffModalProps {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, role: UserRole) => void;
  theme: typeof colors.light;
}

function InviteStaffModal({ visible, onClose, onInvite, theme }: InviteStaffModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    await onInvite(email, role);
    setSending(false);
    setEmail('');
    setRole('manager');
    onClose();
  };

  const handleClose = () => {
    setEmail('');
    setRole('manager');
    onClose();
  };

  const isValid = email.trim() && email.includes('@');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.42)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        onPress={handleClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            width: '100%',
            maxWidth: 440,
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
            <View>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 17,
                  color: theme.ink,
                }}
              >
                Invite staff member
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: theme.muted,
                  marginTop: 4,
                }}
              >
                They'll receive an email to join
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => ({
                padding: 8,
                borderRadius: 8,
                backgroundColor: pressed ? theme.lineSoft : theme.chip,
              })}
            >
              <X size={18} color={theme.ink3} strokeWidth={1.7} />
            </Pressable>
          </View>

          {/* Form */}
          <View style={{ padding: 20, gap: 16 }}>
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Email address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="colleague@email.com"
                placeholderTextColor={theme.muted2}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.ink,
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.inputLine,
                  borderRadius: 10,
                  paddingVertical: Platform.OS === 'ios' ? 12 : 10,
                  paddingHorizontal: 14,
                }}
              />
            </View>

            <View style={{ position: 'relative', zIndex: 10 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Role
              </Text>
              <Pressable
                onPress={() => setShowRolePicker(!showRolePicker)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.inputLine,
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      backgroundColor: roleConfig[role].bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 12,
                        color: roleConfig[role].text,
                      }}
                    >
                      {roleConfig[role].label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      color: theme.muted,
                    }}
                  >
                    {roleConfig[role].hint}
                  </Text>
                </View>
                <ChevronDown size={18} color={theme.muted} strokeWidth={1.7} />
              </Pressable>

              {showRolePicker && (
                <View
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.inputLine,
                    borderRadius: 10,
                    marginTop: 4,
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  {(['manager', 'housekeeping'] as UserRole[]).map((r, index, arr) => {
                    const config = roleConfig[r];
                    return (
                      <Pressable
                        key={r}
                        onPress={() => {
                          setRole(r);
                          setShowRolePicker(false);
                        }}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 14,
                          paddingHorizontal: 14,
                          backgroundColor:
                            pressed
                              ? theme.chip
                              : role === r
                              ? colors.light.primarySoft
                              : theme.surface,
                          borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                          borderBottomColor: theme.lineSoft,
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View
                            style={{
                              backgroundColor: config.bg,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'Inter_600SemiBold',
                                fontSize: 12,
                                color: config.text,
                              }}
                            >
                              {config.label}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 13,
                              color: theme.muted,
                            }}
                          >
                            {config.hint}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: theme.line,
            }}
          >
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => ({
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderWidth: 1,
                borderColor: theme.inputLine,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 18,
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: theme.ink3,
                }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSend}
              disabled={!isValid || sending}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 18,
                opacity: isValid && !sending ? 1 : 0.5,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isValid ? 0.3 : 0,
                shadowRadius: 6,
                elevation: isValid ? 3 : 0,
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: '#ffffff',
                }}
              >
                {sending ? 'Sending...' : 'Send invite'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
