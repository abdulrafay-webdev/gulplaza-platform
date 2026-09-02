import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';
import { 
  Sparkles, 
  Award, 
  Store, 
  Lightbulb, 
  Rocket, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const metadata = {
  title: 'Our Story | AI Plaza Marketplace',
  description: 'Conceived and built single-handedly by a 20-year-old student visionary, Abdul Rafay.',
};

export default function OurStoryPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161226] via-purple-950 to-indigo-950 border border-purple-500/20 p-8 sm:p-14 text-white shadow-2xl mb-12">
          <div className="inline-flex items-center gap-2 bg-[#A163F7]/25 border border-[#A163F7]/40 px-3.5 py-1.5 rounded-full text-[#45E3FF] text-xs font-black uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            The Vision Behind AI Plaza
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl">
            Conceived & Built by a <span className="bg-gradient-to-r from-[#A163F7] to-[#45E3FF] bg-clip-text text-transparent">20-Year-Old Student</span> Visionary
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
            How one determined Pakistani student single-handedly conceptualized, engineered, and launched an AI-native multi-vendor commerce platform for Karachi’s iconic Gul Plaza.
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
                Founder, Solo Architect & Full-Stack System Engineer
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p>
              At just <strong className="text-slate-900 font-bold">20 years old</strong>, <strong className="text-slate-900 font-bold">Abdul Rafay (abdulrafay)</strong> recognized a monumental opportunity: Karachi’s renowned commercial hub, <strong className="text-slate-900 font-bold">Gul Plaza</strong>, was packed with vibrant wholesale stores, unique varieties, and unbeatable wholesale pricing—yet it lacked a cohesive, modern digital bridge to reach customers across Pakistan.
            </p>

            <p>
              Rather than waiting for venture backing or hiring external development agencies, Abdul Rafay took on the entire monumental task alone. He designed the database schema, wrote the backend services in Python FastAPI, crafted high-performance Next.js web applications, and built 3 specialized React Native mobile applications (Customer, Seller, and Admin).
            </p>

            <p>
              By weaving cutting-edge <strong className="text-slate-900 font-bold">Generative AI</strong> directly into the commerce layer, he gave shoppers a natural, conversational shopping companion that speaks Roman Urdu and English, matching outfits, analyzing visual queries, and bringing Karachi's retail heartbeat into the hands of millions.
            </p>
          </div>
        </div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#A163F7] flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Empowering Local Vendors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowering shopkeepers with modern digital storefronts, AI marketing description generators, and clean order tracking tools.
              </p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Generative AI Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Moving past rigid search filters into conversational shopping where AI understands colloquial Urdu questions, budgets, and visual image matches.
              </p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Nationwide COD Reliability</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Safe, verified Cash on Delivery doorstep fulfillment connecting customers from Gilgit to Gwadar with authentic Gul Plaza shopping.
              </p>
            </div>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-3xl p-8 text-center max-w-3xl mx-auto mb-14">
          <Heart className="w-8 h-8 text-[#EC4899] mx-auto mb-3" />
          <blockquote className="text-base sm:text-lg font-medium italic text-slate-800 leading-relaxed">
            "I built AI Plaza with the belief that a 20-year-old student from Pakistan can create enterprise-grade, AI-first platforms that inspire our local youth and digitally empower traditional commercial markets."
          </blockquote>
          <div className="mt-4 font-black text-sm text-purple-900">— Abdul Rafay (abdulrafay)</div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A163F7] to-[#6F88FC] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all"
          >
            Start Exploring AI Plaza Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
