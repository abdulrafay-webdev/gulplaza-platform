"use client";

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import api, { setAuthToken } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadShops = async () => {
            const token = await getToken();
            setAuthToken(token);
            try {
                // Fetch all shops (using admin endpoint)
                const res = await api.get('/admin/shops');
                setShops(res.data);
            } catch (err) {
                console.error("Admin Access Error", err);
            } finally {
                setLoading(false);
            }
        };
        loadShops();
    }, [getToken]);

    const handleApprove = async (shopId: number) => {
        const token = await getToken();
        setAuthToken(token);
        try {
            await api.post(`/admin/shops/${shopId}/approve`);
            setShops(shops.map(s => s.id === shopId ? { ...s, is_approved: true } : s));
            alert("Shop Approved!");
        } catch (err) {
            alert("Failed to approve");
        }
    };

    const handleToggleActive = async (shopId: number) => {
        const token = await getToken();
        setAuthToken(token);
        try {
            const res = await api.patch(`/admin/shops/${shopId}/toggle-active`);
            setShops(shops.map(s => s.id === shopId ? { ...s, is_active: res.data.is_active } : s));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDeleteShop = async (shopId: number) => {
        if (!confirm("Are you sure? This will delete the shop and ALL its products forever.")) return;
        const token = await getToken();
        setAuthToken(token);
        try {
            await api.delete(`/admin/shops/${shopId}`);
            setShops(shops.filter(s => s.id !== shopId));
            alert("Shop Deleted");
        } catch (err) {
            alert("Failed to delete shop");
        }
    };

    if (loading) return <div>Loading Admin Panel...</div>;

    // Access Control
    const isAdmin = user?.id === "user_38gxODtYHX94wosiJA1SvLD4M7C" || user?.publicMetadata?.role === "SUPER_ADMIN";

    return (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-primary">Shop Management</h1>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-4 text-text-secondary uppercase text-xs font-bold">ID</th>
                            <th className="p-4 text-text-secondary uppercase text-xs font-bold">Shop Name</th>
                            <th className="p-4 text-text-secondary uppercase text-xs font-bold">Status</th>
                            <th className="p-4 text-text-secondary uppercase text-xs font-bold">Visibility</th>
                            <th className="p-4 text-text-secondary uppercase text-xs font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shops.map(shop => (
                            <tr key={shop.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-text-primary">#{shop.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-text-primary">{shop.name}</div>
                                    <div className="text-xs text-text-secondary font-mono">{shop.owner_clerk_id}</div>
                                </td>
                                <td className="p-4">
                                    {shop.is_approved ? (
                                        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Approved</span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {shop.is_active ? (
                                        <span className="text-success text-sm font-medium flex items-center gap-1">
                                            <div className="w-2 h-2 bg-success rounded-full"></div> Active
                                        </span>
                                    ) : (
                                        <span className="text-error text-sm font-medium flex items-center gap-1">
                                            <div className="w-2 h-2 bg-error rounded-full"></div> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {!shop.is_approved ? (
                                        <button 
                                            onClick={() => handleApprove(shop.id)}
                                            className="bg-accent text-white px-3 py-1.5 rounded font-bold text-xs hover:bg-amber-600 shadow-sm"
                                        >
                                            Approve
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleToggleActive(shop.id)}
                                            className={`px-3 py-1.5 rounded font-bold text-xs border transition-colors ${
                                                shop.is_active 
                                                ? 'border-error text-error hover:bg-red-50' 
                                                : 'border-success text-success hover:bg-green-50'
                                            }`}
                                        >
                                            {shop.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteShop(shop.id)}
                                        className="bg-gray-100 text-text-secondary px-3 py-1.5 rounded font-bold text-xs hover:bg-error hover:text-white transition-all"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
