"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export default function Cart({ onClose }: { onClose?: () => void }) {
    const { items, removeFromCart, updateQuantity } = useCart();
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={`bg-surface flex flex-col ${onClose ? 'h-full p-0' : 'p-5 rounded-none shadow-lg sticky top-24 border border-gray-100 max-h-[calc(100vh-120px)]'}`}>
            <div className={`flex justify-between items-center mb-4 ${onClose ? 'p-6 bg-primary text-white' : ''}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${onClose ? 'text-white' : 'text-primary'}`}>
                    <ShoppingBag className="w-5 h-5" />
                    Your Cart
                </h2>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-none transition-colors">
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
                    <div className="space-y-6">
                        {items.map(item => (
                            <div key={item.product_id} className="flex gap-3 border-b border-gray-50 pb-4 last:border-0">
                                {/* Product Image */}
                                <div className="h-16 w-16 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="w-4 h-4 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-text-primary text-xs truncate pr-2">{item.name}</p>
                                        <button 
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-gray-400 hover:text-error transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-200 rounded-none">
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-3 text-xs font-black text-primary border-x border-gray-200 min-w-[32px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="font-black text-primary text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
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
                        className="flex items-center justify-center gap-2 w-full bg-accent text-white text-center py-3.5 rounded-none font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-accent/20"
                    >
                        Checkout
                    </Link>
                </div>
            )}
        </div>
    );
}
