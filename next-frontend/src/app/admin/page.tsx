"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { admin, setAuthToken } from '@/services/api';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Power, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { token, seller } = useSeller();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            if (token) setAuthToken(token);
            const res = await admin.getAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            console.error("Admin Access Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading AI Plaza Super Admin Intelligence...
            </div>
        );
    }

    const overview = analytics?.overview || {
        total_revenue: 0,
        total_orders: 0,
        total_shops: 0,
        approved_shops: 0,
        pending_shops: 0,
        active_shops: 0,
        total_products: 0,
        low_stock_products: 0,
        total_customers: 0,
        total_reviews: 0
    };

    const breakdown = analytics?.orders_breakdown || {};
    const topShops = analytics?.top_shops || [];
    const recentOrders = analytics?.recent_orders || [];

    return (
        <div className="space-y-8 w-full max-w-full">
            {/* Header Welcome Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">Platform Overview & Analytics</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Real-time marketplace revenue, store performance & order pipeline</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link 
                        href="/admin/shops"
                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-purple-500/20 flex items-center gap-1.5 hover:opacity-95 transition-all"
                    >
                        <Store className="w-3.5 h-3.5" />
                        <span>Manage Stores ({overview.total_shops})</span>
                    </Link>
                </div>
            </div>

            {/* 1. TOP ANALYTICS & REVENUE STATS (4 KPIs Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Gross Platform Sales</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#A163F7] flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            Rs. {overview.total_revenue.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> Unified COD Orders
                        </p>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
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

                {/* Stores & Approvals */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Stores (Approved/Pending)</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#45E3FF] flex items-center justify-center">
                            <Store className="w-4 h-4 text-[#161226]" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{overview.approved_shops}</h3>
                            <span className="text-xs font-black text-[#FF7582]">/ {overview.pending_shops} pending</span>
                        </div>
                        <Link href="/admin/shops" className="text-[10px] text-[#6F88FC] font-bold mt-1 inline-flex items-center gap-0.5 hover:underline">
                            View store approvals <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                    </div>
                </div>

                {/* Total Products & Low Stock */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Live Inventory Items</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF7582] flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            {overview.total_products}
                        </h3>
                        <p className="text-[10px] text-[#FF7582] font-bold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" /> {overview.low_stock_products} Low Stock Alert{overview.low_stock_products !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. ORDER FULFILLMENT BREAKDOWN & TOP SHOPS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Order Status Distribution (5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#6F88FC]" /> Order Status Pipeline
                        </h3>
                        <span className="text-xs font-bold text-slate-400">{overview.total_orders} total</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Completed / Delivered</span>
                                <span className="text-emerald-600">{breakdown.completed || 0} ({overview.total_orders > 0 ? Math.round(((breakdown.completed || 0)/overview.total_orders)*100) : 0}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.total_orders > 0 ? ((breakdown.completed || 0)/overview.total_orders)*100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Confirmed / In Progress</span>
                                <span className="text-[#6F88FC]">{breakdown.confirmed || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6F88FC] rounded-full" style={{ width: `${overview.total_orders > 0 ? ((breakdown.confirmed || 0)/overview.total_orders)*100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Pending Approval</span>
                                <span className="text-[#A163F7]">{breakdown.pending || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#A163F7] rounded-full" style={{ width: `${overview.total_orders > 0 ? ((breakdown.pending || 0)/overview.total_orders)*100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Cancelled</span>
                                <span className="text-[#FF7582]">{breakdown.cancelled || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FF7582] rounded-full" style={{ width: `${overview.total_orders > 0 ? ((breakdown.cancelled || 0)/overview.total_orders)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing Stores (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Store className="w-4 h-4 text-[#A163F7]" /> Top Performing Stores
                        </h3>
                        <Link href="/admin/shops" className="text-xs font-bold text-[#6F88FC] hover:underline flex items-center gap-0.5">
                            All Stores <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {topShops.slice(0, 4).map((ts: any, idx: number) => (
                            <div key={ts.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 font-mono font-black text-xs text-slate-400">0{idx+1}</span>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                                        {ts.logo_url ? (
                                            <img src={ts.logo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-slate-900">{ts.name}</h4>
                                        <span className="text-[10px] text-slate-400">{ts.products_count} products listed</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="font-black text-xs text-slate-900 block">Rs. {ts.total_sales.toLocaleString()}</span>
                                    <span className="text-[10px] text-emerald-600 font-semibold">Live Store</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. 🔥 AI MARKET DEMAND & SEARCH TRENDS (Platform Intelligence) */}
            <div className="bg-white rounded-3xl border border-purple-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#A163F7] animate-ping"></span>
                            AI Shopper Demand & Unmet Search Trends
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">Top product search queries from shoppers using the AI Shopping Assistant across AI Plaza</p>
                    </div>
                    <span className="bg-purple-100 text-[#A163F7] text-[10px] font-black px-2.5 py-1 rounded-full">
                        Market Demand
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {(analytics?.trending_ai_demands || []).map((demand: any) => (
                        <div 
                            key={demand.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                        {demand.category_hint}
                                    </span>
                                    <span className="bg-purple-100 text-[#A163F7] text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {demand.request_count} Search{demand.request_count > 1 ? 'es' : ''}
                                    </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                    "{demand.query_text}"
                                </h4>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                <span className={demand.had_direct_match ? "text-emerald-600 font-bold" : "text-[#FF7582] font-black"}>
                                    {demand.had_direct_match ? "✓ In Catalog" : "⚡ Restock Alert"}
                                </span>
                                <span className="text-slate-400">
                                    {new Date(demand.last_requested_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {(!analytics?.trending_ai_demands || analytics?.trending_ai_demands.length === 0) && (
                        <div className="col-span-full py-6 text-center text-slate-400 text-xs">
                            No shopper queries recorded yet.
                        </div>
                    )}
                </div>
            </div>

            {/* 4. RECENT PLATFORM ORDERS FEED */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Recent Platform Orders Feed</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Real-time incoming Cash on Delivery orders across all stores</p>
                    </div>
                    <span className="bg-purple-100 text-[#A163F7] text-[10px] font-black px-2.5 py-1 rounded-full">
                        Live Feed
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead>
                            <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer & Phone</th>
                                <th className="p-4">Assigned Store</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {recentOrders.map((ord: any) => (
                                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-4 font-mono font-black text-slate-900">#{ord.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{ord.customer_name}</div>
                                        <div className="text-[10px] text-slate-400">{ord.customer_phone}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-700">{ord.shop_name}</td>
                                    <td className="p-4 font-black text-[#161226]">Rs. {ord.total_amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                            ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                            ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                            'bg-purple-100 text-[#A163F7]'
                                        }`}>
                                            {ord.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[11px] text-slate-400">
                                        {new Date(ord.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {recentOrders.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">No orders recorded yet.</div>
                )}
            </div>
        </div>
    );
}
