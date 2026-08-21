"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, 
  Store, 
  Layers, 
  ArrowLeft, 
  Bot, 
  BarChart3, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard & Analytics', href: '/admin', icon: BarChart3 },
    { name: 'Store Approvals & Shops', href: '/admin/shops', icon: Store },
    { name: 'Main Categories', href: '/admin/categories', icon: Layers },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFE] text-[#161226] font-bold">
        <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin mr-2" />
        Loading AI Plaza Admin Panel...
      </div>
    );
  }

  // Access Control
  const isAdmin = user?.id === "user_38gxODtYHX94wosiJA1SvLD4M7C" || user?.publicMetadata?.role === "SUPER_ADMIN";
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[#FAFAFE]">
        <div className="w-16 h-16 rounded-full bg-[#FF7582]/10 text-[#FF7582] flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-[#161226] mb-2">Access Denied: Super Admins Only</h1>
        <p className="text-slate-500 text-xs mb-6 max-w-sm">
          You do not have permission to access the AI Plaza Super Admin Portal.
        </p>
        <Link href="/" className="bg-[#A163F7] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md">
          Back to AI Plaza
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-xs shadow-xs">
              AI
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block leading-tight">Admin Portal</span>
              <span className="text-[9px] font-bold text-[#FF7582] uppercase tracking-wider block">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs font-bold text-[#6F88FC] hover:underline mr-1">
            Site
          </Link>
          <div className="ring-2 ring-purple-500/20 rounded-full p-0.5">
            <UserButton afterSignOutUrl="/" />
          </div>
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-sm shadow-md">
                <Bot className="w-5 h-5 text-[#161226]" />
              </div>
              <div>
                <Link href="/admin" className="text-base font-black text-[#161226] hover:text-[#A163F7] transition-colors block leading-tight">
                  AI Plaza Admin
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
              {user.primaryEmailAddress?.emailAddress}
            </div>
            <UserButton afterSignOutUrl="/" />
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
              <div className="ring-2 ring-purple-500/30 rounded-full p-0.5">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
