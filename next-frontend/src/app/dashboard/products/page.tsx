"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { shops, products, setAuthToken } from '@/services/api';
import Link from 'next/link';

export default function ProductList() {
    const { getToken } = useAuth();
    const [productList, setProductList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            const token = await getToken();
            setAuthToken(token);
            try {
                const shopRes = await shops.getMe();
                const prodRes = await products.list(shopRes.data.id);
                setProductList(prodRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [getToken]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const token = await getToken();
        setAuthToken(token);
        try {
            await products.delete(id);
            setProductList(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Product Inventory</h1>
                <Link 
                    href="/dashboard/products/new"
                    className="bg-accent text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-amber-600 transition-all shadow-sm"
                >
                    + Add <span className="hidden sm:inline">New</span>
                </Link>
            </div>

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {productList.map(product => (
                    <div key={product.id} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0">
                            {product.image_url ? (
                                <img src={product.image_url} alt="" className="h-full w-full object-cover rounded-lg border border-gray-100" />
                            ) : (
                                <div className="h-full w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Pic</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-primary truncate">{product.name}</h3>
                            <p className="text-primary font-bold text-lg">${product.price}</p>
                            <p className="text-text-secondary text-xs mb-3 italic">Stock: {product.stock_quantity}</p>
                            <div className="flex gap-3">
                                <Link href={`/dashboard/products/${product.id}/edit`} className="text-secondary text-xs font-bold uppercase tracking-wider">Edit</Link>
                                <button onClick={() => handleDelete(product.id)} className="text-error text-xs font-bold uppercase tracking-wider">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-surface rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Image</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {productList.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt="" className="h-12 w-12 object-cover rounded-lg border border-gray-100" />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase">None</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-text-primary">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary font-medium">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">{product.stock_quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
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
        </div>
    );
}
