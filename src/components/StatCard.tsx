import { View, Text, useColorScheme } from 'react-native';
import { colors } from '../constants/theme';

type StatusType = 'default' | 'ok' | 'busy' | 'warn';

interface StatCardProps {
  label: string;
  value: number;
  status: StatusType;
}

export default function StatCard({ label, value, status }: StatCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const getStatusColor = () => {
    switch (status) {
      case 'ok':
        return theme.status.ok;
      case 'busy':
        return theme.status.busy;
      case 'warn':
        return theme.status.warn;
      default:
        return theme.muted;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.line,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 9,
            backgroundColor: getStatusColor(),
          }}
        />
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11.5,
            color: theme.tableHeader,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 30,
          color: theme.ink,
          marginTop: 8,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
