"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { search } from "@/services/api";
import Link from "next/link";
import { Search, X, Store, Package, ChevronRight } from "lucide-react";

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
    }, 300); // 300ms delay

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
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for shops or products..."
          className="w-full pl-10 pr-10 py-2.5 rounded-none border border-gray-200 bg-gray-50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-white transition-all shadow-sm"
          onFocus={() => {
            if (results) setIsOpen(true);
          }}
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-none shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-xs font-medium">Searching...</div>
          ) : results ? (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* No Results */}
              {results.shops.length === 0 && results.products.length === 0 && (
                <div className="p-8 text-center text-text-secondary">
                  <p className="text-sm font-medium">No results found for "{query}"</p>
                </div>
              )}

              {/* Shops Section */}
              {results.shops.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">Shops</h3>
                  </div>
                  <ul>
                    {results.shops.slice(0, 4).map((shop: any) => (
                      <li key={shop.id}>
                        <Link 
                          href={`/shops/${shop.id}`}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-none bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                            {shop.logo_url ? (
                              <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-text-primary group-hover:text-primary truncate">{shop.name}</h4>
                            <p className="text-[10px] text-text-secondary truncate">{shop.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                        </Link>
                      </li>
                    ))}
                    {results.shops.length > 4 && (
                      <li className="px-4 py-2 text-center border-t border-gray-50">
                        <Link href="/shops" className="text-xs font-bold text-secondary hover:underline">
                          View all {results.shops.length} matching shops
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-4 py-2 bg-gray-50/50">
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">Products</h3>
                  </div>
                  <ul>
                    {results.products.map((product: any) => (
                      <li key={product.id}>
                        <Link 
                          href={`/products/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-none bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                             {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-text-primary group-hover:text-primary truncate">{product.name}</h4>
                            <p className="text-xs font-black text-secondary">${product.price.toFixed(2)}</p>
                          </div>
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
