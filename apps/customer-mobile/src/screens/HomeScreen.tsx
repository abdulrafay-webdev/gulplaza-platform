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
  SafeAreaView,
  Dimensions
} from 'react-native';
import { 
  Search, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  ChevronRight, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product, Shop, Category } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [prodRes, shopRes, catRes] = await Promise.all([
        api.products.listAll({ limit: 12 }),
        api.shops.list(),
        api.categories.list()
      ]);
      setProducts(prodRes.data || []);
      setShops((shopRes.data || []).filter(s => s.is_approved));
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { title: 'Outfit Matching', prompt: 'Mere paas red shirt hai, us ke saath matching pant dikhao' },
    { title: 'Gift Ideas', prompt: 'Kisi ko gift dena hai 5000 ke andar best options dikhao' },
    { title: 'Tea Kettle', prompt: 'Fast electric kettle dikhao kitchen ke liye' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={Theme.gradients.primary as any}
            style={styles.logoBadge}
          >
            <Bot color="#FFF" size={20} />
          </LinearGradient>
          <View>
            <Text style={styles.logoTitle}>AI PLAZA</Text>
            <Text style={styles.logoSubtitle}>Smart Marketplace</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.aiHeaderBtn}
          onPress={() => navigation.navigate('AIChat')}
        >
          <LinearGradient
            colors={Theme.gradients.aiGlow as any}
            style={styles.aiHeaderGrad}
          >
            <Sparkles color="#FFF" size={14} />
            <Text style={styles.aiHeaderBtnText}>AI Advisor</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
        >
          <Search color={Theme.colors.textMuted} size={18} />
          <Text style={styles.searchPlaceholder}>Search clothes, gadgets, shoes, appliances...</Text>
        </TouchableOpacity>

        {/* Hero AI Banner */}
        <LinearGradient
          colors={['#1E1B4B', '#0F172A']}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={styles.aiTag}>
              <Sparkles color="#A163F7" size={12} />
              <Text style={styles.aiTagText}>AI Shopping Assistant</Text>
            </View>
            <Text style={styles.heroTitle}>Shop Smarter with AI</Text>
            <Text style={styles.heroDesc}>Upload photos or describe what you want in Roman Urdu!</Text>
            <TouchableOpacity 
              style={styles.heroBtn}
              onPress={() => navigation.navigate('AIChat')}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.heroBtnGrad}>
                <Text style={styles.heroBtnText}>Start AI Chat</Text>
                <ArrowRight color="#FFF" size={14} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' }} 
            style={styles.heroImage} 
          />
        </LinearGradient>

        {/* Quick AI Prompts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Try Asking AI</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsRow}>
          {samplePrompts.map((p, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.promptCard}
              onPress={() => navigation.navigate('AIChat', { initialMessage: p.prompt })}
            >
              <View style={styles.promptTag}>
                <Sparkles color="#A163F7" size={12} />
                <Text style={styles.promptTagText}>{p.title}</Text>
              </View>
              <Text style={styles.promptText} numberOfLines={2}>"{p.prompt}"</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity 
              key={c.id} 
              style={styles.catCard}
              onPress={() => navigation.navigate('Search', { categoryId: c.id, categoryName: c.name })}
            >
              <View style={styles.catIconBox}>
                <ShoppingBag color={Theme.colors.primaryPurple} size={22} />
              </View>
              <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Verified Shops Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Plaza Shops</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shops')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsRow}>
          {shops.map((s) => (
            <TouchableOpacity 
              key={s.id} 
              style={styles.shopCard}
              onPress={() => navigation.navigate('ShopDetail', { shopId: s.id, shopName: s.name })}
            >
              <Image 
                source={{ uri: s.logo_url || s.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' }} 
                style={styles.shopLogo} 
              />
              <View style={styles.shopInfo}>
                <Text style={styles.shopName} numberOfLines={1}>{s.name}</Text>
                <View style={styles.verifiedRow}>
                  <ShieldCheck color={Theme.colors.success} size={12} />
                  <Text style={styles.verifiedText}>Verified Store</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Marketplace Products Grid */}
        <View style={styles.sectionHeader}>
          <View style={styles.trendTag}>
            <Flame color="#EF4444" size={16} />
            <Text style={styles.sectionTitle}>Trending Products</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 24 }} />
        ) : (
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
                    <Text style={styles.productShop} numberOfLines={1}>{p.shop?.name || p.shop_name || 'AI Plaza'}</Text>
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
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  aiHeaderBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiHeaderGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiHeaderBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  searchPlaceholder: {
    color: '#94A3B8',
    fontSize: 13,
    flex: 1,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    marginRight: 10,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(161, 99, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiTagText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 12,
  },
  heroBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  heroBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  trendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A163F7',
  },
  promptsRow: {
    marginBottom: 20,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    width: 220,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  promptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  promptTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A163F7',
  },
  promptText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  catRow: {
    marginBottom: 20,
  },
  catCard: {
    alignItems: 'center',
    marginRight: 14,
    width: 70,
  },
  catIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  shopsRow: {
    marginBottom: 20,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 170,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...Theme.shadows.sm,
  },
  shopLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#10B981',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  productBody: {
    padding: 10,
  },
  productShop: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    height: 32,
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 14,
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
});
