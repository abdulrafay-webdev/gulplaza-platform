"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { reviews as reviewsApi, setAuthToken } from '@/services/api';
import { 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Sparkles, 
  Package, 
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function SellerReviewsPage() {
    const { getToken, isLoaded, userId } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadReviews = async () => {
        if (!userId) return;
        const token = await getToken();
        if (!token) return;
        setAuthToken(token);

        try {
            const res = await reviewsApi.getMyReviews();
            setReviews(res.data);
        } catch (err) {
            console.error("Error loading store reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && userId) {
            loadReviews();
        }
    }, [getToken, isLoaded, userId]);

    const handleApprove = async (reviewId: number) => {
        setActionLoading(reviewId);
        const token = await getToken();
        setAuthToken(token);

        try {
            await reviewsApi.approveReview(reviewId);
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: true } : r));
        } catch (err) {
            alert("Failed to approve review.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm("Are you sure you want to delete/reject this review?")) return;
        setActionLoading(reviewId);
        const token = await getToken();
        setAuthToken(token);

        try {
            await reviewsApi.deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (err) {
            alert("Failed to delete review.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Store Reviews & Approvals...
            </div>
        );
    }

    const filteredReviews = reviews.filter(r => {
        if (filter === 'pending') return !r.is_approved;
        if (filter === 'approved') return r.is_approved;
        return true;
    });

    const pendingCount = reviews.filter(r => !r.is_approved).length;
    const approvedCount = reviews.filter(r => r.is_approved).length;

    return (
        <div className="space-y-6 w-full max-w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[#A163F7]" /> Product Reviews & Store Approvals
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">
                        Reviews submitted for your store's products are sent here for approval before appearing publicly on product pages.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 self-start sm:self-auto">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        All ({reviews.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            filter === 'pending' ? 'bg-[#A163F7] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filter === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Live ({approvedCount})
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                    <div key={rev.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            {/* Product Info */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                    {rev.product_image ? (
                                        <img src={rev.product_image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Product Reviewed</span>
                                    <Link 
                                        href={`/products/${rev.product_id}`}
                                        target="_blank"
                                        className="font-black text-sm text-slate-900 hover:text-[#A163F7] transition-colors flex items-center gap-1"
                                    >
                                        {rev.product_name} <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </Link>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                    rev.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {rev.is_approved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {rev.is_approved ? 'Live on Product' : 'Pending Store Approval'}
                                </span>

                                {!rev.is_approved && (
                                    <button
                                        onClick={() => handleApprove(rev.id)}
                                        disabled={actionLoading === rev.id}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(rev.id)}
                                    disabled={actionLoading === rev.id}
                                    className="bg-rose-50 hover:bg-rose-100 text-[#FF7582] text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>

                        {/* Rating & Reviewer */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`w-4 h-4 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black text-slate-800">{rev.rating}.0 / 5.0</span>
                                </div>

                                <div className="text-[11px] text-slate-400">
                                    {new Date(rev.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                "{rev.comment}"
                            </p>

                            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="font-bold text-slate-900">{rev.reviewer_name}</span>
                                {rev.reviewer_email && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="text-slate-400">{rev.reviewer_email}</span>
                                    </>
                                )}
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    Verified Buyer
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReviews.length === 0 && (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-600">No reviews found in this category.</p>
                        <p className="text-xs text-slate-400">When customers submit feedback for your products, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
