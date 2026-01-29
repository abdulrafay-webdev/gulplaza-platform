"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const navItems = [
    { name: 'Shop Approvals', href: '/admin' },
    { name: 'Main Categories', href: '/admin/categories' },
  ];

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  // Access Control
  const isAdmin = user?.id === "user_38gxODtYHX94wosiJA1SvLD4M7C" || user?.publicMetadata?.role === "SUPER_ADMIN";
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl uppercase tracking-widest bg-background">Access Denied. Admins Only.</div>;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface shadow-md border-r border-gray-100">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-primary">Madni Mall Admin</Link>
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
        <header className="bg-surface shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center text-text-primary font-bold">
            <h2 className="text-lg font-semibold uppercase tracking-tight">Super Admin Portal</h2>
            <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
