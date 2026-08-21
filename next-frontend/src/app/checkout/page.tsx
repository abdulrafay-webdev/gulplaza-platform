"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { cart } from '@/services/api';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

import { useCustomer } from '@/context/CustomerContext';

export default function Checkout() {
    const { items, clearCart } = useCart();
    const { customer, isLoaded: customerLoaded } = useCustomer();
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    
    // Form State
    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: ''
    });

    // Pre-fill form if customer is logged in
    useEffect(() => {
        if (customerLoaded && customer) {
            setFormData(prev => ({
                ...prev,
                guest_name: customer.full_name || '',
                guest_email: customer.email || '',
                guest_phone: customer.phone || '',
            }));
        }
    }, [customer, customerLoaded]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Group items by shop to show split summary
    const shopMap = items.reduce((acc: Record<string | number, typeof items>, item) => {
        const sid = item.shop_id || 'default';
        if (!acc[sid]) acc[sid] = [];
        acc[sid].push(item);
        return acc;
    }, {});
    const distinctShopsCount = Object.keys(shopMap).length;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;
        
        setLoading(true);
        setErrorMessage(null);

        try {
            await cart.checkout({
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                })),
                ...formData
            });
            
            clearCart();
            setOrderPlaced(true);
        } catch (error: any) {
            console.error("Checkout error:", error);
            setErrorMessage(error?.response?.data?.detail || "Checkout failed. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <PublicLayout>
                <div className="max-w-xl mx-auto py-16 px-4 text-center w-full max-w-full">
                    <div className="w-20 h-20 rounded-full bg-purple-50 text-[#A163F7] flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        Thank you for ordering through <strong className="text-slate-900">AI Plaza Marketplace</strong>. Your order has been dispatched directly to the corresponding store owners. You will pay via <span className="text-[#A163F7] font-bold">Cash on Delivery</span> upon delivery.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-left mb-8 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Payment Method:</span>
                            <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Customer Name:</span>
                            <span className="font-bold text-slate-900">{formData.guest_name}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Phone Number:</span>
                            <span className="font-bold text-slate-900">{formData.guest_phone}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Delivery Address:</span>
                            <span className="font-bold text-slate-900">{formData.guest_address}</span>
                        </div>
                    </div>

                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 bg-[#161226] hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    if (items.length === 0) {
        return (
            <PublicLayout>
                <div className="max-w-md mx-auto text-center py-24 px-4">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 text-[#A163F7]">
                        <ShoppingBag className="w-8 h-8 opacity-60" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-slate-500 text-xs mb-6">Explore the AI Plaza store directory to pick items.</p>
                    <Link 
                        href="/" 
                        className="inline-block bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md hover:opacity-95"
                    >
                        Browse Products
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-5xl mx-auto py-4 w-full max-w-full">
                <div className="flex items-center gap-2 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
                    <span className="bg-purple-100 text-[#A163F7] text-xs font-black px-3 py-1 rounded-full">
                        Cash on Delivery
                    </span>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-[#FF7582] text-xs font-bold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT: Shipping Form (7 cols) */}
                    <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-[#6F88FC]" />
                                1. Delivery & Contact Details
                            </h2>
                            <p className="text-slate-500 text-xs">Enter your delivery address and active phone number for COD confirmation.</p>
                        </div>

                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                                </label>
                                <input 
                                    type="text" 
                                    name="guest_name" 
                                    required
                                    placeholder="e.g. Muhammad Ali"
                                    value={formData.guest_name} 
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number (WhatsApp) *
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="guest_phone" 
                                        required
                                        placeholder="0300-1234567"
                                        value={formData.guest_phone} 
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Email (Optional)
                                    </label>
                                    <input 
                                        type="email" 
                                        name="guest_email" 
                                        placeholder="name@example.com"
                                        value={formData.guest_email} 
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Complete Delivery Address *
                                </label>
                                <textarea 
                                    name="guest_address" 
                                    required
                                    rows={3}
                                    placeholder="House/Apartment #, Street, Area/Sector, City"
                                    value={formData.guest_address} 
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A163F7] focus:border-[#A163F7] transition-all"
                                />
                            </div>

                            {/* Payment Notice */}
                            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-3">
                                <Truck className="w-5 h-5 text-[#A163F7] flex-shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <h4 className="font-bold text-purple-950">Payment: Cash on Delivery (COD)</h4>
                                    <p className="text-purple-800 mt-0.5 leading-relaxed">
                                        No advance payment required. You will hand over the cash when the courier delivers your parcel.
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] hover:opacity-95 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <span>Confirm Order (Rs. {total.toLocaleString()})</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Order Summary (5 cols) */}
                    <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                                <ShoppingBag className="w-4 h-4 text-[#A163F7]" />
                                Order Summary ({totalCount} items)
                            </h2>
                            {distinctShopsCount > 1 && (
                                <p className="text-[11px] text-[#A163F7] bg-purple-50 px-2.5 py-1 rounded-lg font-semibold mt-2 border border-purple-200">
                                    Notice: Items are from {distinctShopsCount} different stores. They will be fulfilled by the respective shops.
                                </p>
                            )}
                        </div>

                        {/* Items list */}
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                            {items.map(item => (
                                <div key={item.product_id} className="py-3 first:pt-0 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ShoppingBag className="w-4 h-4 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} &times; Rs. {item.price.toLocaleString()}</p>
                                    </div>
                                    <span className="font-black text-xs text-slate-900">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>Rs. {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Charges</span>
                                <span className="text-[#6F88FC] font-bold">Standard COD</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                                <span>Total Payable</span>
                                <span className="text-base text-[#A163F7]">Rs. {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#6F88FC]" /> Direct Store Fulfillment</span>
                            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#45E3FF]" /> COD</span>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
