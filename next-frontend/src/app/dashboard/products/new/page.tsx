"use client";

import { useState, useEffect } from 'react';
import { useSeller } from '@/context/SellerContext';
import { shops, products, categories, ai, setAuthToken } from '@/services/api';
import { useRouter } from 'next/navigation';
import { IKUpload } from "imagekitio-next";

export default function ProductForm() {
    const { token, isLoaded } = useSeller();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
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
        image_url: '', // Main Thumbnail
        image_urls: [] as string[], // Gallery
        main_category_id: '',
        sub_category_id: ''
    });

    // Subcategory Creation State
    const [isCreatingSub, setIsCreatingSub] = useState(false);
    const [newSubName, setNewSubName] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);

    // Product Variants State
    const [hasVariants, setHasVariants] = useState(false);
    const [variantsList, setVariantsList] = useState<{ name: string; price: number; stock_quantity: number }[]>([
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

    const handleGenerateAI = async () => {
        if (!formData.name.trim()) {
            alert("Please enter a Product Name first so AI can generate descriptions!");
            return;
        }
        try {
            setAiGenerating(true);
            const res = await ai.generateDescription(
                formData.name.trim(),
                formData.main_category_id ? parseInt(formData.main_category_id) : undefined
            );
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    short_description: res.data.short_description || prev.short_description,
                    long_description: res.data.long_description || prev.long_description
                    // Notice: image_url & image_urls are left 100% untouched!
                }));
            }
        } catch (err) {
            console.error('AI generation error:', err);
            alert("AI generation temporarily unavailable. You can enter descriptions manually.");
        } finally {
            setAiGenerating(false);
        }
    };

    useEffect(() => {
        if (!isLoaded) return;

        const loadData = async () => {
            try {
                const cats = await categories.list();
                setMainCategories(cats.data);
                
                if (token) {
                    setAuthToken(token);
                    const subs = await categories.listSub();
                    setSubCategories(subs.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, [token, isLoaded]);

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

        const payload: any = {
            ...formData,
            main_category_id: parseInt(formData.main_category_id),
            sub_category_id: formData.sub_category_id ? parseInt(formData.sub_category_id) : null
        };

        if (hasVariants) {
            const validVariants = variantsList.filter(v => v.name.trim().length > 0 && v.price >= 0);
            if (validVariants.length === 0) {
                alert("Please add at least one valid variant with a name and price, or turn off the variants checkbox.");
                return;
            }
            payload.variants = validVariants;
            const minPrice = Math.min(...validVariants.map(v => v.price));
            if (!payload.price || payload.price === 0) {
                payload.price = minPrice;
            }
        }
        
        setLoading(true);
        if (token) setAuthToken(token);
        try {
            const shopRes = await shops.getMe();
            await products.create(shopRes.data.id, payload);
            alert("Product added!");
            router.push('/dashboard/products');
        } catch (err) {
            alert("Error adding product");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubs = subCategories.filter(s => s.main_category_id === parseInt(formData.main_category_id));

    if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-primary">Add New Product</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg shadow-sm border border-gray-100 text-text-primary">
                
                <div>
                    <label className="block text-sm font-medium">Product Name</label>
                    <input 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

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

                {/* AI Copilot Description Generator */}
                <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                        <div className="text-xs font-black text-[#A163F7] flex items-center gap-1.5 uppercase tracking-wider">
                            <span>✨</span> Seller AI Description Copilot
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Auto-generate high-converting marketing descriptions. Your uploaded photos remain completely unchanged!
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={aiGenerating}
                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
                    >
                        {aiGenerating ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium">Short Description</label>
                    <input 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.short_description}
                        onChange={e => setFormData({...formData, short_description: e.target.value})}
                        maxLength={100}
                        placeholder="Brief summary for product cards"
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
                        placeholder="Full product details..."
                        required
                    />
                </div>

                {/* Product Variants Checkbox & Section */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox"
                                id="hasVariantsCheckbox"
                                checked={hasVariants}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setHasVariants(checked);
                                    if (checked && variantsList.length === 0) {
                                        setVariantsList([{ name: '', price: formData.price || 0, stock_quantity: 10 }]);
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
                                                value={variant.price || ''}
                                                onChange={(e) => handleVariantChange(vIdx, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-full text-xs font-black text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-400"
                                                required={hasVariants}
                                            />
                                        </div>
                                        <div className="w-full sm:w-28">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Stock</label>
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                value={variant.stock_quantity || ''}
                                                onChange={(e) => handleVariantChange(vIdx, 'stock_quantity', parseInt(e.target.value) || 0)}
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{hasVariants ? "Base / Starting Price" : "Price"}</label>
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
                    disabled={loading}
                    className="w-full bg-accent text-white py-4 rounded-md font-bold hover:bg-amber-600 disabled:bg-gray-300 transition-all shadow-md"
                >
                    {loading ? "Saving Product..." : "Save Product"}
                </button>
            </form>
        </div>
    );
}