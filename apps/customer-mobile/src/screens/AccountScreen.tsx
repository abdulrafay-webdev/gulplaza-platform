import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import {
  User,
  Package,
  Bot,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  LogIn
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../../mobile-shared/src/theme';
import { useAuth } from '../context/AuthContext';

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        {user ? (
          <LinearGradient
            colors={Theme.gradients.primary as any}
            style={styles.profileCard}
          >
            <View style={styles.avatarBox}>
              <User color="#A163F7" size={28} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.full_name}</Text>
              {user.email && (
                <View style={styles.contactRow}>
                  <Mail color="#DDD6FE" size={12} />
                  <Text style={styles.contactText}>{user.email}</Text>
                </View>
              )}
              {user.phone && (
                <View style={styles.contactRow}>
                  <Phone color="#DDD6FE" size={12} />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <User color="#94A3B8" size={28} />
            </View>
            <Text style={styles.guestTitle}>Welcome to AI Plaza</Text>
            <Text style={styles.guestDesc}>Sign in to track orders and save your personal AI chat history.</Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.loginGrad}>
                <LogIn color="#FFF" size={16} />
                <Text style={styles.loginBtnText}>Sign In / Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuIconBox}>
              <Package color="#A163F7" size={18} />
            </View>
            <Text style={styles.menuText}>Order History & Tracking</Text>
            <ChevronRight color="#CBD5E1" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AIChat')}
          >
            <View style={styles.menuIconBox}>
              <Bot color="#A163F7" size={18} />
            </View>
            <Text style={styles.menuText}>AI Shopping Assistant</Text>
            <ChevronRight color="#CBD5E1" size={18} />
          </TouchableOpacity>
        </View>

        {/* Security & Verification Note */}
        <View style={styles.trustCard}>
          <ShieldCheck color="#10B981" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>100% Genuine Gul Plaza Marketplace</Text>
            <Text style={styles.trustDesc}>Cash on delivery verified stores with nationwide delivery across Pakistan.</Text>
          </View>
        </View>

        {/* Logout Action */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut color="#EF4444" size={18} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
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
  profileCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    ...Theme.shadows.md,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: '#EDE9FE',
    fontWeight: '600',
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  guestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  guestDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  loginGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  trustDesc: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
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
