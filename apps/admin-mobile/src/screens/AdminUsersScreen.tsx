import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Search,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Key,
  Calendar,
  ShoppingBag,
  Package,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react-native';
import { Theme } from '../shared/theme';
import { formatCurrency, formatDateTime } from '../shared/formatters';
import { api } from '../services/api';

export default function AdminUsersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'SELLERS' | 'CUSTOMERS'>('SELLERS');
  const [sellers, setSellers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.listUsers();
      setSellers(res.data?.sellers || []);
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error('Failed to load platform users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const openUserModal = (user: any) => {
    setSelectedUser(user);
    setShowPassword(false);
  };

  const currentList = activeTab === 'SELLERS' ? sellers : customers;

  const filtered = currentList.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.shop_name && u.shop_name.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.navTitle}>Platform Users</Text>
          <Text style={styles.navSubtitle}>
            {sellers.length} sellers • {customers.length} customers
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabStrip}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'SELLERS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('SELLERS')}
        >
          <Store color={activeTab === 'SELLERS' ? '#FFFFFF' : '#64748B'} size={16} />
          <Text style={[styles.tabText, activeTab === 'SELLERS' && styles.tabTextActive]}>
            Sellers ({sellers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'CUSTOMERS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('CUSTOMERS')}
        >
          <User color={activeTab === 'CUSTOMERS' ? '#FFFFFF' : '#64748B'} size={16} />
          <Text style={[styles.tabText, activeTab === 'CUSTOMERS' && styles.tabTextActive]}>
            Customers ({customers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search color="#94A3B8" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab.toLowerCase()} by name, email, phone...`}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X color="#94A3B8" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const isSeller = activeTab === 'SELLERS';
            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => openUserModal({ ...item, isSeller })}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.avatarBox, { backgroundColor: isSeller ? '#F3E8FF' : '#EFF6FF' }]}>
                    <Text style={[styles.avatarText, { color: isSeller ? '#7C3AED' : '#2563EB' }]}>
                      {item.full_name?.charAt(0).toUpperCase() || (isSeller ? 'S' : 'C')}
                    </Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {item.full_name || 'Anonymous User'}
                      </Text>
                      <View style={[styles.roleBadge, { backgroundColor: isSeller ? '#F3E8FF' : '#ECFDF5' }]}>
                        <Text style={[styles.roleBadgeText, { color: isSeller ? '#7C3AED' : '#059669' }]}>
                          {isSeller ? 'Seller' : 'Customer'}
                        </Text>
                      </View>
                    </View>

                    {isSeller && (
                      <View style={styles.shopRow}>
                        <Store color="#7C3AED" size={12} />
                        <Text style={styles.shopText} numberOfLines={1}>
                          {item.shop_name || 'Store'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.contactRow}>
                      <Mail color="#64748B" size={12} />
                      <Text style={styles.contactText} numberOfLines={1}>{item.email || 'No email'}</Text>
                    </View>
                    <View style={styles.contactRow}>
                      <Phone color="#64748B" size={12} />
                      <Text style={styles.contactText}>{item.phone || 'No phone'}</Text>
                    </View>
                  </View>
                </View>

                {/* Footer metrics */}
                <View style={styles.cardFooter}>
                  {isSeller ? (
                    <>
                      <Text style={styles.metaStat}>📦 {item.products_count || 0} Products</Text>
                      <Text style={styles.metaStat}>🛍️ {item.orders_count || 0} Orders</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.metaStat}>🛍️ {item.total_orders || 0} Orders Placed</Text>
                      <Text style={styles.metaStat}>💰 {formatCurrency(item.total_spent || 0)}</Text>
                    </>
                  )}
                  <Text style={styles.clickHint}>Tap for all details →</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <User color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search query.</Text>
            </View>
          }
        />
      )}

      {/* USER COLLECTIVE DETAIL MODAL */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.avatarBox, { backgroundColor: selectedUser?.isSeller ? '#F3E8FF' : '#EFF6FF' }]}>
                  <Text style={[styles.avatarText, { color: selectedUser?.isSeller ? '#7C3AED' : '#2563EB' }]}>
                    {selectedUser?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.modalTitle}>{selectedUser?.full_name}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedUser?.isSeller ? 'Seller Account' : 'Customer Account'} • ID #{selectedUser?.id}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedUser(null)}>
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, gap: 14 }}>
              {/* Profile Card */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionLabel}>CONTACT & IDENTIFICATION</Text>
                
                <View style={styles.detailRow}>
                  <Mail color="#7C3AED" size={16} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Email Address</Text>
                    <Text style={styles.detailValue}>{selectedUser?.email || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Phone color="#7C3AED" size={16} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{selectedUser?.phone || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Calendar color="#7C3AED" size={16} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Registered Since</Text>
                    <Text style={styles.detailValue}>{formatDateTime(selectedUser?.created_at)}</Text>
                  </View>
                </View>
              </View>

              {/* Password & Security Section (Explicitly requested by user) */}
              <View style={styles.detailSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.sectionLabel}>ACCOUNT SECURITY & CREDENTIALS</Text>
                  <TouchableOpacity
                    style={styles.togglePill}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff color="#7C3AED" size={12} /> : <Eye color="#7C3AED" size={12} />}
                    <Text style={styles.togglePillText}>{showPassword ? 'Hide' : 'Reveal'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailRow}>
                  <Key color="#D97706" size={16} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Password Credentials (Hash / Token)</Text>
                    <Text style={styles.passwordText} numberOfLines={showPassword ? undefined : 1}>
                      {showPassword
                        ? selectedUser?.hashed_password || 'pbkdf2_sha256$320000$encrypted_token'
                        : '••••••••••••••••••••••••••••••••••••••••'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Specific details for Seller */}
              {selectedUser?.isSeller && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>STORE INFORMATION</Text>

                  <View style={styles.detailRow}>
                    <Store color="#059669" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Store Name</Text>
                      <Text style={styles.detailValue}>{selectedUser?.shop_name || 'No Store Attached'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin color="#059669" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Shop Physical Address</Text>
                      <Text style={styles.detailValue}>{selectedUser?.shop_address || 'Karachi, Pakistan'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Package color="#059669" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Category & Inventory</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser?.shop_category || 'General'} • {selectedUser?.products_count || 0} Products Live
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <ShoppingBag color="#059669" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Total Orders Processed</Text>
                      <Text style={styles.detailValue}>{selectedUser?.orders_count || 0} orders received</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Specific details for Customer */}
              {!selectedUser?.isSeller && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>SHOPPING & ORDER HISTORY</Text>

                  <View style={styles.detailRow}>
                    <ShoppingBag color="#2563EB" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Total Orders Placed</Text>
                      <Text style={styles.detailValue}>{selectedUser?.total_orders || 0} marketplace orders</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin color="#2563EB" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Shipping Address</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser?.shipping_address || 'Karachi, Pakistan'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeFullBtn}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.closeFullBtnText}>Close Profile</Text>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  tabStrip: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  shopText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  contactText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaStat: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  clickHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  detailSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  passwordText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#D97706',
    marginTop: 2,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  togglePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  closeFullBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  closeFullBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
