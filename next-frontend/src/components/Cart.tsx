"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function Cart() {
    const { items, removeFromCart } = useCart();
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="bg-surface p-6 rounded-lg shadow-sm sticky top-4 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-text-primary">Your Cart</h2>
            
            {items.length === 0 ? (
                <p className="text-text-secondary">Cart is empty</p>
            ) : (
                <>
                    <div className="space-y-4 mb-6">
                        {items.map(item => (
                            <div key={item.product_id} className="flex justify-between text-sm">
                                <div>
                                    <p className="font-medium text-text-primary">{item.name}</p>
                                    <p className="text-text-secondary">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-text-primary">${item.price * item.quantity}</p>
                                    <button 
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="text-error text-xs hover:underline mt-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between font-bold text-text-primary">
                        <span>Total:</span>
                        <span>${total}</span>
                    </div>

                    <Link 
                        href="/checkout"
                        className="block w-full bg-accent text-white text-center py-3 rounded-md font-bold hover:bg-amber-600 transition-colors shadow-sm"
                    >
                        Checkout
                    </Link>
                </>
            )}
        </div>
    );
}
