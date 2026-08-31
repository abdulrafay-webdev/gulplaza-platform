import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import {
  ChevronLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  CreditCard
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutScreen({ navigation }: any) {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<number[] | null>(null);

  const deliveryFee = 250;
  const grandTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Incomplete Form', 'Please provide your full name, phone number, and delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const itemsPayload = cart.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity
      }));

      const fullDeliveryAddress = `${address.trim()}, ${city.trim()}`;

      const res = await api.orders.checkout({
        items: itemsPayload,
        guest_name: fullName.trim(),
        guest_phone: phone.trim(),
        guest_email: email.trim() || undefined,
        guest_address: fullDeliveryAddress
      });

      const orderIds = res.data.order_ids || [];
      clearCart();
      setOrderSuccess(orderIds);
    } catch (err) {
      console.error('Checkout error:', err);
      Alert.alert('Order Failed', 'Could not complete checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle2 color="#10B981" size={72} />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successDesc}>
            Thank you for shopping at AI Plaza. Your order reference IDs:{' '}
            <Text style={{ fontWeight: '800', color: '#0F172A' }}>
              {orderSuccess.map(id => `#${id}`).join(', ')}
            </Text>
          </Text>
          <Text style={styles.codNote}>Payment method: Cash on Delivery (COD) on arrival.</Text>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient colors={Theme.gradients.primary as any} style={styles.homeGrad}>
              <Text style={styles.homeBtnText}>Return to Marketplace</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Details Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputFieldRow}>
              <User color="#94A3B8" size={16} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter recipient name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (For Rider Contact) *</Text>
            <View style={styles.inputFieldRow}>
              <Phone color="#94A3B8" size={16} />
              <TextInput
                style={styles.fieldInput}
                placeholder="03XXXXXXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address (House / Street / Area) *</Text>
            <View style={[styles.inputFieldRow, { alignItems: 'flex-start', paddingTop: 10 }]}>
              <MapPin color="#94A3B8" size={16} />
              <TextInput
                style={[styles.fieldInput, { height: 60 }]}
                placeholder="Complete street address"
                placeholderTextColor="#94A3B8"
                multiline
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputFieldRow}>
              <TextInput
                style={styles.fieldInput}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentPill}>
            <Truck color="#A163F7" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>Pay with cash when your parcel arrives at your doorstep.</Text>
            </View>
            <CheckCircle2 color="#A163F7" size={20} />
          </View>
        </View>

        {/* Order Summary Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Summary ({cart.length} items)</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatCurrency(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryVal}>{formatCurrency(deliveryFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount Payable</Text>
            <Text style={styles.grandTotalVal}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          <LinearGradient colors={Theme.gradients.primary as any} style={styles.placeOrderGrad}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.placeOrderText}>
                Confirm Order • {formatCurrency(grandTotal)}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 10,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
  },
  paymentSub: {
    fontSize: 11,
    color: '#6B21A8',
    marginTop: 2,
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
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A163F7',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  placeOrderBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  placeOrderGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  codNote: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 24,
  },
  homeBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  homeGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
