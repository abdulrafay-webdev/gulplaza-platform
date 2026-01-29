"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customers, setAuthToken } from '@/services/api';

type Customer = {
    id: number;
    full_name: str;
    email?: string;
    phone?: string;
};

type CustomerContextType = {
    customer: Customer | null;
    login: (token: string, user: Customer) => void;
    logout: () => void;
    isLoaded: bool;
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('customer_token');
        const savedUser = localStorage.getItem('customer_user');
        
        if (token && savedUser) {
            setAuthToken(token);
            setCustomer(JSON.parse(savedUser));
        }
        setIsLoaded(true);
    }, []);

    const login = (token: string, user: Customer) => {
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(user));
        setAuthToken(token);
        setCustomer(user);
    };

    const logout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setAuthToken(null);
        setCustomer(null);
    };

    return (
        <CustomerContext.Provider value={{ customer, login, logout, isLoaded }}>
            {children}
        </CustomerContext.Provider>
    );
}

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (!context) throw new Error("useCustomer must be used within CustomerProvider");
    return context;
};
