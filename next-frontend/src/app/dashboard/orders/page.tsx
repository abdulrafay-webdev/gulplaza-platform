"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { orders, setAuthToken } from '@/services/api';
import Link from 'next/link';

export default function OrderList() {
    const { token } = useSeller();
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (token) setAuthToken(token);
            try {
                const res = await orders.list();
                setOrderList(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) loadOrders();
    }, [token]);

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-primary tracking-tight uppercase">Incoming Orders</h1>
            
            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {orderList.map(order => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block">
                        <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-bold text-primary">Order #{order.id}</div>
                                    <div className="text-[10px] text-text-secondary uppercase font-medium mt-0.5">{new Date(order.created_at).toLocaleString()}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                <div className="flex -space-x-2">
                                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-gray-50">
                                            {item.product?.image_url && <img src={item.product.image_url} className="h-full w-full object-cover" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-text-secondary">Total Amount</div>
                                    <div className="font-bold text-text-primary text-base">${order.total_amount.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-wider text-center pt-1">Tap to view full details</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-surface rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Order Info</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Products</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {orderList.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-primary">#{order.id}</div>
                                    <div className="text-[10px] text-text-secondary uppercase font-medium">{order.guest_name || 'Buyer'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5">
                                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full ring-1 ring-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                                                    {item.product?.image_url ? (
                                                        <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-[6px] text-gray-400">?</div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-text-primary font-medium truncate max-w-[150px]" title={item.product?.name}>
                                                    {item.product?.name || `Product #${item.product_id}`}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="text-[10px] text-text-secondary pl-8 font-medium">
                                                +{order.items.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {new Date(order.created_at).toLocaleDateString()} <br/>
                                    <span className="text-xs opacity-75">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${
                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-primary">
                                    ${order.total_amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link 
                                        href={`/dashboard/orders/${order.id}`}
                                        className="text-secondary font-bold text-sm hover:underline"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
