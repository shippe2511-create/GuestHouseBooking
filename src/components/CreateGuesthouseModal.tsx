import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
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

export default function CreateGuesthouseModal({
  visible,
  onClose,
  onSuccess,
}: CreateGuesthouseModalProps) {
  const { theme } = useTheme();
  const { createGuesthouse, loading } = useCreateGuesthouse();

  const [name, setName] = useState('');
  const [island, setIsland] = useState('');
  const [totalRooms, setTotalRooms] = useState('6');
  const [currency, setCurrency] = useState<Currency>('MVR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!name.trim() || !island.trim()) return;

    const guesthouse = await createGuesthouse({
      name: name.trim(),
      island: island.trim(),
      totalRooms: parseInt(totalRooms) || 6,
      currency,
      images,
    });

    if (guesthouse) {
      setName('');
      setIsland('');
      setTotalRooms('6');
      setCurrency('MVR');
      setImages([]);
      onSuccess(guesthouse);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setIsland('');
    setTotalRooms('6');
    setCurrency('MVR');
    setImages([]);
    onClose();
  };

  const isValid = name.trim() && island.trim() && parseInt(totalRooms) > 0;

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
            maxWidth: 480,
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
                Add new guesthouse
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: theme.muted,
                  marginTop: 4,
                }}
              >
                Set up your property details
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
          <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Property name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Sunset Beach Inn"
                placeholderTextColor={theme.muted2}
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

            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Island
              </Text>
              <TextInput
                value={island}
                onChangeText={setIsland}
                placeholder="e.g. Maafushi"
                placeholderTextColor={theme.muted2}
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

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12.5,
                    color: theme.ink3,
                    marginBottom: 8,
                  }}
                >
                  Number of rooms
                </Text>
                <TextInput
                  value={totalRooms}
                  onChangeText={setTotalRooms}
                  keyboardType="number-pad"
                  placeholder="6"
                  placeholderTextColor={theme.muted2}
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

              <View style={{ flex: 1, position: 'relative', zIndex: 10 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12.5,
                    color: theme.ink3,
                    marginBottom: 8,
                  }}
                >
                  Currency
                </Text>
                <Pressable
                  onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.inputLine,
                    borderRadius: 10,
                    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      color: theme.ink,
                    }}
                  >
                    {currency}
                  </Text>
                  <ChevronDown size={18} color={theme.muted} strokeWidth={1.7} />
                </Pressable>

                {showCurrencyPicker && (
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
                    }}
                  >
                    {(['MVR', 'USD'] as Currency[]).map((c, index) => (
                      <Pressable
                        key={c}
                        onPress={() => {
                          setCurrency(c);
                          setShowCurrencyPicker(false);
                        }}
                        style={({ pressed }) => ({
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          backgroundColor:
                            pressed
                              ? theme.chip
                              : currency === c
                              ? colors.light.primarySoft
                              : theme.surface,
                          borderBottomWidth: index === 0 ? 1 : 0,
                          borderBottomColor: theme.lineSoft,
                        })}
                      >
                        <Text
                          style={{
                            fontFamily:
                              currency === c ? 'Inter_600SemiBold' : 'Inter_400Regular',
                            fontSize: 14,
                            color: currency === c ? colors.light.primary : theme.ink,
                          }}
                        >
                          {c === 'MVR' ? 'MVR - Maldivian Rufiyaa' : 'USD - US Dollar'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Property photos
              </Text>
              <ImagePicker
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                folder="guesthouses"
              />
            </View>
          </ScrollView>

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
              onPress={handleCreate}
              disabled={!isValid || loading}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 18,
                opacity: isValid && !loading ? 1 : 0.5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              })}
            >
              {loading && <ActivityIndicator size="small" color="#ffffff" />}
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: '#ffffff',
                }}
              >
                {loading ? 'Creating...' : 'Create guesthouse'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
