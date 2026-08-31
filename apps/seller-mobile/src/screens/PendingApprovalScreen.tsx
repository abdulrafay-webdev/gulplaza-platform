import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Clock, ShieldAlert, RefreshCw, LogOut, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function PendingApprovalScreen() {
  const { shop, refreshShop, logout } = useSellerAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Clock color="#D97706" size={48} />
        </View>

        <Text style={styles.title}>Store Approval Pending</Text>
        <Text style={styles.shopName}>"{shop?.name || 'Your Shop'}"</Text>
        <Text style={styles.desc}>
          Thank you for registering your store on AI Plaza. Our marketplace administration team is currently verifying your Gul Plaza shop credentials.
        </Text>

        <View style={styles.infoCard}>
          <ShieldAlert color="#D97706" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Verification in Progress</Text>
            <Text style={styles.infoText}>
              Approval takes 1-2 business days. Once approved, you will get instant access to product management and order fulfillment.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={refreshShop}>
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.refreshGrad}>
            <RefreshCw color="#FFF" size={16} />
            <Text style={styles.refreshBtnText}>Check Approval Status</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#64748B" size={16} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A163F7',
    marginBottom: 12,
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  infoText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  refreshBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  refreshGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});
