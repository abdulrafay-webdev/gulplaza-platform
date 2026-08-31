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
  SafeAreaView,
  Alert
} from 'react-native';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerProductsScreen({ navigation }: any) {
  const { shop } = useSellerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (shop) {
      loadProducts();
    }
  }, [shop]);

  const loadProducts = async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const res = await api.products.listByShop(shop.id);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to remove this product from your store?',
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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products Inventory</Text>
          <Text style={styles.headerSubtitle}>{products.length} products listed</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.addGrad}>
            <Plus color="#FFF" size={16} />
            <Text style={styles.addBtnText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search color="#94A3B8" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products in your store..."
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
            const isLowStock = item.stock_quantity <= 3;
            return (
              <View style={styles.productCard}>
                <Image source={{ uri: thumb }} style={styles.productThumb} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>

                  <View style={styles.stockRow}>
                    <View style={[styles.stockBadge, isLowStock ? styles.lowStockBadge : styles.inStockBadge]}>
                      <Text style={[styles.stockText, isLowStock ? styles.lowStockText : styles.inStockText]}>
                        {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsColumn}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditProduct', { product: item })}
                  >
                    <Edit2 color="#A163F7" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#CBD5E1" size={54} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyDesc}>Tap the 'Add Product' button to list your first marketplace item.</Text>
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
    justifyContent: 'space-between',
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
  addBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 3,
  },
  stockRow: {
    flexDirection: 'row',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inStockBadge: {
    backgroundColor: '#ECFDF5',
  },
  inStockText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  lowStockBadge: {
    backgroundColor: '#FFFBEB',
  },
  lowStockText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  actionsColumn: {
    gap: 8,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
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
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
