import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import type { Currency } from '../../src/types/database';

interface LocalSettings {
  propertyName: string;
  island: string;
  totalRooms: string;
  pricePerNight: string;
  currency: Currency;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function SettingsScreen() {
  const { theme, settings: themeSettings, updateSettings: updateThemeSettings } = useTheme();
  const { currentGuesthouse } = useCurrentGuesthouse();

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    propertyName: currentGuesthouse?.name || 'Hudhu Veli',
    island: currentGuesthouse?.island || 'Maafushi',
    totalRooms: String(currentGuesthouse?.total_rooms || 12),
    pricePerNight: '2500',
    currency: currentGuesthouse?.currency || 'MVR',
    emailNotifications: true,
    smsNotifications: false,
  });

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentGuesthouse) {
      setLocalSettings((prev) => ({
        ...prev,
        propertyName: currentGuesthouse.name,
        island: currentGuesthouse.island,
        totalRooms: String(currentGuesthouse.total_rooms),
        currency: currentGuesthouse.currency,
      }));
    }
  }, [currentGuesthouse]);

  const updateLocalSetting = <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to Supabase
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalSettings({
      propertyName: currentGuesthouse?.name || 'Hudhu Veli',
      island: currentGuesthouse?.island || 'Maafushi',
      totalRooms: String(currentGuesthouse?.total_rooms || 12),
      pricePerNight: '2500',
      currency: currentGuesthouse?.currency || 'MVR',
      emailNotifications: true,
      smsNotifications: false,
    });
    setHasChanges(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, alignItems: 'center' }}
      >
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.line,
            width: '100%',
            maxWidth: 720,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: theme.line }}>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 19,
                color: theme.ink,
              }}
            >
              Settings
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.muted,
                marginTop: 4,
              }}
            >
              Manage your guesthouse preferences
            </Text>
          </View>

          {/* Property Section */}
          <View style={{ padding: 24 }}>
            <SectionLabel theme={theme}>Property</SectionLabel>
            <View style={{ gap: 16 }}>
              <FormField label="Property name" theme={theme}>
                <TextInput
                  value={localSettings.propertyName}
                  onChangeText={(v) => updateLocalSetting('propertyName', v)}
                  style={inputStyle(theme)}
                  placeholderTextColor={theme.muted2}
                />
              </FormField>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="Island" theme={theme}>
                    <TextInput
                      value={localSettings.island}
                      onChangeText={(v) => updateLocalSetting('island', v)}
                      style={inputStyle(theme)}
                      placeholderTextColor={theme.muted2}
                    />
                  </FormField>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Total rooms" theme={theme}>
                    <TextInput
                      value={localSettings.totalRooms}
                      onChangeText={(v) => updateLocalSetting('totalRooms', v)}
                      keyboardType="number-pad"
                      style={inputStyle(theme)}
                      placeholderTextColor={theme.muted2}
                    />
                  </FormField>
                </View>
              </View>
            </View>
          </View>

          <Divider theme={theme} />

          {/* Pricing Section */}
          <View style={{ padding: 24 }}>
            <SectionLabel theme={theme}>Pricing</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <FormField label={`Default price per night (${localSettings.currency})`} theme={theme}>
                  <TextInput
                    value={localSettings.pricePerNight}
                    onChangeText={(v) => updateLocalSetting('pricePerNight', v)}
                    keyboardType="decimal-pad"
                    style={inputStyle(theme)}
                    placeholderTextColor={theme.muted2}
                  />
                </FormField>
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Currency" theme={theme}>
                  <Pressable
                    onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
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
                      {localSettings.currency === 'MVR' ? 'MVR - Maldivian Rufiyaa' : 'USD - US Dollar'}
                    </Text>
                    <ChevronDown size={18} color={theme.muted} strokeWidth={1.7} />
                  </Pressable>
                  {showCurrencyPicker && (
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
                        zIndex: 10,
                        shadowColor: '#0f172a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                      }}
                    >
                      <CurrencyOption
                        label="MVR - Maldivian Rufiyaa"
                        value="MVR"
                        selected={localSettings.currency === 'MVR'}
                        theme={theme}
                        onSelect={() => {
                          updateLocalSetting('currency', 'MVR');
                          setShowCurrencyPicker(false);
                        }}
                      />
                      <CurrencyOption
                        label="USD - US Dollar"
                        value="USD"
                        selected={localSettings.currency === 'USD'}
                        theme={theme}
                        onSelect={() => {
                          updateLocalSetting('currency', 'USD');
                          setShowCurrencyPicker(false);
                        }}
                        isLast
                      />
                    </View>
                  )}
                </FormField>
              </View>
            </View>
          </View>

          <Divider theme={theme} />

          {/* Notifications Section */}
          <View style={{ padding: 24 }}>
            <SectionLabel theme={theme}>Notifications</SectionLabel>
            <View style={{ gap: 16 }}>
              <ToggleRow
                label="Email notifications"
                description="Receive booking confirmations and updates via email"
                value={localSettings.emailNotifications}
                onToggle={(v) => updateLocalSetting('emailNotifications', v)}
                theme={theme}
              />
              <ToggleRow
                label="SMS notifications"
                description="Get text alerts for new bookings and check-ins"
                value={localSettings.smsNotifications}
                onToggle={(v) => updateLocalSetting('smsNotifications', v)}
                theme={theme}
              />
            </View>
          </View>

          <Divider theme={theme} />

          {/* Display Section */}
          <View style={{ padding: 24 }}>
            <SectionLabel theme={theme}>Display</SectionLabel>
            <View style={{ gap: 16 }}>
              <ToggleRow
                label="Dark mode"
                description="Use dark theme throughout the app"
                value={themeSettings.darkMode === 'dark'}
                onToggle={(v) => updateThemeSettings({ darkMode: v ? 'dark' : 'light' })}
                theme={theme}
              />
              <ToggleRow
                label="Compact mode"
                description="Reduce spacing for denser information display"
                value={themeSettings.compactMode}
                onToggle={(v) => updateThemeSettings({ compactMode: v })}
                theme={theme}
              />
              <ToggleRow
                label="Colorblind-friendly colors"
                description="Use an alternative color palette for better accessibility"
                value={themeSettings.colorblindMode}
                onToggle={(v) => updateThemeSettings({ colorblindMode: v })}
                theme={theme}
              />
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
              padding: 20,
              backgroundColor: theme.tableHead,
              borderTopWidth: 1,
              borderTopColor: theme.line,
            }}
          >
            <Pressable
              onPress={handleCancel}
              disabled={!hasChanges}
              style={({ pressed }) => ({
                backgroundColor: pressed ? theme.chip : theme.surface,
                borderWidth: 1,
                borderColor: theme.inputLine,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 20,
                opacity: hasChanges ? 1 : 0.5,
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
              disabled={!hasChanges}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 20,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: hasChanges ? 0.3 : 0,
                shadowRadius: 6,
                elevation: hasChanges ? 3 : 0,
                opacity: hasChanges ? 1 : 0.5,
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: '#ffffff',
                }}
              >
                Save changes
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children, theme }: { children: string; theme: typeof colors.light }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11.5,
        color: theme.muted2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
      }}
    >
      {children}
    </Text>
  );
}

interface FormFieldProps {
  label: string;
  theme: typeof colors.light;
  children: React.ReactNode;
}

function FormField({ label, theme, children }: FormFieldProps) {
  return (
    <View style={{ position: 'relative' }}>
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

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  theme: typeof colors.light;
}

function ToggleRow({ label, description, value, onToggle, theme }: ToggleRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: theme.ink,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: theme.muted,
            marginTop: 2,
          }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.chip,
          true: colors.light.primary,
        }}
        thumbColor="#ffffff"
        ios_backgroundColor={theme.chip}
        style={{
          transform: [{ scale: Platform.OS === 'ios' ? 0.9 : 1 }],
        }}
      />
    </View>
  );
}

interface CurrencyOptionProps {
  label: string;
  value: Currency;
  selected: boolean;
  theme: typeof colors.light;
  onSelect: () => void;
  isLast?: boolean;
}

function CurrencyOption({
  label,
  selected,
  theme,
  onSelect,
  isLast,
}: CurrencyOptionProps) {
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
    </Pressable>
  );
}

function Divider({ theme }: { theme: typeof colors.light }) {
  return <View style={{ height: 1, backgroundColor: theme.line }} />;
}
