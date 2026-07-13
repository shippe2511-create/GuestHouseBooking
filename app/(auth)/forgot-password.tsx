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
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import Logo from '../../src/components/Logo';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'guestos://reset-password',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Logo size={80} />
          </View>

          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 28,
              width: '100%',
              maxWidth: 404,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.status.okBg,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 28 }}>✉️</Text>
            </View>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 19,
                color: theme.ink,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Check your email
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.muted,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              We've sent a password reset link to{'\n'}
              <Text style={{ color: theme.ink, fontFamily: 'Inter_600SemiBold' }}>{email}</Text>
            </Text>

            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                borderRadius: 10,
                paddingVertical: 13,
                paddingHorizontal: 24,
                width: '100%',
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
                Back to login
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: 8,
            marginLeft: -8,
            borderRadius: 8,
            backgroundColor: pressed ? theme.chip : 'transparent',
            alignSelf: 'flex-start',
          })}
        >
          <ArrowLeft size={20} color={theme.ink2} strokeWidth={1.7} />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: theme.ink2,
            }}
          >
            Back
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Logo size={80} />
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
              marginBottom: 8,
            }}
          >
            Forgot password?
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.muted,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Enter your email and we'll send you a reset link
          </Text>

          <View style={{ marginBottom: 8 }}>
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

          <Pressable
            onPress={handleResetPassword}
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
              {loading ? 'Sending...' : 'Send reset link'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
