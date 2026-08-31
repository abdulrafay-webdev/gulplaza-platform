import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
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
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.products.get(productId);
      setProduct(res.data);
    } catch (err) {
      console.error('Failed to load product:', err);
      Alert.alert('Error', 'Product could not be loaded.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!product || product.stock_quantity <= 0) return;
    addToCart(product, quantity);
    navigation.navigate('Checkout');
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
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          {/* Delivery & Stock Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Truck color="#64748B" size={16} />
              <Text style={styles.infoText}>Standard Delivery: 3 to 5 Days (All Pakistan)</Text>
            </View>
            <View style={styles.infoRow}>
              <CheckCircle color={product.stock_quantity > 0 ? '#10B981' : '#EF4444'} size={16} />
              <Text style={styles.infoText}>
                {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} units available)` : 'Out of Stock'}
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
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
          disabled={product.stock_quantity <= 0}
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
          disabled={product.stock_quantity <= 0}
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
    marginBottom: 16,
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
});
