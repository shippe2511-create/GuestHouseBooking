import { View, Text, Pressable } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../contexts/ThemeContext';

export default function OfflineBanner() {
  const { isConnected, isSyncing, syncOfflineQueue } = useNetworkStatus();
  const { theme } = useTheme();

  if (isConnected && !isSyncing) return null;

  return (
    <View
      style={{
        backgroundColor: isSyncing ? '#0d9488' : '#ef4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {isSyncing ? (
        <>
          <RefreshCw size={14} color="#fff" strokeWidth={2} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff' }}>
            Syncing offline changes...
          </Text>
        </>
      ) : (
        <>
          <WifiOff size={14} color="#fff" strokeWidth={2} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff' }}>
            You're offline. Changes will sync when connected.
          </Text>
          <Pressable
            onPress={syncOfflineQueue}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4,
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#fff' }}>
              Retry
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
