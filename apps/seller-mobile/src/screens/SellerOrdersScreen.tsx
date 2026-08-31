import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal
} from 'react-native';
import {
  Package,
  Phone,
  MapPin,
  Clock,
  User,
  ChevronDown,
  CheckCircle,
  Truck,
  X
} from 'lucide-react-native';
import { Order } from '../../../../mobile-shared/src/types';
import { Theme } from '../../../../mobile-shared/src/theme';
import { formatCurrency, formatDateTime } from '../../../../mobile-shared/src/utils/formatters';
import { api } from '../services/api';

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.list();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      await api.orders.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      setSelectedOrder(null);
      Alert.alert('Status Updated', `Order #${orderId} marked as ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'all') return true;
    return o.status?.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusStyle = (status: string) => {
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
        <Text style={styles.headerTitle}>Store Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} total orders received</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'confirmed', 'shipped', 'completed'].map((tab) => {
          const isSelected = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected ? styles.activeTabBtn : null]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.tabBtnText, isSelected ? styles.activeTabBtnText : null]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const st = getStatusStyle(item.status);
            return (
              <View style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.orderIdBox}>
                    <Package color="#A163F7" size={16} />
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: st.bg }]}
                    onPress={() => setSelectedOrder(item)}
                  >
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                    <ChevronDown color={st.text} size={12} />
                  </TouchableOpacity>
                </View>

                {/* Customer Details */}
                <View style={styles.detailsBlock}>
                  <View style={styles.infoRow}>
                    <User color="#64748B" size={14} />
                    <Text style={styles.infoText}>{item.guest_name || 'Guest Shopper'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone color="#64748B" size={14} />
                    <Text style={styles.infoText}>{item.guest_phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin color="#64748B" size={14} />
                    <Text style={styles.infoText} numberOfLines={2}>{item.guest_address || 'Gul Plaza area, Karachi'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{formatDateTime(item.created_at)}</Text>
                  <Text style={styles.orderAmount}>{formatCurrency(item.total_amount)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Orders in this Status</Text>
              <Text style={styles.emptyDesc}>Customer orders will show up here automatically when placed.</Text>
            </View>
          }
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order #{selectedOrder?.id} Status</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <X color="#0F172A" size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.statusOptions}>
              {[
                { status: 'pending', label: 'Mark as Pending', bg: '#FFFBEB', color: '#D97706' },
                { status: 'confirmed', label: 'Confirm Order', bg: '#F5F3FF', color: '#7C3AED' },
                { status: 'shipped', label: 'Mark as Dispatched / Shipped', bg: '#EFF6FF', color: '#2563EB' },
                { status: 'completed', label: 'Mark as Delivered / Completed', bg: '#ECFDF5', color: '#059669' },
                { status: 'cancelled', label: 'Cancel Order', bg: '#FEF2F2', color: '#DC2626' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.status}
                  style={[styles.statusOptBtn, { backgroundColor: opt.bg }]}
                  disabled={updating}
                  onPress={() => selectedOrder && handleStatusUpdate(selectedOrder.id, opt.status)}
                >
                  <Text style={[styles.statusOptText, { color: opt.color }]}>{opt.label}</Text>
                  <CheckCircle color={opt.color} size={18} />
                </TouchableOpacity>
              ))}
            </View>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  activeTabBtn: {
    backgroundColor: '#A163F7',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
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
  orderIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBlock: {
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
    flex: 1,
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
  orderAmount: {
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
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusOptions: {
    gap: 10,
    marginBottom: 20,
  },
  statusOptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  statusOptText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
