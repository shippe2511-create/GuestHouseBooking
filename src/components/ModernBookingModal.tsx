import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Calendar,
  Users,
  Bed,
  Mail,
  Phone,
  User,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import type { Currency } from '../types/database';

interface Room {
  id: string;
  number: string;
  pricePerNight: number;
}

interface ModernBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: BookingData) => void;
  rooms: Room[];
  currency: Currency;
  preselectedRoomId?: string;
}

interface BookingData {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  pricePerNight: number;
}

const CELL_SIZE = 40;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function ModernBookingModal({
  visible,
  onClose,
  onSave,
  rooms,
  currency,
  preselectedRoomId,
}: ModernBookingModalProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || '');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [priceOverride, setPriceOverride] = useState('');

  // UI state
  const [activeSection, setActiveSection] = useState<'dates' | 'room' | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState<'checkIn' | 'checkOut'>('checkIn');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

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
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const effectivePrice = priceOverride
    ? parseFloat(priceOverride)
    : selectedRoom?.pricePerNight || 0;

  const total = nights * effectivePrice;

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'guestName':
        if (!value.trim()) {
          newErrors.guestName = 'Guest name is required';
        } else {
          delete newErrors.guestName;
        }
        break;
      case 'guestEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.guestEmail = 'Enter a valid email';
        } else {
          delete newErrors.guestEmail;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSave = async () => {
    if (!guestName.trim() || !selectedRoomId || !checkIn || !checkOut) {
      setErrors({
        ...errors,
        guestName: !guestName.trim() ? 'Guest name is required' : '',
        room: !selectedRoomId ? 'Select a room' : '',
        dates: !checkIn || !checkOut ? 'Select check-in and check-out dates' : '',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        guestName: guestName.trim(),
        guestPhone,
        guestEmail,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        guests,
        pricePerNight: effectivePrice,
      });
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setSelectedRoomId('');
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
    setPriceOverride('');
    setErrors({});
    setActiveSection(null);
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      resetForm();
      onClose();
    });
  };

  const handleDateSelect = (date: Date) => {
    if (selectingDate === 'checkIn') {
      setCheckIn(date);
      if (checkOut && date >= checkOut) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOut(nextDay);
      }
      setSelectingDate('checkOut');
    } else {
      if (checkIn && date <= checkIn) {
        const nextDay = new Date(checkIn);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOut(nextDay);
      } else {
        setCheckOut(date);
      }
      setActiveSection(null);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const isDateSelected = (date: Date) => {
    if (checkIn && isSameDay(date, checkIn)) return 'start';
    if (checkOut && isSameDay(date, checkOut)) return 'end';
    return null;
  };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDateShort = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isValid = guestName.trim() && selectedRoomId && checkIn && checkOut && nights > 0;

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
            maxWidth: 560,
            maxHeight: IS_MOBILE ? '100%' : '90%',
            height: IS_MOBILE ? '100%' : 'auto',
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 25 },
            shadowOpacity: 0.25,
            shadowRadius: 50,
            elevation: 20,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.line,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 20,
                  color: theme.ink,
                  letterSpacing: -0.3,
                }}
              >
                New Reservation
              </Text>
              {nights > 0 && (
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: theme.muted,
                    marginTop: 4,
                  }}
                >
                  {nights} {nights === 1 ? 'night' : 'nights'} · {currency} {total.toLocaleString()}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => ({
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
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Range Selector */}
            <View style={{ marginBottom: 24 }}>
              <SectionLabel icon={Calendar} label="Stay dates" theme={theme} />
              <Pressable
                onPress={() => {
                  setActiveSection(activeSection === 'dates' ? null : 'dates');
                  setSelectingDate('checkIn');
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  backgroundColor: activeSection === 'dates' ? colors.light.primarySoft : theme.page,
                  borderWidth: 2,
                  borderColor: activeSection === 'dates' ? colors.light.primary : theme.line,
                  borderRadius: 14,
                  overflow: 'hidden',
                })}
              >
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRightWidth: 1,
                    borderRightColor: theme.line,
                    backgroundColor: selectingDate === 'checkIn' && activeSection === 'dates'
                      ? 'rgba(37, 99, 235, 0.08)'
                      : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Check-in
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: checkIn ? theme.ink : theme.muted2, marginTop: 4 }}>
                    {formatDateShort(checkIn)}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor: selectingDate === 'checkOut' && activeSection === 'dates'
                      ? 'rgba(37, 99, 235, 0.08)'
                      : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Check-out
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: checkOut ? theme.ink : theme.muted2, marginTop: 4 }}>
                    {formatDateShort(checkOut)}
                  </Text>
                </View>
              </Pressable>

              {/* Calendar */}
              {activeSection === 'dates' && (
                <View
                  style={{
                    marginTop: 12,
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.line,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <CalendarPicker
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onDateSelect={handleDateSelect}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    isDateInRange={isDateInRange}
                    isDateSelected={isDateSelected}
                    isToday={isToday}
                    isPastDate={isPastDate}
                    theme={theme}
                  />

                  {/* Quick Actions */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.line }}>
                    {[1, 2, 3, 7].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => {
                          const start = checkIn || new Date();
                          const end = new Date(start);
                          end.setDate(end.getDate() + n);
                          setCheckIn(start);
                          setCheckOut(end);
                          setActiveSection(null);
                        }}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 10,
                          backgroundColor: pressed ? theme.chip : theme.page,
                          borderRadius: 8,
                          alignItems: 'center',
                        })}
                      >
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: theme.ink2 }}>
                          {n} {n === 1 ? 'night' : 'nights'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Room Selector */}
            <View style={{ marginBottom: 24 }}>
              <SectionLabel icon={Bed} label="Room" theme={theme} />
              <Pressable
                onPress={() => setActiveSection(activeSection === 'room' ? null : 'room')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: activeSection === 'room' ? colors.light.primarySoft : theme.page,
                  borderWidth: 2,
                  borderColor: activeSection === 'room' ? colors.light.primary : theme.line,
                  borderRadius: 14,
                  padding: 16,
                })}
              >
                <View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: selectedRoom ? theme.ink : theme.muted2 }}>
                    {selectedRoom ? `Room ${selectedRoom.number}` : 'Select a room'}
                  </Text>
                  {selectedRoom && (
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.muted, marginTop: 2 }}>
                      {currency} {selectedRoom.pricePerNight.toLocaleString()} / night
                    </Text>
                  )}
                </View>
                <ChevronRight size={20} color={theme.muted} strokeWidth={2} style={{ transform: [{ rotate: activeSection === 'room' ? '90deg' : '0deg' }] }} />
              </Pressable>

              {activeSection === 'room' && (
                <View
                  style={{
                    marginTop: 12,
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.line,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  {rooms.map((room, index) => (
                    <Pressable
                      key={room.id}
                      onPress={() => {
                        setSelectedRoomId(room.id);
                        setActiveSection(null);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        backgroundColor: selectedRoomId === room.id
                          ? colors.light.primarySoft
                          : pressed
                          ? theme.chip
                          : theme.surface,
                        borderBottomWidth: index < rooms.length - 1 ? 1 : 0,
                        borderBottomColor: theme.line,
                      })}
                    >
                      <View>
                        <Text style={{
                          fontFamily: selectedRoomId === room.id ? 'Inter_600SemiBold' : 'Inter_500Medium',
                          fontSize: 15,
                          color: selectedRoomId === room.id ? colors.light.primary : theme.ink
                        }}>
                          Room {room.number}
                        </Text>
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.muted, marginTop: 2 }}>
                          {currency} {room.pricePerNight.toLocaleString()} / night
                        </Text>
                      </View>
                      {selectedRoomId === room.id && (
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.light.primary, justifyContent: 'center', alignItems: 'center' }}>
                          <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Guest Counter */}
            <View style={{ marginBottom: 24 }}>
              <SectionLabel icon={Users} label="Guests" theme={theme} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.page,
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 2,
                  borderColor: theme.line,
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: theme.ink, marginLeft: 4 }}>
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Pressable
                    onPress={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: pressed ? theme.chip : theme.surface,
                      borderWidth: 1,
                      borderColor: theme.line,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: guests <= 1 ? 0.4 : 1,
                    })}
                  >
                    <Minus size={18} color={theme.ink2} strokeWidth={2} />
                  </Pressable>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: theme.ink, minWidth: 32, textAlign: 'center' }}>
                    {guests}
                  </Text>
                  <Pressable
                    onPress={() => setGuests(Math.min(10, guests + 1))}
                    disabled={guests >= 10}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: pressed ? theme.chip : theme.surface,
                      borderWidth: 1,
                      borderColor: theme.line,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: guests >= 10 ? 0.4 : 1,
                    })}
                  >
                    <Plus size={18} color={theme.ink2} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Guest Info */}
            <View style={{ marginBottom: 24 }}>
              <SectionLabel icon={User} label="Guest information" theme={theme} />
              <View style={{ gap: 12 }}>
                <ModernInput
                  icon={User}
                  label="Full name"
                  value={guestName}
                  onChangeText={(text) => {
                    setGuestName(text);
                    validateField('guestName', text);
                  }}
                  placeholder="John Smith"
                  error={errors.guestName}
                  theme={theme}
                  autoCapitalize="words"
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <ModernInput
                      icon={Phone}
                      label="Phone"
                      value={guestPhone}
                      onChangeText={setGuestPhone}
                      placeholder="+1 555 000 0000"
                      theme={theme}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ModernInput
                      icon={Mail}
                      label="Email"
                      value={guestEmail}
                      onChangeText={(text) => {
                        setGuestEmail(text);
                        validateField('guestEmail', text);
                      }}
                      placeholder="guest@email.com"
                      error={errors.guestEmail}
                      theme={theme}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              paddingBottom: Platform.OS === 'ios' ? 34 : 20,
              backgroundColor: theme.surface,
              borderTopWidth: 1,
              borderTopColor: theme.line,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: theme.muted }}>
                {nights > 0 ? `${nights} ${nights === 1 ? 'night' : 'nights'}` : 'Select dates'}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: theme.ink, letterSpacing: -0.5 }}>
                {currency} {total.toLocaleString()}
              </Text>
            </View>
            <Pressable
              onPress={handleSave}
              disabled={!isValid || saving}
              style={({ pressed }) => ({
                backgroundColor: isValid ? (pressed ? '#1d4ed8' : colors.light.primary) : theme.chip,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 14,
                shadowColor: isValid ? '#2563eb' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: isValid ? 4 : 0,
              })}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: isValid ? '#fff' : theme.muted }}>
                {saving ? 'Saving...' : 'Confirm booking'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Section Label Component
function SectionLabel({ icon: Icon, label, theme }: { icon: any; label: string; theme: typeof colors.light }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Icon size={16} color={theme.muted} strokeWidth={2} />
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: theme.ink2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

// Modern Input Component
function ModernInput({
  icon: Icon,
  label,
  value,
  onChangeText,
  placeholder,
  error,
  theme,
  keyboardType,
  autoCapitalize,
}: {
  icon: any;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  theme: typeof colors.light;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isValid = hasValue && !error;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.page,
          borderWidth: 2,
          borderColor: error ? '#ef4444' : focused ? colors.light.primary : theme.line,
          borderRadius: 12,
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        <Icon size={18} color={focused ? colors.light.primary : theme.muted} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: theme.muted, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.muted2}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 15,
              color: theme.ink,
              paddingVertical: 8,
              paddingBottom: 10,
            }}
          />
        </View>
        {isValid && (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' }}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </View>
        )}
      </View>
      {error && (
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#ef4444', marginTop: 6, marginLeft: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Calendar Picker Component
function CalendarPicker({
  month,
  onMonthChange,
  onDateSelect,
  checkIn,
  checkOut,
  isDateInRange,
  isDateSelected,
  isToday,
  isPastDate,
  theme,
}: {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  checkIn: Date | null;
  checkOut: Date | null;
  isDateInRange: (date: Date) => boolean;
  isDateSelected: (date: Date) => 'start' | 'end' | null;
  isToday: (date: Date) => boolean;
  isPastDate: (date: Date) => boolean;
  theme: typeof colors.light;
}) {
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = () => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, m, i));
    }
    return days;
  };

  const days = getDaysInMonth();

  return (
    <View>
      {/* Month Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable
          onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? theme.chip : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <ChevronLeft size={20} color={theme.ink2} strokeWidth={2} />
        </Pressable>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: theme.ink }}>
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? theme.chip : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <ChevronRight size={20} color={theme.ink2} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Week Days */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {weekDays.map((day) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: theme.muted }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
          }

          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const today = isToday(date);
          const past = isPastDate(date);

          return (
            <View key={date.toISOString()} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: inRange ? colors.light.primarySoft : 'transparent',
                  borderTopLeftRadius: selected === 'start' ? CELL_SIZE / 2 : 0,
                  borderBottomLeftRadius: selected === 'start' ? CELL_SIZE / 2 : 0,
                  borderTopRightRadius: selected === 'end' ? CELL_SIZE / 2 : 0,
                  borderBottomRightRadius: selected === 'end' ? CELL_SIZE / 2 : 0,
                }}
              >
                <Pressable
                  onPress={() => !past && onDateSelect(date)}
                  disabled={past}
                  style={({ pressed }) => ({
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: CELL_SIZE / 2,
                    backgroundColor: selected
                      ? colors.light.primary
                      : pressed && !past
                      ? theme.chip
                      : 'transparent',
                    borderWidth: today && !selected ? 2 : 0,
                    borderColor: colors.light.primary,
                  })}
                >
                  <Text
                    style={{
                      fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_500Medium',
                      fontSize: 14,
                      color: selected
                        ? '#fff'
                        : past
                        ? theme.muted2
                        : today
                        ? colors.light.primary
                        : theme.ink,
                    }}
                  >
                    {date.getDate()}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
