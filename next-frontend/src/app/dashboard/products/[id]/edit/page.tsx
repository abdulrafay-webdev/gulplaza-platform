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

    // Product Variants State
    const [hasVariants, setHasVariants] = useState(false);
    const [variantsList, setVariantsList] = useState<{ id?: number; name: string; price: number; stock_quantity: number }[]>([
        { name: '', price: 0, stock_quantity: 10 }
    ]);

    const handleAddVariant = () => {
        setVariantsList(prev => [...prev, { name: '', price: formData.price || 0, stock_quantity: 10 }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariantsList(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: string, value: any) => {
        setVariantsList(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

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

                if (p.variants && p.variants.length > 0) {
                    setHasVariants(true);
                    setVariantsList(p.variants.map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        price: v.price,
                        stock_quantity: v.stock_quantity ?? 0
                    })));
                }
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
        const trimmedName = (formData.name || '').trim();
        if (!trimmedName) {
            alert("Please enter a Product Name.");
            return;
        }
        if (!formData.main_category_id) {
            alert("Main Category is required.");
            return;
        }
        
        const cleanPrice = isNaN(Number(formData.price)) || Number(formData.price) < 0 ? 0 : Number(formData.price);
        const cleanStock = isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0 ? 0 : Math.floor(Number(formData.stock_quantity));
        const cleanMainCat = formData.main_category_id ? parseInt(formData.main_category_id, 10) : null;
        const cleanSubCat = formData.sub_category_id && !isNaN(parseInt(formData.sub_category_id, 10)) ? parseInt(formData.sub_category_id, 10) : null;

        let cleanVariants: { id?: number; name: string; price: number; stock_quantity: number }[] = [];
        let finalPrice = cleanPrice;
        let finalStock = cleanStock;

        if (hasVariants) {
            const validVariants = variantsList
                .filter(v => (v.name || '').trim().length > 0)
                .map(v => ({
                    ...(v.id ? { id: v.id } : {}),
                    name: v.name.trim(),
                    price: isNaN(Number(v.price)) || Number(v.price) < 0 ? 0 : Number(v.price),
                    stock_quantity: isNaN(Number(v.stock_quantity)) || Number(v.stock_quantity) < 0 ? 0 : Math.floor(Number(v.stock_quantity))
                }));

            if (validVariants.length === 0) {
                alert("Please add at least one valid variant with a name and price, or turn off the variants switch.");
                return;
            }
            cleanVariants = validVariants;
            finalPrice = Math.min(...validVariants.map(v => v.price));
            finalStock = validVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
        } else {
            if (cleanPrice <= 0) {
                alert("Please enter a valid price for the product.");
                return;
            }
        }

        const payload: any = {
            name: trimmedName,
            short_description: (formData.short_description || '').trim() || "No short description",
            long_description: (formData.long_description || '').trim() || "No long description",
            price: finalPrice,
            stock_quantity: finalStock,
            image_url: formData.image_url || (formData.image_urls.length > 0 ? formData.image_urls[0] : null),
            image_urls: formData.image_urls || [],
            main_category_id: cleanMainCat,
            sub_category_id: cleanSubCat,
            variants: cleanVariants
        };

        setSaving(true);
        if (token) setAuthToken(token);
        try {
            await products.update(id, payload);
            alert("Product updated successfully!");
            router.push('/dashboard/products');
        } catch (err: any) {
            console.error("Error updating product:", err);
            const detail = err.response?.data?.detail;
            let errorMsg = "Error updating product";
            if (Array.isArray(detail)) {
                errorMsg = detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(", ");
            } else if (typeof detail === 'string') {
                errorMsg = detail;
            } else if (err.message) {
                errorMsg = err.message;
            }
            alert(`Failed to update product: ${errorMsg}`);
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

                {/* Variants Support */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <input 
                                type="checkbox"
                                id="hasVariantsCheckbox"
                                checked={hasVariants}
                                onChange={(e) => {
                                    setHasVariants(e.target.checked);
                                    if (e.target.checked && variantsList.length === 0) {
                                        setVariantsList([{ name: '', price: formData.price || 0, stock_quantity: formData.stock_quantity || 10 }]);
                                    }
                                }}
                                className="w-4 h-4 text-[#A163F7] rounded focus:ring-purple-500 cursor-pointer"
                            />
                            <label htmlFor="hasVariantsCheckbox" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                                This product has different variants (Sizes, Colors, Weights, Packs)
                            </label>
                        </div>
                        <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold">
                            Optional
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7">
                        Turn this on if you sell this product in different options (e.g. Small / Large, 500g / 1kg) with different prices.
                    </p>

                    {/* Dynamic Variants List */}
                    {hasVariants && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                    Product Variants ({variantsList.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddVariant}
                                    className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                    + Add Another Variant
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {variantsList.map((variant, vIdx) => (
                                    <div key={vIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Variant Name</label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Small, 500g, Red, XL"
                                                value={variant.name}
                                                onChange={(e) => handleVariantChange(vIdx, 'name', e.target.value)}
                                                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-400"
                                                required={hasVariants}
                                            />
                                        </div>
                                        <div className="w-full sm:w-36">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Price (PKR)</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                placeholder="Rs."
                                                value={variant.price === 0 ? '' : (isNaN(variant.price) ? '' : variant.price)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleVariantChange(vIdx, 'price', val === '' ? 0 : (parseFloat(val) || 0));
                                                }}
                                                className="w-full text-xs font-black text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-400"
                                                required={hasVariants}
                                            />
                                        </div>
                                        <div className="w-full sm:w-28">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Stock</label>
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                value={variant.stock_quantity === 0 ? '' : (isNaN(variant.stock_quantity) ? '' : variant.stock_quantity)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleVariantChange(vIdx, 'stock_quantity', val === '' ? 0 : (parseInt(val, 10) || 0));
                                                }}
                                                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        {variantsList.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariant(vIdx)}
                                                className="self-end sm:self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1 sm:mt-4 text-xs font-bold"
                                                title="Remove Variant"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price & Stock - Only required and shown when product has NO variants */}
                {!hasVariants && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Price (PKR) *</label>
                            <input 
                                type="number" step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                                placeholder="0.00"
                                value={formData.price === 0 ? '' : (isNaN(formData.price) ? '' : formData.price)}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData({...formData, price: val === '' ? 0 : (parseFloat(val) || 0)});
                                }}
                                required={!hasVariants}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Stock Quantity *</label>
                            <input 
                                type="number" 
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                                placeholder="0"
                                value={formData.stock_quantity === 0 ? '' : (isNaN(formData.stock_quantity) ? '' : formData.stock_quantity)}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData({...formData, stock_quantity: val === '' ? 0 : (parseInt(val, 10) || 0)});
                                }}
                                required={!hasVariants}
                            />
                        </div>
                    </div>
                )}

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
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                {formData.image_url === url && <span className="absolute bottom-0 inset-x-0 bg-[#A163F7] text-[10px] text-white text-center rounded-b py-0.5 font-bold">Main</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#A163F7] hover:bg-[#8738F6] active:scale-[0.99] text-white py-4 rounded-xl font-black text-base disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                    {saving ? "Updating Product..." : "Save Product"}
                </button>
            </form>
        </div>
    );
}
