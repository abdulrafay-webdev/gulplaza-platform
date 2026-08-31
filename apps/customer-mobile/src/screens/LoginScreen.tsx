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
import { Bot, Mail, Lock, ChevronLeft, ArrowRight, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../../mobile-shared/src/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email or phone number and password.');
      return;
    }

    try {
      setLoading(true);
      const success = await login(loginId.trim(), password);
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Sign In Failed', 'Invalid email/phone or password. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.logoBadge}>
            <Bot color="#FFF" size={32} />
          </LinearGradient>

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to access your orders and AI advisor</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone Number</Text>
              <View style={styles.inputBox}>
                <Mail color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or 03XXXXXXXXX"
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
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.submitGrad}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Sign In</Text>
                    <ArrowRight color="#FFF" size={16} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
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
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
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
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  inputGroup: {},
  label: {
    fontSize: 12,
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
    marginTop: 8,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A163F7',
  },
});
