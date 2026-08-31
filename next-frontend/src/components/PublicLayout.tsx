"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import SearchBar from "@/components/SearchBar";
import { 
  ShoppingBag, 
  Home, 
  Store, 
  Search, 
  User, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Sparkles,
  Layers,
  ShieldAlert,
  Bot,
  Download,
  Smartphone
} from 'lucide-react';

import { useCustomer } from "@/context/CustomerContext";
import { useCart } from "@/context/CartContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { customer, logout, isLoaded: customerLoaded } = useCustomer();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isAdmin = user?.id === "user_38gxODtYHX94wosiJA1SvLD4M7C" || user?.publicMetadata?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FAFAFE] text-[#161226] selection:bg-[#A163F7] selection:text-white">
      {/* Unified Cart Drawer Overlay (Mobile & Desktop) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] transition-all">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-[#161226]/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsCartOpen(false)}
            />
            {/* Drawer Panel */}
            <div className="absolute right-0 top-0 h-full w-[90%] sm:w-[420px] max-w-full bg-white shadow-2xl transition-transform ease-out duration-300">
                <Cart onClose={() => setIsCartOpen(false)} />
            </div>
        </div>
      )}

      {/* Top Banner Ticker */}
      <div className="bg-[#161226] text-slate-300 text-[11px] font-medium py-1.5 px-3 sm:px-4 text-center border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1.5 mx-auto md:mx-0">
            <Sparkles className="w-3.5 h-3.5 text-[#45E3FF] animate-pulse" />
            <span className="font-semibold text-white">AI Plaza Marketplace</span> — Smart multi-shop catalogs & instant cash on delivery
          </span>
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-[#45E3FF]" /> Cash on Delivery (COD)</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#A163F7]" /> 100% Verified Sellers</span>
          </div>
        </div>
      </div>

      {/* Sticky Main Header */}
      <header className="glass-header text-white shadow-lg sticky top-0 z-50 border-b border-purple-900/40 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 md:py-3.5 flex justify-between items-center gap-2 sm:gap-4 min-w-0">
            
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <div className="w-full h-full bg-[#161226] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#45E3FF] group-hover:text-[#A163F7] transition-colors" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white group-hover:text-[#45E3FF] transition-colors truncate">
                    AI PLAZA
                  </span>
                  <span className="bg-[#A163F7]/20 text-[#A163F7] border border-[#A163F7]/40 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                    MARKET
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden md:block">Smart Multi-Vendor Mall</p>
              </div>
            </Link>
            
            {/* Desktop Quick Nav Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-300 flex-shrink-0">
              <Link 
                href="/" 
                className={`hover:text-white transition-colors flex items-center gap-1.5 py-1 ${pathname === '/' ? 'text-white border-b-2 border-[#45E3FF]' : ''}`}
              >
                <Home className="w-3.5 h-3.5 text-[#A163F7]" /> Home
              </Link>
              <Link 
                href="/shops" 
                className={`hover:text-white transition-colors flex items-center gap-1.5 py-1 ${pathname.startsWith('/shops') ? 'text-white border-b-2 border-[#45E3FF]' : ''}`}
              >
                <Store className="w-3.5 h-3.5 text-[#6F88FC]" /> All Shops
              </Link>
              <Link 
                href={customer || user ? "/ai" : "/login?redirect=/ai"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${pathname.startsWith('/ai') ? 'bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white shadow-md shadow-purple-500/30 font-black' : 'bg-[#A163F7]/15 hover:bg-[#A163F7]/30 text-[#45E3FF] border border-[#A163F7]/40'}`}
              >
                <Bot className="w-4 h-4 text-[#45E3FF] animate-pulse" />
                <span>AI Assistant</span>
                <span className="bg-[#45E3FF] text-[#161226] text-[8px] font-black px-1 rounded-sm">NEW</span>
              </Link>
            </nav>

            {/* Desktop Live Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-2 min-w-0">
                <SearchBar />
            </div>

            {/* Action Buttons & Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                {/* Cart Trigger */}
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3.5 py-2 rounded-xl border border-purple-400/20 shadow-sm transition-all group active:scale-95 flex-shrink-0 cursor-pointer"
                    title="View Cart"
                >
                    <div className="relative flex items-center">
                      <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#45E3FF] group-hover:scale-110 transition-transform" />
                      {cartItemsCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-[#FF7582] text-white text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center ring-2 ring-[#161226] animate-pulse shadow-sm">
                              {cartItemsCount}
                          </span>
                      )}
                    </div>
                    <span className="hidden xl:inline font-bold text-xs">
                      {cartItemsCount > 0 ? `Rs. ${cartTotal.toLocaleString()}` : "Cart"}
                    </span>
                </button>

                {/* 1. Clerk Authenticated (Sellers/Admins) */}
                <SignedIn>
                    {isAdmin && (
                      <Link 
                          href="/admin" 
                          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black bg-[#FF7582] hover:bg-[#ff5e6e] text-white px-2.5 py-2 rounded-xl shadow-md shadow-rose-500/20 transition-all flex-shrink-0"
                      >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin</span>
                      </Link>
                    )}
                    <Link 
                        href="/dashboard" 
                        className="hidden sm:inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white px-3 py-2 rounded-xl shadow-md shadow-purple-500/20 transition-all flex-shrink-0"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Seller Portal</span>
                    </Link>
                    <div className="flex items-center justify-center flex-shrink-0">
                      <UserButton 
                        afterSignOutUrl="/" 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8 rounded-full ring-2 ring-[#A163F7]/50 shadow-sm"
                          }
                        }}
                      />
                    </div>
                </SignedIn>

                {/* 2. Neon Authenticated (Customers) */}
                {customerLoaded && customer && (
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <Link 
                          href="/account" 
                          className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/20 transition-all flex-shrink-0"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-[10px] shadow-xs">
                                {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="hidden sm:inline">{customer.full_name?.split(' ')[0] || 'Account'}</span>
                        </Link>
                        <button 
                            onClick={logout}
                            className="hidden md:block text-[11px] bg-white/5 hover:bg-[#FF7582]/20 hover:text-[#FF7582] px-2 py-1.5 rounded-lg text-slate-300 font-semibold border border-white/10 transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                )}

                {/* 3. Not Authenticated */}
                <SignedOut>
                    {!customer && (
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            <Link 
                              href="/login" 
                              className="text-xs font-bold text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
                            >
                                Login
                            </Link>
                            <SignInButton 
                                mode="modal" 
                                forceRedirectUrl="/dashboard"
                                signUpForceRedirectUrl="/dashboard"
                            >
                                <button className="flex items-center gap-1 bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] text-white font-black text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-2 rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-95 flex-shrink-0 cursor-pointer">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Sell</span>
                                </button>
                            </SignInButton>
                        </div>
                    )}
                </SignedOut>
            </div>
        </div>
      </header>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden bg-[#161226] border-b border-purple-900/30 p-2.5 sticky top-[53px] sm:top-[57px] z-40 shadow-md w-full max-w-full">
        <SearchBar />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 md:py-8 mb-16 md:mb-0 min-w-0">
        {children}
      </main>

      {/* Modern Marketplace Footer */}
      <footer className="bg-[#161226] text-slate-400 border-t border-purple-900/40 text-xs mt-12 hidden md:block w-full">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-sm shadow-md">
                  AI
                </div>
                <span className="text-white font-black text-base tracking-tight">AI PLAZA</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Your premier AI-powered marketplace. Discover verified shops, buy direct with wholesale rates, and enjoy seamless multi-vendor order fulfillment.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">Quick Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-[#45E3FF] transition-colors">Home Marketplace</Link></li>
                <li><Link href="/shops" className="hover:text-[#45E3FF] transition-colors">Verified Shops Directory</Link></li>
                <li><Link href="/search" className="hover:text-[#45E3FF] transition-colors">Smart Search Catalog</Link></li>
                <li><Link href="/login" className="hover:text-[#45E3FF] transition-colors">Customer Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">For Shop Owners & Admins</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-[#A163F7] transition-colors">Seller Dashboard</Link></li>
                <li><Link href="/dashboard/products/new" className="hover:text-[#A163F7] transition-colors">Add New Products</Link></li>
                <li><Link href="/dashboard/orders" className="hover:text-[#A163F7] transition-colors">Order Management</Link></li>
                <li><Link href="/admin" className="hover:text-[#FF7582] font-semibold transition-colors">Super Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">Customer Support & Guarantees</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Truck className="w-4 h-4 text-[#45E3FF] flex-shrink-0" />
                  <span>Cash on Delivery (All Pakistan)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-[#A163F7] flex-shrink-0" />
                  <span>100% Genuine Store Products</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Headphones className="w-4 h-4 text-[#FF7582] flex-shrink-0" />
                  <span>Direct Shop Contact & Support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-purple-900/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#45E3FF]" />
                <h4 className="text-white font-bold text-sm">Download Our Mobile Apps</h4>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/downloads/ai-plaza-customer.apk"
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#A163F7] to-[#7C3AED] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Customer App
                </a>
                <a
                  href="/downloads/ai-plaza-seller.apk"
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#45E3FF] to-[#0EA5E9] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Seller App
                </a>
                <a
                  href="/downloads/ai-plaza-admin.apk"
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md border border-purple-700/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  Admin App
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-purple-900/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} AI Plaza Marketplace. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <span className="text-[#A163F7] font-bold">FastAPI + Next.js</span>
            </p>
          </div>
        </div>
      </footer>

      {/* App-like Fixed Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161226]/95 backdrop-blur-lg border-t border-purple-900/40 px-2 py-1.5 shadow-2xl w-full max-w-full">
        <div className="grid grid-cols-5 items-center text-center">
          
          {/* Home */}
          <Link 
            href="/" 
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${pathname === '/' ? 'text-[#45E3FF] font-black' : 'text-slate-400 font-medium hover:text-slate-200'}`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
          </Link>

          {/* Shops */}
          <Link 
            href="/shops" 
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${pathname.startsWith('/shops') ? 'text-[#A163F7] font-black' : 'text-slate-400 font-medium hover:text-slate-200'}`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Shops</span>
          </Link>

          {/* AI Assistant Prominent Center Action */}
          <Link 
            href={customer || user ? "/ai" : "/login?redirect=/ai"} 
            className="flex flex-col items-center -mt-5 group"
          >
            <div className="relative p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] shadow-lg shadow-purple-500/40 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${pathname === '/ai' ? 'bg-gradient-to-tr from-[#A163F7] to-[#6F88FC] text-white' : 'bg-[#161226] text-[#45E3FF]'}`}>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45E3FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#45E3FF]"></span>
              </span>
            </div>
            <span className={`text-[9px] font-black mt-0.5 tracking-tight ${pathname === '/ai' ? 'text-[#45E3FF]' : 'text-slate-300'}`}>
              AI Chat
            </span>
          </Link>

          {/* Cart with Badge */}
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="flex flex-col items-center py-1 relative text-slate-400 font-medium hover:text-slate-200"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF7582] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center ring-1 ring-[#161226] animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Cart</span>
          </button>

          {/* Admin / Portal / Account */}
          <Link 
            href={isAdmin ? "/admin" : (customer ? "/account" : "/login")} 
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${pathname.startsWith('/admin') || pathname.startsWith('/account') || pathname.startsWith('/login') ? 'text-[#FF7582] font-black' : 'text-slate-400 font-medium hover:text-slate-200'}`}
          >
            {isAdmin ? (
              <>
                <ShieldAlert className="w-5 h-5 mb-0.5 text-[#FF7582]" />
                <span className="text-[10px] text-[#FF7582] font-bold">Admin</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">{customer ? "Account" : "Login"}</span>
              </>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
}
