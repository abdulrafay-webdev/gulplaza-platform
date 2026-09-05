"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type CartItem = {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    shop_id: number;
    image_url?: string;
    variant_id?: number;
    variant_name?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: number, variantName?: string) => void;
    updateQuantity: (productId: number, quantity: number, variantName?: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Persist cart to local storage (preservng behavior)
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (item: CartItem) => {
        setItems(prev => {
            const isMatch = (i: CartItem) => i.product_id === item.product_id && (i.variant_name || null) === (item.variant_name || null);
            const existing = prev.find(isMatch);
            if (existing) {
                return prev.map(i => isMatch(i) ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (productId: number, variantName?: string) => {
        setItems(prev => prev.filter(i => {
            if (i.product_id !== productId) return true;
            if (variantName !== undefined) return i.variant_name !== variantName;
            return false;
        }));
    };

    const updateQuantity = (productId: number, quantity: number, variantName?: string) => {
        setItems(prev => prev.map(item => {
            if (item.product_id === productId && (variantName === undefined || item.variant_name === variantName)) {
                return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
        }));
    };
    
    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};
