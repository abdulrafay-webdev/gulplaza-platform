"use client";

import { useState, useEffect, useRef } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { useSeller } from '@/context/SellerContext';
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
  CheckCircle, 
  ArrowRight, 
  MessageSquare, 
  Flame,
  ChevronDown,
  Loader2
} from 'lucide-react';

const capabilities = [
  { icon: ImageIcon, label: "Visual Search", desc: "Photo se products" },
  { icon: Sparkles, label: "Style Matching", desc: "Outfit combos" },
  { icon: Flame, label: "Budget Deals", desc: "Best prices" },
];

const thinkingStatuses = [
  "AI Plaza ka catalog scan kar raha hoon...",
  "Products analyze kar raha hoon...",
  "Best prices compare kar raha hoon...",
  "Aapke liye perfect matches chun raha hoon...",
];

export default function AIAssistantPage() {
    const router = useRouter();
    const { customer, isLoaded: customerLoaded } = useCustomer();
    const { seller, token, isLoaded: sellerLoaded } = useSeller();
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
    const [errorBanner, setErrorBanner] = useState<string | null>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [thinkingStep, setThinkingStep] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setIsNearBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
    };

    // Auto-scroll when new messages arrive, but never yank the user away
    // while they are reading older history (unless they just sent a message).
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (isNearBottom || lastMsg?.role === 'user' || isThinking) {
            scrollToBottom();
        }
    }, [messages, isThinking]);

    // Reset scroll state when switching chats
    useEffect(() => {
        setIsNearBottom(true);
        scrollToBottom();
    }, [currentChatId]);

    // Rotate the thinking status line while the AI is working
    useEffect(() => {
        if (!isThinking) {
            setThinkingStep(0);
            return;
        }
        const interval = setInterval(() => setThinkingStep(s => s + 1), 2600);
        return () => clearInterval(interval);
    }, [isThinking]);

    const formatTime = (ts: string) => {
        try {
            return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const formatChatDate = (ts: string) => {
        try {
            const d = new Date(ts);
            const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
            if (diffDays <= 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const displayName = customer?.full_name || seller?.full_name || seller?.email || 'AI Plaza Customer';

    const ensureAuthToken = async () => {
        if (customer) return;
        if (token) setAuthToken(token);
    };

    const describeAxiosError = (err: any): string => {
        if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
            return "Request time out ho gayi. AI abhi busy hai — dobara try karein.";
        }
        if (!err?.response) {
            return "Internet connection ya server se rabta nahi ho saka. Apna connection check karein.";
        }
        const s = err.response?.status;
        if (s === 401 || s === 403) {
            return "Aapka login session khatam ho gaya hai. Baraye meharbani dobara sign in karein.";
        }
        if (s === 413) return "Image ka size bohat bara hai (max 10MB).";
        if (s === 429) return "Bohat zyada requests. Thori dair baad koshish karein.";
        if (s >= 500) return "Server mein masla hai. Kuch dair baad dobara try karein.";
        return err.response?.data?.detail || "Request process karte waqt issue aaya hai. Dobara try karein.";
    };

    // Immediate Authentication Validation & Redirect Gate
    useEffect(() => {
        if (!customerLoaded || !sellerLoaded) return;

        if (!customer && !seller) {
            router.replace('/login?redirect=/ai');
            return;
        }

        const fetchChats = async () => {
            try {
                await ensureAuthToken();
                const res = await ai.listChats();
                const chatList = res.data || [];
                setChats(chatList);
                if (chatList.length > 0) {
                    loadChatDetail(chatList[0].id);
                }
            } catch (err: any) {
                console.error("Failed to load chats:", err);
                setErrorBanner(describeAxiosError(err));
            } finally {
                setLoadingChats(false);
            }
        };

        fetchChats();
    }, [customerLoaded, sellerLoaded, customer, seller, router]);

    const loadChatDetail = async (chatId: number) => {
        try {
            setCurrentChatId(chatId);
            setHistoryOpen(false);
            setErrorBanner(null);
            await ensureAuthToken();
            const res = await ai.getChat(chatId);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Failed to load chat details:", err);
            setErrorBanner(describeAxiosError(err));
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

        const tempId = Date.now();
        let uploadedImageUrl: string | undefined = undefined;

        setIsThinking(true);
        setErrorBanner(null);

        try {
            await ensureAuthToken();

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

            // Clear input only after upload succeeds
            setInputText('');

            // 2. Optimistic user message preview
            setMessages(prev => [...prev, {
                id: tempId,
                role: 'user',
                content: text,
                image_url: uploadedImageUrl,
                created_at: new Date().toISOString()
            }]);

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

                    if (createRes.data.assistant_message) {
                        setMessages([
                            createRes.data.user_message,
                            createRes.data.assistant_message
                        ]);
                    }

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
                        const filtered = prev.filter(m => m.id !== tempId);
                        return [
                            ...filtered,
                            res.data.user_message,
                            res.data.assistant_message
                        ];
                    });
                }

                const listRes = await ai.listChats();
                setChats(listRes.data || []);
            }
        } catch (err: any) {
            console.error("AI chat error:", err);
            // Remove orphaned optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId));
            // Restore the user's text so it is not lost
            setInputText(prev => prev || text);
            setErrorBanner(describeAxiosError(err));
            // Redirect on auth failure
            if (err?.response?.status === 401) {
                setTimeout(() => router.replace('/login?redirect=/ai'), 2000);
            }
        } finally {
            setIsThinking(false);
            setIsUploadingImage(false);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this chat history?")) return;

        try {
            await ensureAuthToken();
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

    if (!customerLoaded || !sellerLoaded || (!customer && !seller)) {
        return (
            <PublicLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] opacity-40 blur-xl" />
                        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/25 anim-glow-pulse">
                            <Bot className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900">Validating Login Session...</h2>
                        <p className="text-xs text-slate-500">Redirecting to customer login to unlock your personalized AI Shopping Assistant.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A163F7] font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Diverting to login...
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {/* Added to Cart Feedback Toast */}
            {cartToast && (
                <div className="fixed bottom-24 right-4 z-[120] bg-[#161226] text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 anim-slide-up">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <CheckCircle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{cartToast}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">Added to cart successfully!</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto w-full h-[calc(100dvh-225px)] sm:h-[calc(100dvh-215px)] md:h-[calc(100dvh-175px)] md:min-h-[580px] md:max-h-[820px] flex rounded-[28px] border border-slate-200/80 bg-white shadow-2xl shadow-purple-500/5 overflow-hidden relative">

                {/* 1. CHAT HISTORY SIDEBAR (Desktop & Mobile Drawer) */}
                <aside className={`
                    absolute md:relative inset-y-0 left-0 z-30 w-72 bg-[#161226] text-white flex flex-col transition-transform duration-300
                    ${historyOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
                `}>
                    {/* Brand Header */}
                    <div className="p-4 flex items-center gap-2.5 border-b border-white/10 flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                            <Bot className="w-5 h-5 text-[#161226]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black tracking-tight">AI Plaza</span>
                                <span className="bg-[#A163F7]/20 text-[#A163F7] border border-[#A163F7]/40 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Chat
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Shopping Intelligence</p>
                        </div>
                        <button
                            onClick={() => setHistoryOpen(false)}
                            className="md:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <div className="p-3 flex-shrink-0">
                        <button 
                            onClick={handleCreateNewChat}
                            className="w-full bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> New Chat
                        </button>
                    </div>

                    {/* Chat History List */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 pt-1 pb-2">
                            Recent Conversations
                        </p>

                        {loadingChats && (
                            <div className="space-y-1.5">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-14 rounded-xl bg-white/5 anim-shimmer" />
                                ))}
                            </div>
                        )}

                        {chats.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => loadChatDetail(c.id)}
                                className={`relative p-3 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                                    currentChatId === c.id 
                                    ? 'bg-white/10' 
                                    : 'hover:bg-white/5'
                                }`}
                            >
                                {currentChatId === c.id && (
                                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full bg-gradient-to-b from-[#A163F7] to-[#45E3FF]" />
                                )}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === c.id ? 'text-[#45E3FF]' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-xs leading-snug ${currentChatId === c.id ? 'text-white font-bold' : 'text-slate-300 font-medium group-hover:text-white'} transition-colors`}>{c.title}</p>
                                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                                            {formatChatDate(c.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteChat(e, c.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-[#FF7582] transition-all flex-shrink-0"
                                    title="Delete Chat"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {chats.length === 0 && !loadingChats && (
                            <div className="py-10 px-4 text-center">
                                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400 text-xs">No conversations yet.</p>
                                <p className="text-slate-500 text-[10px] mt-1">Start a new chat to begin!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-3 border-t border-white/10 flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A163F7] to-[#45E3FF] flex items-center justify-center text-[#161226] font-black text-xs flex-shrink-0">
                            {displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{displayName}</p>
                            <p className="text-[9px] text-slate-400">Verified Customer</p>
                        </div>
                        <Sparkles className="w-3.5 h-3.5 text-[#45E3FF] flex-shrink-0" />
                    </div>
                </aside>

                {/* Mobile Drawer Backdrop */}
                {historyOpen && (
                    <div 
                        onClick={() => setHistoryOpen(false)}
                        className="md:hidden fixed inset-0 bg-[#161226]/60 backdrop-blur-sm z-20 anim-fade-in"
                    ></div>
                )}

                {/* 2. MAIN CHAT AREA */}
                <section className="flex-1 flex flex-col min-w-0 bg-[#FAFAFE] relative">
                    {/* Chat Header */}
                    <header className="px-3.5 sm:px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <button 
                                onClick={() => setHistoryOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
                            >
                                <MessageSquare className="w-4 h-4 text-[#A163F7]" />
                            </button>
                            
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] p-1 flex items-center justify-center shadow-md shadow-purple-500/25">
                                    <img src="/images/robot.png" alt="AI Advisor" className="w-full h-full object-contain" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    AI Shopping Companion
                                    <span className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                        Active
                                    </span>
                                </h2>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 truncate">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" /> 
                                    Instead of searching, simply tell AI what you need
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleCreateNewChat}
                            className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Chat
                        </button>
                    </header>

                    {/* Messages Scrollable Container */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 chat-scroll bg-gradient-to-b from-[#FAFAFE] to-[#F6F3FD]"
                    >
                        {/* Empty State Hero */}
                        {messages.length === 0 && (
                            <div className="max-w-2xl mx-auto py-4 sm:py-8 text-center space-y-7 anim-fade-in">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#A163F7] via-[#6F88FC] to-[#45E3FF] opacity-35 blur-xl animate-pulse" />
                                    <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-purple-200 p-2 flex items-center justify-center shadow-xl shadow-purple-500/20">
                                        <img src="/images/robot.png" alt="AI Robot" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 bg-purple-100 border border-purple-200 text-purple-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                                        <Sparkles className="w-3.5 h-3.5 text-[#A163F7]" />
                                        Instead of searching, simply tell AI what you need
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                                        "Tell me what you are looking for, and I will help you find it."
                                    </h3>
                                    <p className="text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">
                                        Main AI Plaza ka intelligent shopping companion hoon. Outfit matching, budget deals, wholesale inquiry ya visual photo search — Roman Urdu ya English mein bataiye.
                                    </p>
                                </div>

                                {/* Capability Cards */}
                                <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto">
                                    {capabilities.map(cap => (
                                        <div key={cap.label} className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm hover:border-[#A163F7]/40 hover:shadow-md hover:shadow-purple-500/5 transition-all">
                                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#A163F7] flex items-center justify-center">
                                                <cap.icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-[11px] font-black text-slate-800 leading-tight">{cap.label}</p>
                                                <p className="text-[9px] text-slate-400">{cap.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Suggested Prompts */}
                                <div className="space-y-2.5 text-left max-w-xl mx-auto">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 justify-center">
                                        <Sparkles className="w-3 h-3 text-[#A163F7]" /> Try these prompts
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {sampleSuggestions.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(prompt)}
                                                className={`w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#A163F7] hover:bg-purple-50/30 hover:shadow-md hover:shadow-purple-500/5 text-xs font-bold text-slate-700 transition-all flex items-center justify-between gap-2 group shadow-sm cursor-pointer active:scale-[0.99] ${idx === sampleSuggestions.length - 1 ? 'sm:col-span-2' : ''}`}
                                            >
                                                <span className="leading-snug">"{prompt}"</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#A163F7] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} anim-msg-in`}
                            >
                                <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[82%]">
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 p-1 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <img src="/images/robot.png" alt="AI" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="space-y-2 min-w-0">
                                        {/* User Image Attachment */}
                                        {msg.image_url && (
                                            <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-xs shadow-sm bg-slate-100">
                                                <img src={msg.image_url} alt="Attached Query" className="w-full h-auto max-h-56 object-cover" />
                                            </div>
                                        )}

                                        {/* Message Text Bubble */}
                                        {msg.content && (
                                            <div className={`px-4 py-3 rounded-3xl text-[13px] sm:text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                ? 'bg-gradient-to-br from-[#A163F7] to-[#6F88FC] text-white rounded-br-lg shadow-md shadow-purple-500/20 font-medium'
                                                : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-lg shadow-sm'
                                            }`}>
                                                <p className="whitespace-pre-line">{msg.content}</p>
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        {msg.created_at && (
                                            <p className={`text-[9px] font-semibold ${msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'} px-1`}>
                                                {formatTime(msg.created_at)}
                                            </p>
                                        )}

                                        {/* Product Recommendation Cards Grid */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="pt-1.5 space-y-2.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#A163F7] px-1">
                                                    <Sparkles className="w-3 h-3" /> Recommended for you ({msg.products.length})
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {msg.products.map((prod: any) => (
                                                        <div 
                                                            key={prod.id} 
                                                            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-[#A163F7]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
                                                        >
                                                            <Link href={`/products/${prod.id}`} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                                                {prod.image_url ? (
                                                                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-300" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                                                                    </div>
                                                                )}
                                                                <span className="absolute top-2 left-2 bg-[#161226]/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 max-w-[75%]">
                                                                    <Store className="w-2.5 h-2.5 text-[#45E3FF] flex-shrink-0" /> 
                                                                    <span className="truncate">{prod.shop_name}</span>
                                                                </span>
                                                                {typeof prod.stock_quantity === 'number' && prod.stock_quantity > 0 && (
                                                                    <span className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                                                        In Stock
                                                                    </span>
                                                                )}
                                                            </Link>

                                                            <div className="p-3 flex flex-col gap-1.5 flex-1">
                                                                <Link href={`/products/${prod.id}`}>
                                                                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#A163F7] transition-colors">
                                                                        {prod.name}
                                                                    </h4>
                                                                </Link>
                                                                {prod.short_description && (
                                                                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                                                                        {prod.short_description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-baseline gap-1 mt-auto pt-0.5">
                                                                    <span className="text-[10px] font-bold text-slate-400">Rs.</span>
                                                                    <span className="text-sm font-black text-slate-950">
                                                                        {typeof prod.price === 'number' ? prod.price.toLocaleString() : '—'}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-1.5 pt-1.5 mt-0.5 border-t border-slate-100">
                                                                    <button 
                                                                        onClick={() => {
                                                                            addToCart({
                                                                                product_id: prod.id,
                                                                                name: prod.name,
                                                                                price: prod.price ?? 0,
                                                                                quantity: 1,
                                                                                shop_id: prod.shop_id,
                                                                                image_url: prod.image_url
                                                                            });
                                                                            triggerCartToast(prod.name);
                                                                        }}
                                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                                                    >
                                                                        <ShoppingBag className="w-3 h-3 text-[#A163F7]" /> Add Cart
                                                                    </button>
                                                                    <Link 
                                                                        href={`/products/${prod.id}`}
                                                                        className="bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white py-2 rounded-xl text-[10px] font-black text-center transition-all hover:opacity-95 shadow-sm flex items-center justify-center gap-1 active:scale-95"
                                                                    >
                                                                        View Details
                                                                    </Link>
                                                                </div>
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
                            <div className="flex items-start gap-2.5 anim-msg-in">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <img src="/images/robot.png" alt="AI Thinking" className="w-full h-full object-contain animate-pulse" />
                                </div>
                                <div className="bg-white border border-purple-200/70 px-4 py-3.5 rounded-3xl rounded-bl-lg shadow-sm flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#A163F7] inline-block" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6F88FC] inline-block" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#45E3FF] inline-block" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">
                                        {thinkingStatuses[thinkingStep % thinkingStatuses.length]}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll to Bottom Button */}
                    {!isNearBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-28 right-4 md:right-6 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-900/10 flex items-center justify-center text-slate-600 hover:text-[#A163F7] hover:border-[#A163F7]/50 hover:shadow-purple-500/20 transition-all anim-fade-in cursor-pointer"
                            title="Scroll to latest"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}

                    {/* Image Attachment Preview Bar */}
                    {imagePreviewUrl && (
                        <div className="px-4 py-2.5 bg-purple-50/80 border-t border-purple-200/80 flex items-center justify-between anim-fade-in">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-300 bg-white flex-shrink-0 shadow-sm">
                                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        Image Attached
                                        {isUploadingImage && <Loader2 className="w-3 h-3 animate-spin text-[#A163F7]" />}
                                    </span>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        {isUploadingImage ? "Uploading image..." : "Vision search: colors, styles & matching items"}
                                    </p>
                                </div>
                            </div>
                            {!isUploadingImage && (
                                <button 
                                    onClick={handleRemoveImage}
                                    className="p-1.5 rounded-full hover:bg-purple-200 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Error Banner */}
                    {errorBanner && (
                        <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between gap-2 anim-fade-in">
                            <p className="text-xs font-medium text-red-700 flex-1">{errorBanner}</p>
                            <button
                                onClick={() => setErrorBanner(null)}
                                className="p-1 rounded-full hover:bg-red-100 text-red-400 hover:text-red-700 flex-shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex-shrink-0">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-1.5 bg-slate-100/80 rounded-[26px] pl-1.5 pr-1.5 py-1.5 border border-transparent focus-within:bg-white focus-within:border-[#A163F7]/40 focus-within:ring-4 focus-within:ring-[#A163F7]/10 transition-all"
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
                                disabled={isThinking}
                                className={`p-2.5 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                                    imagePreviewUrl 
                                    ? 'bg-[#A163F7]/15 text-[#A163F7]' 
                                    : 'text-slate-400 hover:bg-slate-200/70 hover:text-[#A163F7]'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                                title="Attach Image for Visual Search"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            {/* Text Input */}
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask for products, styles, or budget deals..."
                                disabled={isThinking}
                                className="flex-1 px-2 py-2 bg-transparent text-[13px] sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0 disabled:opacity-60"
                            />

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={(!inputText.trim() && !selectedImageFile) || isThinking}
                                className="p-2.5 sm:px-4 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] hover:opacity-95 text-white rounded-full sm:rounded-2xl font-black text-xs shadow-md shadow-purple-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
                            >
                                {isThinking ? (
                                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span className="hidden sm:inline">Send</span>
                                    </>
                                )}
                            </button>
                        </form>
                        <p className="text-center text-[10px] text-slate-400 mt-2 px-4">
                            AI Assistant ghalat ho sakta hai — prices & availability product page par confirm karein.
                        </p>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
