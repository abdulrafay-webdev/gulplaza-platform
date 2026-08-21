"use client";

import { useEffect, useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { customers } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { User, ShoppingBag, Truck, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
    const { customer, logout, isLoaded } = useCustomer();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        if (!customer) return;

        const loadOrders = async () => {
            try {
                const res = await customers.getOrders();
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to load orders", err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [customer, isLoaded]);

    if (!isLoaded) return <div className="p-12 text-center text-slate-400 font-bold">Loading Account...</div>;
    if (!customer) return (
        <PublicLayout>
            <div className="max-w-md mx-auto py-24 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 text-[#A163F7]">
                    <User className="w-8 h-8 opacity-60" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Customer Account</h2>
                <p className="text-slate-500 text-xs mb-6">Please log in to your customer account to view your past orders.</p>
                <Link href="/login" className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md inline-block">
                    Customer Login
                </Link>
            </div>
        </PublicLayout>
    );

    return (
        <PublicLayout>
            <div className="max-w-5xl mx-auto py-4 w-full max-w-full">
                {/* User Welcome Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#A163F7] to-[#6F88FC] flex items-center justify-center text-white font-black text-xl shadow-md">
                            {customer.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{customer.full_name}</h1>
                            <p className="text-slate-500 text-xs font-semibold">{customer.email || customer.phone}</p>
                        </div>
                    </div>

                    <button 
                        onClick={logout}
                        className="bg-slate-100 hover:bg-rose-50 hover:text-[#FF7582] text-slate-700 px-5 py-2.5 rounded-xl transition-all font-bold text-xs border border-slate-200"
                    >
                        Log Out Account
                    </button>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-[#A163F7]" /> Your Orders History
                        </h2>
                        <span className="text-xs font-bold text-slate-400">{orders.length} orders</span>
                    </div>
                    
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-semibold">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="font-bold text-sm">You haven't placed any orders yet.</p>
                            <Link href="/" className="text-[#6F88FC] font-bold text-xs hover:underline mt-2 inline-block">
                                Explore Gul Plaza &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {orders.map(order => (
                                <div key={order.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-900 text-sm">Order #{order.id}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500">
                                            Total: <strong className="text-[#161226]">Rs. {order.total_amount.toLocaleString()}</strong> (Cash on Delivery)
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                            order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                            'bg-purple-100 text-[#A163F7]'
                                        }`}>
                                            {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                            {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                            {order.status !== 'completed' && order.status !== 'cancelled' && <Clock className="w-3 h-3" />}
                                            {order.status}
                                        </span>

                                        <Link 
                                            href={`/account/orders/${order.id}`}
                                            className="text-xs font-bold text-[#6F88FC] hover:text-[#A163F7] flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
                                        >
                                            Details <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
