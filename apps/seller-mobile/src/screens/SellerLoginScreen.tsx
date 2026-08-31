import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { Store, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignIn, useAuth } from '../lib/ClerkAuthContext';
import { Theme } from '../shared/theme';
import { useSellerAuth } from '../context/SellerAuthContext';
import { api } from '../services/api';

export default function SellerLoginScreen() {
  const { login } = useSellerAuth();
  const { signIn, setActive } = useSignIn();
  const { getToken, isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingBackend, setAwaitingBackend] = useState(false);

  useEffect(() => {
    if (awaitingBackend && isSignedIn) {
      completeBackendLogin();
    }
  }, [awaitingBackend, isSignedIn]);

  const completeBackendLogin = async () => {
    try {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
        try {
          const shopRes = await api.shops.getMe();
          await login(token, shopRes.data);
        } catch (e) {
          await login(token);
        }
      }
    } catch (err) {
      console.error('Backend login error:', err);
      Alert.alert('Error', 'Failed to connect to the marketplace. Please try again.');
    } finally {
      setLoading(false);
      setAwaitingBackend(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Credentials', 'Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);

      const result = await signIn!.create({ identifier: email.trim() });

      if (result.status === 'needs_first_factor') {
        const attemptResult = await signIn!.attemptFirstFactor({
          strategy: 'password',
          password: password,
        });

        if (attemptResult.status === 'complete') {
          await setActive!({ session: attemptResult.createdSessionId });
          setAwaitingBackend(true);
        } else {
          Alert.alert('Sign In Incomplete', 'Additional verification is required.');
          setLoading(false);
        }
      } else {
        Alert.alert('Sign In Failed', 'Unexpected response. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Seller login error:', err);
      const message = err?.errors?.[0]?.message || err?.message || 'Invalid email or password.';
      Alert.alert('Sign In Failed', message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.logoBox}>
            <Store color="#FFF" size={36} />
          </LinearGradient>

          <Text style={styles.title}>Seller Merchant Portal</Text>
          <Text style={styles.subtitle}>Sign in to manage your Gul Plaza store & fulfill customer orders</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputBox}>
                <Mail color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputBox}>
                <Lock color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#94A3B8" size={18} /> : <Eye color="#94A3B8" size={18} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSignIn}
              disabled={loading}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.submitGrad}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Sign In to Dashboard</Text>
                    <ArrowRight color="#FFF" size={16} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    ...Theme.shadows.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  form: {
    gap: 16,
  },
  inputGroup: {},
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 12,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
