import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react-native';
import { Order } from '../../../../mobile-shared/src/types';
import { Theme } from '../../../../mobile-shared/src/theme';
import { formatCurrency, formatDate } from '../../../../mobile-shared/src/utils/formatters';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.customers.getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { bg: '#ECFDF5', text: '#059669', label: 'Delivered' };
      case 'shipped':
        return { bg: '#EFF6FF', text: '#2563EB', label: 'In Transit' };
      case 'confirmed':
        return { bg: '#F5F3FF', text: '#7C3AED', label: 'Confirmed' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#DC2626', label: 'Cancelled' };
      default:
        return { bg: '#FFFBEB', text: '#D97706', label: 'Pending Processing' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.headerSubtitle}>Track past marketplace purchases</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.orderIdRow}>
                    <Package color="#A163F7" size={16} />
                    <Text style={styles.orderIdText}>Order #{item.id}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.shopName}>{item.shop_name || `Shop #${item.shop_id}`}</Text>
                  <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable (COD):</Text>
                    <Text style={styles.totalVal}>{formatCurrency(item.total_amount)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptyDesc}>When you place an order, it will appear here with live tracking.</Text>
            </View>
          }
        />
      )}
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
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    gap: 4,
  },
  shopName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
