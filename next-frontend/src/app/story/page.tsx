import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Sparkles, 
  Award, 
  Store, 
  Bot, 
  Truck, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  Users, 
  Heart, 
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const metadata = {
  title: 'Our Story | AI Plaza — From Marketplace to Opportunity Platform',
  description: 'The story behind AI Plaza, conceived and built by 20-year-old founder Abdul Rafay to empower Pakistani SMEs and create digital opportunities.',
};

export default function OurStoryPage() {
  const opportunityPillars = [
    {
      num: '01',
      title: 'Digital Sellers',
      desc: 'Local shop owners take their businesses online, reaching customers across Pakistan far beyond their physical location.',
      icon: Store,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      num: '02',
      title: 'Delivery Riders',
      desc: 'More online orders generate reliable, dignified earning opportunities for local logistics and delivery workers.',
      icon: Truck,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      num: '03',
      title: 'Digital Product Managers',
      desc: 'Sellers create demand for skilled individuals who can manage their online catalogs, product photos, and order pipelines.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      num: '04',
      title: 'Digital Marketing Workers',
      desc: 'Local businesses going digital need young talent to manage social media outreach, promotional campaigns, and brand visibility.',
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      num: '05',
      title: 'AI-Assisted Business Services',
      desc: 'Individuals can build service businesses around AI-assisted catalog creation, product photography, and customer support.',
      icon: Bot,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      num: '06',
      title: 'New Online Entrepreneurs',
      desc: 'Once the barrier to entry is lowered, aspiring young entrepreneurs, home businesses, and students can start selling directly.',
      icon: Briefcase,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    }
  ];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161226] via-[#211745] to-[#120D22] border border-purple-500/25 p-8 sm:p-14 text-white shadow-2xl mb-12">
          <div className="inline-flex items-center gap-2 bg-[#A163F7]/20 border border-[#A163F7]/40 px-3.5 py-1.5 rounded-full text-[#45E3FF] text-xs font-black uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            The AI Plaza Story
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
            From a Simple Marketplace to an <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#A163F7] via-[#6F88FC] to-[#45E3FF] bg-clip-text text-transparent">
              AI-Powered Opportunity Platform
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-5 max-w-3xl leading-relaxed italic font-medium">
            “I built AI Plaza to give local businesses and ordinary customers a simple bridge into digital commerce—and to create new opportunities around that digital ecosystem.”
          </p>
        </div>

        {/* Founder Bio Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
              AR
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900">Abdul Rafay</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> 20 Years Old • Karachi, Pakistan
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Founder & Solo Creator of AI Plaza
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p>
              At just <strong className="text-slate-900 font-bold">20 years old</strong>, <strong className="text-slate-900 font-bold">Abdul Rafay (abdulrafay)</strong> set out with a clear purpose: he did not want to build just another ordinary e-commerce website.
            </p>

            <p>
              In Pakistan, small and medium enterprises (<strong className="text-slate-900 font-bold">SMEs/MSMEs</strong>) provide a vital foundation of national employment. As the country focuses on digital transformation, e-commerce adoption, and AI-enabled SME growth, Abdul Rafay wanted to create a platform that could help local sellers reach more customers, make digital selling effortless, and unlock new opportunities for people around them.
            </p>

            <p>
              That idea became <strong className="text-purple-700 font-bold">AI Plaza</strong>.
            </p>

            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" /> Solving Both Sides of the Commerce Equation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Many small businesses have good products but struggle with the digital side of selling—creating product listings, writing descriptions, managing catalogs, and reaching customers. At the same time, shoppers often know what they want, but don’t always know the exact keywords or product names to search for. Abdul Rafay conceived AI Plaza to solve both challenges on one unified platform.
              </p>
            </div>
          </div>
        </div>

        {/* Two Pillars: AI for Customers & AI for Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* AI for the Customer */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Shopping Experience</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 mb-3">🤖 AI for the Customer</h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                AI Plaza includes an intelligent Shopping Assistant that allows customers to interact naturally instead of endlessly searching and scrolling through rigid categories.
              </p>

              {/* Natural Query Box */}
              <div className="bg-slate-50 border-l-4 border-purple-500 p-4 rounded-xl mb-4">
                <p className="text-[11px] font-bold text-slate-500 mb-1">A customer can simply say:</p>
                <p className="text-xs sm:text-sm font-black text-slate-900 italic">
                  “Mere paas red shirt hai, iske saath konsi pant achi lagegi?”
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The AI understands natural language, remembers conversational context, analyzes uploaded images when relevant, and searches the real marketplace for matching items. This changes shopping from mechanical searching into an effortless discovery journey.
              </p>
            </div>
          </div>

          {/* AI for Sellers */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Merchant Empowerment</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 mb-3">🏪 AI for Sellers</h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                The bigger vision is helping sellers participate in the digital economy without requiring advanced technical skills or technical marketing knowledge.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  'Product Titles',
                  'Product Descriptions',
                  'Categories & Tags',
                  'Product Information',
                  'Better Listings',
                  'Seller-in-Control'
                ].map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-2.5 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-900">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The seller provides basic details, and AI assists with catalog tasks while keeping the merchant fully in control—lowering technical barriers and enabling small businesses to expand nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Economic Impact: How Can AI Plaza Create Employment? */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs mb-12">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" /> Economic Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              👨‍💼 How Can AI Plaza Create Employment?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
              AI Plaza does not claim that an app alone magically creates thousands of jobs. Instead, the platform creates an expanding digital commerce ecosystem where business growth drives real operational demand.
            </p>
          </div>

          {/* Core Formula Diagram */}
          <div className="bg-gradient-to-r from-[#161226] via-[#24194A] to-[#161226] text-white p-5 sm:p-6 rounded-2xl mb-8 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#45E3FF] text-center mb-2">The Economic Multiplier Formula</p>
            <p className="text-xs sm:text-sm font-black text-center leading-relaxed text-purple-100">
              Seller &nbsp;→&nbsp; AI Plaza &nbsp;→&nbsp; More Customers &nbsp;→&nbsp; More Orders &nbsp;→&nbsp; More Operational Demand &nbsp;→&nbsp; More Earning Opportunities
            </p>
          </div>

          {/* The 6 Opportunity Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunityPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:bg-white hover:border-purple-300 hover:shadow-md transition-all">
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pillar {item.num}</span>
                    <h3 className="font-black text-sm text-slate-900 mt-0.5 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Bigger Vision Quote Box */}
        <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-[#161226] border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl mb-12">
          <Heart className="w-8 h-8 text-[#EC4899] mx-auto mb-4" />
          <span className="text-xs font-black uppercase tracking-wider text-[#45E3FF] block mb-3">
            🇵🇰 The Bigger Vision
          </span>

          <blockquote className="text-base sm:text-xl font-medium italic text-purple-100 max-w-3xl mx-auto leading-relaxed mb-6">
            “My vision for AI Plaza is not simply to build an online marketplace. I want to build a digital ecosystem where technology helps local businesses grow, AI makes commerce easier, and that growth creates opportunities for people.”
          </blockquote>

          <div className="w-16 h-0.5 bg-gradient-to-r from-[#A163F7] to-[#45E3FF] mx-auto my-6 opacity-60" />

          <blockquote className="text-sm sm:text-base font-normal text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
            “If a small seller can reach more customers, if a customer can find the right product more easily, and if that additional business creates work for sellers, riders, digital marketers and other service providers, then technology is doing more than making shopping convenient—it is creating economic opportunity.”
          </blockquote>

          <div className="mt-6">
            <h4 className="font-black text-base text-white">Abdul Rafay (abdulrafay)</h4>
            <p className="text-xs text-[#45E3FF] font-semibold mt-0.5">20-Year-Old Founder & Creator, AI Plaza</p>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all"
          >
            Explore AI Plaza Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
