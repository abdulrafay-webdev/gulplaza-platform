"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import SearchBar from "@/components/SearchBar";
import { ShoppingBag } from 'lucide-react';

import { useCustomer } from "@/context/CustomerContext";
import { useCart } from "@/context/CartContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { customer, logout, isLoaded: customerLoaded } = useCustomer();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Unified Cart Drawer Overlay (Mobile & Desktop) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            {/* Drawer Panel */}
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <Cart onClose={() => setIsCartOpen(false)} />
            </div>
        </div>
      )}

      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
            <Link href="/" className="text-xl md:text-2xl font-black text-white hover:text-accent transition-colors tracking-tight flex-shrink-0">Madni Mall</Link>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-lg mx-auto">
                <SearchBar />
            </div>

            <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                {/* Unified Cart Trigger (Desktop & Mobile) */}
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                    <ShoppingBag className="w-6 h-6 group-hover:text-accent transition-colors" />
                    {cartItemsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-primary animate-pulse">
                            {cartItemsCount}
                        </span>
                    )}
                </button>

                {/* 1. Clerk Authenticated (Sellers/Admins) */}
                <SignedIn>
                    <Link 
                        href="/dashboard" 
                        className="hidden md:block text-sm font-bold text-white hover:text-accent transition-colors"
                    >
                        Seller Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>

                {/* 2. Neon Authenticated (Customers) */}
                {customerLoaded && customer && (
                    <div className="flex items-center gap-4">
                        <Link href="/account" className="text-xs md:text-sm font-bold text-white hover:text-accent transition-colors">
                            Account
                        </Link>
                        <button 
                            onClick={logout}
                            className="hidden md:block text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white font-medium border border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                )}

                {/* 3. Not Authenticated */}
                <SignedOut>
                    {!customer && (
                        <div className="flex items-center gap-3 md:gap-4">
                            <Link href="/login" className="text-xs md:text-sm font-medium text-white/80 hover:text-white transition-colors">
                                Login
                            </Link>
                            <SignInButton 
                                mode="modal" 
                                forceRedirectUrl="/dashboard"
                                signUpForceRedirectUrl="/dashboard"
                            >
                                <button className="bg-accent text-white px-3 md:px-5 py-1.5 md:py-2 rounded-md font-bold text-[10px] md:text-sm hover:bg-amber-600 transition-colors shadow-sm">
                                    Sell
                                </button>
                            </SignInButton>
                        </div>
                    )}
                </SignedOut>
            </div>
        </div>
      </header>
      
      {/* Mobile Search Bar (Below Header) */}
      <div className="md:hidden bg-white border-b border-gray-100 p-3 shadow-sm sticky top-[72px] z-40">
        <SearchBar />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
