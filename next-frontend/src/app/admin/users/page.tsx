"use client";

import { useState, useEffect } from 'react';
import { admin } from '@/services/api';
import { 
  Users, 
  Store, 
  User, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  Calendar, 
  ShoppingBag, 
  Package, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'SELLERS' | 'CUSTOMERS'>('SELLERS');
  const [sellers, setSellers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await admin.listUsers();
      setSellers(res.data?.sellers || []);
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'SELLERS' ? sellers : customers;

  const filtered = currentList.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.shop_name && u.shop_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#7C3AED]" />
            Platform Users Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive directory of registered vendors and customers with collective account details.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('SELLERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SELLERS'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Sellers ({sellers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CUSTOMERS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()} by name, email, phone, shop...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-xs transition-colors"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
          <p className="text-xs font-semibold">Loading platform users...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user, idx) => {
            const isSeller = activeTab === 'SELLERS';
            return (
              <div
                key={user.id || idx}
                onClick={() => { setSelectedUser({ ...user, isSeller }); setShowPassword(false); }}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        isSeller ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.full_name?.charAt(0).toUpperCase() || (isSeller ? 'S' : 'C')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                          {user.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          ID: #{user.id}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                      isSeller ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isSeller ? 'Seller' : 'Customer'}
                    </span>
                  </div>

                  {isSeller && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mb-2 bg-purple-50/50 px-2.5 py-1 rounded-lg">
                      <Store className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{user.shop_name || 'No Store'}</span>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{user.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{user.phone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  {isSeller ? (
                    <span className="text-slate-500 font-medium">
                      📦 {user.products_count || 0} products • {user.orders_count || 0} orders
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      🛍️ {user.total_orders || 0} orders placed
                    </span>
                  )}
                  <span className="text-purple-600 font-bold text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No {activeTab.toLowerCase()} found</h3>
              <p className="text-xs text-slate-500 mt-1">Try changing your search terms.</p>
            </div>
          )}
        </div>
      )}

      {/* COLLECTIVE DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#161226]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                  selectedUser.isSeller ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedUser.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">{selectedUser.full_name}</h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      ID #{selectedUser.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedUser.isSeller ? 'Registered Vendor Account' : 'Registered Customer Profile'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Contact Information */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Contact & Identification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Email Address:</span>
                    <span className="font-bold text-slate-900">{selectedUser.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Phone Number:</span>
                    <span className="font-bold text-slate-900">{selectedUser.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Registration Date:</span>
                    <span className="font-bold text-slate-900">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Account Status:</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Password & Security (Explicitly requested by user) */}
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" /> Account Password & Hash
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Mask' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="bg-white rounded-xl p-3 border border-amber-200/60 text-xs font-mono break-all text-slate-800">
                  {showPassword ? (selectedUser.hashed_password || 'pbkdf2_sha256$...') : '••••••••••••••••••••••••••••••••••••••••'}
                </div>
                <p className="text-[10px] text-amber-700">
                  Passwords in AI Plaza are cryptographically secured using standard bcrypt/pbkdf2 hashing.
                </p>
              </div>

              {/* Seller Store Info */}
              {selectedUser.isSeller && (
                <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-200/80 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                    Store Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Shop Name:</span>
                      <span className="font-bold text-purple-900">{selectedUser.shop_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Store Category:</span>
                      <span className="font-bold text-slate-900">{selectedUser.shop_category || 'General'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 font-medium block">Physical Address:</span>
                      <span className="font-bold text-slate-900">{selectedUser.shop_address || 'Karachi, Pakistan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Products Listed:</span>
                      <span className="font-bold text-slate-900">{selectedUser.products_count || 0} active</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Orders Handled:</span>
                      <span className="font-bold text-slate-900">{selectedUser.orders_count || 0} orders</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer History */}
              {!selectedUser.isSeller && (
                <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-200/80 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                    Customer Shopping History
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Orders Placed:</span>
                      <span className="font-bold text-slate-900">{selectedUser.total_orders || 0} orders</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Total Spend:</span>
                      <span className="font-bold text-emerald-600">Rs. {(selectedUser.total_spent || 0).toLocaleString()}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 font-medium block">Shipping Address:</span>
                      <span className="font-bold text-slate-900">{selectedUser.shipping_address || 'Karachi, Pakistan'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
