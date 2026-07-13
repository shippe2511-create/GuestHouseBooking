import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Users,
  CreditCard,
  LogOut,
  Edit3,
  Copy,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface GuestDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckOut?: () => void;
  onEdit?: () => void;
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function GuestDetailModal({
  visible,
  onClose,
  onCheckOut,
  onEdit,
  guest,
}: GuestDetailModalProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      slideAnim.setValue(20);
    }
  }, [visible]);

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
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const nights = Math.ceil(
    (guest.checkOut.getTime() - guest.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total = nights * guest.pricePerNight;

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: IS_MOBILE ? 0 : 20,
          opacity: fadeAnim,
        }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
        />

        <Animated.View
          style={{
            backgroundColor: theme.surface,
            borderRadius: IS_MOBILE ? 0 : 20,
            width: IS_MOBILE ? '100%' : '100%',
            maxWidth: 480,
            maxHeight: IS_MOBILE ? '100%' : '90%',
            height: IS_MOBILE ? '100%' : 'auto',
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 25 },
            shadowOpacity: 0.25,
            shadowRadius: 50,
            elevation: 20,
            overflow: 'hidden',
          }}
        >
          {/* Header with Guest Avatar */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: 32,
              paddingBottom: 24,
              paddingHorizontal: 24,
              borderBottomWidth: 1,
              borderBottomColor: theme.line,
              position: 'relative',
            }}
          >
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => ({
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: pressed ? theme.chip : theme.page,
                justifyContent: 'center',
                alignItems: 'center',
              })}
            >
              <X size={20} color={theme.ink2} strokeWidth={2} />
            </Pressable>

            {/* Avatar */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.light.primarySoft,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 24,
                  color: colors.light.primary,
                }}
              >
                {getInitials(guest.name)}
              </Text>
            </View>

            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 22,
                color: theme.ink,
                textAlign: 'center',
                letterSpacing: -0.3,
              }}
            >
              {guest.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.status.busyBg,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12,
                    color: theme.status.busyText,
                  }}
                >
                  Checked in
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.muted,
                }}
              >
                Room {guest.roomNumber}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={{ padding: 24 }}>
            {/* Stay Info Card */}
            <View
              style={{
                backgroundColor: theme.page,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Calendar size={14} color={theme.muted} strokeWidth={2} />
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Check-in
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: theme.ink }}>
                    {formatDate(guest.checkIn)}
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: theme.line, marginHorizontal: 16 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Calendar size={14} color={theme.muted} strokeWidth={2} />
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Check-out
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: theme.ink }}>
                    {formatDate(guest.checkOut)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.line,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color={theme.muted} strokeWidth={2} />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.ink2 }}>
                    {guest.guests} {guest.guests === 1 ? 'guest' : 'guests'}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.ink }}>
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                Contact
              </Text>

              <ContactRow
                icon={Phone}
                label="Phone"
                value={guest.phone || 'Not provided'}
                theme={theme}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={guest.email || 'Not provided'}
                theme={theme}
              />
            </View>

            {/* Price Summary */}
            <View
              style={{
                backgroundColor: colors.light.primarySoft,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CreditCard size={18} color={colors.light.primary} strokeWidth={2} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.light.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Payment
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: theme.ink2 }}>
                  {nights} {nights === 1 ? 'night' : 'nights'} × {guest.currency} {guest.pricePerNight.toLocaleString()}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.ink }}>
                  {guest.currency} {(nights * guest.pricePerNight).toLocaleString()}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(37, 99, 235, 0.2)',
                  marginTop: 8,
                }}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.ink }}>
                  Total
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: colors.light.primary }}>
                  {guest.currency} {total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 24,
              paddingTop: 0,
              paddingBottom: Platform.OS === 'ios' ? 34 : 24,
            }}
          >
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderWidth: 2,
                borderColor: theme.line,
                borderRadius: 14,
                paddingVertical: 14,
              })}
            >
              <Edit3 size={18} color={theme.ink2} strokeWidth={2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: theme.ink2 }}>
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={onCheckOut}
              style={({ pressed }) => ({
                flex: 1.5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 14,
                paddingVertical: 14,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <LogOut size={18} color="#fff" strokeWidth={2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' }}>
                Check out
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  theme,
}: {
  icon: any;
  label: string;
  value: string;
  theme: typeof colors.light;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.line,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.page,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={16} color={theme.muted} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.muted }}>
          {label}
        </Text>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.ink, marginTop: 2 }}>
          {value}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => ({
          padding: 8,
          borderRadius: 8,
          backgroundColor: pressed ? theme.chip : 'transparent',
        })}
      >
        <Copy size={16} color={theme.muted} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
