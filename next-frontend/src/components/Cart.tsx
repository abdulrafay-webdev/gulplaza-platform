"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function Cart({ onClose }: { onClose?: () => void }) {
    const { items, removeFromCart, updateQuantity } = useCart();
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className={`bg-white flex flex-col h-full ${onClose ? 'p-0' : 'p-5 rounded-2xl shadow-xl sticky top-24 border border-slate-200'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center ${onClose ? 'p-5 bg-[#161226] text-white border-b border-purple-900/30' : 'mb-4'}`}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#A163F7]/20 text-[#45E3FF] flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-black tracking-tight">Shopping Cart</h2>
                        <p className="text-[10px] text-slate-400 font-semibold">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
                    </div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
                {items.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-[#A163F7] mb-3">
                            <ShoppingBag className="w-8 h-8 opacity-60" />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm">Your cart is empty</h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
                            Browse our verified shops and add items to your cart!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.product_id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                                {/* Product Thumbnail */}
                                <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag className="w-5 h-5 opacity-30" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info & Controls */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-slate-900 text-xs truncate pr-2">{item.name}</p>
                                        <button 
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-slate-400 hover:text-[#FF7582] p-1 rounded-md transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        {/* Quantity Pill */}
                                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 disabled:opacity-30 transition-all"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-6 text-center text-xs font-black text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-all"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <p className="font-black text-slate-950 text-xs">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer with Checkout CTA */}
            {items.length > 0 && (
                <div className="p-5 bg-slate-50 border-t border-slate-200">
                    <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>Rs. {total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Delivery</span>
                            <span className="text-[#6F88FC] font-bold">Standard COD</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                            <span>Total Amount</span>
                            <span className="text-base text-[#A163F7]">Rs. {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link 
                        href="/checkout"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] text-white text-center py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all active:scale-95"
                    >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-[#45E3FF]" /> Cash on Delivery</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#A163F7]" /> Safe & Secure</span>
                    </div>
                </div>
            )}
        </div>
    );
}
