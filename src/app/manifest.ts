import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AURA Boutique & POS Atelier",
    short_name: "AURA POS",
    description: "Sistem Kasir POS & Manajemen Butik Eksklusif AURA Atelier",
    start_url: "/login",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fff8f6",
    theme_color: "#6f5955",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    shortcuts: [
      {
        name: "Terminal Kasir Toko",
        short_name: "Kasir",
        description: "Buka Langsung Terminal Kasir Butik",
        url: "/kasir",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Portal Super Admin",
        short_name: "Admin",
        description: "Buka Ringkasan Omset & Manajemen Staf",
        url: "/portal-admin",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
