"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { wholesale, setAuthToken } from '@/services/api';
import { 
  Package, 
  Store, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function WholesalePurchasesPage() {
  const { seller, shop, token, isLoaded } = useSeller();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true);
        if (token) setAuthToken(token);
        const res = await wholesale.listMyPurchases();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to load wholesale purchases", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && token) {
      loadPurchases();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, token]);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Vendor
          </span>
        );
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
        <span>Loading Sourcing Orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/wholesale"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wholesale Marketplace</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Wholesale Sourcing Orders</h1>
          <p className="text-slate-400 text-xs mt-0.5">Track bulk purchase orders placed to wholesale vendors</p>
        </div>

        <Link
          href="/dashboard/wholesale"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white text-xs font-black rounded-xl shadow-xs"
        >
          <Store className="w-4 h-4" />
          <span>Source More Inventory</span>
        </Link>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Wholesale Supplier</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Items Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs font-black text-slate-900 block">
                      #{o.id}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-slate-800">{o.shop_name || `Supplier #${o.shop_id}`}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900">
                      Rs. {o.total_amount?.toLocaleString()}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      Cash on Delivery (COD)
                    </span>
                  </td>

                  <td className="p-4">
                    {getStatusBadge(o.status)}
                  </td>

                  <td className="p-4 text-right">
                    <span className="font-bold text-slate-700">
                      {o.items?.length || 1} line item(s)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-16 text-center text-slate-400 text-xs">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No wholesale purchase orders placed yet.</p>
            <p className="mt-1 text-slate-400">Visit the Wholesale Marketplace to order bulk inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
