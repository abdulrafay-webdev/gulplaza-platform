"use client";

import { useState, useEffect, use } from 'react';
import { shops, products } from '@/services/api';
import { useCart } from '@/context/CartContext';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function ShopDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [shop, setShop] = useState<any>(null);
    const [productList, setProductList] = useState<any[]>([]);
    const { addToCart } = useCart();

    useEffect(() => {
        if (id) {
            shops.get(id).then(res => setShop(res.data)).catch(console.error);
            products.list(id).then(res => setProductList(res.data)).catch(console.error);
        }
    }, [id]);

    if (!shop) return <PublicLayout><div>Loading...</div></PublicLayout>;

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto">
                {/* Shop Header / Banner */}
                <div className="relative mb-12">
                    <div className="h-64 w-full bg-primary rounded-xl overflow-hidden shadow-sm">
                        {shop.cover_image_url ? (
                            <img src={shop.cover_image_url} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-800 to-blue-600 opacity-50"></div>
                        )}
                    </div>
                    
                    {/* Logo & Info Overlay */}
                    <div className="absolute -bottom-8 left-8 flex items-end gap-6">
                        <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
                            {shop.logo_url ? (
                                <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-primary font-bold text-2xl uppercase">
                                    {shop.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="mb-8">
                            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">{shop.name}</h1>
                        </div>
                    </div>
                </div>

                <div className="mb-12 px-8">
                    <p className="text-text-secondary text-lg max-w-3xl leading-relaxed">
                        {shop.description}
                    </p>
                </div>

                <div className="px-2 md:px-8 pb-12 border-t border-gray-100 pt-8">
                    <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 uppercase tracking-tight px-2">Our Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {productList.map(product => (
                            <div key={product.id} className="bg-surface rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden group">
                                <Link href={`/products/${product.id}`} className="block">
                                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                        {product.image_url ? (
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-secondary text-[10px]">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-3 py-2 md:px-4 md:py-3">
                                        <h3 className="font-bold text-sm md:text-base text-text-primary mb-0.5 line-clamp-1 group-hover:text-secondary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-text-secondary text-[10px] md:text-xs mb-1 line-clamp-1">
                                            {product.short_description}
                                        </p>
                                        <p className="text-primary font-bold text-sm md:text-lg">
                                            ${product.price.toFixed(2)}
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex border-t border-gray-50">
                                    <button 
                                        onClick={() => addToCart({
                                            product_id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            shop_id: shop.id
                                        })}
                                        className="flex-1 bg-secondary text-white py-2.5 text-[9px] md:text-xs font-bold hover:bg-sky-600 transition-colors uppercase tracking-tighter"
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={() => {
                                            addToCart({
                                                product_id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                shop_id: shop.id
                                            });
                                            window.location.href = '/checkout';
                                        }}
                                        className="flex-1 bg-accent text-white py-2.5 text-[9px] md:text-xs font-bold hover:bg-amber-600 transition-colors border-l border-white/10 uppercase tracking-tighter"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
