"use client";

import { useState } from 'react';
import { customers } from '@/services/api';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function CustomerSignup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await customers.signup(formData);
            alert("Signup successful! Please login.");
            router.push('/login');
        } catch (err: any) {
            alert(err.response?.data?.detail || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-primary mb-6">Create Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Full Name</label>
                        <input 
                            type="text" required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={formData.full_name}
                            onChange={e => setFormData({...formData, full_name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Email (Optional)</label>
                        <input 
                            type="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Phone (Optional)</label>
                        <input 
                            type="tel"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Password</label>
                        <input 
                            type="password" required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-text-primary"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-accent text-white py-3 rounded-md font-bold hover:bg-amber-600 transition-all shadow-md disabled:bg-gray-300"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-secondary">
                    Already have an account? <Link href="/login" className="text-secondary font-bold hover:underline">Login here</Link>
                </p>
            </div>
        </PublicLayout>
    );
}
