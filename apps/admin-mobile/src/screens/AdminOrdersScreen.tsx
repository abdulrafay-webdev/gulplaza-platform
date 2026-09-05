import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Store, User, Phone, MapPin } from 'lucide-react-native';
import { Order } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency, formatDateTime } from '../shared/formatters';
import { api } from '../services/api';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopsMap, setShopsMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [orderRes, shopRes] = await Promise.all([
        api.orders.list(),
        api.admin.listShops().catch(() => ({ data: [] }))
      ]);
      const sMap: Record<number, string> = {};
      (shopRes.data || []).forEach((s: any) => {
        sMap[s.id] = s.name;
      });
      setShopsMap(sMap);
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error('Failed to load platform orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Platform Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} total orders across marketplace</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
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

                {/* Ordered Products Breakdown */}
                {item.items && item.items.length > 0 && (
                  <View style={styles.itemsBox}>
                    {item.items.map((it: any, idx: number) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          • {it.product?.name || `Product #${it.product_id}`}{it.variant_name ? ` (${it.variant_name})` : ''}
                        </Text>
                        <Text style={styles.itemQty}>x{it.quantity}</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(it.price_at_purchase * it.quantity)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Store color="#7C3AED" size={14} />
                    <Text style={styles.infoText}>Shop: <Text style={{ fontWeight: '800', color: '#6D28D9' }}>{item.shop_name || shopsMap[item.shop_id] || (item.shop_id ? `Shop #${item.shop_id}` : 'Store')}</Text></Text>
                  </View>
                  <View style={styles.infoRow}>
                    <User color="#64748B" size={14} />
                    <Text style={styles.infoText}>Customer: {item.guest_name || 'Customer'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone color="#64748B" size={14} />
                    <Text style={styles.infoText}>Contact: {item.guest_phone || 'N/A'}</Text>
                  </View>
                  {item.guest_address && (
                    <View style={styles.infoRow}>
                      <MapPin color="#64748B" size={14} />
                      <Text style={styles.infoText} numberOfLines={2}>{item.guest_address}</Text>
                    </View>
                  )}
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
              <Text style={styles.emptyDesc}>Marketplace orders will appear here automatically.</Text>
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
  itemsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  itemQty: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
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
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
