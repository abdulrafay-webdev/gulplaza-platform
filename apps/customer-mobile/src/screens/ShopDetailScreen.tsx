import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import {
  ChevronLeft,
  Store,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shop, Product } from '../../../../mobile-shared/src/types';
import { Theme } from '../../../../mobile-shared/src/theme';
import { formatCurrency } from '../../../../mobile-shared/src/utils/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ShopDetailScreen({ route, navigation }: any) {
  const { shopId, shopName } = route.params;
  const { addToCart } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopData();
  }, [shopId]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes] = await Promise.all([
        api.shops.get(shopId),
        api.products.listByShop(shopId)
      ]);
      setShop(sRes.data);
      setProducts(pRes.data || []);
    } catch (err) {
      console.error('Failed to load shop details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !shop) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} />
      </SafeAreaView>
    );
  }

  const cover = shop.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80';
  const logo = shop.logo_url || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{shop.name}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingBag color="#0F172A" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover & Logo Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: cover }} style={styles.coverImage} />
          <View style={styles.logoBadgeContainer}>
            <Image source={{ uri: logo }} style={styles.logoImage} />
          </View>
        </View>

        {/* Shop Info Card */}
        <View style={styles.shopInfoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.shopTitle}>{shop.name}</Text>
            <View style={styles.verifiedPill}>
              <ShieldCheck color="#10B981" size={14} />
              <Text style={styles.verifiedText}>Verified Gul Plaza Shop</Text>
            </View>
          </View>

          <Text style={styles.shopDescription}>
            {shop.description || 'Welcome to our verified marketplace storefront at Gul Plaza Karachi. Authentic quality & fast shipping guaranteed.'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin color="#64748B" size={14} />
              <Text style={styles.metaText}>Gul Plaza, M.A Jinnah Road, Karachi</Text>
            </View>
          </View>
        </View>

        {/* Shop Catalog Header */}
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogTitle}>Shop Products ({products.length})</Text>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {products.map((p) => {
            const thumb = p.image_url || (p.images && p.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
              >
                <Image source={{ uri: thumb }} style={styles.productThumb} />
                <View style={styles.productBody}>
                  <Text style={styles.productTitle} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(p.price)}</Text>
                  <TouchableOpacity
                    style={styles.addCartBtn}
                    onPress={() => addToCart(p, 1)}
                  >
                    <ShoppingBag color="#FFF" size={13} />
                    <Text style={styles.addCartBtnText}>Add Cart</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {products.length === 0 && (
          <Text style={styles.emptyText}>This shop has not listed products yet.</Text>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    height: 140,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    marginBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  logoBadgeContainer: {
    position: 'absolute',
    bottom: -32,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 4,
    ...Theme.shadows.md,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  shopInfoCard: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleRow: {
    marginBottom: 6,
  },
  shopTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  shopDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  catalogHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  productThumb: {
    width: '100%',
    height: 130,
    backgroundColor: '#F1F5F9',
  },
  productBody: {
    padding: 10,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    height: 32,
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#A163F7',
    paddingVertical: 7,
    borderRadius: 10,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 30,
    fontSize: 13,
  },
});
