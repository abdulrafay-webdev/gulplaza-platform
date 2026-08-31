"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { shops, setAuthToken } from '@/services/api';
import { IKUpload } from "imagekitio-next";
import { 
  Store, 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Edit3, 
  ArrowRight,
  Package,
  Plus,
  Flame,
  Bot,
  Search,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardHome() {
    const { token, seller } = useSeller();
    const [shop, setShop] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '',
        logo_url: '',
        cover_image_url: ''
    });

    const loadData = async () => {
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('aiplaza_seller_token') : null);
        if (!activeToken) {
            setLoading(false);
            return;
        }
        setAuthToken(activeToken);
        try {
            // 1. Fetch Shop details
            try {
                const shopRes = await shops.getMe();
                if (shopRes.data) {
                    setShop(shopRes.data);
                    setFormData({ 
                        name: shopRes.data.name, 
                        description: shopRes.data.description || '',
                        logo_url: shopRes.data.logo_url || '',
                        cover_image_url: shopRes.data.cover_image_url || ''
                    });
                }
            } catch (shopErr) {
                console.log("No store registered yet for this account.");
            }

            // 2. Fetch Analytics
            try {
                const analyticsRes = await shops.getAnalytics();
                if (analyticsRes.data) {
                    setAnalytics(analyticsRes.data);
                    if (!shop && analyticsRes.data.shop) {
                        setShop(analyticsRes.data.shop);
                    }
                }
            } catch (analyticsErr) {
                console.log("Analytics loading error:", analyticsErr);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        if (token) setAuthToken(token);
        try {
            if (shop) {
                const res = await shops.update(formData);
                setShop(res.data);
                setEditProfileOpen(false);
                alert("Store profile updated successfully!");
            } else {
                const res = await shops.create(formData);
                setShop(res.data);
                alert("Store created!");
                window.location.reload(); 
            }
        } catch (err) {
            alert("Error saving shop");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Store Analytics...
            </div>
        );
    }

    // New Store Creation Form if user doesn't own a store yet
    if (!shop) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 mb-1">Register Your Store on AI Plaza</h1>
                        <p className="text-slate-500 text-xs">Set up your vendor profile to begin listing products and taking orders.</p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                            <input 
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Apex Electronics"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                            <textarea 
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What products do you offer?"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white py-3.5 rounded-xl font-black text-sm"
                        >
                            {saving ? 'Creating Store...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const overview = analytics?.overview || {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        low_stock_count: 0
    };
    const breakdown = analytics?.orders_breakdown || {};
    const recentOrders = analytics?.recent_orders || [];
    const lowStockList = analytics?.low_stock_products || [];
    const trendingDemands = analytics?.trending_ai_demands || [];

    return (
        <div className="space-y-8 w-full max-w-full">
            {/* Store Profile Header Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {shop.logo_url ? (
                            <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="w-8 h-8 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{shop.name}</h1>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Live Store
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5 truncate max-w-md">{shop.description || "Official AI Plaza Vendor"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setEditProfileOpen(!editProfileOpen)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{editProfileOpen ? 'Close Editor' : 'Edit Profile'}</span>
                    </button>
                    <Link
                        href="/dashboard/products/new"
                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Profile Editor Collapse */}
            {editProfileOpen && (
                <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-200 animate-in fade-in space-y-4">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-[#A163F7]" /> Update Store Branding & Details
                    </h3>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                                <input 
                                    type="text"
                                    value={formData.logo_url}
                                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Cover Banner URL</label>
                            <input 
                                type="text"
                                value={formData.cover_image_url}
                                onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Store Description</label>
                            <textarea 
                                rows={2}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#A163F7] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md"
                        >
                            {saving ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>
            )}

            {/* 1. SELLER STORE KPIS (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400">Total Store Sales</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#A163F7] flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            Rs. {overview.total_sales.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Earnings via COD</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400">Store Orders</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#6F88FC] flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            {overview.total_orders}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                            {breakdown.completed || 0} completed &bull; {breakdown.pending || 0} pending
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400">Listed Products</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#45E3FF] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#161226]" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            {overview.total_products}
                        </h3>
                        <Link href="/dashboard/products" className="text-[10px] text-[#6F88FC] font-bold mt-1 inline-block hover:underline">
                            Manage Inventory &rarr;
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400">Low Stock Alerts</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF7582] flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            {overview.low_stock_count}
                        </h3>
                        <p className="text-[10px] text-[#FF7582] font-semibold mt-1">
                            {overview.low_stock_count > 0 ? "Requires restock" : "All items in stock"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. 🔥 AI SHOPPER DEMAND & RESTOCK RECOMMENDATIONS (New Feature) */}
            <div className="bg-white rounded-3xl border border-purple-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#FF7582] text-white flex items-center justify-center shadow-xs">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                High Demand Customer Queries (AI Shopping Insights)
                                <span className="bg-[#A163F7]/10 text-[#A163F7] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    Live Insights
                                </span>
                            </h3>
                            <p className="text-slate-400 text-xs">
                                Products customers are actively asking the AI Assistant for — Add these to your catalog to capture unfulfilled sales!
                            </p>
                        </div>
                    </div>
                    <Link 
                        href="/dashboard/products/new"
                        className="bg-[#A163F7] hover:bg-[#8738F6] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="w-3.5 h-3.5" /> List New Product
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {trendingDemands.map((demand: any) => (
                        <div 
                            key={demand.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#A163F7] hover:bg-purple-50/20 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                        <Tag className="w-2.5 h-2.5 text-[#6F88FC]" /> {demand.category_hint}
                                    </span>
                                    <span className="bg-purple-100 text-[#A163F7] text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {demand.request_count} Search{demand.request_count > 1 ? 'es' : ''}
                                    </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                    "{demand.query_text}"
                                </h4>
                            </div>

                            <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                <span className={demand.had_direct_match ? "text-emerald-600 font-bold" : "text-[#FF7582] font-black"}>
                                    {demand.had_direct_match ? "✓ In Demand" : "⚡ Restock Needed"}
                                </span>
                                <Link 
                                    href="/dashboard/products/new"
                                    className="text-[#6F88FC] font-bold hover:underline"
                                >
                                    + Add Item
                                </Link>
                            </div>
                        </div>
                    ))}

                    {trendingDemands.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                            Shopper queries from the AI Assistant will automatically appear here to guide your inventory restocking.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. RECENT ORDERS & LOW STOCK ITEMS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Recent Orders (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-900">Recent Customer Orders</h3>
                        <Link href="/dashboard/orders" className="text-xs font-bold text-[#6F88FC] hover:underline">
                            View All Orders &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="p-3.5">Order ID</th>
                                    <th className="p-3.5">Customer</th>
                                    <th className="p-3.5">Amount</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {recentOrders.map((ord: any) => (
                                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-slate-900">#{ord.id}</td>
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900">{ord.guest_name}</div>
                                            <div className="text-[10px] text-slate-400">{ord.guest_phone}</div>
                                        </td>
                                        <td className="p-3.5 font-black text-[#161226]">Rs. {ord.total_amount.toLocaleString()}</td>
                                        <td className="p-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                                'bg-purple-100 text-[#A163F7]'
                                            }`}>
                                                {ord.status}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-[10px] text-slate-400">
                                            {new Date(ord.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {recentOrders.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No orders placed yet for this store.
                        </div>
                    )}
                </div>

                {/* Low Stock Items (4 cols) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-[#FF7582]" /> Low Stock Warnings
                        </h3>
                        <span className="text-xs font-bold text-[#FF7582]">{lowStockList.length}</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {lowStockList.map((item: any) => (
                            <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                                        <span className="text-[10px] text-slate-400">Rs. {item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className="bg-rose-50 text-[#FF7582] text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                                    {item.stock_quantity} left
                                </span>
                            </div>
                        ))}
                    </div>

                    {lowStockList.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            All products have sufficient inventory.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
