"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, setAuthToken } from '@/services/api';

export type SellerUser = {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    role: string;
    shop_id?: number;
};

export type Shop = {
    id: number;
    name: string;
    description?: string;
    logo_url?: string;
    cover_image_url?: string;
    is_approved: boolean;
    is_active: boolean;
};

type SellerContextType = {
    seller: SellerUser | null;
    shop: Shop | null;
    token: string | null;
    isLoaded: boolean;
    isAdmin: boolean;
    loginSeller: (loginId: string, pass: string) => Promise<{ success: boolean; error?: string; is_approved?: boolean }>;
    registerSeller: (data: any) => Promise<{ success: boolean; error?: string }>;
    loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
};

const SellerContext = createContext<SellerContextType | undefined>(undefined);

const SELLER_TOKEN_KEY = 'aiplaza_seller_token';
const SELLER_USER_KEY = 'aiplaza_seller_user';
const SELLER_SHOP_KEY = 'aiplaza_seller_shop';

export function SellerProvider({ children }: { children: ReactNode }) {
    const [seller, setSeller] = useState<SellerUser | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem(SELLER_TOKEN_KEY);
        const savedUser = localStorage.getItem(SELLER_USER_KEY);
        const savedShop = localStorage.getItem(SELLER_SHOP_KEY);

        if (savedToken) {
            setToken(savedToken);
            setAuthToken(savedToken);
            if (savedUser) setSeller(JSON.parse(savedUser));
            if (savedShop) setShop(JSON.parse(savedShop));

            auth.getMe().then(res => {
                if (res.data.user) {
                    setSeller(res.data.user);
                    localStorage.setItem(SELLER_USER_KEY, JSON.stringify(res.data.user));
                }
                if (res.data.shop) {
                    setShop(res.data.shop);
                    localStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(res.data.shop));
                }
            }).catch(() => {
                // Token may be expired
            });
        }
        setIsLoaded(true);
    }, []);

    const loginSeller = async (loginId: string, pass: string) => {
        try {
            const res = await auth.sellerLogin({ login_id: loginId, password: pass });
            const { access_token, user: userData, shop: shopData } = res.data;

            setToken(access_token);
            setSeller(userData);
            setShop(shopData || null);
            setAuthToken(access_token);

            localStorage.setItem(SELLER_TOKEN_KEY, access_token);
            localStorage.setItem(SELLER_USER_KEY, JSON.stringify(userData));
            if (shopData) {
                localStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(shopData));
            }

            return { success: true, is_approved: shopData?.is_approved };
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Invalid email or password';
            return { success: false, error: msg };
        }
    };

    const registerSeller = async (data: any) => {
        try {
            const res = await auth.sellerRegister(data);
            const { access_token, user: userData, shop: shopData } = res.data;

            setToken(access_token);
            setSeller(userData);
            setShop(shopData || null);
            setAuthToken(access_token);

            localStorage.setItem(SELLER_TOKEN_KEY, access_token);
            localStorage.setItem(SELLER_USER_KEY, JSON.stringify(userData));
            if (shopData) {
                localStorage.setItem(SELLER_SHOP_KEY, JSON.stringify(shopData));
            }

            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Registration failed';
            return { success: false, error: msg };
        }
    };

    const loginAdmin = async (email: string, pass: string) => {
        try {
            const res = await auth.adminLogin({ email, password: pass });
            const { access_token, user: userData } = res.data;

            setToken(access_token);
            setSeller(userData);
            setShop(null);
            setAuthToken(access_token);

            localStorage.setItem(SELLER_TOKEN_KEY, access_token);
            localStorage.setItem(SELLER_USER_KEY, JSON.stringify(userData));
            localStorage.removeItem(SELLER_SHOP_KEY);

            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Invalid admin credentials';
            return { success: false, error: msg };
        }
    };

    const refreshProfile = async () => {
        try {
            const res = await auth.getMe();
            if (res.data.user) setSeller(res.data.user);
            if (res.data.shop) setShop(res.data.shop);
        } catch (e) {
            console.error('Refresh profile error:', e);
        }
    };

    const logout = () => {
        localStorage.removeItem(SELLER_TOKEN_KEY);
        localStorage.removeItem(SELLER_USER_KEY);
        localStorage.removeItem(SELLER_SHOP_KEY);
        setToken(null);
        setSeller(null);
        setShop(null);
        setAuthToken(null);
    };

    const isAdmin = seller?.role === 'SUPER_ADMIN' || seller?.email === 'abdullrrafay@gmail.com';

    return (
        <SellerContext.Provider
            value={{
                seller,
                shop,
                token,
                isLoaded,
                isAdmin,
                loginSeller,
                registerSeller,
                loginAdmin,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </SellerContext.Provider>
    );
}

export const useSeller = () => {
    const context = useContext(SellerContext);
    if (!context) throw new Error("useSeller must be used within SellerProvider");
    return context;
};
