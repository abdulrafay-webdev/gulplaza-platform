"use client";

import { useState, useEffect } from 'react';
import { shops, products } from '@/services/api';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
    const [shopList, setShopList] = useState<any[]>([]);
    const [productList, setProductList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopsRes, productsRes] = await Promise.all([
                    shops.list(),
                    products.listAll({ limit: 12 })
                ]);
                setShopList(shopsRes.data);
                setProductList(productsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <PublicLayout>
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-r from-primary to-blue-900 text-white rounded-3xl overflow-hidden shadow-2xl mx-4 md:mx-0 mb-12">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
                    <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                        Welcome to <span className="text-accent">Madni Mall</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-medium">
                        Your premium destination for multi-shop ordering. Discover verified sellers and quality products all in one place.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="#products" className="bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105">
                            Start Shopping
                        </Link>
                        <Link href="/shops" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full font-bold backdrop-blur-sm transition-all">
                            Browse Shops
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Shops Section */}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-1 block">Verified Sellers</span>
                            <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">Featured Shops</h2>
                        </div>
                        <Link href="/shops" className="hidden md:flex items-center gap-2 text-secondary font-bold text-sm hover:text-blue-700 transition-colors">
                            View All Shops <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {shopList.slice(0, 8).map(shop => (
                            <Link href={`/shops/${shop.id}`} key={shop.id} className="block group">
                                <div className="bg-surface p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:border-secondary hover:shadow-lg transition-all text-center h-full flex flex-col items-center">
                                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center mb-4 ring-2 ring-gray-50 group-hover:ring-secondary/30 transition-all">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold text-xl uppercase">
                                                {shop.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-text-primary group-hover:text-secondary transition-colors truncate w-full">
                                        {shop.name}
                                    </h3>
                                    <p className="text-text-secondary text-[10px] md:text-xs line-clamp-1 mt-1">
                                        {shop.products?.length || 'Verified'} Products
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/shops" className="inline-flex items-center gap-2 bg-gray-100 text-text-primary px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
                            View All Shops <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Products Section */}
                <div id="products" className="mb-12">
                     <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-1 block">Fresh Arrivals</span>
                            <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">Latest Products</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {productList.map(product => (
                            <Link href={`/products/${product.id}`} key={product.id} className="group block h-full">
                                <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-secondary/50 transition-all h-full flex flex-col">
                                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                        {product.image_url || (product.images && product.images.length > 0) ? (
                                            <img 
                                                src={product.image_url || product.images[0].url} 
                                                alt={product.name} 
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        {product.stock_quantity === 0 && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <span className="bg-gray-900 text-white px-3 py-1 text-xs font-bold uppercase rounded tracking-wider">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-2">
                                            <h3 className="font-bold text-text-primary text-sm md:text-base leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-black text-primary">${product.price.toFixed(2)}</span>
                                            <button className="bg-gray-100 hover:bg-accent hover:text-white p-2 rounded-full transition-colors">
                                                <ShoppingBag className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    {productList.length === 0 && !loading && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-text-secondary font-medium">No products available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
