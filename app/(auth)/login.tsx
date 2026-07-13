import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import Logo from '../../src/components/Logo';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(dashboard)');
    }
  };

  const handleDemoLogin = () => {
    router.replace('/(dashboard)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Logo size={80} />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_800ExtraBold',
              fontSize: 24,
              color: theme.ink,
              marginTop: 16,
            }}
          >
            Hudhu Veli
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.muted,
              marginTop: 4,
            }}
          >
            Guesthouse Management
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 404,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.06,
            shadowRadius: 30,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 19,
              color: theme.ink,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Welcome back
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 12.5,
                color: theme.ink3,
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.muted2}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.ink,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.inputLine,
                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 14,
              }}
            />
          </View>

          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                }}
              >
                Password
              </Text>
              <Pressable>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12.5,
                    color: colors.light.primary,
                  }}
                >
                  Forgot password?
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.muted2}
              secureTextEntry
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.ink,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.inputLine,
                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 14,
              }}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
              borderRadius: 10,
              paddingVertical: 13,
              marginTop: 24,
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
              opacity: loading ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDemoLogin}
            style={({ pressed }) => ({
              backgroundColor: pressed ? theme.chip : 'transparent',
              borderWidth: 1,
              borderColor: theme.inputLine,
              borderRadius: 10,
              paddingVertical: 13,
              marginTop: 12,
            })}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: theme.ink3,
                textAlign: 'center',
              }}
            >
              Continue with Demo Data
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: theme.muted,
              textAlign: 'center',
            }}
          >
            Don't have an account?{' '}
            <Text style={{ color: colors.light.primary }}>Sign up</Text>
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(admin)')}
          style={{ marginTop: 16 }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: theme.muted,
              textAlign: 'center',
            }}
          >
            Platform Admin?{' '}
            <Text style={{ color: colors.light.primary }}>Open Admin Console</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
