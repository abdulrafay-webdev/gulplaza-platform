"use client";

import { useEffect, useState, use } from "react";
import { search } from "@/services/api";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { Store, Package, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
    const { q } = use(searchParams);
    const [results, setResults] = useState<{ shops: any[]; products: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await search.unified(q);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [q]);

    if (loading) return <PublicLayout><div className="p-20 text-center animate-pulse font-bold text-primary">Searching...</div></PublicLayout>;

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-primary mb-2">Search Results</h1>
                    <p className="text-text-secondary">Showing results for "<span className="font-bold text-text-primary">{q}</span>"</p>
                </div>

                {!results || (results.shops.length === 0 && results.products.length === 0) ? (
                     <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-text-primary mb-2">No results found</h2>
                        <p className="text-text-secondary">Try checking your spelling or use different keywords.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Related Shops Section */}
                        {results.shops.length > 0 && (
                            <section>
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                                        <Store className="w-6 h-6 text-accent" />
                                        Related Shops
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {results.shops.slice(0, 4).map(shop => (
                                        <Link href={`/shops/${shop.id}`} key={shop.id} className="block group">
                                            <div className="bg-surface rounded-none shadow-sm border border-gray-100 hover:border-secondary hover:shadow-lg transition-all h-full flex flex-col overflow-hidden">
                                                <div className="h-24 w-full bg-primary/10 relative">
                                                    {shop.cover_image_url ? (
                                                        <img src={shop.cover_image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                                                    )}
                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                                                        <div className="h-16 w-16 rounded-none border-2 border-white shadow-md overflow-hidden bg-white flex items-center justify-center aspect-square">
                                                            {shop.logo_url ? (
                                                                <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-primary font-bold text-xl uppercase">
                                                                    {shop.name.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-8 pb-6 px-4 text-center flex-1 flex flex-col">
                                                    <h3 className="font-bold text-lg text-text-primary group-hover:text-secondary transition-colors truncate w-full mb-1">
                                                        {shop.name}
                                                    </h3>
                                                    <p className="text-text-secondary text-[10px] line-clamp-2 mb-4 flex-1">
                                                        {shop.description || 'Verified Seller'}
                                                    </p>
                                                    <div className="pt-3 border-t border-gray-50 mt-auto">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">Visit Shop</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Related Products Section */}
                        {results.products.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black text-primary flex items-center gap-3 mb-6">
                                    <Package className="w-6 h-6 text-accent" />
                                    Related Products
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                                    {results.products.map(product => (
                                        <div key={product.id} className="bg-surface rounded-none shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden group">
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
                                                    {product.stock_quantity === 0 && (
                                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                                            <span className="bg-gray-900 text-white px-3 py-1 text-xs font-bold uppercase rounded-none tracking-wider">Out of Stock</span>
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
                                                        shop_id: product.shop_id,
                                                        image_url: product.image_url
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
                                                            shop_id: product.shop_id,
                                                            image_url: product.image_url
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
                            </section>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
