"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, User, Mail, Phone, Lock, FileText, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useSeller } from "@/context/SellerContext";

export default function SellerRegisterPage() {
    const router = useRouter();
    const { registerSeller } = useSeller();
    const [shopName, setShopName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
            setError("Please provide all required fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await registerSeller({
                shop_name: shopName.trim(),
                full_name: fullName.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                password: password.trim(),
                shop_description: shopDescription.trim() || undefined,
            });

            if (res.success) {
                setSubmitted(true);
            } else {
                setError(res.error || "Registration failed.");
            }
        } catch (err: any) {
            setError("An error occurred during registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 mx-auto mb-4 flex items-center justify-center text-amber-600">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-[#161226]">Store Application Submitted!</h2>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Your shop <strong className="text-[#A163F7]">"{shopName}"</strong> has been registered and is now pending Super Admin review.
                    </p>
                    <div className="my-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800">
                        <p className="font-bold">What happens next?</p>
                        <p className="mt-1 text-[11px] text-amber-700">
                            Our administration team verifies vendor applications within 24 hours. You can sign in to view your approval status.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="w-full py-3.5 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Go to Dashboard Status</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#A163F7] to-[#6F88FC] p-0.5 mx-auto mb-4 shadow-lg shadow-purple-500/25 flex items-center justify-center">
                        <div className="w-full h-full bg-[#161226] rounded-[14px] flex items-center justify-center">
                            <Store className="w-8 h-8 text-[#45E3FF]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-[#161226] tracking-tight">Open Your Shop on AI Plaza</h1>
                    <p className="text-xs text-slate-500 mt-1">Join the premier multi-shop shopping mall and reach shoppers directly</p>
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
                            Shop / Store Name *
                        </label>
                        <div className="relative">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. Creative Electronics"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Owner Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. Muhammad Ali"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Business Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="ali@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                WhatsApp / Phone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    placeholder="03001234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Shop Description & Specialities
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                placeholder="Describe the categories and products you offer..."
                                value={shopDescription}
                                onChange={(e) => setShopDescription(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A163F7] text-[#161226] min-h-[70px]"
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
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Submit Store for Super Admin Approval</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Already have a shop?{" "}
                    <Link href="/seller/login" className="font-bold text-[#7C3AED] hover:underline">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}
