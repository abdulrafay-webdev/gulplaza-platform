"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useSeller } from "@/context/SellerContext";

export default function AdminLoginPage() {
    const router = useRouter();
    const { loginAdmin } = useSeller();
    const [email, setEmail] = useState("abdullrrafay@gmail.com");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await loginAdmin(email.trim(), password);
            if (res.success) {
                router.push("/admin");
            } else {
                setError(res.error || "Invalid Super Admin credentials.");
            }
        } catch (err: any) {
            setError("Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E1B4B] to-[#0F172A] p-0.5 mx-auto mb-4 shadow-lg flex items-center justify-center">
                        <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-[#45E3FF]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-[#161226] tracking-tight">Super Admin Console</h1>
                    <p className="text-xs text-slate-500 mt-1">Platform moderation, store approvals, and KPI analytics</p>
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
                            Admin Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="abdullrrafay@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        className="w-full py-3.5 bg-gradient-to-r from-[#1E1B4B] via-[#4338CA] to-[#6366F1] text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Verify & Access Admin Console</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] text-center">
                    Access is restricted to authorized platform super administrators.
                </div>
            </div>
        </div>
    );
}
