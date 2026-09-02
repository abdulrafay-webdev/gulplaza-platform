import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Star,
  Store,
  Package,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react-native';
import { Theme } from '../shared/theme';
import { formatDateTime } from '../shared/formatters';
import { api } from '../services/api';

export default function AdminReviewsScreen({ navigation }: any) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.admin.listReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load admin reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleApprove = async (reviewId: number) => {
    try {
      await api.admin.approveReview(reviewId);
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, is_approved: true } : r))
      );
      Alert.alert('Success', 'Review approved and is now public!');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve review.');
    }
  };

  const handleDelete = (reviewId: number) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this customer review permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.admin.deleteReview(reviewId);
              setReviews(prev => prev.filter(r => r.id !== reviewId));
              Alert.alert('Deleted', 'Review has been removed.');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete review.');
            }
          }
        }
      ]
    );
  };

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'PENDING') return !r.is_approved;
    if (activeTab === 'APPROVED') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.navTitle}>Marketplace Reviews</Text>
          <Text style={styles.navSubtitle}>
            {reviews.length} total reviews • {pendingCount} pending
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabStrip}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            All ({reviews.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'PENDING' && styles.tabBtnActive]}
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.tabTextActive]}>
            Pending ({pendingCount})
          </Text>
          {pendingCount > 0 && <View style={styles.pendingDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'APPROVED' && styles.tabBtnActive]}
          onPress={() => setActiveTab('APPROVED')}
        >
          <Text style={[styles.tabText, activeTab === 'APPROVED' && styles.tabTextActive]}>
            Approved ({reviews.length - pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              {/* Card Header: Store & Status */}
              <View style={styles.cardHeaderRow}>
                {/* Shop Badge */}
                <View style={styles.shopBadge}>
                  <Store color="#7C3AED" size={13} />
                  <Text style={styles.shopBadgeText} numberOfLines={1}>
                    {item.shop_name || `Shop #${item.shop_id}`}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.is_approved ? '#ECFDF5' : '#FFFBEB' }
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: item.is_approved ? '#059669' : '#D97706' }
                    ]}
                  >
                    {item.is_approved ? 'Approved' : 'Pending Approval'}
                  </Text>
                </View>
              </View>

              {/* Product Info Row */}
              <View style={styles.productRow}>
                {item.product_image ? (
                  <Image source={{ uri: item.product_image }} style={styles.productThumb} />
                ) : (
                  <View style={styles.productThumbPlaceholder}>
                    <Package color="#94A3B8" size={18} />
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.productLabel}>PRODUCT</Text>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.product_name || `Product #${item.product_id}`}
                  </Text>
                </View>
              </View>

              {/* Rating & Reviewer info */}
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= item.rating ? '#F59E0B' : '#E2E8F0'}
                      fill={star <= item.rating ? '#F59E0B' : 'transparent'}
                    />
                  ))}
                </View>
                <Text style={styles.ratingNum}>{item.rating}.0 / 5.0</Text>
              </View>

              {/* Review Comment */}
              <Text style={styles.commentText}>"{item.comment}"</Text>

              {/* Reviewer Details */}
              <View style={styles.reviewerRow}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.avatarLetter}>
                    {item.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>{item.reviewer_name || 'Customer'}</Text>
                  <Text style={styles.reviewerDate}>
                    {item.reviewer_email || 'N/A'} • {formatDateTime(item.created_at)}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.cardActionsRow}>
                {!item.is_approved && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id)}
                  >
                    <CheckCircle2 color="#FFFFFF" size={16} />
                    <Text style={styles.approveBtnText}>Approve Review</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 color="#EF4444" size={16} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Reviews Found</Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'PENDING'
                  ? 'All reviews have been reviewed and approved!'
                  : 'Customer product reviews will appear here.'}
              </Text>
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
    paddingVertical: 8,
    borderRadius: 10,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '65%',
  },
  shopBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D28D9',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  productThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  commentText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7C3AED',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewerDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
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
    maxWidth: 240,
  },
});
