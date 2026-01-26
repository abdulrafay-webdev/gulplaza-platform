"use client";

import { useEffect, useState, use } from 'react';
import { products } from '@/services/api';
import { useCart } from '@/context/CartContext';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await products.get(id);
                setProduct(res.data);
                setActiveImage(res.data.image_url || (res.data.images?.[0]?.url) || '');
            } catch (err) {
                console.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <PublicLayout><div className="p-8 text-center">Loading product...</div></PublicLayout>;
    if (!product) return <PublicLayout><div className="p-8 text-center">Product not found</div></PublicLayout>;

    const allImages = product.images || [];

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link href="/" className="text-text-secondary hover:text-primary mb-6 flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Shopping
                </Link>
                
                <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            {activeImage ? (
                                <img 
                                    src={activeImage} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>
                        
                        {allImages.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                                {/* Include main thumbnail in gallery too if it's different or just show allImages */}
                                {allImages.map((img: any, idx: number) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-secondary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Link href={`/shops/${product.shop_id}`} className="text-secondary font-bold hover:underline mb-2 block uppercase tracking-wider text-xs">
                                Visit Shop
                            </Link>
                            <h1 className="text-4xl font-extrabold text-primary mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4">
                                <p className="text-3xl font-bold text-text-primary">${product.price}</p>
                                {product.stock_quantity > 0 ? (
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">In Stock</span>
                                ) : (
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">Out of Stock</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 p-5 rounded-xl mb-8 border-l-4 border-secondary">
                            <h3 className="font-bold text-primary text-sm mb-2 uppercase tracking-tight">Quick Overview</h3>
                            <p className="text-text-primary leading-relaxed">{product.short_description}</p>
                        </div>

                        <div className="mb-10 flex-1">
                            <h3 className="font-bold text-text-primary mb-3 text-lg border-b border-gray-100 pb-2">Product Description</h3>
                            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                                {product.long_description}
                            </p>
                        </div>

                        <button 
                            onClick={() => addToCart({
                                product_id: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                shop_id: product.shop_id
                            })}
                            disabled={product.stock_quantity <= 0}
                            className="w-full bg-accent text-white py-5 rounded-xl font-extrabold text-xl hover:bg-amber-600 shadow-lg hover:shadow-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {product.stock_quantity > 0 ? 'Add to Cart' : 'Currently Unavailable'}
                        </button>
                        
                        <p className="text-center text-text-secondary text-sm mt-4 italic">
                            Sold by official Gul Plaza verified sellers.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
