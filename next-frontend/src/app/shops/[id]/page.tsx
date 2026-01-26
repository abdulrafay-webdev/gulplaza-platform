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

                <div className="px-8 pb-12 border-t border-gray-100 pt-12">
                    <h2 className="text-2xl font-bold text-primary mb-8 uppercase tracking-tight">Our Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productList.map(product => (
                            <div key={product.id} className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <Link href={`/products/${product.id}`} className="block group">
                                    <div className="mb-4">
                                        {product.image_url ? (
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="w-full h-56 object-cover rounded-lg mb-4 bg-gray-50 group-hover:opacity-90 transition-opacity"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-56 bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-text-secondary border border-gray-100">
                                                No Image
                                            </div>
                                        )}
                                        <h3 className="font-bold text-xl text-text-primary mb-1 group-hover:text-secondary transition-colors">{product.name}</h3>
                                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{product.short_description}</p>
                                        <p className="text-primary font-bold text-2xl">${product.price}</p>
                                    </div>
                                </Link>
                                <button 
                                    onClick={() => addToCart({
                                        product_id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        quantity: 1,
                                        shop_id: shop.id
                                    })}
                                    className="w-full mt-4 bg-accent text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-sm"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
