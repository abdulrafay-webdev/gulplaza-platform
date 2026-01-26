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
                <h1 className="text-2xl font-bold text-primary">Products</h1>
                <Link 
                    href="/dashboard/products/new"
                    className="bg-accent text-white px-4 py-2 rounded font-bold hover:bg-amber-600"
                >
                    Add Product
                </Link>
            </div>

            <div className="bg-surface rounded shadow overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {productList.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt="" className="h-10 w-10 object-cover rounded" />
                                    ) : (
                                        <div className="h-10 w-10 bg-gray-200 rounded"></div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{product.stock_quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <Link 
                                        href={`/dashboard/products/${product.id}/edit`}
                                        className="text-secondary hover:underline font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        className="text-error hover:underline font-medium"
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
