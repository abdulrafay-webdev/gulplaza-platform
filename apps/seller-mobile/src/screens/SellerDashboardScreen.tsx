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
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SellerAnalytics } from '../../../../mobile-shared/src/types';
import { Theme } from '../../../../mobile-shared/src/theme';
import { formatCurrency, formatDate } from '../../../../mobile-shared/src/utils/formatters';
import { api } from '../services/api';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerDashboardScreen({ navigation }: any) {
  const { shop } = useSellerAuth();
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.shops.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load seller analytics:', err);
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

  const overview = analytics?.overview || { total_sales: 0, total_orders: 0, total_products: 0, low_stock_count: 0 };
  const breakdown = analytics?.orders_breakdown || {};
  const trending = analytics?.trending_ai_demands || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerSubtitle}>Seller Control Center</Text>
          <Text style={styles.headerTitle}>{shop?.name || 'My Plaza Store'}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.addGrad}>
            <Plus color="#FFF" size={16} />
            <Text style={styles.addBtnText}>Add Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.kpiCardLarge}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabelLight}>Total Store Revenue</Text>
              <DollarSign color="#A163F7" size={18} />
            </View>
            <Text style={styles.kpiValueLarge}>{formatCurrency(overview.total_sales)}</Text>
            <Text style={styles.kpiSubLight}>From {overview.total_orders} total orders</Text>
          </LinearGradient>

          <View style={styles.kpiRowSmall}>
            <View style={styles.kpiCardSmall}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>Total Orders</Text>
                <Package color="#2563EB" size={16} />
              </View>
              <Text style={styles.kpiValueSmall}>{overview.total_orders}</Text>
              <Text style={styles.kpiSubSmall}>{breakdown.pending || 0} pending</Text>
            </View>

            <View style={styles.kpiCardSmall}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>Products</Text>
                <ShoppingBag color="#10B981" size={16} />
              </View>
              <Text style={styles.kpiValueSmall}>{overview.total_products}</Text>
              <Text style={styles.kpiSubSmall}>Active in store</Text>
            </View>
          </View>
        </View>

        {/* Low Stock Alert Banner */}
        {overview.low_stock_count > 0 && (
          <TouchableOpacity
            style={styles.lowStockBanner}
            onPress={() => navigation.navigate('Products')}
          >
            <AlertTriangle color="#D97706" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lowStockTitle}>Inventory Alert ({overview.low_stock_count} Items)</Text>
              <Text style={styles.lowStockDesc}>Some products are running low on stock. Restock soon!</Text>
            </View>
            <ChevronRight color="#D97706" size={18} />
          </TouchableOpacity>
        )}

        {/* Order Status Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Orders Overview</Text>
          <View style={styles.statusPillsRow}>
            <View style={[styles.statusBox, { backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.statusBoxNum, { color: '#D97706' }]}>{breakdown.pending || 0}</Text>
              <Text style={styles.statusBoxLabel}>Pending</Text>
            </View>
            <View style={[styles.statusBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={[styles.statusBoxNum, { color: '#7C3AED' }]}>{breakdown.confirmed || 0}</Text>
              <Text style={styles.statusBoxLabel}>Confirmed</Text>
            </View>
            <View style={[styles.statusBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statusBoxNum, { color: '#2563EB' }]}>{breakdown.shipped || 0}</Text>
              <Text style={styles.statusBoxLabel}>Shipped</Text>
            </View>
            <View style={[styles.statusBox, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statusBoxNum, { color: '#059669' }]}>{breakdown.completed || 0}</Text>
              <Text style={styles.statusBoxLabel}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Trending AI Shopper Demands */}
        <View style={styles.sectionCard}>
          <View style={styles.trendHeader}>
            <Sparkles color="#A163F7" size={16} />
            <Text style={styles.sectionTitle}>Shopper AI Demand Insights</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Live high-demand product queries searched by Gul Plaza customers via the AI Assistant:
          </Text>

          <View style={styles.demandList}>
            {trending.map((d) => (
              <View key={d.id} style={styles.demandItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demandQuery}>"{d.query_text}"</Text>
                  <Text style={styles.demandCat}>{d.category_hint}</Text>
                </View>
                <View style={styles.demandCountBadge}>
                  <Text style={styles.demandCountText}>{d.request_count} searches</Text>
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
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  addBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  kpiGrid: {
    gap: 12,
    marginBottom: 16,
  },
  kpiCardLarge: {
    borderRadius: 18,
    padding: 18,
    ...Theme.shadows.md,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabelLight: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiValueLarge: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  kpiSubLight: {
    color: '#94A3B8',
    fontSize: 11,
  },
  kpiRowSmall: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCardSmall: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  kpiValueSmall: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  kpiSubSmall: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  lowStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  lowStockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  lowStockDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  statusPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statusBoxNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  statusBoxLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
    marginTop: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demandList: {
    gap: 8,
  },
  demandItem: {
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
  demandCountBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demandCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7E22CE',
  },
});
