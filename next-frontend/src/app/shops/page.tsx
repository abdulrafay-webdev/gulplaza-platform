"use client";

import { useState, useEffect } from 'react';
import { shops } from '@/services/api';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { Store, CheckCircle, Search, Sparkles, MapPin } from 'lucide-react';

export default function AllShops() {
    const [list, setList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        shops.list().then(res => {
            setList(res.data || []);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching shops", err);
            setLoading(false);
        });
    }, []);

    const filteredShops = list.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto py-2 w-full max-w-full">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#161226] via-[#211A38] to-[#120F20] text-white p-6 sm:p-10 rounded-3xl mb-8 shadow-xl border border-purple-900/40 flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-full">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-[#A163F7]/15 border border-[#A163F7]/30 text-[#45E3FF] text-xs font-black px-3 py-1 rounded-full mb-3">
                            <Sparkles className="w-3.5 h-3.5" /> Official Verified Stores
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Verified AI Plaza Stores</h1>
                        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl">
                            Explore retail and wholesale shops registered at AI Plaza. Visit their direct store catalog and order with instant Cash on Delivery.
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <div className="relative">
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter shops by name..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 text-sm text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#45E3FF]"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45E3FF]" />
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                        <Store className="w-5 h-5 animate-pulse text-[#A163F7]" />
                        Loading AI Plaza stores...
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
                                Available Stores ({filteredShops.length})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {filteredShops.map(shop => (
                                <Link 
                                    href={`/shops/${shop.id}`} 
                                    key={shop.id} 
                                    className="bg-white rounded-2xl border border-slate-200 hover:border-[#A163F7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group flex flex-col justify-between"
                                >
                                    {/* Cover Preview */}
                                    <div className="h-32 bg-[#161226] relative overflow-hidden">
                                        {shop.cover_image_url ? (
                                            <img src={shop.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-[#161226] to-[#211A38] flex items-center justify-center opacity-70">
                                                <Store className="w-8 h-8 text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <span className="absolute top-2.5 right-2.5 bg-[#45E3FF] text-[#161226] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle className="w-2.5 h-2.5" /> Verified
                                        </span>
                                    </div>

                                    {/* Info & Avatar */}
                                    <div className="p-4 pt-0 relative flex-1 flex flex-col">
                                        <div className="-mt-8 mb-3 flex items-end justify-between">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white flex items-center justify-center aspect-square flex-shrink-0">
                                                {shop.logo_url ? (
                                                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#A163F7] font-black text-xl uppercase">
                                                        {shop.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" /> AI Plaza
                                            </span>
                                        </div>

                                        <h3 className="font-black text-base text-slate-900 group-hover:text-[#A163F7] transition-colors truncate">
                                            {shop.name}
                                        </h3>
                                        
                                        <p className="text-slate-500 text-xs line-clamp-2 mt-1 mb-4 flex-1">
                                            {shop.description || "Browse all items available at this store."}
                                        </p>

                                        <div className="w-full py-2 bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-[#A163F7] group-hover:to-[#6F88FC] group-hover:text-white text-slate-700 text-xs font-bold rounded-xl text-center transition-all">
                                            Open Store Catalog
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredShops.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-700 font-bold">No shops match your search.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
