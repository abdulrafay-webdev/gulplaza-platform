"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { admin, setAuthToken } from '@/services/api';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Power, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function AdminShopsManagement() {
    const { getToken } = useAuth();
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'inactive'>('all');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const loadShops = async () => {
        try {
            const token = await getToken();
            setAuthToken(token);
            const res = await admin.listShops();
            setShops(res.data || []);
        } catch (err) {
            console.error("Failed to load shops", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShops();
    }, [getToken]);

    const handleApprove = async (shopId: number) => {
        try {
            const token = await getToken();
            setAuthToken(token);
            await admin.approveShop(shopId);
            setActionMessage("Store approved successfully!");
            await loadShops();
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert("Failed to approve store.");
        }
    };

    const handleToggleActive = async (shopId: number) => {
        try {
            const token = await getToken();
            setAuthToken(token);
            await admin.toggleActive(shopId);
            await loadShops();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (shopId: number) => {
        if (!confirm("Are you sure? This will delete the store and ALL its products permanently.")) return;
        try {
            const token = await getToken();
            setAuthToken(token);
            await admin.deleteShop(shopId);
            setActionMessage("Store deleted.");
            await loadShops();
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert("Failed to delete store.");
        }
    };

    const pendingCount = shops.filter(s => !s.is_approved).length;
    const approvedCount = shops.filter(s => s.is_approved && s.is_active).length;

    const filteredShops = shops.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (s.owner_clerk_id && s.owner_clerk_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;
        if (filterTab === 'pending') return !s.is_approved;
        if (filterTab === 'approved') return s.is_approved && s.is_active;
        if (filterTab === 'inactive') return !s.is_active;
        return true;
    });

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Store Directory...
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-full">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">Store Approvals & Governance</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Manage partner stores, approve vendor applications, and control store status</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-[#A163F7] text-xs font-black px-3 py-1.5 rounded-xl border border-purple-200">
                        {shops.length} Total Stores
                    </span>
                    {pendingCount > 0 && (
                        <span className="bg-rose-100 text-[#FF7582] text-xs font-black px-3 py-1.5 rounded-xl border border-rose-200 animate-pulse">
                            {pendingCount} Pending Review
                        </span>
                    )}
                </div>
            </div>

            {/* Action Feedback */}
            {actionMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    {actionMessage}
                </div>
            )}

            {/* Controls Bar: Search & Filter Tabs */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            filterTab === 'all'
                            ? 'bg-[#161226] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        All Stores ({shops.length})
                    </button>
                    <button
                        onClick={() => setFilterTab('pending')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                            filterTab === 'pending'
                            ? 'bg-[#FF7582] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Pending Approvals {pendingCount > 0 && <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{pendingCount}</span>}
                    </button>
                    <button
                        onClick={() => setFilterTab('approved')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            filterTab === 'approved'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Active Live ({approvedCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('inactive')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            filterTab === 'inactive'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Inactive
                    </button>
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-72">
                    <input 
                        type="text"
                        placeholder="Search store by name or owner..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A163F7]"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Stores Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th className="p-4">Store Info</th>
                                <th className="p-4">Owner ID</th>
                                <th className="p-4">Approval Status</th>
                                <th className="p-4">Visibility</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredShops.map(shop => (
                                <tr key={shop.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                {shop.logo_url ? (
                                                    <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Store className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-black text-sm text-slate-900">{shop.name}</h4>
                                                    <Link href={`/shops/${shop.id}`} target="_blank" className="text-slate-400 hover:text-[#6F88FC]">
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{shop.description || "No description"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                            {shop.owner_clerk_id}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {shop.is_approved ? (
                                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Approved
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Pending Review
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {shop.is_active ? (
                                            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 font-bold flex items-center gap-1.5 text-xs">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {!shop.is_approved ? (
                                            <button 
                                                onClick={() => handleApprove(shop.id)}
                                                className="bg-[#A163F7] hover:bg-[#8738F6] text-white px-3.5 py-1.5 rounded-xl font-black text-xs shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                                            >
                                                Approve Store
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleToggleActive(shop.id)}
                                                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                                                    shop.is_active 
                                                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {shop.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(shop.id)}
                                            className="p-2 text-slate-400 hover:text-[#FF7582] rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                                            title="Delete Store"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredShops.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        No stores found matching current filter or search query.
                    </div>
                )}
            </div>
        </div>
    );
}
