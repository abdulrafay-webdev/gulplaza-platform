"use client";

import { useEffect, useState } from 'react';
import { useSeller } from '@/context/SellerContext';
import { categories, setAuthToken } from '@/services/api';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Search, 
  Tag, 
  FolderPlus,
  Package,
  AlertCircle
} from 'lucide-react';

export default function AdminCategories() {
    const { token } = useSeller();
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('⚡');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const availableIcons = ['⚡', '🍳', '👗', '👟', '✨', '🍽️', '⌚', '🧸', '👜', '📱', '🎧', '🛋️'];

    const loadCategories = async () => {
        try {
            const res = await categories.list();
            setCategoryList(res.data || []);
        } catch (err) {
            console.error("Failed to load categories", err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        if (token) setAuthToken(token);
        try {
            await categories.create({ 
                name: name.trim(), 
                description: description.trim() 
            });
            setName('');
            setDescription('');
            setIsCreateOpen(false);
            setFeedbackMessage("Category created successfully!");
            await loadCategories();
            setTimeout(() => setFeedbackMessage(null), 3000);
        } catch (err) {
            alert("Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId: number, categoryName: string) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"? Products in this category will be unlinked.`)) return;

        if (token) setAuthToken(token);
        try {
            await categories.delete(categoryId);
            setFeedbackMessage(`Category "${categoryName}" deleted.`);
            await loadCategories();
            setTimeout(() => setFeedbackMessage(null), 3000);
        } catch (err) {
            alert("Failed to delete category.");
        }
    };

    const filteredCategories = categoryList.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (pageLoading) {
        return (
            <div className="py-24 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A163F7] animate-spin" />
                Loading Categories & Taxonomies...
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-full">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">Main Categories & Taxonomy</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Organize marketplace categories and product departments</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isCreateOpen ? 'Cancel' : 'New Category'}</span>
                    </button>
                </div>
            </div>

            {/* Action Feedback Banner */}
            {feedbackMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    {feedbackMessage}
                </div>
            )}

            {/* Create Category Modal / Drawer */}
            {isCreateOpen && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-xl animate-in slide-in-from-top-4 duration-200 space-y-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#A163F7] flex items-center justify-center font-black">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Create New Department Category</h3>
                            <p className="text-slate-400 text-xs">This category will be displayed on the AI Plaza homepage and search filters</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Sports & Fitness"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#A163F7] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Department Icon</label>
                                <div className="flex gap-1.5 overflow-x-auto py-1">
                                    {availableIcons.map(emoji => (
                                        <button
                                            type="button"
                                            key={emoji}
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                                                selectedEmoji === emoji 
                                                ? 'border-[#A163F7] bg-purple-50 scale-105 ring-2 ring-purple-300' 
                                                : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                            <textarea 
                                rows={2}
                                placeholder="Describe what items belong to this category..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#A163F7] focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md hover:opacity-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Save Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <input 
                        type="text"
                        placeholder="Search categories by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A163F7]"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {categoryList.length} Categories Active
                </span>
            </div>

            {/* Categories Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCategories.map(cat => (
                    <div 
                        key={cat.id} 
                        className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#A163F7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#A163F7] flex items-center justify-center text-xl font-bold border border-purple-100 group-hover:scale-105 transition-transform">
                                    <Layers className="w-6 h-6" />
                                </div>

                                <button
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    className="p-1.5 text-slate-300 hover:text-[#FF7582] rounded-lg hover:bg-rose-50 transition-colors"
                                    title="Delete Category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="font-black text-base text-slate-900 mb-1 group-hover:text-[#A163F7] transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
                                {cat.description || "Active department category on AI Plaza."}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-[#6F88FC]" /> ID #{cat.id}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                                Active
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="p-16 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-700 font-bold text-sm">No categories found matching your search.</p>
                </div>
            )}
        </div>
    );
}
