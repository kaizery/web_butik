"use client";

import React from "react";
import styles from "./cartDrawer.module.css";
import { CartItem } from "@/types/product";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, item) =>
      acc + (Number(item.product.basePrice) + Number(item.selectedVariant.priceAdjustment)) * item.quantity,
    0
  );

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={20} color="var(--tertiary)" />
            <h3 className={styles.drawerTitle}>Kantong Belanja ({items.length})</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Tutup">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} strokeWidth={1} color="var(--outline)" />
            <h4 className={styles.emptyTitle}>Kantong Belanja Anda Kosong</h4>
            <p style={{ fontSize: "0.875rem" }}>
              Jelajahi koleksi busana butik eksklusif kami dan pilih gaun favorit Anda.
            </p>
            <Button variant="primary" size="md" onClick={onClose}>
              Mulai Eksplorasi
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.itemsList}>
              {items.map((item) => {
                const imgUrl =
                  item.product.images[0]?.imageUrl ||
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80";
                const unitPrice =
                  Number(item.product.basePrice) + Number(item.selectedVariant.priceAdjustment);

                return (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={imgUrl} alt={item.product.title} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                      <h5 className={styles.itemTitle}>{item.product.title}</h5>
                      <span className={styles.itemVariantBadge}>
                        Ukuran: {item.selectedVariant.size} • {item.selectedVariant.color}
                      </span>
                      <span className={styles.itemPrice}>{formatRupiah(unitPrice * item.quantity)}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className={styles.qtyControls}>
                        <button
                          type="button"
                          className={styles.qtyButton}
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className={styles.qtyNumber}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyButton}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.selectedVariant.stock}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className={styles.removeButton}
                        title="Hapus dari keranjang"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer / Total & Checkout CTA */}
            <div className={styles.drawerFooter}>
              <div className={styles.summaryRow}>
                <span>Estimasi Pengiriman</span>
                <span style={{ color: "#2e7d32", fontWeight: 600 }}>GRATIS (Boutique Complimentary)</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total Pesanan</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              <span className={styles.paymentNotice}>
                Mendukung Pembayaran Instan via <strong>QRIS</strong>, <strong>Transfer Bank</strong>, & <strong>Tunai (In-Store)</strong>
              </span>

              <Link href="/checkout" onClick={onClose} style={{ textDecoration: "none" }}>
                <Button variant="primary" fullWidth size="lg" rightIcon={<ArrowRight size={18} />}>
                  Lanjut ke Pembayaran ({formatRupiah(subtotal)})
                </Button>
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
