"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSeller } from "@/context/SellerContext";
import { 
  Store, 
  Layers, 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  Menu, 
  X,
  Sparkles,
  BarChart3,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { seller, shop, token, isLoaded, logout, refreshProfile } = useSeller();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!token) {
      router.push("/seller/login");
    }
  }, [isLoaded, token, router]);

  if (!isLoaded || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFE] text-slate-500 font-bold">
        <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin mr-2" />
        Loading AI Plaza Vendor Portal...
      </div>
    );
  }
  
  const isPending = shop && !shop.is_approved;

  const navItems = [
    { name: 'Store Analytics', href: '/dashboard', icon: BarChart3 },
    { name: 'Products Inventory', href: '/dashboard/products', icon: Layers },
    { name: 'Customer Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Product Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFE] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-xs shadow-xs">
              AI
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block leading-tight">{shop?.name || seller?.full_name || "Seller Portal"}</span>
              <span className="text-[9px] font-bold text-[#A163F7] uppercase tracking-wider block">Vendor Control</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { logout(); router.push("/seller/login"); }}
            className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#161226]/50 backdrop-blur-xs top-[57px] transition-all">
          <div className="bg-white p-4 border-b border-slate-200 shadow-xl space-y-2 animate-in slide-in-from-top-4 duration-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pt-1">Seller Menu</p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white shadow-md shadow-purple-500/20' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 mt-2">
              <Link 
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop & Tablet */}
      <aside className="hidden md:flex w-64 bg-white shadow-xs border-r border-slate-200 flex-col justify-between flex-shrink-0 min-h-screen">
        <div>
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-sm shadow-md">
                AI
              </div>
              <div>
                <Link href="/" className="text-base font-black text-[#161226] hover:text-[#A163F7] transition-colors block leading-tight">
                  {shop?.name || "AI Plaza Vendor"}
                </Link>
                <span className="text-[10px] font-black text-[#A163F7] uppercase tracking-wider block mt-0.5">Seller Portal</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">Shop Management</p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white shadow-md shadow-purple-500/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#161226]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-[#161226] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Visit Marketplace</span>
          </Link>
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold text-slate-800 truncate">{seller?.full_name || seller?.email}</p>
              <p className="text-[9px] text-slate-400 truncate">{seller?.email}</p>
            </div>
            <button
              onClick={() => { logout(); router.push("/seller/login"); }}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="hidden md:flex bg-white shadow-xs border-b border-slate-200 px-8 py-4 justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Vendor Management Dashboard</h2>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-bold text-[#6F88FC] hover:underline">
                View AI Plaza Store &rarr;
              </Link>
              <button
                onClick={() => { logout(); router.push("/seller/login"); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8 relative flex-1 overflow-x-hidden">
          {isPending ? (
              <div className="fixed inset-0 bg-[#161226]/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border border-slate-200">
                      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8" />
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 mb-2">Account Pending Approval</h1>
                      <p className="text-slate-500 text-xs mb-6">
                          Your store application for <strong>{shop?.name || "Your Store"}</strong> is currently being reviewed by the AI Plaza super admin team.
                      </p>
                      <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl text-xs mb-6 border border-amber-200 font-semibold">
                          Dashboard product management and order fulfillment will be unlocked as soon as approval is granted.
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={refreshProfile}
                          className="bg-[#A163F7] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer hover:opacity-95"
                        >
                          Check Status
                        </button>
                        <Link href="/" className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200">
                          Visit Marketplace
                        </Link>
                      </div>
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
