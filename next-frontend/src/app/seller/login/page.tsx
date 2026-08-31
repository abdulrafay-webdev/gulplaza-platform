"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, ArrowRight, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';
import { useSeller } from "@/context/SellerContext";

export default function SellerLoginPage() {
    const router = useRouter();
    const { loginSeller } = useSeller();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginId.trim() || !password.trim()) {
            setError("Please provide both email/phone and password.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await loginSeller(loginId.trim(), password);
            if (res.success) {
                router.push("/dashboard");
            } else {
                setError(res.error || "Invalid credentials.");
            }
        } catch (err: any) {
            setError("Failed to sign in. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#161226] border border-purple-500/30 p-1 mx-auto mb-4 shadow-lg shadow-purple-500/25 flex items-center justify-center">
                        <img src="/images/logo.png" alt="AI Plaza Logo" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <h1 className="text-2xl font-black text-[#161226] tracking-tight">Seller Merchant Portal</h1>
                    <p className="text-xs text-slate-500 mt-1">Sign in to manage your Gul Plaza shop, catalog, and orders</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Seller Email or Phone Number
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. creative@aiplaza.com or 0300..."
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Seller Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">New Seller?</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <Link
                    href="/seller/register"
                    className="w-full py-3 bg-purple-50 hover:bg-purple-100/70 border border-purple-200 text-[#7C3AED] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Open / Register a New Shop</span>
                </Link>

                <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-500 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Protected Seller Portal. Approvals are verified by Super Admin.</span>
                </div>
            </div>
        </div>
    );
}
