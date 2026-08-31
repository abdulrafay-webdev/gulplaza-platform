import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { 
  Product, 
  Shop, 
  Category, 
  Order, 
  PlatformAnalytics, 
  SellerAnalytics, 
  AIChat, 
  AIMessage, 
  CustomerUser 
} from '../shared/types';

export class APIClient {
  private instance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.instance = axios.create({
      baseURL,
      timeout: 25000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.instance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setBaseURL(url: string) {
    this.instance.defaults.baseURL = url;
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  auth = {
    sellerRegister: (data: {
      full_name: string;
      email: string;
      phone?: string;
      password: string;
      shop_name: string;
      shop_description?: string;
    }) => this.instance.post<{
      access_token: string;
      token_type: string;
      user: any;
      shop: Shop;
      message: string;
    }>('/auth/seller/register', data),

    sellerLogin: (data: { login_id: string; password: string }) =>
      this.instance.post<{
        access_token: string;
        token_type: string;
        user: any;
        shop: Shop;
      }>('/auth/seller/login', data),

    adminLogin: (data: { email: string; password: string }) =>
      this.instance.post<{
        access_token: string;
        token_type: string;
        user: any;
        message: string;
      }>('/auth/admin/login', data),

    getMe: () =>
      this.instance.get<{ user: any; shop?: Shop }>('/auth/me'),
  };

  customers = {
    signup: (data: { full_name: string; email?: string; phone?: string; password: string }) =>
      this.instance.post<{ message: string; customer_id: number }>('/customers/signup', data),

    login: (data: { login_id: string; password: string }) =>
      this.instance.post<{ access_token: string; token_type: string; user: CustomerUser }>('/customers/login', data),

    getMe: () =>
      this.instance.get<CustomerUser>('/customers/me'),

    getOrders: () =>
      this.instance.get<Order[]>('/customers/orders'),
  };

  products = {
    listAll: (params?: { limit?: number; offset?: number; search?: string }) =>
      this.instance.get<Product[]>('/products', { params }),

    get: (id: number | string) =>
      this.instance.get<Product>(`/products/${id}`),

    listByShop: (shopId: number | string) =>
      this.instance.get<Product[]>(`/shops/${shopId}/products`),

    create: (shopId: number | string, data: any) =>
      this.instance.post<Product>(`/shops/${shopId}/products`, data),

    update: (id: number | string, data: any) =>
      this.instance.put<Product>(`/products/${id}`, data),

    delete: (id: number | string) =>
      this.instance.delete<{ message: string }>(`/products/${id}`),
  };

  shops = {
    list: () =>
      this.instance.get<Shop[]>('/shops/'),

    get: (id: number | string) =>
      this.instance.get<Shop>(`/shops/${id}`),

    getMe: () =>
      this.instance.get<Shop>('/shops/me'),

    getAnalytics: () =>
      this.instance.get<SellerAnalytics>('/shops/me/analytics'),

    update: (data: Partial<Shop>) =>
      this.instance.put<Shop>('/shops/me', data),

    create: (data: Partial<Shop>) =>
      this.instance.post<Shop>('/shops/', data),
  };

  categories = {
    list: () =>
      this.instance.get<Category[]>('/categories/'),

    listSubcategories: (mainId?: number) =>
      this.instance.get('/categories/subcategories', { params: { main_category_id: mainId } }),

    create: (data: { name: string; slug?: string }) =>
      this.instance.post<Category>('/categories/', data),

    delete: (id: number | string) =>
      this.instance.delete(`/categories/${id}`),
  };

  orders = {
    checkout: (data: {
      items: Array<{ product_id: number; quantity: number }>;
      guest_name?: string;
      guest_email?: string;
      guest_phone?: string;
      guest_address?: string;
    }) => this.instance.post<{ message: string; order_ids: number[] }>('/cart/checkout', data),

    list: () =>
      this.instance.get<Order[]>('/orders'),

    get: (id: number | string) =>
      this.instance.get<Order>(`/orders/${id}`),

    updateStatus: (id: number | string, status: string) =>
      this.instance.patch<Order>(`/orders/${id}/status`, { status }),
  };

  search = {
    unified: (query: string) =>
      this.instance.get<{ products: Product[]; shops: Shop[]; categories: Category[] }>('/search/', { params: { q: query } }),
  };

  ai = {
    listChats: () =>
      this.instance.get<AIChat[]>('/ai/chats', { timeout: 35000 }),

    createChat: (data?: { initial_message?: string; image_url?: string }) =>
      this.instance.post<{
        chat: { id: number; title: string; created_at: string; updated_at: string };
        user_message?: AIMessage;
        assistant_message?: AIMessage;
      }>('/ai/chats', data, { timeout: 35000 }),

    getChat: (chatId: number | string) =>
      this.instance.get<AIChat & { messages: AIMessage[] }>(`/ai/chats/${chatId}`, { timeout: 35000 }),

    sendMessage: (chatId: number | string, data: { content: string; image_url?: string }) =>
      this.instance.post<{
        user_message: AIMessage;
        assistant_message: AIMessage;
        chat: { id: number; title: string; updated_at: string };
      }>(`/ai/chats/${chatId}/messages`, data, { timeout: 35000 }),

    renameChat: (chatId: number | string, title: string) =>
      this.instance.patch<{ id: number; title: string }>(`/ai/chats/${chatId}/title`, { title }),

    deleteChat: (chatId: number | string) =>
      this.instance.delete<{ message: string }>(`/ai/chats/${chatId}`),

    uploadImage: (formData: any) =>
      this.instance.post<{ url: string }>('/ai/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000,
      }),

    generateDescription: (title: string, categoryId?: number) =>
      this.instance.post<{ short_description: string; long_description: string }>('/ai/generate-description', {
        title,
        category_id: categoryId,
      }),
  };

  admin = {
    getAnalytics: () =>
      this.instance.get<PlatformAnalytics>('/admin/analytics'),

    listShops: (approved?: boolean) =>
      this.instance.get<Shop[]>('/admin/shops', { params: { approved } }),

    approveShop: (shopId: number | string) =>
      this.instance.post<Shop>(`/admin/shops/${shopId}/approve`),

    toggleActive: (shopId: number | string) =>
      this.instance.patch<Shop>(`/admin/shops/${shopId}/toggle-active`),

    deleteShop: (shopId: number | string) =>
      this.instance.delete<{ message: string }>(`/admin/shops/${shopId}`),
  };
}

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:8000/api/v1`;
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api/v1';
    }
  }
  return 'http://localhost:8000/api/v1';
};

export const api = new APIClient(getBaseURL());
export default api;
