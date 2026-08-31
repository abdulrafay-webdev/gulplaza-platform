import React, { useState } from 'react';
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
import { Store, Mail, Lock, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerLoginScreen({ navigation }: any) {
  const { login } = useSellerAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your seller email/phone and password.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(loginId.trim(), password);
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Invalid email/phone or password.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.logoBox}>
              <Store color="#FFFFFF" size={38} />
            </LinearGradient>

            <Text style={styles.title}>Seller Merchant Portal</Text>
            <Text style={styles.subtitle}>Sign in to manage your inventory, track orders, and view AI shopper demand analytics</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seller Email or Phone</Text>
                <View style={styles.inputBox}>
                  <Mail color="#94A3B8" size={18} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. creative@aiplaza.com or 0300..."
                    placeholderTextColor="#94A3B8"
                    value={loginId}
                    onChangeText={setLoginId}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputBox}>
                  <Lock color="#94A3B8" size={18} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
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

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>NEW VENDOR?</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => navigation.navigate('SellerRegister')}
              >
                <UserPlus color="#7C3AED" size={18} />
                <Text style={styles.registerBtnText}>Open / Register a New Shop</Text>
              </TouchableOpacity>

              <View style={styles.noticeBox}>
                <ShieldCheck color="#10B981" size={16} />
                <Text style={styles.noticeText}>
                  Protected Multi-Vendor Merchant Access. Registered stores receive real-time order alerts and AI product optimizations.
                </Text>
              </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 24,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
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
    paddingHorizontal: 10,
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
    marginTop: 6,
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
    fontSize: 13,
    fontWeight: '900',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    paddingVertical: 13,
  },
  registerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  noticeText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
});
