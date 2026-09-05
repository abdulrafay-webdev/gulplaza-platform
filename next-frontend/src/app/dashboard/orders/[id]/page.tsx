"use client";

import { useEffect, useState, use } from 'react';
import { useSeller } from '@/context/SellerContext';
import { orders, setAuthToken } from '@/services/api';
import { Package, ArrowLeft, CheckCircle2, Truck, Clock, XCircle, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useSeller();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('aiplaza_seller_token') : null);
            if (activeToken) setAuthToken(activeToken);
            try {
                const res = await orders.get(id);
                setOrder(res.data);
            } catch (err) {
                console.error('Failed to load order:', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id, token]);

    const handleStatusChange = async (newStatus: string) => {
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('aiplaza_seller_token') : null);
        if (activeToken) setAuthToken(activeToken);
        try {
            setUpdating(true);
            await orders.updateStatus(id, newStatus);
            setOrder({ ...order, status: newStatus });
            alert(`Order status successfully updated to "${newStatus.toUpperCase()}"!`);
        } catch (err) {
            console.error('Update status error:', err);
            alert("Failed to update status. Please make sure you have vendor authorization.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Order Details...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="py-16 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
                <Link href="/dashboard/orders" className="text-[#6F88FC] font-bold text-xs hover:underline">
                    &larr; Return to Orders
                </Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered / Completed' };
            case 'shipped':
                return { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Dispatched / Shipped' };
            case 'confirmed':
                return { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Confirmed' };
            case 'cancelled':
                return { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Cancelled' };
            default:
                return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending Processing' };
        }
    };

    const statusBadge = getStatusStyle(order.status);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Navigation */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/orders"
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Order #{order.id}</h1>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${statusBadge.bg} self-start sm:self-auto`}>
                    {statusBadge.label}
                </span>
            </div>

            {/* Main Order Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-8">
                {/* Customer & Shipping Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                            <User className="w-4 h-4 text-[#A163F7]" /> Customer Information
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="font-bold text-slate-900 text-sm">{order.guest_name || 'Customer Shopper'}</div>
                            <div className="text-slate-600 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{order.guest_phone || 'Not provided'}</span>
                            </div>
                            {order.guest_email && (
                                <div className="text-slate-500 text-[11px]">{order.guest_email}</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                            <MapPin className="w-4 h-4 text-[#6F88FC]" /> Shipping & Delivery Address
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                            {order.guest_address || "Gul Plaza area, Karachi, Pakistan"}
                        </div>
                    </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Ordered Items ({order.items?.length || 0})
                    </h3>

                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                        {order.items?.map((item: any) => (
                            <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                        {item.product?.image_url ? (
                                            <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex flex-wrap items-center gap-1.5">
                                            <span>{item.product?.name || `Product #${item.product_id}`}</span>
                                            {item.variant_name && (
                                                <span className="inline-flex items-center text-[10px] sm:text-[11px] font-black text-[#A163F7] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                                    Option: {item.variant_name}
                                                </span>
                                            )}
                                        </h4>
                                        <div className="text-[11px] text-slate-400">
                                            Rs. {Number(item.price_at_purchase || 0).toLocaleString()} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs sm:text-sm font-black text-slate-900">
                                        Rs. {(item.price_at_purchase * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Payout Bar */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                            Total Order Value (Cash on Delivery)
                        </span>
                        <span className="text-xs text-slate-300">Payment collected upon parcel handover</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                        Rs. {Number(order.total_amount || 0).toLocaleString()}
                    </div>
                </div>

                {/* Status Update Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Update Fulfillment Status
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                            { key: 'pending', label: 'Pending', color: 'hover:border-amber-400 hover:text-amber-600' },
                            { key: 'confirmed', label: 'Confirm', color: 'hover:border-purple-400 hover:text-purple-600' },
                            { key: 'shipped', label: 'Ship Out', color: 'hover:border-blue-400 hover:text-blue-600' },
                            { key: 'completed', label: 'Delivered', color: 'hover:border-emerald-400 hover:text-emerald-600' },
                            { key: 'cancelled', label: 'Cancel', color: 'hover:border-rose-400 hover:text-rose-600' },
                        ].map(({ key, label, color }) => {
                            const isCurrent = order.status?.toLowerCase() === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    disabled={isCurrent || updating}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isCurrent
                                            ? 'bg-[#A163F7] text-white shadow-xs'
                                            : `bg-slate-100 text-slate-600 border border-slate-200 ${color}`
                                    }`}
                                >
                                    {isCurrent ? `✓ ${label}` : label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
