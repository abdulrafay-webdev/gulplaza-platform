"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { shops, products, setAuthToken } from '@/services/api';
import Link from 'next/link';
import { ExternalLink, Edit3, Trash2, Package, Layers } from 'lucide-react';

export default function ProductList() {
    const { token, shop, isWholesaleSeller } = useSeller();
    const [productList, setProductList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            if (token) setAuthToken(token);
            try {
                const shopRes = await shops.getMe();
                const prodRes = await products.list(shopRes.data.id);
                setProductList(prodRes.data || []);
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) loadProducts();
    }, [token]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        if (token) setAuthToken(token);
        try {
            await products.delete(id);
            setProductList(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading inventory products...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                        {isWholesaleSeller ? "Wholesale Product Inventory" : "Product Inventory"}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        {isWholesaleSeller 
                            ? "Manage your bulk wholesale catalog, stock quantities, and minimum order quantities (MOQ)."
                            : "Manage your retail store catalog, pricing, and active stock."}
                    </p>
                </div>
                <Link 
                    href="/dashboard/products/new"
                    className="bg-[#A163F7] hover:bg-[#8738F6] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                >
                    + Add <span className="hidden sm:inline">New Product</span>
                </Link>
            </div>

            {/* Empty State */}
            {productList.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#A163F7] flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No products added yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {isWholesaleSeller 
                            ? "List your first wholesale product with bulk pricing and MOQ for retail buyers."
                            : "Add products to start selling to customers across AI Plaza."}
                    </p>
                    <Link
                        href="/dashboard/products/new"
                        className="inline-block bg-[#A163F7] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#8738F6]"
                    >
                        + Create First Product
                    </Link>
                </div>
            )}

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {productList.map(product => (
                    <div key={product.id} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                        <Link href={`/products/${product.id}`} className="h-20 w-20 flex-shrink-0 block">
                            {product.image_url ? (
                                <img src={product.image_url} alt="" className="h-full w-full object-cover rounded-lg border border-gray-100 hover:opacity-90 transition-opacity" />
                            ) : (
                                <div className="h-full w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Pic</div>
                            )}
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/products/${product.id}`} className="block hover:text-[#A163F7] transition-colors">
                                <h3 className="font-bold text-text-primary truncate">{product.name}</h3>
                            </Link>
                            <p className="text-primary font-bold text-lg">Rs. {Number(product.price).toLocaleString()}</p>
                            <div className="flex items-center gap-2 text-text-secondary text-xs mb-3">
                                <span>Stock: {product.stock_quantity}</span>
                                {(product.moq > 1 || product.product_type === 'WHOLESALE') && (
                                    <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                        MOQ: {product.moq || 1}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 items-center">
                                <Link 
                                    href={`/products/${product.id}`} 
                                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" /> View
                                </Link>
                                <Link href={`/dashboard/products/${product.id}/edit`} className="text-secondary text-xs font-bold uppercase tracking-wider">Edit</Link>
                                <button onClick={() => handleDelete(product.id)} className="text-error text-xs font-bold uppercase tracking-wider">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            {productList.length > 0 && (
                <div className="hidden md:block bg-surface rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">MOQ</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {productList.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/products/${product.id}`} className="block">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt="" className="h-12 w-12 object-cover rounded-lg border border-gray-100 hover:opacity-80 transition-opacity" />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase">None</div>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-text-primary">
                                        <Link href={`/products/${product.id}`} className="hover:text-[#A163F7] transition-colors flex items-center gap-1.5">
                                            <span>{product.name}</span>
                                            {product.product_type === 'WHOLESALE' && (
                                                <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded uppercase">
                                                    Wholesale
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-text-primary font-medium">Rs. {Number(product.price).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">{product.stock_quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            (product.moq > 1 || product.product_type === 'WHOLESALE')
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-slate-500'
                                        }`}>
                                            {product.moq || 1} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                        <Link 
                                            href={`/products/${product.id}`}
                                            className="text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors inline-flex items-center gap-1"
                                            title="View Detailed Page"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> View
                                        </Link>
                                        <Link 
                                            href={`/dashboard/products/${product.id}/edit`}
                                            className="text-secondary hover:text-primary font-bold text-sm transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="text-error hover:text-red-800 font-bold text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
