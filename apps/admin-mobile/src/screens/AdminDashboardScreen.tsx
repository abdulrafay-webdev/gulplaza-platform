import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import {
  ShieldCheck,
  DollarSign,
  Store,
  Package,
  Users,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
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
      <SafeAreaView style={styles.loadingContainer}>
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
    total_customers: 0
  };
  const topShops = analytics?.top_shops || [];
  const trending = analytics?.trending_ai_demands || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Super Admin Console</Text>
          <Text style={styles.headerTitle}>AI Plaza Platform</Text>
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
});
