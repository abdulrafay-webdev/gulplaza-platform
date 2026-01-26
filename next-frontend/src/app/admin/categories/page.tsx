"use client";

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { categories, setAuthToken } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';

export default function AdminCategories() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const loadCategories = async () => {
        try {
            const res = await categories.list();
            setCategoryList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = await getToken();
        setAuthToken(token);
        try {
            await categories.create({ name, description });
            setName('');
            setDescription('');
            loadCategories();
            alert("Category Created");
        } catch (err) {
            alert("Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-primary">Main Categories</h1>
            
            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-8 p-6 bg-background rounded-lg border border-gray-200 shadow-inner">
                <h2 className="text-lg font-bold mb-4 text-text-primary uppercase tracking-tight">Add New Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        className="border border-gray-300 p-2 rounded-md focus:ring-secondary focus:border-secondary transition-all outline-none" 
                        placeholder="Category Name (e.g. Electronics)" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <input 
                        className="border border-gray-300 p-2 rounded-md focus:ring-secondary focus:border-secondary transition-all outline-none" 
                        placeholder="Short Description" 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-4 bg-accent text-white px-6 py-2 rounded-md font-bold hover:bg-amber-600 disabled:opacity-50 transition-all shadow-sm"
                >
                    {loading ? 'Creating...' : 'Create Category'}
                </button>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoryList.map(cat => (
                    <div key={cat.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-secondary transition-all group">
                        <h3 className="font-bold text-lg text-primary mb-1">{cat.name}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{cat.description || "No description provided."}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
