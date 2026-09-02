"use client";

import { useState, useEffect } from 'react';
import { admin } from '@/services/api';
import { 
  Star, 
  Store, 
  Package, 
  CheckCircle2, 
  Trash2, 
  MessageSquare, 
  Search, 
  Loader2, 
  X,
  Clock,
  Check
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await admin.listReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setActionLoading(reviewId);
      await admin.approveReview(reviewId);
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, is_approved: true } : r))
      );
    } catch (err) {
      alert("Failed to approve review.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) return;
    try {
      setActionLoading(reviewId);
      await admin.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert("Failed to delete review.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter(r => {
    const matchesTab = 
      activeTab === 'ALL' ? true :
      activeTab === 'PENDING' ? !r.is_approved :
      r.is_approved;

    const q = search.toLowerCase();
    const matchesSearch = 
      (r.comment && r.comment.toLowerCase().includes(q)) ||
      (r.reviewer_name && r.reviewer_name.toLowerCase().includes(q)) ||
      (r.shop_name && r.shop_name.toLowerCase().includes(q)) ||
      (r.product_name && r.product_name.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Reviews Moderation & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor and moderate all customer reviews across marketplace shops and products.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'APPROVED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({reviews.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by shop name, product, reviewer or comment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-xs transition-colors"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
          <p className="text-xs font-semibold">Loading marketplace reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Store Badge & Approval Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200/80 text-purple-700 px-3 py-1 rounded-xl text-xs font-bold max-w-[70%]">
                    <Store className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{review.shop_name || `Shop #${review.shop_id}`}</span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    review.is_approved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {review.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>

                {/* Product Reference */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center gap-3">
                  {review.product_image ? (
                    <img 
                      src={review.product_image} 
                      alt={review.product_name} 
                      className="w-10 h-10 rounded-lg object-cover bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Product</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {review.product_name || `Product #${review.product_id}`}
                    </span>
                  </div>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600">{review.rating}.0</span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  "{review.comment}"
                </p>

                {/* Reviewer Details */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] flex items-center justify-center font-black">
                      {review.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>{review.reviewer_name || 'Customer'}</span>
                  </div>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                {!review.is_approved && (
                  <button
                    disabled={actionLoading === review.id}
                    onClick={() => handleApprove(review.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Review</span>
                  </button>
                )}

                <button
                  disabled={actionLoading === review.id}
                  onClick={() => handleDelete(review.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-rose-200 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No reviews found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'PENDING' ? 'No customer reviews pending moderation.' : 'Try changing your search filter.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
