"use client";

import { useState, useEffect } from 'react';
import { shops, products, reviews } from '@/services/api';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import PublicLayout from '@/components/PublicLayout';
import { 
  ArrowRight, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Flame, 
  CheckCircle,
  ChevronRight,
  Plus,
  Layers,
  Star,
  MessageSquare,
  Quote,
  Bot,
  Camera,
  Zap
} from 'lucide-react';

export default function Home() {
    const { addToCart } = useCart();
    const [shopList, setShopList] = useState<any[]>([]);
    const [productList, setProductList] = useState<any[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedToast, setAddedToast] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const triggerAddedToast = (productName: string) => {
        setAddedToast(productName);
        setTimeout(() => setAddedToast(null), 2500);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopsRes, productsRes, reviewsRes] = await Promise.all([
                    shops.list(),
                    products.listAll({ limit: 50 }),
                    reviews.getRecentReviews(6).catch(() => ({ data: [] }))
                ]);
                setShopList(shopsRes.data || []);
                setProductList(productsRes.data || []);
                setRecentReviews(reviewsRes.data || []);
            } catch (err) {
                console.error("Failed to load home data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categoriesList = [
        { name: "Home Appliances", icon: "🍳" },
        { name: "Gadgets & Electronics", icon: "⚡" },
        { name: "Clothes & Apparel", icon: "👗" },
        { name: "Shoes & Footwear", icon: "👟" },
        { name: "Cosmetics & Fragrances", icon: "✨" },
        { name: "Crockery & Kitchenware", icon: "🍽️" },
    ];

    // Latest products (Strict limit 6)
    const latestProducts = productList.slice(0, 6);

    // Filtered All Products
    const filteredAllProducts = selectedCategory === 'All' 
        ? productList 
        : productList.filter(p => {
            const desc = (p.short_description + " " + p.name + " " + (p.long_description || "")).toLowerCase();
            return desc.includes(selectedCategory.toLowerCase()) || 
                   (selectedCategory === "Home Appliances" && (desc.includes("fryer") || desc.includes("vacuum") || desc.includes("kettle") || desc.includes("appliance"))) ||
                   (selectedCategory === "Gadgets & Electronics" && (desc.includes("smartwatch") || desc.includes("earbuds") || desc.includes("charger") || desc.includes("gadget"))) ||
                   (selectedCategory === "Clothes & Apparel" && (desc.includes("lawn") || desc.includes("kurta") || desc.includes("clothing") || desc.includes("dress"))) ||
                   (selectedCategory === "Shoes & Footwear" && (desc.includes("sneaker") || desc.includes("oxford") || desc.includes("shoe") || desc.includes("sole"))) ||
                   (selectedCategory === "Cosmetics & Fragrances" && (desc.includes("oud") || desc.includes("parfum") || desc.includes("perfume") || desc.includes("beauty"))) ||
                   (selectedCategory === "Crockery & Kitchenware" && (desc.includes("cookware") || desc.includes("granite") || desc.includes("crockery")));
        });

    return (
        <PublicLayout>
            {/* Added to Cart Feedback Toast */}
            {addedToast && (
                <div className="fixed bottom-20 md:bottom-8 right-4 z-[120] bg-[#161226] text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
                    <div className="w-7 h-7 rounded-full bg-[#45E3FF]/20 text-[#45E3FF] flex items-center justify-center font-bold">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{addedToast}</p>
                        <p className="text-[10px] text-[#45E3FF] font-semibold">Added to cart successfully!</p>
                    </div>
                </div>
            )}

            {/* 1. Compact Circular Side-Scrolling Shops Strip (Small size for mobile) */}
            {shopList.length > 0 && (
                <section className="mb-4 sm:mb-6 w-full max-w-full bg-white px-3 py-2.5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#A163F7]" />
                            Verified Stores
                        </span>
                        <Link href="/shops" className="text-[10px] sm:text-xs font-bold text-[#6F88FC] hover:text-[#A163F7] flex items-center gap-0.5 transition-colors">
                            All Stores <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Link>
                    </div>
                    
                    {/* Horizontal Side Scroll Carousel with Round Small Avatars */}
                    <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-1 no-scrollbar w-full max-w-full items-center">
                        {shopList.map((shop) => (
                            <Link 
                                href={`/shops/${shop.id}`} 
                                key={shop.id}
                                className="flex flex-col items-center flex-shrink-0 group w-[54px] sm:w-[70px] text-center"
                            >
                                {/* Circular Round Avatar with Gradient Ring */}
                                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] group-hover:scale-105 transition-transform shadow-xs">
                                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white overflow-hidden flex items-center justify-center border border-white">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="font-black text-[#A163F7] text-xs sm:text-sm uppercase">
                                                {shop.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#45E3FF] border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                                        <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#161226]" />
                                    </span>
                                </div>
                                {/* Compact Name */}
                                <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 group-hover:text-[#A163F7] truncate w-full mt-1 leading-tight">
                                    {shop.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 2. Compact Modern AI Hero Banner - Space-Optimized */}
            <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-5 sm:mb-7 shadow-xl bg-gradient-to-br from-[#120D22] via-[#1B1438] to-[#0A0714] text-white border border-purple-500/25 w-full max-w-full">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(#A163F7_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
                <div className="absolute top-0 right-10 w-64 h-64 bg-[#45E3FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-10 w-64 h-64 bg-[#A163F7]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
                        
                        {/* Left Column: Brand Vision & Conversational AI */}
                        <div className="lg:col-span-8 text-left space-y-3">
                            {/* Vision Tagline */}
                            <div className="inline-flex items-center gap-1.5 bg-[#A163F7]/20 border border-[#A163F7]/40 text-[#45E3FF] px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-[#45E3FF]" />
                                Instead of searching, simply tell AI what you need
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
                                Shop Smarter with <span className="bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] bg-clip-text text-transparent">Generative AI</span>
                            </h1>

                            {/* Story Subtitle */}
                            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                                Pakistan’s AI-powered digital commerce marketplace. Ask our conversational companion in Roman Urdu or English, snap or upload photos for visual matching, and order with nationwide Cash on Delivery.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <Link 
                                    href="/ai" 
                                    className="bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] hover:opacity-95 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <img src="/images/robot.png" alt="AI Advisor" className="w-4 h-4 object-contain" />
                                    <span>Talk to AI Assistant</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#161226]" />
                                </Link>

                                <Link 
                                    href="/shops" 
                                    className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                >
                                    <Store className="w-3.5 h-3.5 text-[#45E3FF]" />
                                    <span>Browse Verified Stores</span>
                                </Link>
                            </div>

                            {/* Quick AI Prompts */}
                            <div className="flex items-center gap-2 pt-1.5 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex-shrink-0 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#A163F7]" /> Ask AI:
                                </span>
                                {[
                                    "5000 ke andar best gift dikhao",
                                    "Mere paas black suit hai matching tie dikhao",
                                    "Kitchen ke liye fast electric kettle"
                                ].map((prompt, i) => (
                                    <Link
                                        key={i}
                                        href="/ai"
                                        className="text-[10px] sm:text-[11px] bg-white/5 hover:bg-purple-500/20 hover:border-purple-400/40 text-slate-300 hover:text-white border border-white/10 px-2.5 py-1 rounded-lg transition-all flex-shrink-0 truncate max-w-[220px]"
                                    >
                                        "{prompt}"
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Compact Sleek AI Robot Mascot Card */}
                        <div className="lg:col-span-4 flex justify-center">
                            <div className="w-full max-w-xs bg-gradient-to-b from-[#1C1635]/90 to-[#120F24]/90 border border-purple-400/25 rounded-2xl p-4 text-center shadow-xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] opacity-25 blur-md" />
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 p-2 flex items-center justify-center backdrop-blur-md">
                                            <img 
                                                src="/images/robot.png" 
                                                alt="AI Plaza Robot" 
                                                className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(161,99,247,0.4)]"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">AI Companion</span>
                                        </div>
                                        <p className="text-[11px] sm:text-xs font-bold text-white leading-snug line-clamp-2">
                                            "Tell me what you need, I'll find it instantly."
                                        </p>
                                        <p className="text-[9px] text-[#45E3FF] font-semibold mt-1">Roman Urdu & English</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300 font-semibold px-1">
                                    <span>🏪 Verified Stores</span>
                                    <span>•</span>
                                    <span>🚚 Nationwide COD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Bottom Category Ticker */}
                <div className="bg-[#0C0917]/90 border-t border-purple-900/40 px-3 py-2 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-purple-200">
                            <span className="bg-[#A163F7]/30 text-[#45E3FF] px-1.5 py-0.5 rounded font-mono text-[9px]">VISION</span>
                            <span>AI + Local Commerce + Opportunities = AI Plaza</span>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                            {categoriesList.map((cat, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-all flex-shrink-0 cursor-pointer ${
                                        selectedCategory === cat.name 
                                        ? 'bg-[#A163F7] text-white border-[#A163F7] shadow-xs' 
                                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Value Proposition / Trust Features Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12">
                <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-[#A163F7] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] sm:text-xs text-slate-900">Multi-Shop Cart</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-500">Buy together in 1 cart</p>
                    </div>
                </div>

                <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 text-[#1CD5F8] flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] sm:text-xs text-slate-900">Cash on Delivery</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-500">Pay when delivered</p>
                    </div>
                </div>

                <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#6F88FC] flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] sm:text-xs text-slate-900">100% Verified</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-500">Official partner stores</p>
                    </div>
                </div>

                <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-[#FF7582] flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] sm:text-xs text-slate-900">Direct Rates</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-500">Zero extra fees</p>
                    </div>
                </div>
            </section>

            {/* 4. SECTION 1: LATEST PRODUCTS (Limit Exactly 6 Products) */}
            <section id="latest-products" className="mb-10 sm:mb-14">
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                    <div>
                        <span className="text-[#FF7582] font-extrabold uppercase tracking-widest text-[9px] sm:text-[10px] mb-0.5 block flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 fill-current text-[#FF7582]" /> Fresh Arrivals
                        </span>
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Latest Products
                        </h2>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        6 New Arrivals
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
                    {latestProducts.map(product => (
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
                                            <span className="bg-[#FF7582] text-white px-2 py-0.5 text-[9px] font-black uppercase rounded-lg">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}

                                    <span className="absolute top-2 left-2 bg-[#A163F7] text-white px-2 py-0.5 text-[8px] sm:text-[9px] font-black rounded-md shadow-xs">
                                        NEW
                                    </span>
                                </div>

                                <div className="p-2.5 sm:p-3">
                                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#A163F7] transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-slate-500 text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 mb-1.5">
                                        {product.short_description || "Quality verified item"}
                                    </p>
                                    
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">Rs.</span>
                                        <span className="text-xs sm:text-base font-black text-slate-950 tracking-tight">
                                            {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="p-2 pt-0 grid grid-cols-2 gap-1 sm:gap-1.5">
                                <button 
                                    onClick={() => {
                                        addToCart({
                                            product_id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            shop_id: product.shop_id,
                                            image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                        });
                                        triggerAddedToast(product.name);
                                    }}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40"
                                    title="Add to Cart"
                                >
                                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Cart
                                </button>
                                <button 
                                    onClick={() => {
                                        addToCart({
                                            product_id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            shop_id: product.shop_id,
                                            image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                        });
                                        window.location.href = '/checkout';
                                    }}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-40"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SECTION 2: ALL PRODUCTS (Explore Full Catalog) */}
            <section id="all-products" className="mb-14">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                    <div>
                        <span className="text-[#6F88FC] font-extrabold uppercase tracking-widest text-[9px] sm:text-[10px] mb-0.5 block flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" /> Complete Marketplace
                        </span>
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            All Products ({filteredAllProducts.length})
                        </h2>
                    </div>

                    {/* Filter Pills Bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                                selectedCategory === 'All'
                                ? 'bg-[#161226] text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            All Categories
                        </button>
                        {categoriesList.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                                    selectedCategory === cat.name
                                    ? 'bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {cat.icon} {cat.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
                    {filteredAllProducts.map(product => (
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
                                            <span className="bg-[#FF7582] text-white px-2 py-0.5 text-[9px] font-black uppercase rounded-lg tracking-wider">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2.5 sm:p-3">
                                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#A163F7] transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-slate-500 text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 mb-1.5">
                                        {product.short_description || "Quality verified item"}
                                    </p>
                                    
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">Rs.</span>
                                        <span className="text-xs sm:text-base font-black text-slate-950 tracking-tight">
                                            {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="p-2 pt-0 grid grid-cols-2 gap-1 sm:gap-1.5">
                                <button 
                                    onClick={() => {
                                        addToCart({
                                            product_id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            shop_id: product.shop_id,
                                            image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                        });
                                        triggerAddedToast(product.name);
                                    }}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40"
                                    title="Add to Cart"
                                >
                                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Cart
                                </button>
                                <button 
                                    onClick={() => {
                                        addToCart({
                                            product_id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            shop_id: product.shop_id,
                                            image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
                                        });
                                        window.location.href = '/checkout';
                                    }}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-40"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAllProducts.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-bold text-sm">No products found in this category.</p>
                        <button onClick={() => setSelectedCategory('All')} className="text-[#6F88FC] font-bold text-xs mt-2 hover:underline">
                            Reset to All Products
                        </button>
                    </div>
                )}
            </section>

            {/* 6. SECTION 3: VERIFIED MARKETPLACE CUSTOMER REVIEWS & TESTIMONIALS */}
            {recentReviews.length > 0 && (
                <section className="mb-14">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="text-[#A163F7] font-extrabold uppercase tracking-widest text-[9px] sm:text-[10px] mb-0.5 block flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" /> Verified Feedback
                            </span>
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                What Shoppers Are Saying
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            100% Genuine Reviews
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {recentReviews.map((rev) => (
                            <div 
                                key={rev.id} 
                                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} 
                                                />
                                            ))}
                                        </div>
                                        <Quote className="w-5 h-5 text-purple-200" />
                                    </div>

                                    <p className="text-slate-600 text-xs leading-relaxed italic mb-4">
                                        "{rev.comment}"
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-xs text-slate-900">{rev.reviewer_name}</h4>
                                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded">
                                                Verified
                                            </span>
                                        </div>
                                        <Link 
                                            href={`/products/${rev.product_id}`} 
                                            className="text-[10px] text-[#6F88FC] hover:underline truncate max-w-[180px] block mt-0.5"
                                        >
                                            {rev.product_name}
                                        </Link>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
