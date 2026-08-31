import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerUser } from '../shared/types';
import { api } from '../services/api';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (loginId: string, pass: string) => Promise<boolean>;
  signup: (data: { full_name: string; email?: string; phone?: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
});

const TOKEN_KEY = '@aiplaza_customer_token';
const USER_KEY = '@aiplaza_customer_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.setAuthToken(storedToken);
        }
      } catch (err) {
        console.error('Failed to load stored auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (loginId: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.customers.login({ login_id: loginId, password: pass });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      api.setAuthToken(access_token);
      await AsyncStorage.setItem(TOKEN_KEY, access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (data: { full_name: string; email?: string; phone?: string; password: string }): Promise<boolean> => {
    try {
      await api.customers.signup(data);
      return await login(data.email || data.phone || '', data.password);
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
