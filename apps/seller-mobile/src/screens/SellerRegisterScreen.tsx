import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, User, Mail, Phone, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerRegisterScreen({ navigation }: any) {
  const { register } = useSellerAuth();
  const [shopName, setShopName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!shopName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide Shop Name, Full Name, Email, and Password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        shop_name: shopName.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        shop_description: shopDescription.trim() || undefined,
      });

      if (result.success) {
        Alert.alert(
          'Registration Submitted! 🎉',
          'Your shop application has been submitted and is now pending Super Admin review. You will be redirected to your verification status screen.',
          [{ text: 'View Status' }]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Could not register shop.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#0F172A" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Open a New Shop</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Register your vendor business on AI Plaza and reach thousands of shoppers across Pakistan.
          </Text>

          <View style={styles.form}>
            {/* Shop Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop / Brand Name *</Text>
              <View style={styles.inputBox}>
                <Store color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Karachi Electronic Hub"
                  placeholderTextColor="#94A3B8"
                  value={shopName}
                  onChangeText={setShopName}
                />
              </View>
            </View>

            {/* Owner Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Full Name *</Text>
              <View style={styles.inputBox}>
                <User color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Muhammad Ali"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email *</Text>
              <View style={styles.inputBox}>
                <Mail color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ali@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp / Phone Number</Text>
              <View style={styles.inputBox}>
                <Phone color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 03001234567"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputBox}>
                <Lock color="#94A3B8" size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Shop Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Description / Products Overview</Text>
              <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start', paddingTop: 8 }]}>
                <FileText color="#94A3B8" size={18} style={{ marginTop: 2 }} />
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top' }]}
                  placeholder="Tell customers about the items and specialties you sell..."
                  placeholderTextColor="#94A3B8"
                  value={shopDescription}
                  onChangeText={setShopDescription}
                  multiline
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.submitGrad}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <CheckCircle2 color="#FFF" size={18} />
                    <Text style={styles.submitBtnText}>Submit Store for Approval</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have a shop?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SellerLogin')}>
                <Text style={styles.footerLink}> Sign In</Text>
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  form: {
    gap: 14,
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
    paddingVertical: 11,
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
    fontSize: 13,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
});
