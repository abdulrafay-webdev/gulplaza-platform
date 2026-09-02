import PublicLayout from '@/components/PublicLayout';
import { ShieldCheck, Lock, Eye, Server, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | AI Plaza Marketplace',
  description: 'AI Plaza data security and privacy commitments for customers and vendors.',
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Security & Trust
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            AI Plaza is committed to protecting your personal data, shopping preferences, and transaction privacy.
          </p>
          <span className="text-xs text-slate-400 font-bold block mt-2">Last Updated: September 2026</span>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              • <strong>Customer Data:</strong> Your name, phone number, shipping address, and email address for delivery fulfillment.{"\n"}
              • <strong>AI Visual Queries:</strong> When you upload a picture to search for matching clothes, gadgets, or jewelry, photos are processed securely and never sold to third-party ad networks.{"\n"}
              • <strong>Order & Review History:</strong> Details of your Cash on Delivery orders, tracking timeline, and customer ratings.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">2. How Your Information Is Used</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We use customer information exclusively to deliver orders, notify you of package dispatch, improve our conversational AI responses, and prevent fraudulent delivery attempts.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">3. Vendor Data & Inventory Protection</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Shopkeeper catalogs and shop owner profiles are safeguarded. Vendor authentication uses enterprise-grade encrypted JWT tokens with role-based access control.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">4. Contacting Our Privacy Team</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you have any questions or data removal requests, reach out to us at:{"\n"}
              <strong>support@gulplaza-platform.com</strong>{"\n"}
              Gul Plaza Commercial Center, M.A. Jinnah Road, Saddar, Karachi, Pakistan.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
