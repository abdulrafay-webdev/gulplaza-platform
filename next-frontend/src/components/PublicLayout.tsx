"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Cart from "@/components/Cart";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-accent transition-colors">Gul Plaza</Link>
            <div className="flex items-center gap-4">
                <SignedIn>
                    <Link 
                        href="/dashboard" 
                        className="text-sm font-medium text-white hover:text-accent mr-4 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    {/* "Sign in as Seller" triggers login and redirects to dashboard */}
                    <SignInButton 
                        mode="modal" 
                        forceRedirectUrl="/dashboard"
                        signUpForceRedirectUrl="/dashboard"
                    >
                        <button className="bg-accent text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm">
                            Sign in as Seller
                        </button>
                    </SignInButton>
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
