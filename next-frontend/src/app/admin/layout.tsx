"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSeller } from "@/context/SellerContext";
import { 
  ShieldAlert, 
  Store, 
  Layers, 
  ArrowLeft, 
  Bot, 
  BarChart3, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  Lock,
  Users,
  Star
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { seller, token, isLoaded, isAdmin, logout } = useSeller();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!token || !isAdmin) {
      router.push("/admin/login");
    }
  }, [isLoaded, token, isAdmin, router]);

  const navItems = [
    { name: 'Dashboard & Analytics', href: '/admin', icon: BarChart3 },
    { name: 'Store Approvals & Shops', href: '/admin/shops', icon: Store },
    { name: 'Users Directory', href: '/admin/users', icon: Users },
    { name: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
    { name: 'Main Categories', href: '/admin/categories', icon: Layers },
  ];

  if (!isLoaded || !token || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[#FAFAFE]">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-[#161226] mb-2">Super Admin Authentication Required</h1>
        <p className="text-slate-500 text-xs mb-6 max-w-sm">
          Please authenticate with your Super Admin credentials to access platform controls.
        </p>
        <Link href="/admin/login" className="bg-[#1E1B4B] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md">
          Sign In to Admin Console
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFE] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Header with Hamburger Button */}
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
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-purple-500/30 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/images/logo.png" alt="AI Plaza Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block leading-tight">Admin Portal</span>
              <span className="text-[9px] font-bold text-[#FF7582] uppercase tracking-wider block">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { logout(); router.push("/admin/login"); }}
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
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pt-1">Navigation</p>
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
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-purple-500/30 p-1 flex items-center justify-center shadow-md">
                <img src="/images/logo.png" alt="AI Plaza Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <Link href="/admin" className="text-base font-black text-[#161226] hover:text-[#A163F7] transition-colors block leading-tight">
                  Super Admin
                </Link>
                <span className="text-[10px] font-black text-[#FF7582] uppercase tracking-wider block mt-0.5">Control Center</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">Platform Admin</p>
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
            <div className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">
              {seller?.email || "Super Admin"}
            </div>
            <button
              onClick={() => { logout(); router.push("/admin/login"); }}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="hidden md:flex bg-white shadow-xs border-b border-slate-200 px-8 py-4 justify-between items-center">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Platform Control Center</h2>
              <p className="text-[11px] text-slate-400">Live monitoring, store governance & catalog management</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-bold text-[#6F88FC] hover:underline">
                View Live Site &rarr;
              </Link>
              <button
                onClick={() => { logout(); router.push("/admin/login"); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
