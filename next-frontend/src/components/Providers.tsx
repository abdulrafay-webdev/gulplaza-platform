"use client";

import { ImageKitProvider } from "imagekitio-next";
import { CartProvider } from "@/context/CartContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { SellerProvider } from "@/context/SellerContext";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
      <CustomerProvider>
        <SellerProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SellerProvider>
      </CustomerProvider>
    </ImageKitProvider>
  );
}
