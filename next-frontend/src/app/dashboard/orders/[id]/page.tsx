"use client";

import { useEffect, useState, use } from 'react';
import { useSeller } from '@/context/SellerContext';
import { orders, setAuthToken } from '@/services/api';

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useSeller();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (token) setAuthToken(token);
            try {
                const res = await orders.get(id);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) loadOrder();
    }, [id, token]);

    const handleStatusChange = async (newStatus: string) => {
        if (token) setAuthToken(token);
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
        <div className="max-w-3xl mx-auto px-4 md:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-primary uppercase tracking-tight">Order Details #{order.id}</h1>
                <div className="flex flex-wrap gap-2">
                    {order.status !== 'COMPLETED' && (
                        <button 
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="bg-success text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition-colors"
                        >
                            Mark Completed
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-surface p-5 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-text-primary border-b border-gray-100 pb-2 mb-3 uppercase text-xs tracking-wider">Customer</h3>
                        {order.guest_name ? (
                            <div className="text-sm space-y-1.5">
                                <p className="flex justify-between md:block"><span className="text-text-secondary font-medium">Name:</span> <span className="font-bold">{order.guest_name}</span></p>
                                <p className="flex justify-between md:block"><span className="text-text-secondary font-medium">Email:</span> <span className="font-medium">{order.guest_email}</span></p>
                                <p className="flex justify-between md:block"><span className="text-text-secondary font-medium">Phone:</span> <span className="font-bold">{order.guest_phone}</span></p>
                            </div>
                        ) : (
                            <div>
                                <span className="text-text-secondary text-xs block mb-1">Customer ID</span>
                                <span className="font-mono text-xs bg-gray-50 p-1 rounded border">{order.customer_clerk_id}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary border-b border-gray-100 pb-2 mb-3 uppercase text-xs tracking-wider">Shipping Address</h3>
                        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                            {order.guest_address || "No address provided"}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-gray-100">
                    <div>
                        <span className="text-text-secondary text-[10px] md:text-xs uppercase font-bold block mb-1">Placed On</span>
                        <span className="text-text-primary font-medium text-xs md:text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-text-secondary text-[10px] md:text-xs uppercase font-bold block mb-1">Status</span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ring-1 ring-amber-200">{order.status}</span>
                    </div>
                </div>
                
                <h3 className="font-bold text-text-primary border-b border-gray-100 pb-2 mb-5 uppercase text-xs tracking-wider">Items Summary</h3>
                <div className="space-y-5">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 md:gap-4 border-b border-gray-50 pb-5 last:border-0">
                            <div className="h-14 w-14 md:h-16 md:w-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 shadow-inner">
                                {item.product?.image_url ? (
                                    <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold italic">No Pic</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-bold text-text-primary text-sm md:text-base block truncate">{item.product?.name || `Product #${item.product_id}`}</span>
                                <span className="text-text-secondary text-xs">Qty: {item.quantity} × ${item.price_at_purchase}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-text-primary text-sm md:text-base">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-between items-center bg-primary text-white p-5 rounded-xl shadow-md">
                    <span className="font-bold uppercase tracking-widest text-xs opacity-80">Total Payout</span>
                    <span className="text-2xl md:text-3xl font-black">${order.total_amount.toFixed(2)}</span>
                </div>
                
                <div className="mt-10 border-t border-gray-100 pt-8">
                    <h3 className="font-bold text-text-primary mb-5 uppercase text-xs tracking-wider">Change Order Status</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={order.status === s}
                                className={`flex-1 min-w-[100px] md:min-w-0 py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-tighter transition-all shadow-sm ${
                                    order.status === s 
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-200' 
                                    : 'bg-white border border-gray-200 text-text-secondary hover:border-blue-400 hover:text-blue-600'
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
