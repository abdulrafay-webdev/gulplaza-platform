import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../../../../mobile-shared/src/types';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
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

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity }];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId: number) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Group items by shop for multi-shop checkout
  const itemsByShop: Record<number, { shopName: string; items: CartItem[]; shopTotal: number }> = {};
  cart.forEach((item) => {
    const shopId = item.product.shop_id || 1;
    const shopName = item.product.shop?.name || item.product.shop_name || `Shop #${shopId}`;
    if (!itemsByShop[shopId]) {
      itemsByShop[shopId] = { shopName, items: [], shopTotal: 0 };
    }
    itemsByShop[shopId].items.push(item);
    itemsByShop[shopId].shopTotal += item.product.price * item.quantity;
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
