"use client";

import { useEffect, useState, use } from 'react';
import { products } from '@/services/api';
import { useCart } from '@/context/CartContext';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

import { Truck, ShieldCheck, RotateCcw, Store, ShoppingCart, Zap } from 'lucide-react';

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

    if (loading) return <PublicLayout><div className="p-20 text-center text-primary font-bold animate-pulse">Loading product...</div></PublicLayout>;
    if (!product) return <PublicLayout><div className="p-20 text-center text-error font-bold">Product not found</div></PublicLayout>;

    const allImages = product.images || [];

    const handleBuyNow = () => {
        addToCart({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            shop_id: product.shop_id
        });
        window.location.href = '/checkout';
    };

    return (
        <PublicLayout>
            <div className="bg-background min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                    {/* Breadcrumbs / Back */}
                    <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Marketplace
                    </Link>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        {/* LEFT: Sticky Gallery & Shop Info (5 cols) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-8">
                            <div className="space-y-6">
                                <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl group cursor-zoom-in">
                                    {activeImage ? (
                                        <img 
                                            src={activeImage} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                
                                {allImages.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {allImages.map((img: any, idx: number) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setActiveImage(img.url)}
                                                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 overflow-hidden border-2 transition-all shadow-sm ${
                                                    activeImage === img.url 
                                                    ? 'border-secondary ring-4 ring-secondary/10 scale-95' 
                                                    : 'border-transparent hover:border-gray-200 grayscale-[0.5] hover:grayscale-0'
                                                }`}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Shop Summary Card (Desktop Only: under gallery) */}
                            <div className="hidden lg:flex bg-white border-2 border-primary/5 p-6 rounded-3xl shadow-sm flex-col xl:flex-row items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10">
                                        <Store className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-secondary tracking-widest block mb-0.5">Verified Seller</span>
                                        <h4 className="text-lg font-black text-primary leading-tight">Official Mall Partner</h4>
                                    </div>
                                </div>
                                <Link 
                                    href={`/shops/${product.shop_id}`}
                                    className="w-full xl:w-auto text-center bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-800 transition-all shadow-md shadow-primary/10"
                                >
                                    Visit Store
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT: Product Details (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col">
                            {/* Product Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {product.stock_quantity > 0 ? (
                                        <span className="bg-success/10 text-success text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-success/20">In Stock</span>
                                    ) : (
                                        <span className="bg-error/10 text-error text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-error/20">Out of Stock</span>
                                    )}
                                    <span className="text-text-secondary text-xs font-bold uppercase tracking-wider italic opacity-60">Verified Product</span>
                                </div>
                                
                                <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 leading-[1.1]">{product.name}</h1>
                                
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>

                                <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl">
                                    {product.short_description}
                                </p>
                            </div>

                            {/* Trust Features Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-10">
                                <div className="bg-surface border border-gray-100 p-3 md:p-4 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm">
                                    <Truck className="text-secondary w-5 h-5" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-tighter">Fast Delivery</span>
                                </div>
                                <div className="bg-surface border border-gray-100 p-3 md:p-4 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm">
                                    <ShieldCheck className="text-success w-5 h-5" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-tighter">Secure Pay</span>
                                </div>
                                <div className="bg-surface border border-gray-100 p-3 md:p-4 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm">
                                    <RotateCcw className="text-accent w-5 h-5" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-tighter">7-Day Return</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button 
                                    onClick={() => addToCart({
                                        product_id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        quantity: 1,
                                        shop_id: product.shop_id
                                    })}
                                    disabled={product.stock_quantity <= 0}
                                    className="flex-1 bg-secondary text-white py-5 rounded-2xl font-black text-lg hover:bg-sky-600 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-3 disabled:bg-gray-200"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    ADD TO CART
                                </button>
                                <button 
                                    onClick={handleBuyNow}
                                    disabled={product.stock_quantity <= 0}
                                    className="flex-1 bg-accent text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-600 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-3 disabled:bg-gray-200"
                                >
                                    <Zap className="w-6 h-6 fill-current" />
                                    BUY IT NOW
                                </button>
                            </div>

                            {/* Shop Summary Card (Mobile Only: under buttons) */}
                            <div className="lg:hidden bg-white border-2 border-primary/5 p-6 rounded-3xl shadow-sm flex items-center justify-between gap-4 mb-12 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-secondary tracking-widest block mb-0.5">Verified Seller</span>
                                        <h4 className="text-base font-black text-primary leading-tight">Official Mall Partner</h4>
                                    </div>
                                </div>
                                <Link 
                                    href={`/shops/${product.shop_id}`}
                                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-800 transition-all shadow-md shadow-primary/10 whitespace-nowrap"
                                >
                                    Visit Store
                                </Link>
                            </div>

                            {/* Full Description */}
                            <div className="border-t border-gray-100 pt-10">
                                <h3 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-secondary rounded-full"></div>
                                    Product Description
                                </h3>
                                <p className="text-text-secondary text-base md:text-lg leading-[1.8] whitespace-pre-wrap font-medium">
                                    {product.long_description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footnote */}
                <div className="max-w-7xl mx-auto px-4 py-10 border-t border-gray-100">
                    <p className="text-center text-text-secondary text-xs md:text-sm font-bold opacity-40 uppercase tracking-[0.2em]">
                        Official Madni Mall Licensed Partner &copy; 2026
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
