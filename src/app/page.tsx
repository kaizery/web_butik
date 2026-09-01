"use client";

import React, { useState, useEffect } from "react";
import styles from "./home.module.css";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductModal } from "@/components/ProductModal";
import { Product, ProductVariant, CartItem } from "@/types/product";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

import { loadUserCart, saveUserCart } from "@/lib/cartStorage";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load user-scoped cart and check URL category parameter on mount
  useEffect(() => {
    setCartItems(loadUserCart());

    // Read category from URL if present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        setActiveCategory(catParam);
      }
    }

    // Listen for cross-component cart updates (e.g. login/logout)
    const handleCartSync = (e: any) => {
      if (e.detail?.items) {
        setCartItems(e.detail.items);
      } else {
        setCartItems(loadUserCart());
      }
    };

    window.addEventListener("aura_cart_updated", handleCartSync);
    window.addEventListener("storage", handleCartSync);
    return () => {
      window.removeEventListener("aura_cart_updated", handleCartSync);
      window.removeEventListener("storage", handleCartSync);
    };
  }, []);

  // Fetch products from backend MySQL API
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?category=${activeCategory}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory]);

  // Cart operations with user-scoped persistence
  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant.id === variant.id
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex].quantity += 1;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          product,
          selectedVariant: variant,
          quantity: 1,
        };
        updated = [...prev, newItem];
      }

      saveUserCart(updated);
      return updated;
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item));
      saveUserCart(updated);
      return updated;
    });
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      saveUserCart(updated);
      return updated;
    });
  };

  const handleOpenQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const categories = [
    { label: "Semua Busana", slug: "all" },
    { label: "Dresses & Gowns", slug: "dresses" },
    { label: "Outerwear & Blazers", slug: "outerwear" },
    { label: "Tops & Blouses", slug: "tops" },
    { label: "Skirts & Bottoms", slug: "skirts" },
    { label: "Couture Sets", slug: "sets" },
  ];

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={styles.pageContainer}>
      {/* Luxury Editorial Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(slug) => setActiveCategory(slug)}
      />

      <main>
        {/* Hero Editorial Spread */}
        <section id="hero" className={styles.heroSection}>
          <div className={styles.heroBackground} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={13} />
              <span>Autumn / Winter Collection 2026</span>
            </div>

            <h1 className={styles.heroTitle}>
              Curated Silhouettes of <em>Haute Elegance</em> & Grace.
            </h1>

            <p className={styles.heroDescription}>
              Temukan keindahan busana butik eksklusif yang dirancang dengan material sutra murni, linen organik Prancis, dan potongan arsitektural yang abadi.
            </p>

            <div className={styles.heroActions}>
              <a href="#collection">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                  Eksplorasi Katalog Busana
                </Button>
              </a>
              <a href="#atelier">
                <Button variant="secondary" size="lg">
                  Kisah Atelier Butik
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Product Catalog & Filter Chips Section */}
        <section id="collection" className={styles.filterSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Koleksi Butik Musim Ini</h2>
              <p className={styles.sectionSubtitle}>
                Pilihan gaun, atasan, dan outerwear terpilih dengan stok langsung dari atelier.
              </p>
            </div>

            {/* Filter Chips conforming to DESIGN.md */}
            <div className={styles.filterChips}>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  className={`${styles.chip} ${activeCategory === cat.slug ? styles.chipActive : ""}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className={styles.productsGrid}>
          {isLoading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "1.125rem" }}>
                Memuat katalog busana butik...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "1.125rem" }}>
                Belum ada produk dalam kategori ini.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={handleOpenQuickView}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </section>

        {/* Editorial Atelier Spotlight Section */}
        <section id="atelier" className={styles.atelierSpotlight}>
          <div className={styles.spotlightGrid}>
            <div className={styles.spotlightImageContainer}>
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                alt="Atelier Craftsmanship"
                className={styles.spotlightImage}
              />
            </div>

            <div className={styles.spotlightContent}>
              <span className={styles.spotlightBadge}>Dedikasi Kualitas & Keterampilan</span>
              <h2 className={styles.spotlightTitle}>
                Setiap Jahitan Menceritakan Keanggunan.
              </h2>
              <p className={styles.spotlightText}>
                Kami percaya bahwa pakaian terbaik bukan sekadar busana, melainkan ekspresi diri yang menenangkan dan memancarkan pesona alami. Setiap helai kain dipilih langsung dari pengrajin tekstil terbaik dengan standar <em>ethical luxury</em>.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/register">
                  <Button variant="secondary" size="md">
                    Daftar Sebagai Anggota VIP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section id="layanan" className={styles.valueSection}>
          <div className={styles.valueCard}>
            <ShieldCheck size={28} className={styles.valueIcon} />
            <h4 className={styles.valueTitle}>100% Kain Asli Pilihan</h4>
            <p className={styles.valueDesc}>
              Garansi keaslian serat sutra, linen, dan kasmir berkualitas premium grade-A.
            </p>
          </div>

          <div className={styles.valueCard}>
            <CreditCard size={28} className={styles.valueIcon} />
            <h4 className={styles.valueTitle}>Pembayaran Fleksibel</h4>
            <p className={styles.valueDesc}>
              Mendukung transaksi instan <strong>QRIS</strong>, <strong>Transfer Bank</strong> (BCA/Mandiri/dll), dan <strong>Tunai di Toko</strong>.
            </p>
          </div>

          <div className={styles.valueCard}>
            <Truck size={28} className={styles.valueIcon} />
            <h4 className={styles.valueTitle}>Pengiriman Aman & Cepat</h4>
            <p className={styles.valueDesc}>
              Kemasan kotak butik mewah dengan asuransi pengiriman ke seluruh kota.
            </p>
          </div>

          <div className={styles.valueCard}>
            <RotateCcw size={28} className={styles.valueIcon} />
            <h4 className={styles.valueTitle}>Jaminan Pas & Tukar Ukuran</h4>
            <p className={styles.valueDesc}>
              Layanan penukaran ukuran baju dalam 7 hari untuk kenyamanan belanja Anda.
            </p>
          </div>
        </section>
      </main>

      {/* Editorial Luxury Footer */}
      <footer id="kontak" className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h3 className={styles.footerBrand}>AURA BOUTIQUE</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              Rumah butik busana wanita terkurasi. Menghadirkan siluet kontemporer dengan sentuhan kemewahan lembut dan keabadian desain.
            </p>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Koleksi</h5>
            <ul className={styles.footerLinks}>
              <li><button type="button" onClick={() => setActiveCategory("dresses")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit" }}>Evening Dresses</button></li>
              <li><button type="button" onClick={() => setActiveCategory("outerwear")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit" }}>Tailored Blazers</button></li>
              <li><button type="button" onClick={() => setActiveCategory("tops")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit" }}>Silk Tops</button></li>
              <li><button type="button" onClick={() => setActiveCategory("sets")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit" }}>Couture Sets</button></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Bantuan & Layanan</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="/login">Portal Akun</Link></li>
              <li><Link href="/register">Registrasi Pelanggan</Link></li>
              <li><a href="#collection">Panduan Ukuran (Size Guide)</a></li>
              <li><a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">WhatsApp Concierge</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Jam Operasional Butik</h5>
            <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              Senin – Sabtu: 10:00 – 21:00 WIB<br />
              Minggu: 11:00 – 20:00 WIB<br /><br />
              Metode Pembayaran: <strong>QRIS, Transfer Bank, Tunai</strong>
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span>© 2026 AURA BOUTIQUE STORE. All Rights Reserved.</span>
          <span>Ethereal Editorial Luxury Design</span>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* Quick View Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
