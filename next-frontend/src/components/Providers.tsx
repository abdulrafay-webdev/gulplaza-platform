"use client";

import { ImageKitProvider } from "imagekitio-next";
import { CartProvider } from "@/context/CartContext";
import { CustomerProvider } from "@/context/CustomerContext";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
      <CustomerProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </CustomerProvider>
    </ImageKitProvider>
  );
}
