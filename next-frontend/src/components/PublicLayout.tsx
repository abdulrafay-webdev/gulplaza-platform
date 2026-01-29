"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import { ShoppingBag, Menu, MenuIcon } from 'lucide-react';

import { useCustomer } from "@/context/CustomerContext";
import { useCart } from "@/context/CartContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { customer, logout, isLoaded: customerLoaded } = useCustomer();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Mobile Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            {/* Drawer Panel */}
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <Cart onClose={() => setIsCartOpen(false)} />
            </div>
        </div>
      )}

      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-black text-white hover:text-accent transition-colors tracking-tight">Madni Mall</Link>
            
            <div className="flex items-center gap-3 md:gap-6">
                {/* Mobile Cart Trigger */}
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ShoppingBag className="w-6 h-6" />
                    {cartItemsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-primary">
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
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
            {children}
        </div>
        <aside className="w-80 hidden lg:block flex-shrink-0">
             <Cart />
        </aside>
      </main>

      {/* Floating Mobile Cart Button (Corner) */}
      {!isCartOpen && cartItemsCount > 0 && (
        <button 
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 lg:hidden z-40 bg-accent text-white p-4 rounded-full shadow-2xl shadow-accent/40 animate-bounce"
        >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-accent">
                {cartItemsCount}
            </span>
        </button>
      )}
    </div>
  );
}
