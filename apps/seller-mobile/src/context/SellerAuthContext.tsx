import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignOut } from '../lib/ClerkAuthContext';
import { Shop, SellerUser } from '../shared/types';
import { api } from '../services/api';

interface SellerAuthContextType {
  seller: SellerUser | null;
  shop: Shop | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, shopData?: Shop) => Promise<void>;
  refreshShop: () => Promise<void>;
  logout: () => Promise<void>;
}

const SellerAuthContext = createContext<SellerAuthContextType>({
  seller: null,
  shop: null,
  token: null,
  isLoading: true,
  login: async () => {},
  refreshShop: async () => {},
  logout: async () => {},
});

const SELLER_TOKEN_KEY = '@aiplaza_seller_token';
const SELLER_DATA_KEY = '@aiplaza_seller_data';
const SELLER_SHOP_KEY = '@aiplaza_seller_shop';

export const SellerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useSignOut();
  const [seller, setSeller] = useState<SellerUser | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(SELLER_TOKEN_KEY);
      const storedSeller = await AsyncStorage.getItem(SELLER_DATA_KEY);
      const storedShop = await AsyncStorage.getItem(SELLER_SHOP_KEY);

      if (storedToken) {
        setToken(storedToken);
        api.setAuthToken(storedToken);
        if (storedSeller) setSeller(JSON.parse(storedSeller));
        if (storedShop) setShop(JSON.parse(storedShop));

        try {
          const res = await api.shops.getMe();
          setShop(res.data);
          await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(res.data));
        } catch (e) {
          console.warn('Could not refresh shop on startup:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load seller auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authToken: string, shopData?: Shop) => {
    setToken(authToken);
    api.setAuthToken(authToken);
    await AsyncStorage.setItem(SELLER_TOKEN_KEY, authToken);

    if (shopData) {
      setShop(shopData);
      await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(shopData));
    } else {
      await refreshShop();
    }
  };

  const refreshShop = async () => {
    try {
      const res = await api.shops.getMe();
      setShop(res.data);
      await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh shop:', err);
    }
  };

  const logout = async () => {
    try { await signOut(); } catch (e) { /* ignore */ }
    setToken(null);
    setSeller(null);
    setShop(null);
    api.setAuthToken(null);
    await AsyncStorage.removeItem(SELLER_TOKEN_KEY);
    await AsyncStorage.removeItem(SELLER_DATA_KEY);
    await AsyncStorage.removeItem(SELLER_SHOP_KEY);
  };

  return (
    <SellerAuthContext.Provider
      value={{
        seller,
        shop,
        token,
        isLoading,
        login,
        refreshShop,
        logout,
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => useContext(SellerAuthContext);
