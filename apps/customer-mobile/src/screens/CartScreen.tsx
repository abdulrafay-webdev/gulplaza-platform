import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }: any) {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, itemsByShop } = useCart();

  const deliveryFee = cartCount > 0 ? 250 : 0;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>{cartCount} items selected</Text>
        </View>
        {cartCount > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartCount === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag color="#CBD5E1" size={64} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Discover authentic products or ask our AI Shopping Assistant for recommendations!</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient colors={Theme.gradients.primary as any} style={styles.exploreGrad}>
              <Text style={styles.exploreBtnText}>Explore Marketplace</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Multi-Shop Grouped Cart Items */}
          {Object.entries(itemsByShop).map(([shopId, group]) => (
            <View key={shopId} style={styles.shopGroupCard}>
              <View style={styles.shopGroupHeader}>
                <Store color="#A163F7" size={16} />
                <Text style={styles.shopGroupName}>{group.shopName}</Text>
                <View style={styles.verifiedTag}>
                  <ShieldCheck color="#10B981" size={12} />
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>

              {group.items.map((item) => {
                const thumb = item.product.image_url || (item.product.images && item.product.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
                return (
                  <View key={item.product.id} style={styles.cartItemRow}>
                    <Image source={{ uri: thumb }} style={styles.itemThumb} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={styles.itemPrice}>{formatCurrency(item.product.price)}</Text>

                      <View style={styles.qtyRow}>
                        <View style={styles.qtyCounter}>
                          <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus color="#0F172A" size={14} />
                          </TouchableOpacity>
                          <Text style={styles.counterText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus color="#0F172A" size={14} />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 color="#EF4444" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Price Breakdown */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Standard Shipping (Cash on Delivery)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Bottom Sticky Checkout Action */}
      {cartCount > 0 && (
        <View style={styles.bottomCheckoutBar}>
          <View>
            <Text style={styles.barTotalLabel}>Total Amount</Text>
            <Text style={styles.barTotalValue}>{formatCurrency(grandTotal)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Theme.gradients.primary as any} style={styles.checkoutGrad}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ArrowRight color="#FFF" size={16} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  exploreGrad: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  shopGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  shopGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  shopGroupName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  cartItemRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  itemThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  counterBtn: {
    padding: 4,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A163F7',
  },
  bottomCheckoutBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 96 : 80,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Theme.shadows.md,
  },
  barTotalLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  barTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  checkoutBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkoutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
