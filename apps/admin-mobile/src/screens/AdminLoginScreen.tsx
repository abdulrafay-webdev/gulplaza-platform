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
  Alert
} from 'react-native';
import { ShieldCheck, Key, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../../mobile-shared/src/theme';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginScreen() {
  const { login } = useAdminAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!tokenInput.trim()) {
      Alert.alert('Admin Token Required', 'Please enter your Super Admin access key or Clerk token.');
      return;
    }

    try {
      setLoading(true);
      const success = await login(tokenInput.trim());
      if (!success) {
        Alert.alert('Access Denied', 'This credential does not have Super Admin privileges on AI Plaza.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
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
        <View style={styles.content}>
          <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.logoBox}>
            <ShieldCheck color="#A163F7" size={40} />
          </LinearGradient>

          <Text style={styles.title}>Super Admin Console</Text>
          <Text style={styles.subtitle}>Protected administration portal for AI Plaza operations</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Super Admin Access Key</Text>
              <View style={styles.inputBox}>
                <Key color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter administrator token"
                  placeholderTextColor="#94A3B8"
                  value={tokenInput}
                  onChangeText={setTokenInput}
                  autoCapitalize="none"
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
                    <Text style={styles.submitBtnText}>Verify & Enter Admin Console</Text>
                    <ArrowRight color="#FFF" size={16} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Access is restricted to platform super administrators. All moderation actions, approvals, and order records are audited.
              </Text>
            </View>
          </View>
        </View>
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
    fontSize: 13,
    fontWeight: '900',
  },
  noticeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  noticeText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
    textAlign: 'center',
  },
});
