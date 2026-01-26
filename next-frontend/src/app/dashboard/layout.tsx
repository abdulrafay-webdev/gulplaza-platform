"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { shops, setAuthToken } from "@/services/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getToken, isLoaded, userId } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    const checkShop = async () => {
        if (!userId) {
            // Should be handled by middleware, but client-side check
            console.log("No user ID");
            setLoading(false); 
            return;
        }
        
        console.log("Auth loaded, fetching token...");
        try {
            const token = await getToken();
            console.log("Token fetched, checking shop...");
            setAuthToken(token);
            
            const res = await shops.getMe();
            console.log("Shop found:", res.data);
            setShop(res.data);
        } catch (err: any) {
            console.log("Shop check error (or no shop):", err);
        } finally {
            console.log("Loading complete.");
            setLoading(false);
        }
    };
    checkShop();
  }, [isLoaded, userId, getToken]);

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard... (Auth: {isLoaded ? 'Yes' : 'No'})</div>;

  // Block access if shop exists but is pending
  // Exception: Allow access if on the exact dashboard page (to see status) or if creating a shop
  // But simpler: Just show overlay if pending.
  
  const isPending = shop && !shop.is_approved;

  const navItems = [
    { name: 'Shop Profile', href: '/dashboard' },
    { name: 'Products', href: '/dashboard/products' },
    { name: 'Orders', href: '/dashboard/orders' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface shadow-md border-r border-gray-100">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-primary">Gul Plaza Vendor</Link>
        </div>
        <nav className="mt-6">
          {navItems.map(item => (
            <Link 
              key={item.name}
              href={item.href}
              className={`block px-6 py-3 border-l-4 transition-colors ${
                pathname === item.href 
                  ? 'bg-blue-50 border-primary text-primary font-medium' 
                  : 'border-transparent text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-surface shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-primary">Dashboard</h2>
            <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-8 relative">
          {isPending ? (
              <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                  <div className="bg-surface p-8 rounded-lg shadow-xl max-w-md text-center border border-gray-100">
                      <div className="text-status-pending mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <h1 className="text-2xl font-bold text-text-primary mb-2">Account Pending Approval</h1>
                      <p className="text-text-secondary mb-6">
                          Your seller account for <strong>{shop.name}</strong> is currently under review by our admin team.
                      </p>
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm mb-6 border border-amber-100">
                          Access to the Seller Dashboard is restricted until approval is granted.
                      </div>
                      <Link href="/" className="text-secondary hover:underline font-medium">
                          &larr; Back to Home
                      </Link>
                  </div>
              </div>
          ) : (
              children
          )}
        </main>
      </div>
    </div>
  );
}
