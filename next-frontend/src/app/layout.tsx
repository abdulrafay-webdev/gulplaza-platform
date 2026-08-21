import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Plaza - Smart Multi-Vendor Marketplace",
  description: "Next-generation multi-shop shopping platform with unified cart & direct store fulfillment.",
};

// Clerk Theme Customization - Purple & Blue Palette
const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    socialButtonsVariant: 'iconButton' as const,
  },
  variables: {
    colorPrimary: '#A163F7',
    colorText: '#161226',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#161226',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'shadow-2xl rounded-2xl border border-slate-200 bg-white',
    formButtonPrimary: '!bg-gradient-to-r !from-[#A163F7] !to-[#6F88FC] hover:!opacity-95 !text-white !shadow-lg !shadow-purple-500/25 normal-case text-sm !rounded-xl !py-3',
    footerActionLink: 'text-[#6F88FC] hover:text-[#A163F7] font-bold',
    headerTitle: 'text-[#161226] font-black text-xl',
    headerSubtitle: 'text-slate-500 text-xs',
    formFieldInput: 'border-slate-300 focus:border-[#A163F7] focus:ring-[#A163F7] rounded-xl',
    identityPreviewEditButton: 'text-[#A163F7] hover:text-[#8738F6]',
    formFieldLabel: 'text-[#161226] font-bold text-xs',
    socialButtonsBlockButton: 'border-slate-200 hover:bg-slate-50 text-[#161226] rounded-xl',
    userButtonPopoverCard: 'shadow-2xl border border-slate-200 rounded-2xl',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}