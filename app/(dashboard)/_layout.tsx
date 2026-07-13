import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import {
  Home,
  Calendar,
  BedDouble,
  DollarSign,
  Receipt,
  Users,
  Building2,
  Settings,
} from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import Sidebar from '../../src/components/Sidebar';

export default function DashboardLayout() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.page }}>
        <Sidebar />
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="calendar" />
            <Tabs.Screen name="bookings" />
            <Tabs.Screen name="revenue" />
            <Tabs.Screen name="payments" />
            <Tabs.Screen name="staff" />
            <Tabs.Screen name="properties" />
            <Tabs.Screen name="settings" />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.line,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: theme.nav,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, size }) => (
            <BedDouble size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: 'Revenue',
          tabBarIcon: ({ color, size }) => (
            <DollarSign size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Receipt size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Building2 size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={1.7} />
          ),
        }}
      />
    </Tabs>
  );
}
