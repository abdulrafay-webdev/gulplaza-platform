"use client";

import { useState, Suspense } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { customers } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { LogIn, Sparkles, ShieldCheck, ArrowRight, User } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/account';
    
    const { login } = useCustomer();
    const [loading, setLoading] = useState(false);
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await customers.login({ login_id: loginId.trim(), password });
            login(res.data.access_token, res.data.user);
            router.push(redirectPath);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-8 sm:my-14 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-purple-500/5 border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A163F7] to-[#6F88FC] text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
                    <LogIn className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Login</h1>
                <p className="text-xs text-slate-500">
                    Sign in to access your orders, saved cart, and AI Shopping Assistant.
                </p>
            </div>

            {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#FF7582] rounded-2xl text-xs font-bold animate-shake">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email or Phone Number</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. 03001234567 or user@example.com"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={loginId}
                        onChange={e => setLoginId(e.target.value)}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">Password</label>
                    </div>
                    <input 
                        type="password" 
                        required
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] hover:opacity-95 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-purple-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Signing In...</span>
                        </>
                    ) : (
                        <>
                            <span>Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                    Don't have an account yet?{' '}
                    <Link 
                        href={`/signup${redirectPath !== '/account' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} 
                        className="text-[#6F88FC] font-black hover:underline"
                    >
                        Create Free Account
                    </Link>
                </p>
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure end-to-end authentication</span>
                </div>
            </div>
        </div>
    );
}

export default function CustomerLogin() {
    return (
        <PublicLayout>
            <Suspense fallback={
                <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                    Loading Login...
                </div>
            }>
                <LoginForm />
            </Suspense>
        </PublicLayout>
    );
}
