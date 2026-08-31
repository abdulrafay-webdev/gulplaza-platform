import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shop, SellerUser } from '../shared/types';
import { api } from '../services/api';

interface SellerAuthContextType {
  seller: SellerUser | null;
  shop: Shop | null;
  token: string | null;
  isLoading: boolean;
  login: (loginId: string, pass: string) => Promise<{ success: boolean; error?: string; is_approved?: boolean }>;
  register: (data: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
    shop_name: string;
    shop_description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshShop: () => Promise<void>;
  logout: () => Promise<void>;
}

const SellerAuthContext = createContext<SellerAuthContextType>({
  seller: null,
  shop: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  refreshShop: async () => {},
  logout: async () => {},
});

const SELLER_TOKEN_KEY = '@aiplaza_seller_token';
const SELLER_DATA_KEY = '@aiplaza_seller_data';
const SELLER_SHOP_KEY = '@aiplaza_seller_shop';

export const SellerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          const res = await api.auth.getMe();
          if (res.data.shop) {
            setShop(res.data.shop);
            await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(res.data.shop));
          }
          if (res.data.user) {
            setSeller(res.data.user);
            await AsyncStorage.setItem(SELLER_DATA_KEY, JSON.stringify(res.data.user));
          }
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

  const login = async (loginId: string, pass: string) => {
    try {
      const res = await api.auth.sellerLogin({ login_id: loginId, password: pass });
      const { access_token, user: userData, shop: shopData } = res.data;

      setToken(access_token);
      api.setAuthToken(access_token);
      setSeller(userData);
      setShop(shopData || null);

      await AsyncStorage.setItem(SELLER_TOKEN_KEY, access_token);
      await AsyncStorage.setItem(SELLER_DATA_KEY, JSON.stringify(userData));
      if (shopData) {
        await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(shopData));
      }

      return { 
        success: true, 
        is_approved: shopData ? shopData.is_approved : false 
      };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email/phone or password';
      return { success: false, error: msg };
    }
  };

  const register = async (data: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
    shop_name: string;
    shop_description?: string;
  }) => {
    try {
      const res = await api.auth.sellerRegister(data);
      const { access_token, user: userData, shop: shopData } = res.data;

      setToken(access_token);
      api.setAuthToken(access_token);
      setSeller(userData);
      setShop(shopData || null);

      await AsyncStorage.setItem(SELLER_TOKEN_KEY, access_token);
      await AsyncStorage.setItem(SELLER_DATA_KEY, JSON.stringify(userData));
      if (shopData) {
        await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(shopData));
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: msg };
    }
  };

  const refreshShop = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.data.shop) {
        setShop(res.data.shop);
        await AsyncStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(res.data.shop));
      }
    } catch (err) {
      console.error('Failed to refresh shop:', err);
    }
  };

  const logout = async () => {
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
        register,
        refreshShop,
        logout,
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => useContext(SellerAuthContext);
