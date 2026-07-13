import { View, useWindowDimensions } from 'react-native';
import { Slot } from 'expo-router';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const isDesktop = width >= 1024;

  if (!isDesktop) {
    return <Slot />;
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.page }}>
      <Sidebar />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
}
