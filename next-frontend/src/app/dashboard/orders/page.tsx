"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { orders, setAuthToken } from '@/services/api';
import { Package, RefreshCw, Phone, MapPin, User, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function OrderList() {
    const { token } = useSeller();
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const loadOrders = async () => {
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('aiplaza_seller_token') : null);
        if (activeToken) {
            setAuthToken(activeToken);
        }
        try {
            const res = await orders.list();
            setOrderList(res.data || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [token]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const filteredOrders = orderList.filter(order => {
        if (statusFilter === 'all') return true;
        return order.status?.toLowerCase() === statusFilter.toLowerCase();
    });

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'confirmed':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'cancelled':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    if (loading && !refreshing) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Store Orders...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Orders</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Manage incoming purchases, customer shipping details & fulfillment</p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="self-start sm:self-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh Orders'}</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                {['all', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map((tab) => {
                    const isActive = statusFilter === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-[#A163F7] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
            
            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredOrders.map(order => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block">
                        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4 hover:border-[#A163F7] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-black text-slate-900">Order #{order.id}</div>
                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(order.created_at).toLocaleString()}</div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600">
                                <div className="font-bold text-slate-900">{order.guest_name || 'Customer'}</div>
                                {order.guest_phone && <div className="text-slate-500 text-[11px]">📞 {order.guest_phone}</div>}
                                {order.guest_address && <div className="text-slate-500 text-[11px] truncate">📍 {order.guest_address}</div>}
                            </div>

                            {/* Ordered Items Preview */}
                            {order.items && order.items.length > 0 && (
                                <div className="space-y-1 pt-1">
                                    {order.items.slice(0, 2).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                                            <span className="truncate max-w-[200px]">
                                                • {item.product?.name || `Product #${item.product_id}`}
                                            </span>
                                            <span className="font-bold text-slate-900">x{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className="text-[10px] text-slate-400">+{order.items.length - 2} more item(s)</div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</div>
                                    <div className="font-black text-[#161226] text-base">Rs. {Number(order.total_amount || 0).toLocaleString()}</div>
                                </div>
                                <div className="text-[11px] font-bold text-[#6F88FC] flex items-center gap-1">
                                    View Details &rarr;
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-3xl shadow-xs overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80">
                        <tr className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="px-6 py-4 text-left">Order Info</th>
                            <th className="px-6 py-4 text-left">Customer & Address</th>
                            <th className="px-6 py-4 text-left">Products Ordered</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Total (COD)</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-black text-slate-900">#{order.id}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                        {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-slate-900">{order.guest_name || 'Customer'}</div>
                                    <div className="text-[11px] text-slate-500">{order.guest_phone || 'N/A'}</div>
                                    <div className="text-[10px] text-slate-400 max-w-[200px] truncate">{order.guest_address || 'Karachi'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                                                    {item.product?.name || `Product #${item.product_id}`}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#161226]">
                                    Rs. {Number(order.total_amount || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link 
                                        href={`/dashboard/orders/${order.id}`}
                                        className="text-[#6F88FC] font-bold text-xs hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Manage</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredOrders.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-black text-slate-900">No Orders Found</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        Customer orders placed on the marketplace will appear here in real time.
                    </p>
                </div>
            )}
        </div>
    );
}
