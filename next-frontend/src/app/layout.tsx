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
  title: "Madni Mall Marketplace",
  description: "Multi-shop ordering platform",
};

// Clerk Theme Customization
const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    socialButtonsVariant: 'iconButton' as const,
  },
  variables: {
    colorPrimary: '#F59E0B', // Accent (Amber)
    colorText: '#0F172A', // Text Primary
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#0F172A',
    borderRadius: '0.5rem',
  },
  elements: {
    card: 'shadow-xl rounded-xl border border-gray-100 bg-white',
    formButtonPrimary: '!bg-[#F59E0B] hover:!bg-[#D97706] !text-white !shadow-md normal-case text-sm',
    footerActionLink: 'text-[#0EA5E9] hover:text-[#0284C7] font-bold',
    headerTitle: 'text-[#1E40AF] font-bold text-xl',
    headerSubtitle: 'text-[#64748B]',
    formFieldInput: 'border-gray-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9] rounded-lg',
    identityPreviewEditButton: 'text-[#F59E0B] hover:text-[#D97706]',
    formFieldLabel: 'text-[#0F172A] font-medium',
    socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 text-[#0F172A]',
    userButtonPopoverCard: 'shadow-lg border border-gray-100',
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