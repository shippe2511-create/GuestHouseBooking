import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import Logo from '../../src/components/Logo';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert(
        'Check Your Email',
        'We sent you a confirmation link. Please check your email to complete sign up.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
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
              Create Account
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.muted,
                marginTop: 4,
              }}
            >
              Start managing your guesthouse
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
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Full Name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.muted2}
                autoCapitalize="words"
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

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
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

            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12.5,
                  color: theme.ink3,
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
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
              onPress={handleSignUp}
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
                {loading ? 'Creating account...' : 'Create account'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
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
              Already have an account?{' '}
              <Text style={{ color: colors.light.primary }}>Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
