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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-surface shadow-md border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
        <div className="p-4 md:p-6 flex justify-between items-center md:block">
          <Link href="/" className="text-lg md:text-xl font-bold text-primary">Madni Mall Vendor</Link>
          {/* Mobile User Button */}
          <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:mt-6 no-scrollbar">
          {navItems.map(item => (
            <Link 
              key={item.name}
              href={item.href}
              className={`px-4 py-3 md:px-6 md:py-3 border-b-2 md:border-b-0 md:border-l-4 transition-colors whitespace-nowrap text-sm md:text-base ${
                pathname === item.href 
                  ? 'border-primary text-primary font-bold bg-blue-50/50 md:bg-blue-50' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-surface shadow-sm border-b border-gray-100 px-8 py-4 justify-between items-center text-text-primary font-bold">
            <h2 className="text-lg font-semibold text-text-primary">Dashboard</h2>
            <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-4 md:p-8 relative flex-1 overflow-auto">
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
