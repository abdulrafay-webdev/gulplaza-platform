"use client";

import { useState, useEffect } from 'react';
import { shops } from '@/services/api';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export default function AllShops() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        shops.list().then(res => {
            setList(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <PublicLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">All Verified Shops</h1>
                    <span className="text-text-secondary font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">{list.length} Shops</span>
                </div>
                
                {loading ? (
                    <div className="text-center py-20 text-text-secondary">Loading shops...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.map(shop => (
                            <Link href={`/shops/${shop.id}`} key={shop.id} className="block group">
                                <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 hover:border-secondary hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col items-center text-center">
                                    <div className="h-20 w-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center mb-4 ring-2 ring-gray-100 group-hover:ring-secondary/50 transition-all">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold text-2xl uppercase">
                                                {shop.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-text-primary group-hover:text-secondary transition-colors mb-1">
                                        {shop.name}
                                    </h3>
                                    <p className="text-text-secondary text-xs line-clamp-2 px-2">
                                        {shop.description || "Browse our collection"}
                                    </p>
                                    
                                    <div className="mt-4 w-full">
                                        <span className="block w-full py-2 bg-gray-50 text-text-secondary text-xs font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                            Visit Shop
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
