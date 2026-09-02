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
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  ChevronRight, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Grid,
  Tag,
  CheckCircle2,
  Menu,
  X,
  Award,
  HelpCircle,
  Lock,
  Package,
  User
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartSuccessId, setCartSuccessId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [prodRes, shopRes, catRes] = await Promise.all([
        api.products.listAll({ limit: 60 }),
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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setCartSuccessId(product.id);
    setTimeout(() => setCartSuccessId(null), 1800);
  };

  const samplePrompts = [
    { title: 'Outfit Matching', prompt: 'Mere paas red shirt hai, us ke saath matching pant dikhao' },
    { title: 'Gift Ideas', prompt: 'Kisi ko gift dena hai 5000 ke andar best options dikhao' },
    { title: 'Tea Kettle', prompt: 'Fast electric kettle dikhao kitchen ke liye' },
  ];

  // Trending (Top 6) vs All Products
  const trendingProducts = products.slice(0, 6);
  const filteredAllProducts = selectedCategory 
    ? products.filter(p => p.main_category_id === selectedCategory) 
    : products;

  const navigateMenu = (screenName: string, params?: any) => {
    setMenuVisible(false);
    navigation.navigate(screenName, params);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Top Header with Hamburger Icon */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Menu color="#0F172A" size={22} />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logoImg} 
                resizeMode="contain" 
              />
            </View>
            <View>
              <Text style={styles.logoTitle}>AI PLAZA</Text>
              <Text style={styles.logoSubtitle}>Smart Marketplace</Text>
            </View>
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
            <Image 
              source={require('../../assets/robot.png')} 
              style={{ width: 20, height: 20 }} 
              resizeMode="contain" 
            />
            <Text style={styles.aiHeaderBtnText}>AI Advisor</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Hamburger Drawer Modal */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setMenuVisible(false)} 
          />
          <View style={styles.drawerContainer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoRow}>
                <Image source={require('../../assets/logo.png')} style={styles.drawerLogoImg} resizeMode="contain" />
                <View>
                  <Text style={styles.drawerLogoTitle}>AI PLAZA</Text>
                  <Text style={styles.drawerLogoSub}>Gul Plaza Digital Hub</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setMenuVisible(false)}>
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            {/* Founder Honor Badge */}
            <TouchableOpacity 
              style={styles.founderBanner}
              onPress={() => navigateMenu('OurStory')}
            >
              <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.founderBannerGrad}>
                <View style={styles.founderTag}>
                  <Award color="#FDE047" size={12} />
                  <Text style={styles.founderTagText}>Conceived by Abdul Rafay</Text>
                </View>
                <Text style={styles.founderBannerTitle}>The Story of a 20yo Visionary</Text>
                <Text style={styles.founderBannerSub}>Read how this entire platform was built alone →</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Menu List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerMenuContent}>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('HomeTab')}>
                <Store color="#7C3AED" size={18} />
                <Text style={styles.drawerItemText}>Home Marketplace</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('ShopsTab')}>
                <Store color="#2563EB" size={18} />
                <Text style={styles.drawerItemText}>Verified Gul Plaza Shops</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('AIChat')}>
                <Bot color="#A163F7" size={18} />
                <Text style={styles.drawerItemText}>AI Shopping Advisor</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('CartTab')}>
                <ShoppingBag color="#059669" size={18} />
                <Text style={styles.drawerItemText}>Shopping Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('Orders')}>
                <Package color="#D97706" size={18} />
                <Text style={styles.drawerItemText}>Track Orders</Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <Text style={styles.drawerSectionLabel}>ABOUT & GUIDANCE</Text>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('OurStory')}>
                <Award color="#EC4899" size={18} />
                <Text style={styles.drawerItemText}>Our Story (Abdul Rafay)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('HowToUse')}>
                <HelpCircle color="#0284C7" size={18} />
                <Text style={styles.drawerItemText}>How to Use AI Plaza</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('PrivacyPolicy')}>
                <Lock color="#64748B" size={18} />
                <Text style={styles.drawerItemText}>Privacy Policy</Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateMenu('AccountTab')}>
                <User color="#475569" size={18} />
                <Text style={styles.drawerItemText}>Account & Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#A163F7']} />
        }
      >
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
        >
          <Search color={Theme.colors.textMuted} size={18} />
          <Text style={styles.searchPlaceholder}>Search clothes, gadgets, shoes, appliances...</Text>
        </TouchableOpacity>

        {/* Hero AI Banner - Brand Vision */}
        <LinearGradient
          colors={['#161226', '#1E1B4B', '#0F172A']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.aiTag}>
              <Sparkles color="#45E3FF" size={12} />
              <Text style={styles.aiTagText}>Instead of searching, ask AI</Text>
            </View>
            <Text style={styles.heroTitle}>Shop Smarter with AI</Text>
            <Text style={styles.heroDesc}>
              Tell AI what you need in Roman Urdu, upload a photo for visual match, or get outfit advice.
            </Text>
            <TouchableOpacity 
              style={styles.heroBtn}
              onPress={() => navigation.navigate('AIChat')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.heroBtnGrad}>
                <Text style={styles.heroBtnText}>Talk to AI Assistant</Text>
                <ArrowRight color="#FFF" size={14} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageWrapper}>
            <Image 
              source={require('../../assets/robot.png')} 
              style={styles.heroImage} 
              resizeMode="contain"
            />
          </View>
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

        {/* 1. Trending Marketplace Products */}
        <View style={styles.sectionHeader}>
          <View style={styles.trendTag}>
            <Flame color="#EF4444" size={16} />
            <Text style={styles.sectionTitle}>Trending Products</Text>
          </View>
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>HOT</Text>
          </View>
        </View>

        {/* Horizontal Trending Cards Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingRow}>
          {trendingProducts.map((p) => {
            const thumb = p.image_url || (p.images && p.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
            const isAdded = cartSuccessId === p.id;
            return (
              <TouchableOpacity 
                key={p.id} 
                style={styles.trendingCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
              >
                <Image source={{ uri: thumb }} style={styles.trendingThumb} />
                <View style={styles.trendingTag}>
                  <Flame color="#FFF" size={10} />
                  <Text style={styles.trendingTagText}>Trending</Text>
                </View>
                <View style={styles.trendingBody}>
                  <Text style={styles.productShop} numberOfLines={1}>{p.shop?.name || p.shop_name || 'AI Plaza'}</Text>
                  <Text style={styles.productTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(p.price)}</Text>
                  <TouchableOpacity 
                    style={[styles.addCartBtn, isAdded && { backgroundColor: '#10B981' }]}
                    onPress={() => handleAddToCart(p)}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 color="#FFF" size={13} />
                        <Text style={styles.addCartBtnText}>Added!</Text>
                      </>
                    ) : (
                      <>
                        <ShoppingBag color="#FFF" size={13} />
                        <Text style={styles.addCartBtnText}>Add Cart</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. All Products / Full Marketplace Catalog Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.trendTag}>
            <Grid color="#A163F7" size={16} />
            <Text style={styles.sectionTitle}>All Products</Text>
          </View>
          <Text style={styles.itemCountText}>{filteredAllProducts.length} items</Text>
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.pillBtn, selectedCategory === null && styles.pillBtnActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.pillText, selectedCategory === null && styles.pillTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => setSelectedCategory(isActive ? null : c.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* All Products Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 24 }} />
        ) : filteredAllProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <ShoppingBag color="#94A3B8" size={36} />
            <Text style={styles.emptyText}>No products found in this category</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredAllProducts.map((p) => {
              const thumb = p.image_url || (p.images && p.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
              const isAdded = cartSuccessId === p.id;
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
                      style={[styles.addCartBtn, isAdded && { backgroundColor: '#10B981' }]}
                      onPress={() => handleAddToCart(p)}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 color="#FFF" size={13} />
                          <Text style={styles.addCartBtnText}>Added!</Text>
                        </>
                      ) : (
                        <>
                          <ShoppingBag color="#FFF" size={13} />
                          <Text style={styles.addCartBtnText}>Add Cart</Text>
                        </>
                      )}
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
    overflow: 'hidden',
  },
  logoImg: {
    width: 36,
    height: 36,
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
  heroImageWrapper: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: 'rgba(161, 99, 247, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(69, 227, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
  hotBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
  },
  itemCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
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
  trendingRow: {
    marginBottom: 10,
  },
  trendingCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
    position: 'relative',
    ...Theme.shadows.sm,
  },
  trendingThumb: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  trendingTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendingTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  trendingBody: {
    padding: 10,
  },
  filterPillsRow: {
    marginBottom: 16,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  pillBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
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
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 24,
    ...Theme.shadows.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  drawerLogoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  drawerLogoSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  founderBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  founderBannerGrad: {
    padding: 14,
  },
  founderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  founderTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  founderBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  founderBannerSub: {
    fontSize: 10,
    color: '#DDD6FE',
    marginTop: 2,
    fontWeight: '600',
  },
  drawerMenuContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  drawerItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  drawerSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    marginBottom: 4,
    marginTop: 2,
  },
});
