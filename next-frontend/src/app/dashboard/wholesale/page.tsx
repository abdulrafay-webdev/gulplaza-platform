"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useCart } from '@/context/CartContext';
import { wholesale, setAuthToken } from '@/services/api';
import { 
  Store, 
  Search, 
  ShoppingBag, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Layers,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export default function WholesaleMarketplacePage() {
  const { seller, shop, token, isLoaded } = useSeller();
  const { addToCart, items: cartItems } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isApprovedRetail = shop?.is_approved && (shop?.seller_type || seller?.seller_type || 'RETAIL') === 'RETAIL';
  const isWholesaleSeller = (shop?.seller_type || seller?.seller_type) === 'WHOLESALE';

  const loadWholesaleProducts = async (searchQuery: string = '') => {
    try {
      setLoading(true);
      if (token) setAuthToken(token);
      const res = await wholesale.listProducts(searchQuery ? { search: searchQuery } : undefined);
      setProducts(res.data || []);
    } catch (err: any) {
      console.error("Failed to load wholesale products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && token && isApprovedRetail) {
      loadWholesaleProducts();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, token, isApprovedRetail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWholesaleProducts(search);
  };

  const handleAddToCart = (product: any, qty: number = 10) => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.min_price || product.price,
      quantity: qty,
      shop_id: product.shop_id,
      image_url: product.image_url || (product.images?.[0]?.url)
    });

    setActionNotice(`Added ${qty}x "${product.name}" to cart!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
        <span>Loading Wholesale Marketplace Catalog...</span>
      </div>
    );
  }

  // Guard 1: Wholesale Seller cannot buy
  if (isWholesaleSeller) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Wholesale Vendor Portal</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Your account is registered as a <strong>Wholesale Seller</strong>. Wholesale Sellers list bulk items for Retail Sellers and cannot purchase from other wholesale vendors.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6F88FC] text-white font-bold text-xs rounded-xl shadow-md"
          >
            <Package className="w-4 h-4" />
            <span>Manage Your Wholesale Inventory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Guard 2: Retail seller not yet approved
  if (!shop?.is_approved) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Store Approval Pending</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Your retail shop <strong>"{shop?.name}"</strong> is currently awaiting Super Admin approval. Wholesale Marketplace bulk sourcing will be unlocked as soon as your store is verified.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#161226] via-[#1E1938] to-[#2B2353] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-purple-500/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>B2B Wholesale Sourcing Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Wholesale Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Source high-margin bulk products directly from verified wholesale vendors to stock your retail shop.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-purple-500/30 hover:opacity-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart & Checkout ({cartItems.length} items)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard/wholesale/purchases"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/15 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>My Sourcing Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Toast */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <Link href="/checkout" className="text-[#7C3AED] underline font-black text-xs">
            Go to Checkout &rarr;
          </Link>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search bulk products or suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A163F7]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#161226] text-white text-[11px] font-bold rounded-lg cursor-pointer"
          >
            Search
          </button>
        </form>

        <span className="text-xs font-bold text-slate-500 self-end sm:self-auto">
          {products.length} Wholesale Items Available
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => {
          const displayPrice = p.min_price || p.price;
          const thumb = p.image_url || (p.images && p.images[0]?.url) || '/images/placeholder.png';

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Product Thumbnail */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={thumb}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                    Wholesale Bulk
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Store className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold truncate">{p.shop_name || `Shop #${p.shop_id}`}</span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 line-clamp-2 leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {p.short_description || "High quality wholesale bulk supply ready for immediate dispatch."}
                  </p>

                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Unit Price</span>
                      <span className="text-base font-black text-slate-900">Rs. {displayPrice?.toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Stock</span>
                      <span className="text-xs font-black text-emerald-600">{p.stock_quantity} units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => handleAddToCart(p, 10)}
                  disabled={p.stock_quantity <= 0}
                  className="w-full py-2.5 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white text-xs font-black rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add 10x Pack to Cart</span>
                </button>

                <button
                  onClick={() => handleAddToCart(p, 50)}
                  disabled={p.stock_quantity < 50}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Add 50x Bulk Lot</span>
                </button>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No wholesale products found</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon as wholesale suppliers add more bulk inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
