import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Store,
  Camera,
  ShieldCheck,
  LogOut,
  MapPin,
  Save,
  CheckCircle2
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { api } from '../services/api';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function ShopSettingsScreen() {
  const { shop, refreshShop, logout } = useSellerAuth();

  const [name, setName] = useState(shop?.name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [logoUrl, setLogoUrl] = useState<string | null>(shop?.logo_url || null);
  const [loading, setLoading] = useState(false);

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setLogoUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Store Name Required', 'Please provide a valid shop name.');
      return;
    }

    try {
      setLoading(true);
      let uploadedLogo = logoUrl;

      if (logoUrl && logoUrl.startsWith('file:')) {
        try {
          const uploadRes = await api.ai.uploadImage(logoUrl);
          uploadedLogo = uploadRes.data.url;
        } catch (imgErr) {
          console.warn('Logo upload failed:', imgErr);
        }
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        logo_url: uploadedLogo || undefined,
      };

      await api.shops.update(payload);
      await refreshShop();
      Alert.alert('Profile Updated', 'Your store profile has been updated!');
    } catch (err) {
      console.error('Failed to update shop:', err);
      Alert.alert('Error', 'Failed to update shop details.');
    } finally {
      setLoading(false);
    }
  };

  const currentLogo = logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Profile & Settings</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Shop Logo Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: currentLogo }} style={styles.shopLogo} />
            <TouchableOpacity style={styles.cameraBtn} onPress={pickLogo}>
              <Camera color="#FFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.shopNameHeading}>{shop?.name || 'Your Store'}</Text>
          <View style={styles.statusPill}>
            <ShieldCheck color="#10B981" size={14} />
            <Text style={styles.statusPillText}>
              {shop?.is_approved ? 'Verified Store' : 'Pending Verification'}
            </Text>
          </View>
        </View>

        {/* Shop Details Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Store Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Description</Text>
            <TextInput
              style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.locationCard}>
            <MapPin color="#A163F7" size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>Physical Marketplace Store</Text>
              <Text style={styles.locationSub}>Gul Plaza Shopping Mall, M.A Jinnah Road, Karachi</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient colors={Theme.gradients.primary as any} style={styles.saveGrad}>
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Save color="#FFF" size={16} />
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#EF4444" size={18} />
          <Text style={styles.logoutText}>Log Out of Seller Account</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  shopLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#A163F7',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shopNameHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputGroup: {},
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 12,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7E22CE',
  },
  locationSub: {
    fontSize: 10,
    color: '#6B21A8',
    marginTop: 1,
  },
  saveBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  saveGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
});
