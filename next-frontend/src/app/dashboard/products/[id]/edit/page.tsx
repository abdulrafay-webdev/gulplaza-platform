"use client";

import { useState, useEffect, use } from 'react';
import { useSeller } from '@/context/SellerContext';
import { products, categories, setAuthToken } from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IKUpload } from "imagekitio-next";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token, isLoaded } = useSeller();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Data Sources
    const [mainCategories, setMainCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        short_description: '',
        long_description: '',
        price: 0,
        stock_quantity: 0,
        image_url: '',
        image_urls: [] as string[],
        main_category_id: '',
        sub_category_id: ''
    });

    // Subcategory Creation State
    const [isCreatingSub, setIsCreatingSub] = useState(false);
    const [newSubName, setNewSubName] = useState('');

    useEffect(() => {
        if (!isLoaded) return;

        const loadData = async () => {
            if (token) setAuthToken(token);
            try {
                // Fetch categories
                const cats = await categories.list();
                setMainCategories(cats.data);
                
                const subs = await categories.listSub();
                setSubCategories(subs.data);

                // Fetch existing product
                const prodRes = await products.get(id);
                const p = prodRes.data;
                setFormData({
                    name: p.name,
                    short_description: p.short_description,
                    long_description: p.long_description,
                    price: p.price,
                    stock_quantity: p.stock_quantity,
                    image_url: p.image_url || '',
                    image_urls: p.image_urls || (p.image_url ? [p.image_url] : []),
                    main_category_id: p.main_category_id ? p.main_category_id.toString() : '',
                    sub_category_id: p.sub_category_id ? p.sub_category_id.toString() : ''
                });
            } catch (err) {
                console.error("Error loading product", err);
                alert("Failed to load product data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [token, isLoaded, id]);

    const authenticator = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const response = await fetch(`${apiUrl}/imagekit-auth`);
            if (!response.ok) throw new Error("Authentication failed");
            return await response.json();
        } catch (error) {
            throw new Error(`Authentication request failed: ${error}`);
        }
    };

    const onUploadSuccess = (res: any) => {
        const newUrl = res.url;
        setFormData(prev => {
            const updatedUrls = [...prev.image_urls, newUrl];
            return {
                ...prev,
                image_urls: updatedUrls,
                image_url: prev.image_url || newUrl 
            };
        });
    };

    const handleRemoveImage = (url: string) => {
        setFormData(prev => {
            const updatedUrls = prev.image_urls.filter(u => u !== url);
            return {
                ...prev,
                image_urls: updatedUrls,
                image_url: prev.image_url === url ? (updatedUrls[0] || '') : prev.image_url
            };
        });
    };

    const handleCreateSubCategory = async () => {
        if (!newSubName || !formData.main_category_id) return;
        if (token) setAuthToken(token);
        try {
            const res = await categories.createSub(parseInt(formData.main_category_id), { name: newSubName });
            setSubCategories([...subCategories, res.data]);
            setFormData(prev => ({ ...prev, sub_category_id: res.data.id.toString() }));
            setIsCreatingSub(false);
            setNewSubName('');
        } catch (err) {
            alert("Failed to create sub-category");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.main_category_id) {
            alert("Main Category is required");
            return;
        }
        
        setSaving(true);
        if (token) setAuthToken(token);
        try {
            await products.update(id, {
                ...formData,
                main_category_id: parseInt(formData.main_category_id),
                sub_category_id: formData.sub_category_id ? parseInt(formData.sub_category_id) : null
            });
            alert("Product updated successfully!");
            router.push('/dashboard/products');
        } catch (err) {
            alert("Error updating product");
        } finally {
            setSaving(false);
        }
    };

    const filteredSubs = subCategories.filter(s => s.main_category_id === parseInt(formData.main_category_id));

    if (loading) return <div className="p-8">Loading product data...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/products" className="text-text-secondary hover:text-primary">&larr; Back</Link>
                <h1 className="text-2xl font-bold text-primary">Edit Product</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg shadow-sm border border-gray-100 text-text-primary">
                
                {/* Basic Info */}
                <div>
                    <label className="block text-sm font-medium">Product Name</label>
                    <input 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Main Category (Required)</label>
                        <select 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                            value={formData.main_category_id}
                            onChange={e => setFormData({...formData, main_category_id: e.target.value, sub_category_id: ''})}
                            required
                        >
                            <option value="">Select Category</option>
                            {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Sub-Category (Optional)</label>
                        {!isCreatingSub ? (
                            <div className="flex gap-2">
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white flex-1"
                                    value={formData.sub_category_id}
                                    onChange={e => setFormData({...formData, sub_category_id: e.target.value})}
                                    disabled={!formData.main_category_id}
                                >
                                    <option value="">Select Sub-Category</option>
                                    {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button 
                                    type="button"
                                    onClick={() => setIsCreatingSub(true)}
                                    className="mt-1 px-3 py-2 bg-secondary text-white rounded-md text-sm whitespace-nowrap"
                                    disabled={!formData.main_category_id}
                                >
                                    + New
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 mt-1">
                                <input 
                                    className="block w-full border border-gray-300 rounded-md p-2 bg-white"
                                    placeholder="New Sub-Category Name"
                                    value={newSubName}
                                    onChange={e => setNewSubName(e.target.value)}
                                />
                                <button type="button" onClick={handleCreateSubCategory} className="px-3 py-2 bg-success text-white rounded-md text-sm">Save</button>
                                <button type="button" onClick={() => setIsCreatingSub(false)} className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md text-sm">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div>
                    <label className="block text-sm font-medium">Short Description</label>
                    <input 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.short_description}
                        onChange={e => setFormData({...formData, short_description: e.target.value})}
                        maxLength={100}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Long Description</label>
                    <textarea 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.long_description}
                        onChange={e => setFormData({...formData, long_description: e.target.value})}
                        rows={5}
                        required
                    />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Price</label>
                        <input 
                            type="number" step="0.01"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Stock</label>
                        <input 
                            type="number" 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                            value={formData.stock_quantity}
                            onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                            required
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Product Images (Gallery)</label>
                    <IKUpload 
                        fileName="product_image.jpg"
                        authenticator={authenticator}
                        onError={(err) => alert("Upload failed: " + err.message)}
                        onSuccess={onUploadSuccess}
                        className="text-sm text-text-secondary mb-4 block"
                    />
                    
                    <div className="grid grid-cols-4 gap-4">
                        {formData.image_urls.map((url, idx) => (
                            <div key={idx} className="relative group h-20 w-20">
                                <img src={url} alt="Uploaded" className="h-full w-full object-cover rounded border border-gray-200 shadow-sm" />
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveImage(url)}
                                    className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                {formData.image_url === url && <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-[10px] text-white text-center rounded-b py-0.5">Main</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-accent text-white py-4 rounded-md font-bold hover:bg-amber-600 disabled:bg-gray-300 transition-all shadow-md"
                >
                    {saving ? "Updating Product..." : "Update Product"}
                </button>
            </form>
        </div>
    );
}
