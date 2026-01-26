"use client";

import { useEffect, useState, use } from 'react';
import { useAuth } from '@clerk/nextjs';
import { orders, setAuthToken } from '@/services/api';

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { getToken } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            const token = await getToken();
            setAuthToken(token);
            try {
                const res = await orders.get(id);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id, getToken]);

    const handleStatusChange = async (newStatus: string) => {
        const token = await getToken();
        setAuthToken(token);
        try {
            await orders.updateStatus(id, newStatus);
            setOrder({ ...order, status: newStatus });
            alert("Status updated");
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading order...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                <div className="space-x-2">
                    {order.status !== 'COMPLETED' && (
                        <button 
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold"
                        >
                            Mark as Completed
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-bold border-b pb-2 mb-2">Customer Details</h3>
                        {order.guest_name ? (
                            <div className="text-sm space-y-1">
                                <p><span className="font-medium">Name:</span> {order.guest_name}</p>
                                <p><span className="font-medium">Email:</span> {order.guest_email}</p>
                                <p><span className="font-medium">Phone:</span> {order.guest_phone}</p>
                            </div>
                        ) : (
                            <div>
                                <span className="text-gray-500 text-sm block">Customer ID</span>
                                <span className="font-mono text-sm">{order.customer_clerk_id}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold border-b pb-2 mb-2">Shipping Address</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {order.guest_address || "No address provided"}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t">
                    <div>
                        <span className="text-gray-500 text-sm block">Total Amount</span>
                        <span className="font-bold text-xl">${order.total_amount}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 text-sm block">Status</span>
                        <span className="font-bold uppercase">{order.status}</span>
                    </div>
                </div>
                
                <h3 className="font-bold border-b pb-2 mb-4">Items</h3>
                <div className="space-y-3">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                            <div>
                                <span className="font-bold">{item.product?.name || `Product #${item.product_id}`}</span>
                                <span className="text-gray-500 block">Qty: {item.quantity}</span>
                            </div>
                            <span>${item.price_at_purchase * item.quantity}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 border-t pt-6">
                    <h3 className="font-bold mb-4">Update Status</h3>
                    <div className="flex gap-2">
                        {['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={order.status === s}
                                className={`px-4 py-2 rounded text-sm capitalize ${
                                    order.status === s 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
