"use client";

import { useState, useEffect } from 'react';
import { shops } from '@/services/api';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export default function Home() {
    const [list, setList] = useState<any[]>([]);
    
    useEffect(() => {
        shops.list().then(res => setList(res.data)).catch(console.error);
    }, []);

    return (
        <PublicLayout>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-primary uppercase tracking-tight">Verified Shops</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map(shop => (
                        <Link href={`/shops/${shop.id}`} key={shop.id} className="block group">
                            <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 hover:border-secondary hover:shadow-md transition-all flex items-center gap-4">
                                {/* Circular Logo */}
                                <div className="h-16 w-16 min-w-[64px] rounded-full border border-gray-100 shadow-inner overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {shop.logo_url ? (
                                        <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-primary font-bold text-xl uppercase">
                                            {shop.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Shop Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-text-primary group-hover:text-secondary transition-colors truncate">
                                        {shop.name}
                                    </h3>
                                    <p className="text-text-secondary text-sm line-clamp-1">
                                        {shop.description || "Browse our latest collection"}
                                    </p>
                                </div>
                                
                                <div className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}