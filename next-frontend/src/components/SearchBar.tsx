"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { search } from "@/services/api";
import Link from "next/link";
import { Search, X, Store, Package, ChevronRight, Sparkles } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ shops: any[]; products: any[] } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await search.unified(query);
          setResults(res.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-full">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, or shops in Gul Plaza..."
          className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-xl border border-purple-900/50 bg-[#161226]/90 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#45E3FF]/50 focus:border-[#45E3FF] transition-all shadow-inner"
          onFocus={() => {
            if (results) setIsOpen(true);
          }}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45E3FF]" />
        
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A163F7] animate-spin" />
              Searching Gul Plaza catalog...
            </div>
          ) : results ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {/* No Results */}
              {results.shops.length === 0 && results.products.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-bold">No results found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching by shop name or product category</p>
                </div>
              )}

              {/* Shops Section */}
              {results.shops.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 flex justify-between items-center bg-purple-50/50 border-b border-slate-100">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#A163F7] flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" /> Matching Shops
                    </h3>
                  </div>
                  <ul>
                    {results.shops.slice(0, 4).map((shop: any) => (
                      <li key={shop.id}>
                        <Link 
                          href={`/shops/${shop.id}`}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                            {shop.logo_url ? (
                              <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#A163F7] truncate">{shop.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{shop.description || 'Verified Gul Plaza Store'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#A163F7] transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                    {results.shops.length > 4 && (
                      <li className="px-4 py-2 text-center bg-slate-50/50 border-t border-slate-100">
                        <Link href={`/search?q=${encodeURIComponent(query)}`} className="text-xs font-bold text-[#6F88FC] hover:underline">
                          View all {results.shops.length} matching shops
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="py-2 border-t border-slate-100">
                  <div className="px-4 py-2 flex justify-between items-center bg-cyan-50/50 border-b border-slate-100">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#6F88FC] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Matching Products
                    </h3>
                  </div>
                  <ul>
                    {results.products.slice(0, 8).map((product: any) => (
                      <li key={product.id}>
                        <Link 
                          href={`/products/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                             {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#A163F7] truncate">{product.name}</h4>
                            <p className="text-xs font-black text-[#6F88FC]">Rs. {product.price.toLocaleString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#A163F7] transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
