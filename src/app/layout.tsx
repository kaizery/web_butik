import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { InstallPwaBanner } from "@/components/pwa/InstallPwaBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6f5955",
};

export const metadata: Metadata = {
  title: "AURA BOUTIQUE | Luxury Fashion & Haute Couture",
  description:
    "Ethereal Editorial fashion boutique store. Discover exclusive dresses, curated seasonal collections, and effortless elegance.",
  keywords: ["boutique", "fashion", "luxury clothing", "dress", "haute couture", "butik baju"],
  authors: [{ name: "Aura Boutique Studio" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AURA POS",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body>
        <PwaRegister />
        {children}
        <InstallPwaBanner />
      </body>
    </html>
  );
}
