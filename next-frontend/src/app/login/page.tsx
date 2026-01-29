"use client";

import { useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { customers } from '@/services/api';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function CustomerLogin() {
    const router = useRouter();
    const { login } = useCustomer();
    const [loading, setLoading] = useState(false);
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await customers.login({ login_id: loginId, password });
            login(res.data.access_token, res.data.user);
            alert("Login successful!");
            router.push('/account');
        } catch (err: any) {
            alert(err.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-primary mb-6">Customer Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Email or Phone</label>
                        <input 
                            type="text" required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={loginId}
                            onChange={e => setLoginId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Password</label>
                        <input 
                            type="password" required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-accent text-white py-3 rounded-md font-bold hover:bg-amber-600 transition-all shadow-md disabled:bg-gray-300"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-secondary">
                    Don't have an account? <Link href="/signup" className="text-secondary font-bold hover:underline">Sign up here</Link>
                </p>
            </div>
        </PublicLayout>
    );
}
