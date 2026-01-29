"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { cart } from '@/services/api';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';

import { useCustomer } from '@/context/CustomerContext';

export default function Checkout() {
    const { items, clearCart } = useCart();
    const { customer, isLoaded: customerLoaded } = useCustomer();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    // Guest Form State
    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: ''
    });

    // Pre-fill form if customer is logged in
    useEffect(() => {
        if (customerLoaded && customer) {
            setFormData({
                guest_name: customer.full_name,
                guest_email: customer.email || '',
                guest_phone: customer.phone || '',
                guest_address: '' // Still need address
            });
        }
    }, [customer, customerLoaded]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;
        
        setLoading(true);
        try {
            // Send items AND guest details
            await cart.checkout({
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                })),
                ...formData
            });
            
            clearCart();
            alert("Order placed successfully! You will receive a confirmation shortly.");
            router.push('/');
        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <PublicLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700">Your Cart is Empty</h2>
                    <button onClick={() => router.push('/')} className="mt-4 text-blue-600 hover:underline">Continue Shopping</button>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Guest Form */}
                <div className="bg-surface p-8 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-primary">Shipping Details</h2>
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Full Name</label>
                            <input 
                                type="text" name="guest_name" required
                                value={formData.guest_name} onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-text-primary focus:ring-secondary focus:border-secondary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Email</label>
                            <input 
                                type="email" name="guest_email" required
                                value={formData.guest_email} onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-text-primary focus:ring-secondary focus:border-secondary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Phone</label>
                            <input 
                                type="tel" name="guest_phone" required
                                value={formData.guest_phone} onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-text-primary focus:ring-secondary focus:border-secondary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Address</label>
                            <textarea 
                                name="guest_address" required rows={3}
                                value={formData.guest_address} onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-text-primary focus:ring-secondary focus:border-secondary transition-colors"
                            />
                        </div>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="bg-surface p-8 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold mb-6 text-primary">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6 max-h-64 overflow-auto custom-scrollbar">
                        {items.map(item => (
                            <div key={item.product_id} className="flex justify-between text-sm">
                                <div>
                                    <p className="font-medium text-text-primary">{item.name}</p>
                                    <p className="text-text-secondary">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-text-primary">${item.price * item.quantity}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between font-bold text-xl text-primary">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm text-primary border border-blue-100">
                        <strong>Payment Method:</strong> Cash on Delivery (COD)
                    </div>

                    <button 
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className="w-full bg-accent text-white py-3 rounded-md font-bold text-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {loading ? "Placing Order..." : "Confirm Order"}
                    </button>
                </div>
            </div>
        </PublicLayout>
    );
}
