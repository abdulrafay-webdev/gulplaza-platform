import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Search, X, ShoppingBag, ArrowLeft, Filter } from 'lucide-react-native';
import { Product, Category } from '../../../../mobile-shared/src/types';
import { Theme } from '../../../../mobile-shared/src/theme';
import { formatCurrency } from '../../../../mobile-shared/src/utils/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function SearchScreen({ route, navigation }: any) {
  const { addToCart } = useCart();
  const selectedCatId = route?.params?.categoryId;
  const selectedCatName = route?.params?.categoryName;

  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(selectedCatId || null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    performSearch();
  }, [activeCategory]);

  const loadCategories = async () => {
    try {
      const res = await api.categories.list();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const performSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    try {
      setLoading(true);
      const res = await api.products.listAll({ search: q || undefined });
      let prods = res.data || [];
      if (activeCategory) {
        prods = prods.filter(p => p.main_category_id === activeCategory);
      }
      setProducts(prods);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#0F172A" size={22} />
        </TouchableOpacity>

        <View style={styles.inputBox}>
          <Search color="#94A3B8" size={18} />
          <TextInput
            style={styles.input}
            placeholder="Search all products..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              performSearch(text);
            }}
            returnKeyType="search"
            onSubmitEditing={() => performSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); performSearch(''); }}>
              <X color="#94A3B8" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills Filter */}
      <View style={styles.catFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All Categories' }, ...categories] as any}
          keyExtractor={(item) => (item.id === null ? 'all' : item.id.toString())}
          renderItem={({ item }) => {
            const isSelected = activeCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.catPill, isSelected ? styles.activeCatPill : null]}
                onPress={() => setActiveCategory(item.id)}
              >
                <Text style={[styles.catPillText, isSelected ? styles.activeCatPillText : null]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsCountBar}>
        <Text style={styles.resultsCountText}>{products.length} Products Found</Text>
      </View>

      {/* Products Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridColumnWrapper}
          renderItem={({ item }) => {
            const thumb = item.image_url || (item.images && item.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
            return (
              <TouchableOpacity
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
                <Image source={{ uri: thumb }} style={styles.productThumb} />
                <View style={styles.productBody}>
                  <Text style={styles.productShop} numberOfLines={1}>{item.shop?.name || item.shop_name || 'AI Plaza'}</Text>
                  <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                  <TouchableOpacity
                    style={styles.addCartBtn}
                    onPress={() => addToCart(item, 1)}
                  >
                    <ShoppingBag color="#FFF" size={13} />
                    <Text style={styles.addCartBtnText}>Add Cart</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search color="#CBD5E1" size={48} />
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptyDesc}>Try searching with different keywords or check out our AI Assistant for recommendations!</Text>
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
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  catFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeCatPill: {
    backgroundColor: '#A163F7',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeCatPillText: {
    color: '#FFFFFF',
  },
  resultsCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
