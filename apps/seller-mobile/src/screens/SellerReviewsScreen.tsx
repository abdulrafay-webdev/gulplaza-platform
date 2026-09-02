import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Star,
  CheckCircle,
  Trash2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Package
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { api } from '../services/api';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerReviewsScreen({ navigation }: any) {
  const { shop } = useSellerAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [shop]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.reviews.getMyReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load store reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setActionLoading(reviewId);
      await api.reviews.approveReview(reviewId);
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, is_approved: true } : r))
      );
      Alert.alert('Review Approved! ✅', 'This review is now publicly visible on the product page.');
    } catch (err) {
      console.error('Failed to approve review:', err);
      Alert.alert('Error', 'Could not approve this review.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (reviewId: number) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to reject and remove this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(reviewId);
              await api.reviews.deleteReview(reviewId);
              setReviews(prev => prev.filter(r => r.id !== reviewId));
              Alert.alert('Deleted', 'Review has been removed from your store.');
            } catch (err) {
              console.error('Failed to delete review:', err);
              Alert.alert('Error', 'Could not delete review.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Customer Reviews</Text>
          <Text style={styles.headerSubtitle}>Moderate and approve customer feedback</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} Pending</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, filter === 'all' && styles.activeTabItem]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>
            All ({reviews.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, filter === 'pending' && styles.activeTabItem]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.tabText, filter === 'pending' && styles.activeTabText]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, filter === 'approved' && styles.activeTabItem]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.tabText, filter === 'approved' && styles.activeTabText]}>
            Approved ({reviews.length - pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#A163F7']} />
          }
          renderItem={({ item }) => {
            const isProcessing = actionLoading === item.id;
            return (
              <View style={styles.reviewCard}>
                {/* Product Reference */}
                <View style={styles.productRow}>
                  {item.product_image ? (
                    <Image source={{ uri: item.product_image }} style={styles.productThumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.productThumb, styles.noThumb]}>
                      <Package color="#94A3B8" size={18} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.product_name || 'Marketplace Item'}
                    </Text>
                    <View style={styles.statusRow}>
                      {item.is_approved ? (
                        <View style={styles.approvedPill}>
                          <CheckCircle color="#059669" size={11} />
                          <Text style={styles.approvedPillText}>Approved & Live</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingPill}>
                          <Clock color="#D97706" size={11} />
                          <Text style={styles.pendingPillText}>Pending Approval</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Rating & Reviewer info */}
                <View style={styles.reviewerRow}>
                  <View>
                    <Text style={styles.reviewerName}>{item.reviewer_name}</Text>
                    <Text style={styles.reviewDate}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </Text>
                  </View>

                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star
                        key={st}
                        size={14}
                        color="#F59E0B"
                        fill={st <= item.rating ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>

                {/* Customer Comment */}
                <Text style={styles.commentText}>{item.comment}</Text>

                {/* Governance Actions */}
                <View style={styles.actionButtonsRow}>
                  {!item.is_approved && (
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(item.id)}
                      disabled={isProcessing}
                    >
                      <LinearGradient colors={['#10B981', '#059669']} style={styles.approveGrad}>
                        {isProcessing ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <>
                            <CheckCircle color="#FFF" size={14} />
                            <Text style={styles.approveBtnText}>Approve Review</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                    disabled={isProcessing}
                  >
                    <Trash2 color="#EF4444" size={14} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MessageSquare color="#CBD5E1" size={48} />
              <Text style={styles.emptyTitle}>No Reviews in This Category</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'pending'
                  ? 'All customer reviews have been moderated.'
                  : 'Customer reviews will appear here as soon as shoppers leave feedback on your products.'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  activeTabItem: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  noThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    marginTop: 3,
  },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  approvedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pendingPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  reviewerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  approveBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  approveGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});
