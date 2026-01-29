"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Cart from "@/components/Cart";

import { useCustomer } from "@/context/CustomerContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { customer, logout, isLoaded: customerLoaded } = useCustomer();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-accent transition-colors">Madni Mall</Link>
            
            <div className="flex items-center gap-6">
                {/* 1. Clerk Authenticated (Sellers/Admins) */}
                <SignedIn>
                    <Link 
                        href="/dashboard" 
                        className="text-sm font-bold text-white hover:text-accent transition-colors"
                    >
                        Seller Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>

                {/* 2. Neon Authenticated (Customers) */}
                {customerLoaded && customer && (
                    <div className="flex items-center gap-4">
                        <Link href="/account" className="text-sm font-bold text-white hover:text-accent transition-colors">
                            My Account
                        </Link>
                        <button 
                            onClick={logout}
                            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white font-medium border border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                )}

                {/* 3. Not Authenticated */}
                <SignedOut>
                    {!customer && (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                                Customer Login
                            </Link>
                            <SignInButton 
                                mode="modal" 
                                forceRedirectUrl="/dashboard"
                                signUpForceRedirectUrl="/dashboard"
                            >
                                <button className="bg-accent text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm">
                                    Sign in as Seller
                                </button>
                            </SignInButton>
                        </div>
                    )}
                </SignedOut>
            </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1">
            {children}
        </div>
        <aside className="w-80 hidden lg:block">
             <Cart />
        </aside>
      </main>
    </div>
  );
}
