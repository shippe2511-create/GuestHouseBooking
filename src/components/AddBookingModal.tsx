import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { X, ChevronDown, Calendar } from 'lucide-react-native';
import { colors } from '../constants/theme';
import type { Currency } from '../types/database';

interface Room {
  id: string;
  number: string;
  pricePerNight: number;
}

interface AddBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: BookingData) => void;
  rooms: Room[];
  currency: Currency;
  prefilledRoom?: string;
  prefilledDate?: Date;
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

export default function AddBookingModal({
  visible,
  onClose,
  onSave,
  rooms,
  currency,
  prefilledRoom,
  prefilledDate,
  preselectedRoomId,
}: AddBookingModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || prefilledRoom || '');
  const [checkIn, setCheckIn] = useState(prefilledDate || new Date());
  const [checkOut, setCheckOut] = useState(() => {
    const date = prefilledDate ? new Date(prefilledDate) : new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });
  const [guests, setGuests] = useState(2);
  const [pricePerNight, setPricePerNight] = useState('');

  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const closeAllPickers = () => {
    setShowRoomPicker(false);
    setShowGuestsPicker(false);
    setShowCheckInPicker(false);
    setShowCheckOutPicker(false);
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId]);

  const nights = useMemo(() => {
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const effectivePrice = pricePerNight
    ? parseFloat(pricePerNight)
    : selectedRoom?.pricePerNight || 0;

  const total = nights * effectivePrice;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!guestName || !selectedRoomId) return;

    setSaving(true);
    try {
      await onSave({
        guestName,
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
    setCheckIn(new Date());
    setCheckOut(() => {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date;
    });
    setGuests(2);
    setPricePerNight('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = guestName.trim() && selectedRoomId;

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
            maxWidth: 600,
            maxHeight: '90%',
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 24 },
            shadowOpacity: 0.3,
            shadowRadius: 60,
            elevation: 10,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView bounces={false} style={{ overflow: 'visible' }} contentContainerStyle={{ overflow: 'visible' }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: 24,
                borderBottomWidth: 1,
                borderBottomColor: theme.line,
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
                  New Booking
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.muted,
                    marginTop: 4,
                  }}
                >
                  Add a new guest reservation
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
            <View style={{ padding: 24, gap: 20, overflow: 'visible' }}>
              {/* Guest Name - Full Width */}
              <FormField label="Guest name" theme={theme}>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Full name"
                  placeholderTextColor={theme.muted2}
                  style={inputStyle(theme)}
                  autoCapitalize="words"
                />
              </FormField>

              {/* Phone / Email - 2 Column */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="Phone" theme={theme}>
                    <TextInput
                      value={guestPhone}
                      onChangeText={setGuestPhone}
                      placeholder="+1 555 000 0000"
                      placeholderTextColor={theme.muted2}
                      style={inputStyle(theme)}
                      keyboardType="phone-pad"
                    />
                  </FormField>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Email" theme={theme}>
                    <TextInput
                      value={guestEmail}
                      onChangeText={setGuestEmail}
                      placeholder="guest@email.com"
                      placeholderTextColor={theme.muted2}
                      style={inputStyle(theme)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </FormField>
                </View>
              </View>

              {/* Check-in / Check-out - 2 Column */}
              <View style={{ flexDirection: 'row', gap: 16, zIndex: 20 }}>
                <View style={{ flex: 1, zIndex: 21 }}>
                  <FormField label="Check-in" theme={theme}>
                    <DateInput
                      value={checkIn}
                      onChange={setCheckIn}
                      theme={theme}
                      isOpen={showCheckInPicker}
                      onToggle={() => {
                        closeAllPickers();
                        setShowCheckInPicker(!showCheckInPicker);
                      }}
                      onClose={() => setShowCheckInPicker(false)}
                    />
                  </FormField>
                </View>
                <View style={{ flex: 1, zIndex: 20 }}>
                  <FormField label="Check-out" theme={theme}>
                    <DateInput
                      value={checkOut}
                      onChange={setCheckOut}
                      minDate={checkIn}
                      theme={theme}
                      isOpen={showCheckOutPicker}
                      onToggle={() => {
                        closeAllPickers();
                        setShowCheckOutPicker(!showCheckOutPicker);
                      }}
                      onClose={() => setShowCheckOutPicker(false)}
                    />
                  </FormField>
                </View>
              </View>

              {/* Room / Guests / Price - 3 Column */}
              <View style={{ flexDirection: 'row', gap: 16, zIndex: 30 }}>
                <View style={{ flex: 1, zIndex: 33 }}>
                  <FormField label="Room" theme={theme}>
                    <Pressable
                      onPress={() => {
                        closeAllPickers();
                        setShowRoomPicker(!showRoomPicker);
                      }}
                      style={[
                        inputStyle(theme),
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          color: selectedRoom ? theme.ink : theme.muted2,
                        }}
                      >
                        {selectedRoom ? `Room ${selectedRoom.number}` : 'Select'}
                      </Text>
                      <ChevronDown size={18} color={theme.muted} strokeWidth={1.7} />
                    </Pressable>
                    {showRoomPicker && (
                      <DropdownPicker
                        theme={theme}
                        onClose={() => setShowRoomPicker(false)}
                      >
                        {rooms.map((room, index) => (
                          <PickerOption
                            key={room.id}
                            label={`Room ${room.number}`}
                            sublabel={`${currency} ${room.pricePerNight.toLocaleString()}/night`}
                            selected={selectedRoomId === room.id}
                            onSelect={() => {
                              setSelectedRoomId(room.id);
                              if (!pricePerNight) {
                                setPricePerNight(room.pricePerNight.toString());
                              }
                              setShowRoomPicker(false);
                            }}
                            theme={theme}
                            isLast={index === rooms.length - 1}
                          />
                        ))}
                      </DropdownPicker>
                    )}
                  </FormField>
                </View>
                <View style={{ flex: 1, zIndex: 32 }}>
                  <FormField label="Guests" theme={theme}>
                    <Pressable
                      onPress={() => {
                        closeAllPickers();
                        setShowGuestsPicker(!showGuestsPicker);
                      }}
                      style={[
                        inputStyle(theme),
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          color: theme.ink,
                        }}
                      >
                        {guests} {guests === 1 ? 'guest' : 'guests'}
                      </Text>
                      <ChevronDown size={18} color={theme.muted} strokeWidth={1.7} />
                    </Pressable>
                    {showGuestsPicker && (
                      <DropdownPicker
                        theme={theme}
                        onClose={() => setShowGuestsPicker(false)}
                      >
                        {[1, 2, 3, 4, 5, 6].map((num, index, arr) => (
                          <PickerOption
                            key={num}
                            label={`${num} ${num === 1 ? 'guest' : 'guests'}`}
                            selected={guests === num}
                            onSelect={() => {
                              setGuests(num);
                              setShowGuestsPicker(false);
                            }}
                            theme={theme}
                            isLast={index === arr.length - 1}
                          />
                        ))}
                      </DropdownPicker>
                    )}
                  </FormField>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label={`Price per night (${currency})`} theme={theme}>
                    <TextInput
                      value={pricePerNight}
                      onChangeText={setPricePerNight}
                      placeholder={selectedRoom?.pricePerNight.toString() || '0'}
                      placeholderTextColor={theme.muted2}
                      style={inputStyle(theme)}
                      keyboardType="decimal-pad"
                    />
                  </FormField>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: theme.line,
                backgroundColor: theme.tableHead,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: theme.muted,
                  }}
                >
                  Total · {nights} {nights === 1 ? 'night' : 'nights'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 17,
                    color: theme.ink,
                    marginTop: 2,
                  }}
                >
                  {currency} {total.toLocaleString()}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? theme.chip : theme.surface,
                    borderWidth: 1,
                    borderColor: theme.inputLine,
                    borderRadius: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
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
                  onPress={handleSave}
                  disabled={!isValid || saving}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                    borderRadius: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    opacity: isValid && !saving ? 1 : 0.5,
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
                    {saving ? 'Saving...' : 'Save booking'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface FormFieldProps {
  label: string;
  theme: typeof colors.light;
  children: React.ReactNode;
}

function FormField({ label, theme, children }: FormFieldProps) {
  return (
    <View style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12.5,
          color: theme.ink3,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function inputStyle(theme: typeof colors.light) {
  return {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: theme.ink,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.inputLine,
    borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 14,
  } as const;
}

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  theme: typeof colors.light;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

function DateInput({ value, onChange, theme, isOpen, onToggle, onClose }: DateInputProps) {
  const showPicker = isOpen ?? false;
  const [viewMonth, setViewMonth] = useState(new Date(value));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const prevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const selectDay = (day: number) => {
    const newDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    onChange(newDate);
    onClose?.();
  };

  const isSelected = (day: number) => {
    return (
      value.getDate() === day &&
      value.getMonth() === viewMonth.getMonth() &&
      value.getFullYear() === viewMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth.getMonth() &&
      today.getFullYear() === viewMonth.getFullYear()
    );
  };

  const days = getDaysInMonth(viewMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={[
          inputStyle(theme),
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: theme.ink,
          }}
        >
          {formatDate(value)}
        </Text>
        <Calendar size={18} color={theme.muted} strokeWidth={1.7} />
      </Pressable>
      {showPicker && (
        <View
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            minWidth: 280,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.inputLine,
            borderRadius: 10,
            marginBottom: 4,
            zIndex: 1000,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
            padding: 12,
          }}
        >
          {/* Month Navigation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Pressable
              onPress={prevMonth}
              style={({ pressed }) => ({
                padding: 6,
                borderRadius: 6,
                backgroundColor: pressed ? theme.chip : 'transparent',
              })}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: theme.ink }}>‹</Text>
            </Pressable>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.ink }}>
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable
              onPress={nextMonth}
              style={({ pressed }) => ({
                padding: 6,
                borderRadius: 6,
                backgroundColor: pressed ? theme.chip : 'transparent',
              })}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: theme.ink }}>›</Text>
            </Pressable>
          </View>

          {/* Week Days Header */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {weekDays.map((day) => (
              <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.muted }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map((day, index) => (
              <View key={index} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                {day !== null && (
                  <Pressable
                    onPress={() => selectDay(day)}
                    style={({ pressed }) => ({
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 6,
                      backgroundColor: isSelected(day)
                        ? colors.light.primary
                        : pressed
                        ? theme.chip
                        : 'transparent',
                      borderWidth: isToday(day) && !isSelected(day) ? 1 : 0,
                      borderColor: colors.light.primary,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: isSelected(day) ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        fontSize: 13,
                        color: isSelected(day) ? '#fff' : theme.ink,
                      }}
                    >
                      {day}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

interface DropdownPickerProps {
  theme: typeof colors.light;
  onClose: () => void;
  children: React.ReactNode;
}

function DropdownPicker({ theme, children }: DropdownPickerProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.inputLine,
        borderRadius: 10,
        marginBottom: 4,
        zIndex: 1000,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        maxHeight: 220,
      }}
    >
      <ScrollView bounces={false} nestedScrollEnabled>
        {children}
      </ScrollView>
    </View>
  );
}

interface PickerOptionProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
  theme: typeof colors.light;
  isLast?: boolean;
}

function PickerOption({
  label,
  sublabel,
  selected,
  onSelect,
  theme,
  isLast,
}: PickerOptionProps) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => ({
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: pressed
          ? theme.chip
          : selected
          ? colors.light.primarySoft
          : theme.surface,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.lineSoft,
      })}
    >
      <Text
        style={{
          fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_400Regular',
          fontSize: 14,
          color: selected ? colors.light.primary : theme.ink,
        }}
      >
        {label}
      </Text>
      {sublabel && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: theme.muted,
            marginTop: 2,
          }}
        >
          {sublabel}
        </Text>
      )}
    </Pressable>
  );
}
