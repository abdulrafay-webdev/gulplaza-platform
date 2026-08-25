"use client";

import { useState, useEffect, useRef } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ai, setAuthToken } from '@/services/api';
import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Bot, 
  Send, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  ShoppingBag, 
  Store, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  MessageSquare, 
  Layers, 
  Lock,
  ChevronLeft,
  Paperclip,
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function AIAssistantPage() {
    const router = useRouter();
    const { customer, isLoaded: customerLoaded } = useCustomer();
    const { user, isLoaded: userLoaded } = useUser();
    const { addToCart } = useCart();

    const [chats, setChats] = useState<any[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [cartToast, setCartToast] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Immediate Authentication Validation & Redirect Gate
    useEffect(() => {
        if (!customerLoaded || !userLoaded) return;

        if (!customer && !user) {
            router.replace('/login?redirect=/ai');
            return;
        }

        const fetchChats = async () => {
            try {
                const res = await ai.listChats();
                const chatList = res.data || [];
                setChats(chatList);
                if (chatList.length > 0) {
                    loadChatDetail(chatList[0].id);
                }
            } catch (err) {
                console.error("Failed to load AI chats:", err);
            } finally {
                setLoadingChats(false);
            }
        };
        fetchChats();
    }, [customerLoaded, userLoaded, customer, user, router]);

    const loadChatDetail = async (chatId: number) => {
        try {
            setCurrentChatId(chatId);
            setHistoryOpen(false);
            const res = await ai.getChat(chatId);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Failed to load chat details:", err);
        }
    };

    const handleCreateNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setInputText('');
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        setHistoryOpen(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerCartToast = (productName: string) => {
        setCartToast(productName);
        setTimeout(() => setCartToast(null), 2500);
    };

    const handleSendMessage = async (textToSend?: string) => {
        const text = textToSend !== undefined ? textToSend : inputText;
        if (!text.trim() && !selectedImageFile) return;

        let uploadedImageUrl: string | undefined = undefined;

        setIsThinking(true);
        setInputText('');

        try {
            // 1. Upload image if selected
            if (selectedImageFile) {
                setIsUploadingImage(true);
                const formData = new FormData();
                formData.append('file', selectedImageFile);
                const uploadRes = await ai.uploadImage(formData);
                uploadedImageUrl = uploadRes.data.url;
                handleRemoveImage();
                setIsUploadingImage(false);
            }

            // 2. Optimistic user message preview
            const tempUserMsg = {
                id: Date.now(),
                role: 'user',
                content: text,
                image_url: uploadedImageUrl,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempUserMsg]);

            // 3. If no chat open, create a new one first
            let chatId = currentChatId;
            if (!chatId) {
                const createRes = await ai.createChat({
                    initial_message: text,
                    image_url: uploadedImageUrl
                });

                if (createRes.data.chat) {
                    chatId = createRes.data.chat.id;
                    setCurrentChatId(chatId);
                    
                    // The create response processes the initial message
                    if (createRes.data.assistant_message) {
                        setMessages([
                            createRes.data.user_message,
                            createRes.data.assistant_message
                        ]);
                    }
                    
                    // Refresh chat list
                    const listRes = await ai.listChats();
                    setChats(listRes.data || []);
                    setIsThinking(false);
                    return;
                }
            }

            // 4. Send message in existing chat
            if (chatId) {
                const res = await ai.sendMessage(chatId, {
                    content: text,
                    image_url: uploadedImageUrl
                });

                if (res.data.assistant_message) {
                    setMessages(prev => {
                        // Replace temp message with server response
                        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
                        return [
                            ...filtered,
                            res.data.user_message,
                            res.data.assistant_message
                        ];
                    });
                }

                // Update chat list metadata
                const listRes = await ai.listChats();
                setChats(listRes.data || []);
            }
        } catch (err) {
            console.error("AI chat error:", err);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: "Maaf kijiye, request process karte waqt issue aaya hai. Baraye meharbani dobara try karein.",
                    created_at: new Date().toISOString(),
                    products: []
                }
            ]);
        } finally {
            setIsThinking(false);
            setIsUploadingImage(false);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this chat history?")) return;

        try {
            await ai.deleteChat(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (currentChatId === chatId) {
                handleCreateNewChat();
            }
        } catch (err) {
            alert("Failed to delete chat.");
        }
    };

    const sampleSuggestions = [
        "Mere paas red shirt hai, us ke liye matching pant suggest karo",
        "5000 ke andar office ke liye black shoes chahiye",
        "Cooking ke liye non-stick granite cookware set dikhao",
        "Wireless earbuds under 4000 PKR with good bass",
        "Is red dress ke saath matching dupatta dhoondo"
    ];

    if (!customerLoaded || !userLoaded || (!customer && !user)) {
        return (
            <PublicLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/25">
                        <Bot className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900">Validating Login Session...</h2>
                        <p className="text-xs text-slate-500">Redirecting to customer login to unlock your personalized AI Shopping Assistant.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A163F7] font-bold">
                        <Sparkles className="w-4 h-4 animate-spin" /> Diverting to login...
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {/* Added to Cart Feedback Toast */}
            {cartToast && (
                <div className="fixed bottom-24 right-4 z-[120] bg-[#161226] text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
                    <div className="w-7 h-7 rounded-full bg-[#45E3FF]/20 text-[#45E3FF] flex items-center justify-center font-bold">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{cartToast}</p>
                        <p className="text-[10px] text-[#45E3FF] font-semibold">Added to cart successfully!</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] md:h-[750px] flex rounded-3xl border border-slate-200/80 bg-white shadow-xl overflow-hidden relative">
                
                {/* 1. CHAT HISTORY SIDEBAR (Desktop & Mobile Drawer) */}
                <aside className={`
                    absolute md:relative inset-y-0 left-0 z-30 w-72 bg-slate-50 border-r border-slate-200 flex flex-col justify-between transition-transform duration-300
                    ${historyOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-xs shadow-xs">
                                AI
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-800">Chat History</span>
                        </div>
                        <button 
                            onClick={handleCreateNewChat}
                            className="p-1.5 rounded-lg bg-[#A163F7] text-white hover:bg-[#8738F6] transition-colors flex items-center gap-1 text-[11px] font-bold px-2 cursor-pointer"
                            title="New Chat"
                        >
                            <Plus className="w-3.5 h-3.5" /> New
                        </button>
                    </div>

                    {/* Chat History List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {chats.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => loadChatDetail(c.id)}
                                className={`p-3 rounded-2xl text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                                    currentChatId === c.id 
                                    ? 'bg-white shadow-sm border border-purple-200 text-slate-900 font-bold' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === c.id ? 'text-[#A163F7]' : 'text-slate-400'}`} />
                                    <div className="min-w-0">
                                        <p className="truncate text-xs">{c.title}</p>
                                        <p className="text-[10px] text-slate-400 font-normal">
                                            {new Date(c.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteChat(e, c.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#FF7582] transition-opacity"
                                    title="Delete Chat"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {chats.length === 0 && !loadingChats && (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                No previous conversations.
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-200 bg-white/50 text-[11px] text-slate-500 font-medium text-center">
                        AI Plaza Shopping Intelligence
                    </div>
                </aside>

                {/* Mobile Drawer Backdrop */}
                {historyOpen && (
                    <div 
                        onClick={() => setHistoryOpen(false)}
                        className="md:hidden fixed inset-0 bg-[#161226]/40 backdrop-blur-xs z-20"
                    ></div>
                )}

                {/* 2. MAIN CHAT AREA */}
                <section className="flex-1 flex flex-col min-w-0 bg-[#FAFAFE]">
                    {/* Chat Header */}
                    <header className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 shadow-xs">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setHistoryOpen(true)}
                                className="md:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                                <MessageSquare className="w-4 h-4 text-[#A163F7]" />
                            </button>
                            
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                        AI Shopping Assistant
                                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                            Online
                                        </span>
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-medium">Bilingual Urdu/English • Multi-vendor Catalog</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleCreateNewChat}
                                className="hidden sm:flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> New Chat
                            </button>
                        </div>
                    </header>

                    {/* Messages Scrollable Container */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {/* Empty State */}
                        {messages.length === 0 && (
                            <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/30">
                                    <Bot className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 mb-1">
                                        Assalam-o-Alaikum! How can I help you shop today?
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                        Ask me for outfit matching, budget electronics, home appliances, or upload a picture to find matching and similar marketplace products.
                                    </p>
                                </div>

                                <div className="space-y-2 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                                        Try these quick shopping prompts:
                                    </span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {sampleSuggestions.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(prompt)}
                                                className="w-full text-left p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#A163F7] hover:bg-purple-50/40 text-xs font-bold text-slate-700 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                                            >
                                                <span>"{prompt}"</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#A163F7] group-hover:translate-x-0.5 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message Threads */}
                        {messages.map((msg, idx) => (
                            <div 
                                key={msg.id || idx} 
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                            >
                                <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-xs">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {/* User Image Attachment */}
                                        {msg.image_url && (
                                            <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-xs shadow-sm bg-slate-100">
                                                <img src={msg.image_url} alt="Attached Query" className="w-full h-auto max-h-56 object-cover" />
                                            </div>
                                        )}

                                        {/* Message Text Bubble */}
                                        {msg.content && (
                                            <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                ? 'bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white rounded-br-xs shadow-md shadow-purple-500/20 font-medium'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-sm font-medium'
                                            }`}>
                                                <p className="whitespace-pre-line">{msg.content}</p>
                                            </div>
                                        )}

                                        {/* Product Recommendation Cards Grid */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="pt-2 space-y-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#A163F7]">
                                                    <Sparkles className="w-3 h-3" /> Recommended Marketplace Products ({msg.products.length})
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {msg.products.map((prod: any) => (
                                                        <div 
                                                            key={prod.id} 
                                                            className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#A163F7] hover:shadow-md transition-all flex flex-col justify-between group"
                                                        >
                                                            <Link href={`/products/${prod.id}`} className="block">
                                                                <div className="flex gap-3 items-center mb-2">
                                                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                                                        {prod.image_url ? (
                                                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                        ) : (
                                                                            <ShoppingBag className="w-6 h-6 text-slate-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 truncate">
                                                                            <Store className="w-2.5 h-2.5 text-[#6F88FC]" /> {prod.shop_name}
                                                                        </span>
                                                                        <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#A163F7] transition-colors mt-0.5">
                                                                            {prod.name}
                                                                        </h4>
                                                                        <div className="flex items-baseline gap-1 mt-1">
                                                                            <span className="text-[10px] font-bold text-slate-400">Rs.</span>
                                                                            <span className="text-xs sm:text-sm font-black text-slate-950">
                                                                                {prod.price.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>

                                                            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
                                                                <button 
                                                                    onClick={() => {
                                                                        addToCart({
                                                                            product_id: prod.id,
                                                                            name: prod.name,
                                                                            price: prod.price,
                                                                            quantity: 1,
                                                                            shop_id: prod.shop_id,
                                                                            image_url: prod.image_url
                                                                        });
                                                                        triggerCartToast(prod.name);
                                                                    }}
                                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                                >
                                                                    <ShoppingBag className="w-3 h-3 text-[#A163F7]" /> Add Cart
                                                                </button>
                                                                <Link 
                                                                    href={`/products/${prod.id}`}
                                                                    className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white py-1.5 rounded-xl text-[10px] font-black text-center transition-opacity hover:opacity-95 shadow-xs flex items-center justify-center gap-1"
                                                                >
                                                                    View Details
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Thinking / Searching Indicator */}
                        {isThinking && (
                            <div className="flex items-center gap-3 animate-in fade-in">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                                    <Bot className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="bg-white border border-purple-200 px-4 py-3 rounded-3xl shadow-sm text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A163F7] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A163F7]"></span>
                                    </span>
                                    <span>Searching marketplace products and analyzing matching styles...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image Attachment Preview Bar */}
                    {imagePreviewUrl && (
                        <div className="px-4 py-2 bg-purple-50/80 border-t border-purple-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-300 bg-white flex-shrink-0">
                                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-800">Image Attached</span>
                                    <p className="text-[10px] text-slate-400">Gemini Vision will analyze colors, styles & matching items</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleRemoveImage}
                                className="p-1.5 rounded-full hover:bg-purple-200 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex-shrink-0">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            {/* Hidden File Input */}
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            {/* Camera / Image Upload Trigger */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                                    imagePreviewUrl 
                                    ? 'bg-purple-100 border-[#A163F7] text-[#A163F7]' 
                                    : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                                title="Attach Image for Visual Search"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            {/* Text Input */}
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask for matching clothes, shoes, appliances, or budget items..."
                                disabled={isThinking}
                                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A163F7]"
                            />

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={(!inputText.trim() && !selectedImageFile) || isThinking}
                                className="p-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-md shadow-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
