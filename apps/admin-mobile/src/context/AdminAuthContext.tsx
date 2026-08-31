import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser } from '../shared/types';
import { api } from '../services/api';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  token: null,
  isLoading: true,
  login: async () => false,
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

  const login = async (authToken: string): Promise<boolean> => {
    try {
      api.setAuthToken(authToken);
      await api.admin.getAnalytics();

      const adminData: AdminUser = {
        id: 'admin',
        role: 'SUPER_ADMIN'
      };

      setToken(authToken);
      setAdmin(adminData);
      await AsyncStorage.setItem(ADMIN_TOKEN_KEY, authToken);
      await AsyncStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
      return true;
    } catch (err) {
      console.error('Admin validation error:', err);
      api.setAuthToken(null);
      return false;
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
