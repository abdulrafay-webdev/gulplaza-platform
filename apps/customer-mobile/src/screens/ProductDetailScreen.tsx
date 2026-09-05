import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ShoppingBag,
  Store,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Zap,
  Star,
  MessageSquare,
  Send,
  X,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { addToCart, cartCount } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }>({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState(user?.full_name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.products.get(productId);
      setProduct(res.data);
      if (res.data.variants && res.data.variants.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      } else {
        setSelectedVariant(null);
      }

      // Load Reviews
      try {
        const revRes = await api.reviews.getProductReviews(productId);
        setReviewsList(revRes.data.reviews || []);
        if (revRes.data.summary) {
          setReviewSummary(revRes.data.summary);
        }
      } catch (revErr) {
        console.warn('Could not load reviews:', revErr);
      }

      // Load Related Products (same category or nearby)
      try {
        const allRes = await api.products.listAll({ limit: 12 });
        const related = (allRes.data || []).filter(
          (p: Product) => p.id !== Number(productId) && (
            (res.data.main_category_id && p.main_category_id === res.data.main_category_id) ||
            p.shop_id === res.data.shop_id
          )
        );
        setRelatedProducts(related.length > 0 ? related : (allRes.data || []).filter((p: Product) => p.id !== Number(productId)).slice(0, 6));
      } catch (relErr) {
        console.warn('Could not load related products:', relErr);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      Alert.alert('Error', 'Product could not be loaded.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = selectedVariant ? selectedVariant.price : (product?.price || 0);
  const currentStock = selectedVariant ? (selectedVariant.stock_quantity ?? product?.stock_quantity ?? 0) : (product?.stock_quantity ?? 0);
  const currentName = selectedVariant ? `${product?.name} (${selectedVariant.name})` : product?.name;

  const handleAdd = () => {
    if (product && currentStock > 0) {
      addToCart(product, quantity, selectedVariant || undefined);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!product || currentStock <= 0) return;
    addToCart(product, quantity, selectedVariant || undefined);
    navigation.navigate('Checkout');
  };

  const handleSubmitReview = async () => {
    if (!reviewerName.trim() || !reviewComment.trim()) {
      Alert.alert('Missing Details', 'Please enter your name and comments.');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.reviews.submitProductReview(productId, {
        reviewer_name: reviewerName.trim(),
        reviewer_email: user?.email || undefined,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      Alert.alert('Review Submitted! ⭐', 'Thank you for your feedback! It will appear once approved by the shop owner.');
      setReviewModalVisible(false);
      setReviewComment('');
      // Reload reviews
      const revRes = await api.reviews.getProductReviews(productId);
      setReviewsList(revRes.data.reviews || []);
      if (revRes.data.summary) {
        setReviewSummary(revRes.data.summary);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      Alert.alert('Submission Failed', 'Could not submit your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} />
      </SafeAreaView>
    );
  }

  const imagesList = product.images && product.images.length > 0 
    ? product.images.map(img => img.url) 
    : [product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
        >
          <View style={{ position: 'relative' }}>
            <ShoppingBag color="#0F172A" size={22} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image View */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imagesList[activeImageIndex] }} style={styles.mainImage} resizeMode="cover" />
          
          {/* Multi-image indicators */}
          {imagesList.length > 1 && (
            <View style={styles.indicatorsRow}>
              {imagesList.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.indicatorDot, i === activeImageIndex ? styles.activeDot : null]}
                  onPress={() => setActiveImageIndex(i)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Details Body */}
        <View style={styles.bodyContainer}>
          {/* Shop Tag */}
          <TouchableOpacity 
            style={styles.shopBadge}
            onPress={() => navigation.navigate('ShopDetail', { shopId: product.shop_id, shopName: product.shop?.name || product.shop_name })}
          >
            <Store color="#A163F7" size={14} />
            <Text style={styles.shopBadgeText}>{product.shop?.name || product.shop_name || 'AI Plaza Store'}</Text>
            <ShieldCheck color="#10B981" size={13} />
          </TouchableOpacity>

          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(currentPrice)}</Text>
            {selectedVariant && (
              <View style={styles.activeVariantBadge}>
                <Text style={styles.activeVariantBadgeText}>Option: {selectedVariant.name}</Text>
              </View>
            )}
          </View>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantContainer}>
              <View style={styles.variantHeaderRow}>
                <Text style={styles.variantHeaderTitle}>Choose Option / Variant:</Text>
                {selectedVariant && (
                  <Text style={styles.variantPriceLabel}>Rs. {selectedVariant.price.toLocaleString()}</Text>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantPillsRow}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.variantPill, isSelected && styles.variantPillActive]}
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text style={[styles.variantPillName, isSelected && styles.variantPillTextActive]}>
                        {v.name}
                      </Text>
                      <Text style={[styles.variantPillPrice, isSelected && styles.variantPillPriceActive]}>
                        Rs. {v.price.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Delivery & Stock Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Truck color="#64748B" size={16} />
              <Text style={styles.infoText}>Standard Delivery: 3 to 5 Days (All Pakistan)</Text>
            </View>
            <View style={styles.infoRow}>
              <CheckCircle color={currentStock > 0 ? '#10B981' : '#EF4444'} size={16} />
              <Text style={styles.infoText}>
                {currentStock > 0 ? `In Stock (${currentStock} units available)` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Ask AI Advisor Button */}
          <TouchableOpacity
            style={styles.askAiCard}
            onPress={() => navigation.navigate('AIChat', { initialMessage: `Mujhe "${product.name}" ke baare mein mazeed details batao aur iske matching items suggest karo` })}
          >
            <LinearGradient colors={['#F3E8FF', '#EDE9FE']} style={styles.askAiGrad}>
              <View style={styles.aiSparkle}>
                <Sparkles color="#A163F7" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.askAiTitle}>Ask AI Shopping Advisor</Text>
                <Text style={styles.askAiDesc}>Get matching clothing, accessories, or styling advice for this item.</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Product Description */}
          <Text style={styles.sectionHeading}>Product Description</Text>
          <Text style={styles.description}>
            {product.long_description || product.short_description || 'High-quality authentic product available directly from verified Gul Plaza vendors.'}
          </Text>

          {/* Customer Reviews & Ratings Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Customer Reviews</Text>
                <View style={styles.starsSummaryRow}>
                  <View style={styles.starsInline}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={15}
                        color="#F59E0B"
                        fill={s <= Math.round(reviewSummary.average_rating || 5) ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={styles.starsScoreText}>
                    {reviewSummary.average_rating > 0 ? reviewSummary.average_rating.toFixed(1) : '5.0'}
                  </Text>
                  <Text style={styles.reviewCountText}>({reviewSummary.total_reviews} reviews)</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setReviewModalVisible(true)}
              >
                <Star color="#A163F7" size={14} />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Review Cards List */}
            {reviewsList.length === 0 ? (
              <View style={styles.emptyReviewsCard}>
                <MessageSquare color="#CBD5E1" size={28} />
                <Text style={styles.emptyReviewsTitle}>No reviews yet for this product</Text>
                <Text style={styles.emptyReviewsSub}>Be the first to share your experience with this item!</Text>
                <TouchableOpacity
                  style={styles.firstReviewBtn}
                  onPress={() => setReviewModalVisible(true)}
                >
                  <Text style={styles.firstReviewBtnText}>Leave a Review</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviewsList.map((rev: any) => (
                  <View key={rev.id} style={styles.reviewItemCard}>
                    <View style={styles.reviewItemHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerAvatarText}>
                            {rev.reviewer_name ? rev.reviewer_name.charAt(0).toUpperCase() : 'U'}
                          </Text>
                        </View>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.reviewerName}>{rev.reviewer_name}</Text>
                            {rev.is_verified_purchase && (
                              <View style={styles.verifiedBadge}>
                                <ShieldCheck color="#059669" size={10} />
                                <Text style={styles.verifiedBadgeText}>Verified</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.reviewDate}>
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent review'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemStarsRow}>
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            size={12}
                            color="#F59E0B"
                            fill={st <= rev.rating ? '#F59E0B' : 'transparent'}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.sectionHeading}>Related Products</Text>
                <Text style={styles.relatedSubtitle}>Shoppers also viewed</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProducts.map((rel) => {
                  const relThumb = rel.image_url || (rel.images && rel.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';
                  return (
                    <TouchableOpacity
                      key={rel.id}
                      style={styles.relatedCard}
                      onPress={() => navigation.push('ProductDetail', { productId: rel.id })}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: relThumb }} style={styles.relatedThumb} resizeMode="cover" />
                      <View style={styles.relatedBody}>
                        <Text style={styles.relatedShop} numberOfLines={1}>
                          {rel.shop?.name || rel.shop_name || 'Gul Plaza Store'}
                        </Text>
                        <Text style={styles.relatedTitle} numberOfLines={2}>{rel.name}</Text>
                        <Text style={styles.relatedPrice}>{formatCurrency(rel.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Write a Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setReviewModalVisible(false)}
          />
          <View style={styles.reviewModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate & Review Product</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setReviewModalVisible(false)}
              >
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product mini info */}
              <View style={styles.miniProductRow}>
                <Image
                  source={{ uri: imagesList[0] }}
                  style={styles.miniProductThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniProductTitle} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.miniProductPrice}>{formatCurrency(product.price)}</Text>
                </View>
              </View>

              {/* Star rating selector */}
              <Text style={styles.inputLabel}>Your Overall Rating</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={styles.starPickerBtn}
                    onPress={() => setReviewRating(st)}
                  >
                    <Star
                      size={32}
                      color="#F59E0B"
                      fill={st <= reviewRating ? '#F59E0B' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.starPickerLabel}>
                {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
                 reviewRating === 4 ? '⭐⭐⭐⭐ Very Good' :
                 reviewRating === 3 ? '⭐⭐⭐ Average' :
                 reviewRating === 2 ? '⭐⭐ Below Average' : '⭐ Poor'}
              </Text>

              {/* Reviewer Name */}
              <Text style={styles.inputLabel}>Your Name *</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="e.g. Tariq Ahmed"
                placeholderTextColor="#94A3B8"
                value={reviewerName}
                onChangeText={setReviewerName}
              />

              {/* Review Comment */}
              <Text style={styles.inputLabel}>Your Review Comments *</Text>
              <TextInput
                style={[styles.reviewInput, styles.reviewTextArea]}
                placeholder="Share your thoughts on build quality, packaging, delivery speed..."
                placeholderTextColor="#94A3B8"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <LinearGradient
                  colors={Theme.gradients.primary as any}
                  style={styles.submitReviewGrad}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Send color="#FFF" size={16} />
                      <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
          >
            <Minus color="#0F172A" size={15} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(q => q + 1)}
          >
            <Plus color="#0F172A" size={15} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={styles.addToCartBtn} 
          onPress={handleAdd}
          disabled={currentStock <= 0}
          activeOpacity={0.85}
        >
          <View style={[styles.addToCartInner, addedToast && styles.addToCartAdded]}>
            <ShoppingBag color={addedToast ? "#059669" : "#7C3AED"} size={16} />
            <Text style={[styles.addToCartText, addedToast && styles.addToCartTextAdded]}>
              {addedToast ? 'Added ✓' : 'Add to Cart'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Buy Now Button */}
        <TouchableOpacity 
          style={styles.buyNowBtn} 
          onPress={handleBuyNow}
          disabled={currentStock <= 0}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.buyNowGrad}>
            <Zap color="#FFF" size={16} />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navBtn: {
    padding: 6,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF7582',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  indicatorsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },
  bodyContainer: {
    padding: 20,
  },
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  shopBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: '#A163F7',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  activeVariantBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  activeVariantBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7E22CE',
  },
  variantContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  variantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  variantHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  variantPriceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  variantPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  variantPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  variantPillActive: {
    borderColor: '#A163F7',
    backgroundColor: '#FAF5FF',
  },
  variantPillName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  variantPillTextActive: {
    color: '#7C3AED',
  },
  variantPillPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  variantPillPriceActive: {
    color: '#A163F7',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  askAiCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  askAiGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 16,
  },
  aiSparkle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  askAiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
  },
  askAiDesc: {
    fontSize: 11,
    color: '#6B21A8',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
    ...Theme.shadows.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  qtyBtn: {
    padding: 5,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 6,
  },
  addToCartBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addToCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 14,
  },
  addToCartAdded: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  addToCartText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '900',
  },
  addToCartTextAdded: {
    color: '#059669',
  },
  buyNowBtn: {
    flex: 1.1,
    borderRadius: 14,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  buyNowGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 6,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  reviewsSection: {
    marginTop: 10,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  starsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  starsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsScoreText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  reviewCountText: {
    fontSize: 11,
    color: '#64748B',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  writeReviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  emptyReviewsCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyReviewsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginTop: 8,
  },
  emptyReviewsSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  firstReviewBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  firstReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsList: {
    gap: 12,
  },
  reviewItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7C3AED',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  reviewDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  itemStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  relatedSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  relatedHeader: {
    marginBottom: 12,
  },
  relatedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  relatedScroll: {
    gap: 12,
    paddingRight: 16,
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  relatedThumb: {
    width: 140,
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  relatedBody: {
    padding: 8,
  },
  relatedShop: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  relatedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    height: 28,
    marginVertical: 2,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  reviewModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  miniProductThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  miniProductTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  miniProductPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7C3AED',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4,
  },
  starPickerBtn: {
    padding: 4,
  },
  starPickerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 10,
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  reviewTextArea: {
    height: 90,
    paddingTop: 10,
  },
  submitReviewBtn: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  submitReviewGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
