import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../shared/types';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  itemsByShop: Record<number, { shopName: string; items: CartItem[]; shopTotal: number }>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemsByShop: {},
});

const CART_KEY = '@aiplaza_customer_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = await AsyncStorage.getItem(CART_KEY);
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, []);

  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(newCart));
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  const addToCart = (product: Product, quantity: number = 1, selectedVariant?: ProductVariant) => {
    const isMatch = (item: CartItem) =>
      item.product.id === product.id &&
      (item.selected_variant?.id || null) === (selectedVariant?.id || null);

    const existingIndex = cart.findIndex(isMatch);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity, selected_variant: selectedVariant }];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    const updated = cart.filter((item) => {
      if (item.product.id !== productId) return true;
      if (variantId !== undefined) return item.selected_variant?.id !== variantId;
      return false;
    });
    saveCart(updated);
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    const updated = cart.map((item) => {
      const match = item.product.id === productId && (variantId === undefined || item.selected_variant?.id === variantId);
      return match ? { ...item, quantity } : item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.selected_variant ? item.selected_variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemsByShop: Record<number, { shopName: string; items: CartItem[]; shopTotal: number }> = {};
  cart.forEach((item) => {
    const shopId = item.product.shop_id || 1;
    const shopName = item.product.shop?.name || item.product.shop_name || `Shop #${shopId}`;
    if (!itemsByShop[shopId]) {
      itemsByShop[shopId] = { shopName, items: [], shopTotal: 0 };
    }
    const price = item.selected_variant ? item.selected_variant.price : item.product.price;
    itemsByShop[shopId].items.push(item);
    itemsByShop[shopId].shopTotal += price * item.quantity;
  });

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsByShop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
