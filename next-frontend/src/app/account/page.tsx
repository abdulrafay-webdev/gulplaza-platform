"use client";

import { useEffect, useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { customers } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

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
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [customer, isLoaded]);

    if (!isLoaded) return <div>Loading...</div>;
    if (!customer) return <PublicLayout><div className="p-12 text-center">Please <Link href="/login" className="text-secondary font-bold">Login</Link> to view your account.</div></PublicLayout>;

    return (
        <PublicLayout>
            <div className="max-w-5xl mx-auto py-6 md:py-10 px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">Welcome, {customer.full_name}</h1>
                        <p className="text-text-secondary text-sm md:text-base">{customer.email || customer.phone}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full md:w-auto bg-gray-100 text-text-primary px-6 py-2.5 rounded-lg hover:bg-red-50 hover:text-error transition-all font-bold text-sm shadow-sm"
                    >
                        Logout Account
                    </button>
                </div>

                <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">Your Orders</h2>
                    </div>
                    
                    {loading ? (
                        <div className="p-12 text-center text-text-secondary">Loading your data...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center text-text-secondary">
                            You haven't placed any orders yet.
                            <br/>
                            <Link href="/" className="text-secondary font-bold hover:underline mt-2 inline-block">Start Shopping</Link>
                        </div>
                    ) : (
                        <div>
                            {/* Mobile: Card-based List (Hidden on Desktop) */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {orders.map(order => (
                                    <div key={order.id} className="p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-bold text-primary">Order #{order.id}</div>
                                                <div className="text-[10px] text-text-secondary uppercase mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                                            <div className="text-xs font-bold text-text-primary">Total: ${order.total_amount.toFixed(2)}</div>
                                            <Link 
                                                href={`/account/orders/${order.id}`} 
                                                className="text-secondary font-bold text-xs uppercase hover:underline"
                                            >
                                                Track Order →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop: Professional Table (Hidden on Mobile) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 text-text-secondary uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {orders.map(order => (
                                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-bold text-primary">#{order.id}</td>
                                                <td className="p-4 text-sm text-text-secondary">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 font-bold text-text-primary">
                                                    ${order.total_amount.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link href={`/account/orders/${order.id}`} className="text-secondary font-bold text-sm hover:underline">
                                                        Track Order
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
