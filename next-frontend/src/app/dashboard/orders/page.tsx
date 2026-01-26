"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { orders, setAuthToken } from '@/services/api';
import Link from 'next/link';

export default function OrderList() {
    const { getToken } = useAuth();
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            const token = await getToken();
            setAuthToken(token);
            try {
                const res = await orders.list();
                setOrderList(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [getToken]);

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orderList.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">${order.total_amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline">
                                    <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
