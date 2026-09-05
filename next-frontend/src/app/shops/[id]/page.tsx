"use client";

import { useState, useEffect, use } from 'react';
import { shops, products } from '@/services/api';
import { useCart } from '@/context/CartContext';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Store, 
  CheckCircle, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  ArrowLeft,
  Package,
  Sparkles
} from 'lucide-react';

export default function ShopDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [shop, setShop] = useState<any>(null);
    const [productList, setProductList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (name: string) => {
        setToastMessage(name);
        setTimeout(() => setToastMessage(null), 2500);
    };

    useEffect(() => {
        if (id) {
            Promise.all([
                shops.get(id),
                products.list(id)
            ]).then(([shopRes, prodRes]) => {
                setShop(shopRes.data);
                setProductList(prodRes.data || []);
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-[#A163F7]" />
                    Loading Shop Details...
                </div>
            </PublicLayout>
        );
    }

    if (!shop) {
        return (
            <PublicLayout>
                <div className="py-24 text-center">
                    <h2 className="text-xl font-bold text-slate-800">Store Not Found</h2>
                    <Link href="/shops" className="text-[#6F88FC] font-bold text-sm mt-3 inline-block">
                        &larr; Back to all stores
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {toastMessage && (
                <div className="fixed bottom-20 md:bottom-8 right-4 z-[120] bg-[#161226] text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
                    <div className="w-7 h-7 rounded-full bg-[#45E3FF]/20 text-[#45E3FF] flex items-center justify-center font-bold">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{toastMessage}</p>
                        <p className="text-[10px] text-[#45E3FF] font-semibold">Added to cart!</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto py-2 w-full max-w-full">
                {/* Back Link */}
                <Link href="/shops" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold text-xs mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> All Stores
                </Link>

                {/* Shop Cover & Profile Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    {/* Cover Banner */}
                    <div className="h-44 sm:h-64 w-full bg-gradient-to-r from-[#161226] via-[#211A38] to-[#120F20] relative overflow-hidden">
                        {shop.cover_image_url ? (
                            <img src={shop.cover_image_url} alt="Cover Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-40">
                                <Store className="w-16 h-16 text-slate-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161226]/90 via-transparent to-transparent"></div>
                    </div>

                    {/* Shop Meta Info & Avatar */}
                    <div className="px-6 sm:px-10 pb-6 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                            <div className="flex items-end gap-4">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden flex items-center justify-center aspect-square flex-shrink-0">
                                    {shop.logo_url ? (
                                        <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[#A163F7] font-black text-3xl uppercase">
                                            {shop.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{shop.name}</h1>
                                        <span className="bg-purple-100 text-[#A163F7] text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                                            <CheckCircle className="w-3 h-3" /> Verified Partner
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> AI Plaza Marketplace
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-end">
                                <span className="bg-slate-100 text-slate-800 text-xs font-black px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-[#6F88FC]" />
                                    {productList.length} Product{productList.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {shop.description && (
                            <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed mt-2">
                                {shop.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Shop Products Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            Available Store Inventory ({productList.length})
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {productList.map(product => (
                            <div 
                                key={product.id} 
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#A163F7] hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
                            >
                                <Link href={`/products/${product.id}`} className="block">
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        {product.image_url || (product.images && product.images.length > 0) ? (
                                            <img 
                                                src={product.image_url || product.images[0].url} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                                                No Image
                                            </div>
                                        )}

                                        {product.stock_quantity === 0 && (
                                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                                                <span className="bg-[#FF7582] text-white px-2.5 py-1 text-[10px] font-black uppercase rounded-lg">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#A163F7] transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5 mb-2">
                                            {product.short_description || "Verified store product"}
                                        </p>
                                        
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs font-bold text-slate-500">Rs.</span>
                                            <span className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                                                {product.has_variants && product.min_price != null && product.max_price != null && product.min_price !== product.max_price
                                                    ? `${product.min_price.toLocaleString()} - ${product.max_price.toLocaleString()}`
                                                    : (product.min_price ?? product.price).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-2 pt-0 grid grid-cols-2 gap-1.5">
                                    <button 
                                        onClick={() => {
                                            addToCart({
                                                product_id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                shop_id: shop.id,
                                                image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                            });
                                            showToast(product.name);
                                        }}
                                        disabled={product.stock_quantity <= 0}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Cart
                                    </button>
                                    <button 
                                        onClick={() => {
                                            addToCart({
                                                product_id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                shop_id: shop.id,
                                                image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                            });
                                            window.location.href = '/checkout';
                                        }}
                                        disabled={product.stock_quantity <= 0}
                                        className="w-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-40"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {productList.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-700 font-bold">No products uploaded yet by this shop.</p>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
