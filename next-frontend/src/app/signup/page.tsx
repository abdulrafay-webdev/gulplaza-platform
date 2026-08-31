"use client";

import { useState, Suspense } from 'react';
import { customers } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { UserPlus, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/account';

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            await customers.signup(formData);
            alert("Account created successfully! Please sign in.");
            router.push(`/login${redirectPath !== '/account' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || "Signup failed. Please check your information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-8 sm:my-14 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-purple-500/5 border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#161226] border border-purple-500/30 p-1 flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
                    <img src="/images/logo.png" alt="AI Plaza Logo" className="w-full h-full object-contain rounded-xl" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Customer Account</h1>
                <p className="text-xs text-slate-500">
                    Join AI Plaza to shop across verified stores and use the AI Shopping Assistant.
                </p>
            </div>

            {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#FF7582] rounded-2xl text-xs font-bold animate-shake">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. Kashif Khan"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input 
                        type="email"
                        placeholder="e.g. kashif@example.com"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input 
                        type="tel"
                        placeholder="e.g. 03001234567"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                    <input 
                        type="password" 
                        required
                        placeholder="Choose a strong password"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] focus:outline-none transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
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
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <>
                            <span>Create Account</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link 
                        href={`/login${redirectPath !== '/account' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} 
                        className="text-[#6F88FC] font-black hover:underline"
                    >
                        Sign In Here
                    </Link>
                </p>
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Free customer registration & instant checkout</span>
                </div>
            </div>
        </div>
    );
}

export default function CustomerSignup() {
    return (
        <PublicLayout>
            <Suspense fallback={
                <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                    Loading Signup...
                </div>
            }>
                <SignupForm />
            </Suspense>
        </PublicLayout>
    );
}
