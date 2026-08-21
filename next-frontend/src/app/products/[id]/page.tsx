"use client";

import { useEffect, useState, use } from 'react';
import { products, reviews } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Store, 
  ShoppingCart, 
  Zap, 
  ArrowLeft, 
  CheckCircle,
  Plus,
  Minus,
  Sparkles,
  Star,
  MessageSquare,
  Send,
  User
} from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { customer } = useCustomer();
    const [product, setProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(false);
    const { addToCart } = useCart();

    // Reviews State
    const [reviewsList, setReviewsList] = useState<any[]>([]);
    const [reviewSummary, setReviewSummary] = useState<any>({
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [reviewForm, setReviewForm] = useState({
        reviewer_name: '',
        reviewer_email: '',
        rating: 5,
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

    // Pre-fill customer name if logged in
    useEffect(() => {
        if (customer) {
            setReviewForm(prev => ({
                ...prev,
                reviewer_name: customer.full_name || '',
                reviewer_email: customer.email || ''
            }));
        }
    }, [customer]);

    const loadReviews = async () => {
        try {
            const res = await reviews.getProductReviews(id);
            setReviewsList(res.data.reviews || []);
            setReviewSummary(res.data.summary || {
                average_rating: 0,
                total_reviews: 0,
                rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
        } catch (err) {
            console.error("Failed to load reviews", err);
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await products.get(id);
                setProduct(res.data);
                setActiveImage(res.data.image_url || (res.data.images?.[0]?.url) || '');
                await loadReviews();
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            shop_id: product.shop_id,
            image_url: activeImage || product.image_url
        });
        setToastMessage(true);
        setTimeout(() => setToastMessage(false), 2500);
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            shop_id: product.shop_id,
            image_url: activeImage || product.image_url
        });
        window.location.href = '/checkout';
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewForm.reviewer_name.trim() || !reviewForm.comment.trim()) return;

        setSubmittingReview(true);
        try {
            await reviews.submitProductReview(id, reviewForm);
            setReviewSuccessMessage("Thank you! Your verified review has been published.");
            setReviewForm(prev => ({ ...prev, comment: '', rating: 5 }));
            await loadReviews();
            setTimeout(() => setReviewSuccessMessage(null), 4000);
        } catch (err) {
            console.error("Failed to submit review", err);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="py-32 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                    Loading Product Details...
                </div>
            </PublicLayout>
        );
    }

    if (!product) {
        return (
            <PublicLayout>
                <div className="py-32 text-center">
                    <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
                    <Link href="/" className="text-[#6F88FC] font-bold text-sm mt-3 inline-block">
                        &larr; Back to AI Plaza
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    const allImages = product.images || [];

    return (
        <PublicLayout>
            {toastMessage && (
                <div className="fixed bottom-20 md:bottom-8 right-4 z-[120] bg-[#161226] text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
                    <div className="w-7 h-7 rounded-full bg-[#45E3FF]/20 text-[#45E3FF] flex items-center justify-center font-bold">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{product.name}</p>
                        <p className="text-[10px] text-[#45E3FF] font-semibold">{quantity} item(s) added to cart!</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto py-2 w-full max-w-full">
                {/* Breadcrumb / Back */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#A163F7] font-bold text-xs mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to AI Plaza
                </Link>
                
                {/* TOP: Product Summary & Purchase Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14">
                    {/* LEFT: Image Gallery & Shop Summary (5 cols) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                        {/* Main Showcase Image */}
                        <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md relative group">
                            {activeImage ? (
                                <img 
                                    src={activeImage} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    No Image Available
                                </div>
                            )}

                            {product.stock_quantity === 0 && (
                                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="bg-[#FF7582] text-white px-4 py-1.5 text-xs font-black uppercase rounded-xl tracking-wider">
                                        Sold Out
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Thumbnail Selector */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {allImages.map((img: any, idx: number) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden border-2 transition-all shadow-sm ${
                                            activeImage === img.url 
                                            ? 'border-[#A163F7] ring-2 ring-[#A163F7]/30 scale-95' 
                                            : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Seller Summary Box */}
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#A163F7] font-bold border border-purple-100">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-[#A163F7] tracking-wider block">Official Vendor</span>
                                    <h4 className="text-sm font-black text-slate-900 leading-tight">AI Plaza Verified Store</h4>
                                </div>
                            </div>
                            <Link 
                                href={`/shops/${product.shop_id}`}
                                className="bg-[#161226] hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm"
                            >
                                Visit Store
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Product Details & Purchase Actions (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        {/* Header Details */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {product.stock_quantity > 0 ? (
                                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> In Stock ({product.stock_quantity} available)
                                    </span>
                                ) : (
                                    <span className="bg-rose-50 text-[#FF7582] text-[11px] font-black px-3 py-1 rounded-full border border-rose-200">
                                        Currently Out of Stock
                                    </span>
                                )}
                                
                                {/* Star Rating Badge */}
                                {reviewSummary.total_reviews > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span>{reviewSummary.average_rating}</span>
                                        <span className="text-slate-400">({reviewSummary.total_reviews} reviews)</span>
                                    </div>
                                )}
                            </div>
                            
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 leading-snug">
                                {product.name}
                            </h1>
                            
                            {/* Price Block */}
                            <div className="flex items-baseline gap-2 mb-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 w-fit">
                                <span className="text-sm font-bold text-slate-500">Price:</span>
                                <span className="text-2xl sm:text-3xl font-black text-[#161226] tracking-tight">
                                    Rs. {product.price.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-semibold text-[#6F88FC] ml-2 bg-blue-100/60 px-2 py-0.5 rounded">
                                    COD Supported
                                </span>
                            </div>

                            {product.short_description && (
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        {/* Quantity Selector & Action CTA */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-600">Quantity:</span>
                                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 transition-all"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-black text-slate-900">
                                        {quantity}
                                    </span>
                                    <button 
                                        onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 transition-all"
                                        disabled={product.stock_quantity > 0 && quantity >= product.stock_quantity}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500 font-semibold">
                                    Subtotal: <strong className="text-slate-900">Rs. {(product.price * quantity).toLocaleString()}</strong>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
                                >
                                    <ShoppingCart className="w-4 h-4 text-[#A163F7]" />
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={handleBuyNow}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
                                >
                                    <Zap className="w-4 h-4 fill-current" />
                                    Buy Now (COD)
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1.5 shadow-sm">
                                <Truck className="text-[#45E3FF] w-5 h-5" />
                                <span className="text-[10px] font-black uppercase text-slate-800">Cash on Delivery</span>
                            </div>
                            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1.5 shadow-sm">
                                <ShieldCheck className="text-[#A163F7] w-5 h-5" />
                                <span className="text-[10px] font-black uppercase text-slate-800">Verified Store</span>
                            </div>
                            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1.5 shadow-sm">
                                <RotateCcw className="text-[#FF7582] w-5 h-5" />
                                <span className="text-[10px] font-black uppercase text-slate-800">Direct Support</span>
                            </div>
                        </div>

                        {/* Full Long Description */}
                        {product.long_description && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-5 bg-[#A163F7] rounded-full"></div>
                                    Full Product Details & Specifications
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {product.long_description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM: COMPLETE REVIEWS & RATINGS SECTION */}
                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-12">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#A163F7] flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Customer Reviews & Ratings</h2>
                            <p className="text-slate-500 text-xs">Genuine feedback from verified buyers across Pakistan</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* LEFT: Rating Breakdown Summary (4 cols) */}
                        <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                            <div className="space-y-1">
                                <div className="text-5xl font-black text-slate-900">{reviewSummary.average_rating}</div>
                                <div className="flex justify-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            className={`w-5 h-5 ${star <= Math.round(reviewSummary.average_rating) ? 'fill-amber-400' : 'text-slate-200'}`} 
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 font-semibold">Based on {reviewSummary.total_reviews} verified reviews</p>
                            </div>

                            {/* Distribution Bars */}
                            <div className="space-y-1.5 text-xs text-slate-600 text-left pt-2 border-t border-slate-200">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviewSummary.rating_distribution?.[star] || 0;
                                    const pct = reviewSummary.total_reviews > 0 ? (count / reviewSummary.total_reviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="w-8 font-bold flex items-center gap-0.5">{star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="w-6 text-right text-[11px] text-slate-400 font-bold">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Write a Review Form & Reviews List (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Write Review Form */}
                            <div className="bg-purple-50/40 p-6 rounded-2xl border border-purple-100">
                                <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-[#A163F7]" /> Write a Review
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">Share your honest experience to help other buyers on AI Plaza.</p>

                                {reviewSuccessMessage && (
                                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        {reviewSuccessMessage}
                                    </div>
                                )}

                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-700">Rating:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star 
                                                        className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-[#A163F7] ml-2">{reviewForm.rating} of 5 Stars</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Your Full Name *"
                                            value={reviewForm.reviewer_name}
                                            onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                                            className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#A163F7] focus:outline-none"
                                        />
                                        <input 
                                            type="email"
                                            placeholder="Email (Optional)"
                                            value={reviewForm.reviewer_email}
                                            onChange={(e) => setReviewForm({ ...reviewForm, reviewer_email: e.target.value })}
                                            className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#A163F7] focus:outline-none"
                                        />
                                    </div>

                                    <textarea 
                                        required
                                        rows={3}
                                        placeholder="Write your review comments here (e.g. build quality, delivery speed, packaging)... *"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#A163F7] focus:outline-none"
                                    />

                                    <button 
                                        type="submit"
                                        disabled={submittingReview}
                                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
                                    Customer Feedback ({reviewsList.length})
                                </h3>

                                {reviewsList.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-500">No reviews yet for this product.</p>
                                        <p className="text-[11px] text-slate-400">Be the first customer to leave a review!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {reviewsList.map((rev: any) => (
                                            <div key={rev.id} className="py-4 first:pt-0 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#A163F7] font-black text-xs flex items-center justify-center">
                                                            {rev.reviewer_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-xs text-slate-900">{rev.reviewer_name}</span>
                                                                {rev.is_verified_purchase && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                        <CheckCircle className="w-2.5 h-2.5" /> Verified Buyer
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(rev.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex text-amber-400">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star 
                                                                key={star} 
                                                                className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                                                    {rev.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
