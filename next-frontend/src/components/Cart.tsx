"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { X, ShoppingBag } from 'lucide-react';

export default function Cart({ onClose }: { onClose?: () => void }) {
    const { items, removeFromCart } = useCart();
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={`bg-surface flex flex-col ${onClose ? 'h-full p-0' : 'p-5 rounded-2xl shadow-lg sticky top-24 border border-gray-100 max-h-[calc(100vh-120px)]'}`}>
            <div className={`flex justify-between items-center mb-4 ${onClose ? 'p-6 bg-primary text-white' : ''}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${onClose ? 'text-white' : 'text-primary'}`}>
                    <ShoppingBag className="w-5 h-5" />
                    Your Cart
                </h2>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>
            
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${onClose ? 'px-6' : 'px-1'}`}>
                {items.length === 0 ? (
                    <div className="py-12 text-center">
                        <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-text-secondary font-medium italic text-xs">Empty cart...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.product_id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-text-primary text-xs truncate">{item.name}</p>
                                    <p className="text-text-secondary text-[10px] mt-0.5 font-medium">Qty: {item.quantity}</p>
                                    <button 
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="text-error text-[9px] font-black uppercase tracking-widest hover:underline mt-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-primary text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {items.length > 0 && (
                <div className={`border-t border-gray-100 ${onClose ? 'p-6 bg-gray-50/50' : 'mt-4 pt-4 bg-white'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-text-secondary uppercase text-[9px] font-black tracking-widest">Total</span>
                        <span className="text-xl font-black text-primary tracking-tighter">${total.toFixed(2)}</span>
                    </div>

                    <Link 
                        href="/checkout"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full bg-accent text-white text-center py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-accent/20"
                    >
                        Checkout
                    </Link>
                </div>
            )}
        </div>
    );
}
