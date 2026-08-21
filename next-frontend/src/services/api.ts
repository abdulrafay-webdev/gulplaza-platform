import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const shops = {
    create: (data: any) => api.post('/shops/', data),
    update: (data: any) => api.put('/shops/me', data),
    getMe: () => api.get('/shops/me'),
    getAnalytics: () => api.get('/shops/me/analytics'),
    list: () => api.get('/shops/'),
    get: (id: string | number) => api.get(`/shops/${id}`),
};

export const products = {
    create: (shopId: string | number, data: any) => api.post(`/shops/${shopId}/products`, data),
    list: (shopId: string | number) => api.get(`/shops/${shopId}/products`),
    listAll: (params?: any) => api.get('/products', { params }),
    get: (id: string | number) => api.get(`/products/${id}`),
    update: (id: string | number, data: any) => api.put(`/products/${id}`, data),
    delete: (id: string | number) => api.delete(`/products/${id}`),
};

export const reviews = {
    getProductReviews: (productId: string | number) => api.get(`/products/${productId}/reviews`),
    submitProductReview: (productId: string | number, data: any) => api.post(`/products/${productId}/reviews`, data),
    getRecentReviews: (limit: number = 6) => api.get('/recent', { params: { limit } }),
};

export const cart = {
    checkout: (data: any) => api.post('/cart/checkout', data),
};

export const orders = {
    list: () => api.get('/orders'),
    get: (id: string | number) => api.get(`/orders/${id}`),
    updateStatus: (id: string | number, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const admin = {
    getAnalytics: () => api.get('/admin/analytics'),
    listShops: (approved?: boolean) => api.get('/admin/shops', { params: { approved } }),
    approveShop: (shopId: string | number) => api.post(`/admin/shops/${shopId}/approve`),
    toggleActive: (shopId: string | number) => api.patch(`/admin/shops/${shopId}/toggle-active`),
    deleteShop: (shopId: string | number) => api.delete(`/admin/shops/${shopId}`),
};

export const categories = {
    list: () => api.get('/categories/'),
    create: (data: any) => api.post('/categories/', data),
    delete: (id: string | number) => api.delete(`/categories/${id}`),
    createSub: (mainId: string | number, data: any) => api.post(`/categories/${mainId}/subcategories`, data),
    listSub: (mainId?: string | number) => api.get('/categories/subcategories', { params: { main_category_id: mainId } }),
};

export const customers = {
    signup: (data: any) => api.post('/customers/signup', data),
    login: (data: any) => api.post('/customers/login', data),
    getMe: () => api.get('/customers/me'),
    getOrders: () => api.get('/customers/orders'),
};

export const search = {
    unified: (query: string) => api.get('/search/', { params: { q: query } }),
};

export default api;
