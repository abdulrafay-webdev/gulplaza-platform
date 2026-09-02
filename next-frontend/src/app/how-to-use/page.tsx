import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Bot, 
  Camera, 
  Store, 
  Truck, 
  Star, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const metadata = {
  title: 'How to Use AI Plaza | Shopper & Vendor Guide',
  description: 'Complete step-by-step guide for shopping with AI and managing merchant stores on AI Plaza.',
};

export default function HowToUsePage() {
  const shopperSteps = [
    {
      step: '01',
      title: 'Chat with AI Shopping Assistant',
      desc: 'Ask anything in English or Roman Urdu! "5000 ke andar gift dikhao" or "Mere paas black suit hai matching tie dikhao". AI gives instant curated recommendations.',
      icon: Bot,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      step: '02',
      title: 'Visual Photo Search',
      desc: 'Have a photo of a dress, watch, or kitchen gadget? Upload or snap a picture in the AI Chat. AI Plaza scans thousands of Gul Plaza items to find exact or similar matches.',
      icon: Camera,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      step: '03',
      title: 'Browse Verified Gul Plaza Stores',
      desc: 'Explore genuine shops across Gul Plaza. View live inventory, wholesale prices, and verified merchant credentials with 100% price transparency.',
      icon: Store,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      step: '04',
      title: 'Easy Cash on Delivery (COD)',
      desc: 'Add items to your cart from one or multiple stores. Enjoy safe nationwide Cash on Delivery with no credit card required.',
      icon: Truck,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      step: '05',
      title: 'Real-Time Order Tracking & Reviews',
      desc: 'Track your package progress (Pending → Confirmed → Shipped → Delivered) and leave authentic star ratings to support local sellers.',
      icon: Star,
      color: 'text-rose-600 bg-rose-50'
    }
  ];

  const sellerSteps = [
    {
      step: '01',
      title: 'Register Your Shop',
      desc: 'Sign up via the Seller Mobile App or Web Portal with your store name, category, and Gul Plaza floor/shop number.',
      icon: Store,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      step: '02',
      title: 'Add Products with AI Copilot',
      desc: 'Simply enter a title and upload product photos. Click "Generate with AI" to auto-write high-converting marketing descriptions while keeping your original photo untouched.',
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      step: '03',
      title: 'Manage Incoming Orders',
      desc: 'Receive live customer orders, view ordered item breakdowns with customer phone numbers and addresses, and update status from Confirmed to Shipped.',
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      step: '04',
      title: 'Approve & Moderate Reviews',
      desc: 'Build trust by moderating genuine customer ratings and approving reviews to display publicly on your product pages.',
      icon: CheckCircle,
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Platform Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How to Use AI Plaza
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Everything you need to know about shopping with AI or selling products as a verified Gul Plaza merchant.
          </p>
        </div>

        {/* Shopper Guide Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🛍️</span>
            <div>
              <h2 className="text-xl font-black text-slate-900">For Shoppers</h2>
              <p className="text-xs text-slate-500">How to find, compare, and order authentic items from Gul Plaza</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {shopperSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Step {item.step}</span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seller Guide Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🏪</span>
            <div>
              <h2 className="text-xl font-black text-slate-900">For Shopkeepers & Merchants</h2>
              <p className="text-xs text-slate-500">How to list inventory and scale sales across all Pakistan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sellerSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Step {item.step}</span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white text-center shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black">Experience Next-Generation Shopping</h3>
          <p className="text-purple-200 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
            Try our conversational AI shopping advisor today or download our native mobile app for faster checkout.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ai"
              className="bg-white text-purple-900 hover:bg-purple-50 font-black text-xs px-5 py-3 rounded-xl shadow-md transition-all"
            >
              Try AI Shopping Advisor
            </Link>
            <Link
              href="/seller/register"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all"
            >
              Register Your Shop
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
