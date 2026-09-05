"use client";

import { useEffect, useState, use } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { products } from '@/services/api'; // Reusing products.get or making a specific orders.get
import { orders as ordersApi } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { customer, isLoaded } = useCustomer();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !customer) return;

        const loadOrder = async () => {
            try {
                // Note: The /orders/{id} endpoint currently uses Clerk token. 
                // I need to ensure the backend supports Customer JWT for this too.
                const res = await ordersApi.get(id);
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to load order");
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id, customer, isLoaded]);

    if (!isLoaded || loading) return <PublicLayout><div className="p-12 text-center">Loading Tracking Info...</div></PublicLayout>;
    if (!order) return <PublicLayout><div className="p-12 text-center text-error">Order not found or access denied.</div></PublicLayout>;

    const statusSteps = ["pending", "confirmed", "shipped", "completed"];
    const currentStatusIdx = statusSteps.indexOf(order.status.toLowerCase());

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto py-6 md:py-10 px-4">
                <Link href="/account" className="text-text-secondary hover:text-primary mb-6 flex items-center gap-2 transition-colors text-sm font-bold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to My Account
                </Link>

                <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 md:mb-12">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">Order Tracking</h1>
                            <p className="text-text-secondary text-sm">Order ID: <span className="font-mono font-bold text-text-primary">#{order.id}</span></p>
                        </div>
                        <div className="md:text-right">
                            <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Status</span>
                            <span className="bg-[#A163F7] text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold uppercase tracking-wide shadow-sm inline-block">
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar UI */}
                    <div className="relative mb-12 md:mb-16 px-2">
                        <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                        <div 
                            className="absolute top-4 left-0 h-1 bg-success -translate-y-1/2 transition-all duration-1000 rounded-full" 
                            style={{ width: `${(currentStatusIdx / (statusSteps.length - 1)) * 100}%` }}
                        ></div>
                        
                        <div className="relative flex justify-between">
                            {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center">
                                    <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center border-4 transition-colors z-10 ${
                                        idx <= currentStatusIdx ? 'bg-success border-success text-white' : 'bg-white border-gray-100 text-gray-300'
                                    }`}>
                                        <span className="text-[10px] md:text-xs font-bold">{idx < currentStatusIdx ? '✓' : idx + 1}</span>
                                    </div>
                                    <span className={`mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-center ${idx <= currentStatusIdx ? 'text-success' : 'text-gray-300'}`}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 border-t border-gray-50 pt-10 md:pt-12">
                        <div>
                            <h3 className="font-bold text-text-primary mb-5 text-base md:text-lg uppercase tracking-tight">Order Items</h3>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3 md:gap-4">
                                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden shadow-inner">
                                            {item.product?.image_url && <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-text-primary text-sm md:text-base block truncate">{item.product?.name || 'Product'}</span>
                                            <span className="text-text-secondary text-xs">Quantity: {item.quantity}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-text-primary text-sm md:text-base">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center px-1">
                                <span className="font-bold text-text-secondary text-sm">Total Paid</span>
                                <span className="text-xl md:text-2xl font-extrabold text-primary">${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-text-primary mb-5 text-base md:text-lg uppercase tracking-tight">Delivery Info</h3>
                            <div className="bg-gray-50 p-5 md:p-6 rounded-xl border border-gray-100 space-y-5 shadow-inner">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-text-secondary block mb-0.5">Receiver Name</span>
                                    <span className="text-text-primary font-bold text-sm md:text-base">{order.guest_name || customer?.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-text-secondary block mb-0.5">Shipping Address</span>
                                    <span className="text-text-primary font-medium text-sm md:text-base leading-relaxed">{order.guest_address}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-text-secondary block mb-0.5">Contact Number</span>
                                    <span className="text-text-primary font-bold text-sm md:text-base">{order.guest_phone || customer?.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
