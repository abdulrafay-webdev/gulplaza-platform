import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server
} from 'lucide-react-native';

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <ShieldCheck color="#10B981" size={32} />
          <Text style={styles.headerTitle}>Your Privacy Matters</Text>
          <Text style={styles.headerSubtitle}>
            AI Plaza is committed to protecting your personal data, shopping preferences, and transaction privacy.
          </Text>
          <Text style={styles.lastUpdated}>Last Updated: September 2026</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Lock color="#7C3AED" size={18} />
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          <Text style={styles.sectionBody}>
            • <Text style={styles.bold}>Account Details:</Text> Your name, mobile phone number, email address, and shipping delivery location.{"\n"}
            • <Text style={styles.bold}>Visual Queries:</Text> When you upload a photo for AI visual search, images are processed securely and never sold to third parties.{"\n"}
            • <Text style={styles.bold}>Order History:</Text> Records of your Cash on Delivery orders, delivery tracking, and product reviews.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Eye color="#2563EB" size={18} />
            <Text style={styles.sectionTitle}>2. How Your Data Is Used</Text>
          </View>
          <Text style={styles.sectionBody}>
            • Facilitating courier deliveries across Pakistan.{"\n"}
            • Powering AI personalized product recommendations.{"\n"}
            • Providing verified merchant shop communication.{"\n"}
            • Preventing fraudulent orders and protecting Gul Plaza merchants.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Server color="#059669" size={18} />
            <Text style={styles.sectionTitle}>3. Device Permissions</Text>
          </View>
          <Text style={styles.sectionBody}>
            • <Text style={styles.bold}>Camera & Photos:</Text> Used exclusively when you choose to take or upload a product picture for visual search or reviews.{"\n"}
            • <Text style={styles.bold}>Storage:</Text> Used to cache product thumbnails for faster offline browsing.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FileText color="#D97706" size={18} />
            <Text style={styles.sectionTitle}>4. Contact Us</Text>
          </View>
          <Text style={styles.sectionBody}>
            If you have any questions regarding your data or wish to request data removal, please contact the AI Plaza administration team at:{"\n\n"}
            📧 <Text style={styles.bold}>support@gulplaza-platform.com</Text>{"\n"}
            🏢 <Text style={styles.bold}>Gul Plaza Commercial Complex, M.A. Jinnah Road, Karachi, Pakistan</Text>
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
