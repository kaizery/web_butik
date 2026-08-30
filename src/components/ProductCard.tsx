"use client";

import React, { useState } from "react";
import styles from "./productCard.module.css";
import { Product, ProductVariant } from "@/types/product";
import { Eye, ShoppingBag } from "lucide-react";
import { Button } from "./ui/Button";

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, onOpenQuickView, onAddToCart }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || null
  );

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80";

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <article className={styles.card}>
      {/* Product Image & Badges */}
      <div className={styles.imageContainer}>
        <img
          src={primaryImage}
          alt={product.title}
          className={styles.productImage}
          loading="lazy"
        />

        <div className={styles.badgeContainer}>
          {product.isFeatured && <span className={styles.goldBadge}>Atelier Exclusive</span>}
          {totalStock < 10 && totalStock > 0 && (
            <span className={styles.tagBadge}>Stok Terbatas: {totalStock}</span>
          )}
        </div>

        {/* Quick Add Overlay on Hover */}
        <div className={styles.quickActionOverlay}>
          <div className={styles.sizeButtons}>
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={styles.sizeChip}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product, variant);
                }}
                title={`Tambah Ukuran ${variant.size} ke Keranjang (Sisa: ${variant.stock})`}
              >
                + {variant.size}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onOpenQuickView(product)}
            leftIcon={<Eye size={15} />}
          >
            Lihat Detail Gaun
          </Button>
        </div>
      </div>

      {/* Meta Content */}
      <div className={styles.content}>
        <span className={styles.categoryLabel}>{product.category?.name || "Boutique"}</span>
        <h4
          className={styles.productTitle}
          onClick={() => onOpenQuickView(product)}
        >
          {product.title}
        </h4>
        {product.material && <span className={styles.materialText}>{product.material}</span>}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatRupiah(Number(product.basePrice))}</span>
          <span className={styles.stockStatus}>
            {totalStock > 0 ? "Tersedia" : "Habis Terjual"}
          </span>
        </div>
      </div>
    </article>
  );
}
