"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./productModal.module.css";
import { Product, ProductVariant } from "@/types/product";
import { X, ShoppingBag, ShieldCheck, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants[0] || null
  );
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const currentVariant = selectedVariant || product.variants[0];

  const primaryImage =
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80";

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAdd = () => {
    if (currentVariant && currentVariant.stock > 0) {
      onAddToCart(product, currentVariant);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    if (currentVariant && currentVariant.stock > 0) {
      onAddToCart(product, currentVariant);
      onClose();
      router.push("/checkout");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Tutup">
          <X size={20} />
        </button>

        {/* Gallery */}
        <div className={styles.gallerySection}>
          <img src={primaryImage} alt={product.title} className={styles.mainImage} />
        </div>

        {/* Details */}
        <div className={styles.detailsSection}>
          <span className={styles.categoryTag}>{product.category?.name || "Boutique Collection"}</span>
          <h2 className={styles.title}>{product.title}</h2>
          <div className={styles.price}>{formatRupiah(Number(product.basePrice))}</div>

          <p className={styles.description}>{product.description}</p>

          {/* Material & Care */}
          {product.material && (
            <div className={styles.specBox}>
              <span className={styles.specLabel}>Material &amp; Komposisi Kain:</span>
              <span>{product.material}</span>
              {product.careInstructions && (
                <span style={{ color: "var(--on-surface-variant)", fontSize: "0.75rem" }}>
                  Perawatan: {product.careInstructions}
                </span>
              )}
            </div>
          )}

          {/* Size Options */}
          <div className={styles.sizeSelection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.sizeTitle}>Pilih Ukuran Gaun:</span>
              <span style={{ fontSize: "0.75rem", color: "var(--tertiary)" }}>
                Tersedia: <strong>{currentVariant?.stock || 0} pcs</strong>
              </span>
            </div>

            <div className={styles.sizeGrid}>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`${styles.sizeButton} ${
                    currentVariant?.id === v.id ? styles.sizeButtonActive : ""
                  }`}
                  onClick={() => setSelectedVariant(v)}
                >
                  {v.size} ({v.color})
                </button>
              ))}
            </div>
          </div>

          {/* Actions: Tambahkan ke Kantong & Bayar Sekarang */}
          <div className={styles.actionButtonGroup}>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="lg"
              onClick={handleAdd}
              disabled={!currentVariant || currentVariant.stock === 0}
              leftIcon={isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
            >
              {isAdded
                ? "Ditambahkan!"
                : currentVariant?.stock > 0
                ? `+ Kantong (${currentVariant.size})`
                : "Stok Habis"}
            </Button>

            <Button
              type="button"
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleBuyNow}
              disabled={!currentVariant || currentVariant.stock === 0}
              rightIcon={<ArrowRight size={18} />}
            >
              Bayar Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
