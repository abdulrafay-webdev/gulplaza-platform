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
import { Package, Store, User, Phone, MapPin } from 'lucide-react-native';
import { Order } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency, formatDateTime } from '../shared/formatters';
import { api } from '../services/api';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.list();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load platform orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#ECFDF5', text: '#059669', label: 'Delivered' };
      case 'shipped':
        return { bg: '#EFF6FF', text: '#2563EB', label: 'Shipped' };
      case 'confirmed':
        return { bg: '#F5F3FF', text: '#7C3AED', label: 'Confirmed' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#DC2626', label: 'Cancelled' };
      default:
        return { bg: '#FFFBEB', text: '#D97706', label: 'Pending' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Platform Orders</Text>
        <Text style={styles.headerSubtitle}>Real-time marketplace transactions & tracking</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const badge = getBadge(item.status);
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
                  <View style={styles.infoRow}>
                    <Store color="#64748B" size={14} />
                    <Text style={styles.infoText}>Shop: {item.shop_name || `Shop #${item.shop_id}`}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <User color="#64748B" size={14} />
                    <Text style={styles.infoText}>Customer: {item.guest_name || 'Guest Shopper'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone color="#64748B" size={14} />
                    <Text style={styles.infoText}>Contact: {item.guest_phone || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{formatDateTime(item.created_at)}</Text>
                  <Text style={styles.totalAmount}>{formatCurrency(item.total_amount)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
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
    fontSize: 11,
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
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  totalAmount: {
    fontSize: 15,
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
  },
});
