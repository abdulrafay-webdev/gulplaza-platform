import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser } from '../shared/types';
import { api } from '../services/api';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

const ADMIN_TOKEN_KEY = '@aiplaza_admin_token';
const ADMIN_DATA_KEY = '@aiplaza_admin_data';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
      const storedAdmin = await AsyncStorage.getItem(ADMIN_DATA_KEY);

      if (storedToken) {
        setToken(storedToken);
        api.setAuthToken(storedToken);
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      }
    } catch (err) {
      console.error('Failed to load admin auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.adminLogin({ email, password: pass });
      const { access_token, user: userData } = res.data;

      setToken(access_token);
      setAdmin(userData);
      api.setAuthToken(access_token);

      await AsyncStorage.setItem(ADMIN_TOKEN_KEY, access_token);
      await AsyncStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid Super Admin email or password';
      api.setAuthToken(null);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    setToken(null);
    setAdmin(null);
    api.setAuthToken(null);
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
    await AsyncStorage.removeItem(ADMIN_DATA_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
