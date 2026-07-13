import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { colors } from '../constants/theme';

interface ThemeSettings {
  darkMode: 'system' | 'light' | 'dark';
  compactMode: boolean;
  colorblindMode: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  isDark: boolean;
  theme: typeof colors.light;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
}

const defaultSettings: ThemeSettings = {
  darkMode: 'system',
  compactMode: false,
  colorblindMode: false,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setLoaded(true);
    }
  };

  const updateSettings = async (updates: Partial<ThemeSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('theme_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  const isDark =
    settings.darkMode === 'dark' ||
    (settings.darkMode === 'system' && systemColorScheme === 'dark');

  const baseTheme = isDark ? colors.dark : colors.light;

  const theme = settings.colorblindMode
    ? {
        ...baseTheme,
        status: {
          ok: colors.colorblind.ok,
          okBg: colors.colorblind.okBg,
          okText: colors.colorblind.okText,
          busy: colors.colorblind.busy,
          busyBg: colors.colorblind.busyBg,
          busyText: colors.colorblind.busyText,
          warn: colors.colorblind.warn,
          warnBg: colors.colorblind.warnBg,
          warnText: colors.colorblind.warnText,
        },
      }
    : baseTheme;

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ settings, isDark, theme, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
