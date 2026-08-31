import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import {
  Store,
  CheckCircle,
  XCircle,
  Power,
  Trash2,
  ShieldCheck,
  Clock
} from 'lucide-react-native';
import { Shop } from '../shared/types';
import { Theme } from '../shared/theme';
import { api } from '../services/api';

export default function AdminShopsScreen({ route }: any) {
  const defaultFilter = route?.params?.filter || 'all';
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultFilter);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await api.admin.listShops();
      setShops(res.data || []);
    } catch (err) {
      console.error('Failed to load admin shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId: number) => {
    try {
      await api.admin.approveShop(shopId);
      setShops(prev =>
        prev.map(s => (s.id === shopId ? { ...s, is_approved: true, is_active: true } : s))
      );
      Alert.alert('Shop Approved', 'The store is now verified and active on AI Plaza!');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve shop.');
    }
  };

  const handleToggleActive = async (shopId: number) => {
    try {
      const res = await api.admin.toggleActive(shopId);
      const updated = res.data;
      setShops(prev =>
        prev.map(s => (s.id === shopId ? { ...s, is_active: updated.is_active } : s))
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle shop status.');
    }
  };

  const handleDelete = (shopId: number) => {
    Alert.alert(
      'Delete Shop',
      'Permanently remove this store from the platform?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.admin.deleteShop(shopId);
              setShops(prev => prev.filter(s => s.id !== shopId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete shop.');
            }
          }
        }
      ]
    );
  };

  const filteredShops = shops.filter(s => {
    if (activeTab === 'pending') return !s.is_approved;
    if (activeTab === 'approved') return s.is_approved && s.is_active;
    if (activeTab === 'inactive') return !s.is_active;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Approvals & Management</Text>
        <Text style={styles.headerSubtitle}>{shops.length} total registered vendor stores</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: 'all', label: 'All Shops' },
          { key: 'pending', label: 'Pending Approval' },
          { key: 'approved', label: 'Active & Verified' },
        ].map((t) => {
          const isSelected = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, isSelected ? styles.activeTabBtn : null]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabBtnText, isSelected ? styles.activeTabBtnText : null]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const logo = item.logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80';
            return (
              <View style={styles.shopCard}>
                <Image source={{ uri: logo }} style={styles.shopLogo} />
                <View style={styles.shopInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                    {item.is_approved ? (
                      <View style={styles.approvedBadge}>
                        <ShieldCheck color="#059669" size={12} />
                        <Text style={styles.approvedText}>Approved</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Clock color="#D97706" size={12} />
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.shopDesc} numberOfLines={2}>
                    {item.description || 'No description provided.'}
                  </Text>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    {!item.is_approved ? (
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(item.id)}
                      >
                        <CheckCircle color="#FFF" size={14} />
                        <Text style={styles.approveBtnText}>Approve Store</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.toggleBtn, item.is_active ? styles.activeBg : styles.inactiveBg]}
                        onPress={() => handleToggleActive(item.id)}
                      >
                        <Power color={item.is_active ? '#059669' : '#DC2626'} size={14} />
                        <Text style={[styles.toggleBtnText, { color: item.is_active ? '#059669' : '#DC2626' }]}>
                          {item.is_active ? 'Active' : 'Deactivated'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Store color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Shops Found</Text>
              <Text style={styles.emptyDesc}>No vendor shops match the selected filter.</Text>
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
  tabRow: {
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
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Theme.shadows.sm,
  },
  shopLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  shopInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  shopDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeBg: {
    backgroundColor: '#ECFDF5',
  },
  inactiveBg: {
    backgroundColor: '#FEF2F2',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
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
  },
});
