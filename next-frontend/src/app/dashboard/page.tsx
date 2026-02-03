"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { shops, setAuthToken } from '@/services/api';
import { IKUpload } from "imagekitio-next";

export default function ShopSettings() {
    const { getToken, isLoaded, userId } = useAuth();
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '',
        logo_url: '',
        cover_image_url: ''
    });

    useEffect(() => {
        if (!isLoaded || !userId) return;

        const fetchShop = async () => {
            const token = await getToken();
            if (!token) return;
            
            setAuthToken(token);
            try {
                const res = await shops.getMe();
                setShop(res.data);
                setFormData({ 
                    name: res.data.name, 
                    description: res.data.description,
                    logo_url: res.data.logo_url || '',
                    cover_image_url: res.data.cover_image_url || ''
                });
            } catch (err) {
                console.log("No shop found, ready to create.");
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, [getToken, isLoaded, userId]);

    const authenticator = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const response = await fetch(`${apiUrl}/imagekit-auth`);
            if (!response.ok) throw new Error("Authentication failed");
            return await response.json();
        } catch (error) {
            throw new Error(`Authentication request failed: ${error}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = await getToken();
        setAuthToken(token);
        try {
            if (shop) {
                const res = await shops.update(formData);
                setShop(res.data);
                alert("Shop updated!");
            } else {
                const res = await shops.create(formData);
                setShop(res.data);
                alert("Shop created!");
                window.location.reload(); 
            }
        } catch (err) {
            alert("Error saving shop");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-primary">{shop ? 'Shop Profile' : 'Create Your Shop'}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8 bg-surface p-8 rounded-xl shadow-sm border border-gray-100">
                {/* Visual Assets Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">Shop Logo</label>
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-32 w-32 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative group aspect-square">
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs">No Logo</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">Change</span>
                                </div>
                            </div>
                            <IKUpload 
                                fileName="logo.jpg"
                                authenticator={authenticator}
                                onSuccess={(res) => setFormData(prev => ({ ...prev, logo_url: res.url }))}
                                className="text-xs text-text-secondary"
                            />
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">Cover Banner</label>
                        <div className="flex flex-col gap-4">
                            <div className="h-32 w-full rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                                {formData.cover_image_url ? (
                                    <img src={formData.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs">No Cover Image</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">Change Banner</span>
                                </div>
                            </div>
                            <IKUpload 
                                fileName="cover.jpg"
                                authenticator={authenticator}
                                onSuccess={(res) => setFormData(prev => ({ ...prev, cover_image_url: res.url }))}
                                className="text-xs text-text-secondary"
                            />
                        </div>
                    </div>
                </div>

                {/* Basic Details Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Shop Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-text-primary"
                            placeholder="e.g. Al-Abbas Electronics"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-text-primary"
                            rows={4}
                            placeholder="Tell customers what you sell..."
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-accent text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-600 transition-all shadow-md disabled:bg-gray-300"
                >
                    {saving ? 'Processing...' : (shop ? 'Update Profile' : 'Create My Shop')}
                </button>
            </form>
        </div>
    );
}
