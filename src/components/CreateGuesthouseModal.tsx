import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {
  X,
  Building2,
  MapPin,
  Hash,
  Coins,
  Camera,
  Check,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCreateGuesthouse } from '../hooks/useGuesthouses';
import ImagePicker from './ImagePicker';
import type { Currency } from '../types/database';

interface CreateGuesthouseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (guesthouse: any) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function CreateGuesthouseModal({
  visible,
  onClose,
  onSuccess,
}: CreateGuesthouseModalProps) {
  const { theme } = useTheme();
  const { createGuesthouse, loading } = useCreateGuesthouse();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [name, setName] = useState('');
  const [island, setIsland] = useState('');
  const [totalRooms, setTotalRooms] = useState(6);
  const [currency, setCurrency] = useState<Currency>('MVR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    if (field === 'name' && !value.trim()) {
      newErrors.name = 'Property name is required';
    } else if (field === 'name') {
      delete newErrors.name;
    }
    if (field === 'island' && !value.trim()) {
      newErrors.island = 'Island is required';
    } else if (field === 'island') {
      delete newErrors.island;
    }
    setErrors(newErrors);
  };

  const handleCreate = async () => {
    if (!name.trim() || !island.trim()) {
      setErrors({
        name: !name.trim() ? 'Property name is required' : '',
        island: !island.trim() ? 'Island is required' : '',
      });
      return;
    }

    const guesthouse = await createGuesthouse({
      name: name.trim(),
      island: island.trim(),
      totalRooms,
      currency,
      images,
    });

    if (guesthouse) {
      resetForm();
      onSuccess(guesthouse);
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setIsland('');
    setTotalRooms(6);
    setCurrency('MVR');
    setImages([]);
    setErrors({});
    setShowCurrencyPicker(false);
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

  const isValid = name.trim() && island.trim() && totalRooms > 0;

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
            maxWidth: 520,
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.light.primarySoft,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Building2 size={22} color={colors.light.primary} strokeWidth={2} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 20,
                    color: theme.ink,
                    letterSpacing: -0.3,
                  }}
                >
                  New Property
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.muted,
                    marginTop: 2,
                  }}
                >
                  Set up your guesthouse
                </Text>
              </View>
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
            {/* Property Name */}
            <View style={{ marginBottom: 20 }}>
              <SectionLabel icon={Building2} label="Property name" theme={theme} />
              <ModernInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  validateField('name', text);
                }}
                placeholder="e.g. Sunset Beach Inn"
                error={errors.name}
                theme={theme}
                autoCapitalize="words"
              />
            </View>

            {/* Island */}
            <View style={{ marginBottom: 20 }}>
              <SectionLabel icon={MapPin} label="Island" theme={theme} />
              <ModernInput
                value={island}
                onChangeText={(text) => {
                  setIsland(text);
                  validateField('island', text);
                }}
                placeholder="e.g. Maafushi"
                error={errors.island}
                theme={theme}
                autoCapitalize="words"
              />
            </View>

            {/* Number of Rooms */}
            <View style={{ marginBottom: 20 }}>
              <SectionLabel icon={Hash} label="Number of rooms" theme={theme} />
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
                  {totalRooms} {totalRooms === 1 ? 'room' : 'rooms'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Pressable
                    onPress={() => setTotalRooms(Math.max(1, totalRooms - 1))}
                    disabled={totalRooms <= 1}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: pressed ? theme.chip : theme.surface,
                      borderWidth: 1,
                      borderColor: theme.line,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: totalRooms <= 1 ? 0.4 : 1,
                    })}
                  >
                    <Minus size={18} color={theme.ink2} strokeWidth={2} />
                  </Pressable>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: theme.ink, minWidth: 32, textAlign: 'center' }}>
                    {totalRooms}
                  </Text>
                  <Pressable
                    onPress={() => setTotalRooms(Math.min(50, totalRooms + 1))}
                    disabled={totalRooms >= 50}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: pressed ? theme.chip : theme.surface,
                      borderWidth: 1,
                      borderColor: theme.line,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: totalRooms >= 50 ? 0.4 : 1,
                    })}
                  >
                    <Plus size={18} color={theme.ink2} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Currency */}
            <View style={{ marginBottom: 20, zIndex: 10 }}>
              <SectionLabel icon={Coins} label="Currency" theme={theme} />
              <Pressable
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: showCurrencyPicker ? colors.light.primarySoft : theme.page,
                  borderWidth: 2,
                  borderColor: showCurrencyPicker ? colors.light.primary : theme.line,
                  borderRadius: 14,
                  padding: 16,
                })}
              >
                <View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: theme.ink }}>
                    {currency}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.muted, marginTop: 2 }}>
                    {currency === 'MVR' ? 'Maldivian Rufiyaa' : 'US Dollar'}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={theme.muted}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: showCurrencyPicker ? '90deg' : '0deg' }] }}
                />
              </Pressable>

              {showCurrencyPicker && (
                <View
                  style={{
                    marginTop: 12,
                    backgroundColor: theme.surface,
                    borderRadius: 14,
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
                  {[
                    { code: 'MVR' as Currency, name: 'Maldivian Rufiyaa', symbol: 'Rf' },
                    { code: 'USD' as Currency, name: 'US Dollar', symbol: '$' },
                  ].map((c, index) => (
                    <Pressable
                      key={c.code}
                      onPress={() => {
                        setCurrency(c.code);
                        setShowCurrencyPicker(false);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        backgroundColor: currency === c.code
                          ? colors.light.primarySoft
                          : pressed
                          ? theme.chip
                          : theme.surface,
                        borderBottomWidth: index === 0 ? 1 : 0,
                        borderBottomColor: theme.line,
                      })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.page,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.ink }}>
                            {c.symbol}
                          </Text>
                        </View>
                        <View>
                          <Text style={{
                            fontFamily: currency === c.code ? 'Inter_600SemiBold' : 'Inter_500Medium',
                            fontSize: 15,
                            color: currency === c.code ? colors.light.primary : theme.ink
                          }}>
                            {c.code}
                          </Text>
                          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.muted }}>
                            {c.name}
                          </Text>
                        </View>
                      </View>
                      {currency === c.code && (
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.light.primary, justifyContent: 'center', alignItems: 'center' }}>
                          <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Property Photos */}
            <View style={{ marginBottom: 20 }}>
              <SectionLabel icon={Camera} label="Property photos" theme={theme} />
              <View
                style={{
                  backgroundColor: theme.page,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: theme.line,
                  borderStyle: 'dashed',
                }}
              >
                <ImagePicker
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                  folder="guesthouses"
                />
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
                Creating
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: theme.ink, marginTop: 2 }}>
                {name || 'New Property'}
              </Text>
            </View>
            <Pressable
              onPress={handleCreate}
              disabled={!isValid || loading}
              style={({ pressed }) => ({
                backgroundColor: isValid ? (pressed ? '#1d4ed8' : colors.light.primary) : theme.chip,
                paddingVertical: 16,
                paddingHorizontal: 28,
                borderRadius: 14,
                shadowColor: isValid ? '#2563eb' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: isValid ? 4 : 0,
              })}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: isValid ? '#fff' : theme.muted }}>
                {loading ? 'Creating...' : 'Create property'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

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

function ModernInput({
  value,
  onChangeText,
  placeholder,
  error,
  theme,
  autoCapitalize,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  theme: typeof colors.light;
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
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.muted2}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            color: theme.ink,
          }}
        />
        {isValid && (
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
            <Check size={13} color="#fff" strokeWidth={3} />
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
