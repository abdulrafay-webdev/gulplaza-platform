import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Search, Trash2, Store, AlertCircle } from 'lucide-react-native';
import { Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopsMap, setShopsMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, shopRes] = await Promise.all([
        api.products.listAll({ limit: 150 }),
        api.admin.listShops().catch(() => ({ data: [] }))
      ]);
      const sMap: Record<number, string> = {};
      (shopRes.data || []).forEach((s: any) => {
        sMap[s.id] = s.name;
      });
      setShopsMap(sMap);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId: number) => {
    Alert.alert(
      'Remove Product',
      'Remove this product from the marketplace?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.products.delete(productId);
              setProducts(prev => prev.filter(p => p.id !== productId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        }
      ]
    );
  };

  const filtered = products.filter(p => {
    const sName = p.shop?.name || p.shop_name || shopsMap[p.shop_id] || '';
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           sName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace Products</Text>
        <Text style={styles.headerSubtitle}>{products.length} live products across all shops</Text>
      </View>

      <View style={styles.searchBox}>
        <Search color="#94A3B8" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by product or shop name..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const thumb = item.image_url || (item.images && item.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
            const shopDisplayName = item.shop?.name || item.shop_name || shopsMap[item.shop_id] || (item.shop_id ? `Shop #${item.shop_id}` : 'Store');
            return (
              <View style={styles.productCard}>
                <Image source={{ uri: thumb }} style={styles.productThumb} />
                <View style={styles.productInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <Store color="#7C3AED" size={12} />
                    <Text style={styles.shopName} numberOfLines={1}>{shopDisplayName}</Text>
                  </View>
                  <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.stockText}>{item.stock_quantity} units remaining</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  stockText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
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
  },
});
