import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  DollarSign,
  Store,
  Package,
  Users,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Star,
  Layers,
  ShoppingBag,
  LogOut,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlatformAnalytics } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency, formatDateTime } from '../shared/formatters';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminDashboardScreen({ navigation }: any) {
  const { logout } = useAdminAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} />
      </SafeAreaView>
    );
  }

  const overview = analytics?.overview || {
    total_revenue: 0,
    total_orders: 0,
    total_shops: 0,
    approved_shops: 0,
    pending_shops: 0,
    total_products: 0,
    total_customers: 0,
    total_reviews: 0
  };
  const topShops = analytics?.top_shops || [];
  const trending = analytics?.trending_ai_demands || [];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Menu color="#0F172A" size={22} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>Super Admin Console</Text>
            <Text style={styles.headerTitle}>AI Plaza Platform</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutPill} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* GMV Banner */}
        <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.gmvCard}>
          <View style={styles.gmvHeader}>
            <Text style={styles.gmvLabel}>Gross Merchandise Value (GMV)</Text>
            <DollarSign color="#A163F7" size={20} />
          </View>
          <Text style={styles.gmvValue}>{formatCurrency(overview.total_revenue)}</Text>
          <Text style={styles.gmvSub}>Total marketplace sales volume</Text>
        </LinearGradient>

        {/* Pending Approvals Action Alert */}
        {overview.pending_shops > 0 && (
          <TouchableOpacity
            style={styles.pendingAlertCard}
            onPress={() => navigation.navigate('AdminShops', { filter: 'pending' })}
          >
            <AlertCircle color="#D97706" size={22} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingAlertTitle}>{overview.pending_shops} Shops Awaiting Approval</Text>
              <Text style={styles.pendingAlertSub}>Review vendor applications & verify credentials</Text>
            </View>
            <ChevronRight color="#D97706" size={18} />
          </TouchableOpacity>
        )}

        {/* Platform Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Store color="#A163F7" size={18} />
            <Text style={styles.statNum}>{overview.total_shops}</Text>
            <Text style={styles.statLabel}>Shops ({overview.approved_shops} Active)</Text>
          </View>
          <View style={styles.statCard}>
            <Package color="#2563EB" size={18} />
            <Text style={styles.statNum}>{overview.total_orders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp color="#10B981" size={18} />
            <Text style={styles.statNum}>{overview.total_products}</Text>
            <Text style={styles.statLabel}>Listed Products</Text>
          </View>
          <View style={styles.statCard}>
            <Users color="#F59E0B" size={18} />
            <Text style={styles.statNum}>{overview.total_customers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>
        </View>

        {/* Quick Access: Reviews Moderation & Users Directory */}
        <View style={styles.quickNavSection}>
          <Text style={styles.quickSectionTitle}>MANAGEMENT & GOVERNANCE</Text>
          <View style={styles.quickNavGrid}>
            <TouchableOpacity
              style={styles.quickNavCard}
              onPress={() => navigation.navigate('AdminReviews')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickNavIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Star color="#D97706" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.quickNavTitle}>Reviews Moderation</Text>
                  {overview.total_reviews > 0 && (
                    <View style={styles.countPill}>
                      <Text style={styles.countPillText}>{overview.total_reviews}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickNavSub}>Approve & govern customer reviews</Text>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickNavCard}
              onPress={() => navigation.navigate('AdminUsers')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickNavIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Users color="#7C3AED" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.quickNavTitle}>Users Directory</Text>
                  <View style={[styles.countPill, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.countPillText, { color: '#059669' }]}>Sellers & Buyers</Text>
                  </View>
                </View>
                <Text style={styles.quickNavSub}>View seller and customer profiles</Text>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Performing Shops */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Performing Vendors</Text>
          <View style={styles.topShopsList}>
            {topShops.slice(0, 5).map((s, idx) => (
              <View key={s.id} style={styles.shopLeaderRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopLeaderName}>{s.name}</Text>
                  <Text style={styles.shopLeaderSub}>{s.products_count} products listed</Text>
                </View>
                <Text style={styles.shopLeaderRevenue}>{formatCurrency(s.total_sales)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Global AI Demand Intelligence */}
        <View style={styles.sectionCard}>
          <View style={styles.trendTitleRow}>
            <Sparkles color="#A163F7" size={16} />
            <Text style={styles.sectionTitle}>Platform AI Search Insights</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Real-time shoppers demand trends analyzed by the AI Shopping Assistant:
          </Text>

          <View style={styles.demandList}>
            {trending.map((d) => (
              <View key={d.id} style={styles.demandRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demandQuery}>"{d.query_text}"</Text>
                  <Text style={styles.demandCat}>{d.category_hint}</Text>
                </View>
                <View style={styles.demandBadge}>
                  <Text style={styles.demandBadgeText}>{d.request_count} queries</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* HAMBURGER MENU DRAWER MODAL */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.drawerBackdrop}>
          <TouchableOpacity 
            style={styles.drawerBackdropDismiss} 
            activeOpacity={1} 
            onPress={() => setMenuVisible(false)} 
          />
          <View style={styles.drawerContainer}>
            {/* Drawer Admin Profile Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>AR</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.drawerAdminName}>Abdul Rafay</Text>
                <Text style={styles.drawerAdminRole}>Super Administrator</Text>
                <View style={styles.drawerAdminBadge}>
                  <ShieldCheck color="#7C3AED" size={12} />
                  <Text style={styles.drawerAdminBadgeText}>AI Plaza Console</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setMenuVisible(false)}>
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            {/* Navigation List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerNavList}>
              <Text style={styles.drawerNavHeader}>MAIN NAVIGATION</Text>

              <TouchableOpacity 
                style={styles.drawerNavItem}
                onPress={() => { setMenuVisible(false); navigation.navigate('DashboardTab'); }}
              >
                <ShieldCheck color="#7C3AED" size={20} />
                <Text style={styles.drawerNavText}>Dashboard Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerNavItem}
                onPress={() => { setMenuVisible(false); navigation.navigate('ShopsTab'); }}
              >
                <Store color="#2563EB" size={20} />
                <Text style={styles.drawerNavText}>Verified Shops</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerNavItem}
                onPress={() => { setMenuVisible(false); navigation.navigate('ProductsTab'); }}
              >
                <Package color="#10B981" size={20} />
                <Text style={styles.drawerNavText}>Marketplace Products</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerNavItem}
                onPress={() => { setMenuVisible(false); navigation.navigate('OrdersTab'); }}
              >
                <ShoppingBag color="#D97706" size={20} />
                <Text style={styles.drawerNavText}>Platform Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerNavItem}
                onPress={() => { setMenuVisible(false); navigation.navigate('CategoriesTab'); }}
              >
                <Layers color="#6366F1" size={20} />
                <Text style={styles.drawerNavText}>Categories & Taxonomy</Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <Text style={styles.drawerNavHeader}>GOVERNANCE & DIRECTORY</Text>

              <TouchableOpacity 
                style={[styles.drawerNavItem, styles.drawerNavItemHighlight]}
                onPress={() => { setMenuVisible(false); navigation.navigate('AdminReviews'); }}
              >
                <Star color="#D97706" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerNavTextBold}>Reviews Moderation</Text>
                  <Text style={styles.drawerNavSubText}>Shop & product reviews</Text>
                </View>
                <ChevronRight color="#CBD5E1" size={16} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.drawerNavItem, styles.drawerNavItemHighlight]}
                onPress={() => { setMenuVisible(false); navigation.navigate('AdminUsers'); }}
              >
                <Users color="#7C3AED" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerNavTextBold}>Users Management</Text>
                  <Text style={styles.drawerNavSubText}>Sellers & Customers directory</Text>
                </View>
                <ChevronRight color="#CBD5E1" size={16} />
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity 
                style={styles.drawerLogoutItem}
                onPress={() => { setMenuVisible(false); logout(); }}
              >
                <LogOut color="#EF4444" size={18} />
                <Text style={styles.drawerLogoutText}>Sign Out from Console</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoutPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  scrollContent: {
    padding: 16,
  },
  gmvCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    ...Theme.shadows.md,
  },
  gmvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gmvLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  gmvValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  gmvSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  pendingAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  pendingAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingAlertSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    ...Theme.shadows.sm,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  topShopsList: {
    gap: 8,
    marginTop: 6,
  },
  shopLeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#7C3AED',
  },
  shopLeaderName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  shopLeaderSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  shopLeaderRevenue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10B981',
  },
  trendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demandList: {
    gap: 8,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  demandQuery: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  demandCat: {
    fontSize: 10,
    color: '#A163F7',
    fontWeight: '600',
    marginTop: 2,
  },
  demandBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7E22CE',
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavSection: {
    marginTop: 16,
    marginBottom: 6,
  },
  quickSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  quickNavGrid: {
    gap: 10,
  },
  quickNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Theme.shadows.sm,
  },
  quickNavIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  quickNavSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  countPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  // Drawer Styles
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    flexDirection: 'row',
  },
  drawerBackdropDismiss: {
    flex: 1,
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  drawerAdminName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  drawerAdminRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  drawerAdminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  drawerAdminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  drawerCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerNavList: {
    padding: 16,
  },
  drawerNavHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 6,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  drawerNavItemHighlight: {
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  drawerNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  drawerNavTextBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  drawerNavSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  drawerLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  drawerLogoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
});
