"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./lacak.module.css";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ShoppingBag,
  RotateCw,
  Sparkles,
  User,
} from "lucide-react";
import { getCurrentUser } from "@/lib/cartStorage";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialInvoice = searchParams.get("invoice") || "";

  const [searchQuery, setSearchQuery] = useState(initialInvoice);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [statusUpdateToast, setStatusUpdateToast] = useState<string | null>(null);

  // Keep track of previous order status for live change detection
  const previousStatusMap = useRef<Record<string, string>>({});

  // Auto search if invoice query param is present or logged-in user phone
  useEffect(() => {
    if (initialInvoice) {
      handleSearch(initialInvoice, false);
    } else {
      const user = getCurrentUser();
      if (user && user.phone) {
        setSearchQuery(user.phone);
        handleSearch(user.phone, false);
      }
    }
  }, [initialInvoice]);

  // Real-Time Live Polling: Auto-sync order status every 3.5 seconds while viewing
  useEffect(() => {
    if (orders.length === 0 || !searchQuery.trim()) return;

    const interval = setInterval(() => {
      handleSearch(searchQuery, true); // silent background fetch
    }, 3500);

    return () => clearInterval(interval);
  }, [orders.length, searchQuery]);

  const handleSearch = async (queryToSearch?: string, isSilent = false) => {
    const query = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!query.trim()) {
      if (!isSilent) setErrorMessage("Masukkan Nomor Invoice atau Nomor WhatsApp Anda.");
      return;
    }

    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const isPhone = /^[0-9+]+$/.test(query.trim());
      const url = isPhone
        ? `/api/orders/track?phone=${encodeURIComponent(query.trim())}`
        : `/api/orders/track?invoice=${encodeURIComponent(query.trim())}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pesanan tidak ditemukan.");
      }

      const fetchedOrders = data.orders || [];

      // Check if any order status changed live
      fetchedOrders.forEach((o: any) => {
        const prev = previousStatusMap.current[o.invoiceNumber];
        if (prev && prev !== o.status) {
          const statusName =
            o.status === "PROCESSING"
              ? "Sedang Dikemas (Packing)"
              : o.status === "SHIPPED"
              ? "Dalam Pengiriman (Resi Diterbitkan)"
              : o.status === "COMPLETED"
              ? "Pesanan Selesai / Diterima"
              : o.status;

          setStatusUpdateToast(
            `Status Pesanan ${o.invoiceNumber} baru saja diperbarui oleh Butik menjadi: ${statusName}!`
          );

          // Clear toast after 6 seconds
          setTimeout(() => setStatusUpdateToast(null), 6000);
        }
        previousStatusMap.current[o.invoiceNumber] = o.status;
      });

      setOrders(fetchedOrders);
      setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setErrorMessage(null);
    } catch (err: any) {
      if (!isSilent) {
        setErrorMessage(err.message || "Gagal melacak pesanan.");
        setOrders([]);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopyResi = (resi: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resi);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  // Stepper Step Resolver
  const getStepIndex = (status: string) => {
    switch (status) {
      case "UNPAID":
      case "PENDING_VERIFICATION":
        return 0; // Step 1: Menunggu Verifikasi
      case "PROCESSING":
        return 1; // Step 2: Sedang Dikemas
      case "SHIPPED":
        return 2; // Step 3: Dalam Pengiriman
      case "COMPLETED":
        return 3; // Step 4: Selesai
      default:
        return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNPAID":
        return <span className={`${styles.statusBadge} ${styles.statusUNPAID}`}>Menunggu Pembayaran</span>;
      case "PENDING_VERIFICATION":
        return (
          <span className={`${styles.statusBadge} ${styles.statusPENDING_VERIFICATION}`}>
            Verifikasi Pembayaran
          </span>
        );
      case "PROCESSING":
        return (
          <span className={`${styles.statusBadge} ${styles.statusPROCESSING}`}>
            Sedang Dikemas (Packing)
          </span>
        );
      case "SHIPPED":
        return (
          <span className={`${styles.statusBadge} ${styles.statusSHIPPED}`}>
            <Truck size={14} /> Dalam Pengiriman
          </span>
        );
      case "COMPLETED":
        return (
          <span className={`${styles.statusBadge} ${styles.statusCOMPLETED}`}>
            <CheckCircle2 size={14} /> Pesanan Selesai
          </span>
        );
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.mainContent}>
      {/* Header */}
      <div className={styles.headerSection}>
        <span className={styles.badge}>
          <Truck size={13} /> Real-Time Live Order Tracking
        </span>
        <h1 className={styles.pageTitle}>Lacak Status Pesanan Butik</h1>
        <p className={styles.pageSubtitle}>
          Pantau status verifikasi pembayaran, proses pengemasan gaun, dan nomor resi pengiriman Anda secara langsung
          tanpa perlu refresh halaman.
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBox}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery, false);
          }}
          className={styles.searchForm}
        >
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Masukkan Nomor Invoice (Contoh: ORD-AURA-...) atau No. WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            Cari Pesanan
          </Button>
        </form>
      </div>

      {/* Live Status Toast Banner */}
      {statusUpdateToast && (
        <div className={styles.statusAlertToast}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} color="#2e7d32" />
            <span>{statusUpdateToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusUpdateToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1b5e20", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Feedback Alerts */}
      {errorMessage && (
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "var(--error-container)",
            color: "var(--on-error-container)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            fontSize: "0.875rem",
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results List */}
      {orders.length > 0 && (
        <div>
          {/* Live Sync Info Header */}
          <div className={styles.liveStatusHeader}>
            <div className={styles.liveDotGroup}>
              <span className={styles.pulsingDot} />
              <span>Live Sync Aktif (Otomatis Terupdate)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span>Sinkron: {lastSyncTime || "Baru saja"}</span>
              <button
                type="button"
                className={styles.refreshButton}
                onClick={() => handleSearch(searchQuery, false)}
                title="Segarkan data sekarang"
              >
                <RotateCw size={13} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
                <span>Segarkan</span>
              </button>
            </div>
          </div>

          {orders.map((order) => {
            const currentStep = getStepIndex(order.status);

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Header */}
                <div className={styles.orderCardHeader}>
                  <div>
                    <span className={styles.invoiceTitle}>{order.invoiceNumber}</span>
                    <div className={styles.orderDate}>
                      Dipesan pada: {new Date(order.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* 4-Step Progress Stepper */}
                <div className={styles.stepperWrapper}>
                  <div className={styles.stepper}>
                    {/* Step 1 */}
                    <div className={styles.stepItem}>
                      <div
                        className={`${styles.stepCircle} ${
                          currentStep >= 0 ? (currentStep > 0 ? styles.stepCircleCompleted : styles.stepCircleActive) : ""
                        }`}
                      >
                        {currentStep > 0 ? <Check size={20} /> : <Clock size={20} />}
                      </div>
                      <span className={styles.stepLabel}>1. Pesanan Diterima</span>
                      <span className={styles.stepSub}>Menunggu Verifikasi</span>
                    </div>

                    {/* Step 2 */}
                    <div className={styles.stepItem}>
                      <div
                        className={`${styles.stepCircle} ${
                          currentStep >= 1 ? (currentStep > 1 ? styles.stepCircleCompleted : styles.stepCircleActive) : ""
                        }`}
                      >
                        {currentStep > 1 ? <Check size={20} /> : <Package size={20} />}
                      </div>
                      <span className={styles.stepLabel}>2. Sedang Dikemas</span>
                      <span className={styles.stepSub}>Packaging Butik</span>
                    </div>

                    {/* Step 3 */}
                    <div className={styles.stepItem}>
                      <div
                        className={`${styles.stepCircle} ${
                          currentStep >= 2 ? (currentStep > 2 ? styles.stepCircleCompleted : styles.stepCircleActive) : ""
                        }`}
                      >
                        {currentStep > 2 ? <Check size={20} /> : <Truck size={20} />}
                      </div>
                      <span className={styles.stepLabel}>3. Dalam Pengiriman</span>
                      <span className={styles.stepSub}>Menuju Alamat Anda</span>
                    </div>

                    {/* Step 4 */}
                    <div className={styles.stepItem}>
                      <div
                        className={`${styles.stepCircle} ${
                          currentStep >= 3 ? styles.stepCircleCompleted : ""
                        }`}
                      >
                        <CheckCircle2 size={20} />
                      </div>
                      <span className={styles.stepLabel}>4. Pesanan Selesai</span>
                      <span className={styles.stepSub}>Diterima Pelanggan</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Resi Box (If Shipped / Completed) */}
                {order.notes && order.notes.includes("Resi:") && (
                  <div className={styles.resiBox}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#0d47a1", fontWeight: 600, textTransform: "uppercase" }}>
                        Nomor Resi Ekspedisi Pengiriman
                      </span>
                      <div className={styles.resiNumber}>{order.notes.replace("Resi:", "").trim()}</div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyResi(order.notes.replace("Resi:", "").trim())}
                      leftIcon={copiedResi ? <Check size={14} color="#2e7d32" /> : <Copy size={14} />}
                    >
                      {copiedResi ? "Tersalin!" : "Salin No. Resi"}
                    </Button>
                  </div>
                )}

                {/* Customer & Shipping Details Grid */}
                <div className={styles.detailsGrid}>
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem", color: "var(--on-surface)" }}>
                      Penerima &amp; Kontak:
                    </strong>
                    <span>{order.customerName}</span>
                    <span style={{ display: "block", color: "var(--on-surface-variant)" }}>
                      {order.customerPhone}
                    </span>
                  </div>

                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem", color: "var(--on-surface)" }}>
                      Alamat Pengiriman:
                    </strong>
                    <span style={{ color: "var(--on-surface-variant)", lineHeight: 1.4 }}>
                      {order.customerAddress || "Ambil di Butik (Store Pickup)"}
                    </span>
                  </div>
                </div>

                {/* Items Purchased */}
                <div className={styles.itemsSection}>
                  <strong style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.75rem" }}>
                    Rincian Busana ({order.items?.length || 0} Item):
                  </strong>

                  {order.items?.map((item: any) => {
                    const imgUrl =
                      item.variant?.product?.images?.[0]?.imageUrl ||
                      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&q=80";

                    return (
                      <div key={item.id} className={styles.itemRow}>
                        <img src={imgUrl} alt={item.variant?.product?.title} className={styles.itemImg} />
                        <div className={styles.itemInfo}>
                          <h5 className={styles.itemTitle}>{item.variant?.product?.title}</h5>
                          <span className={styles.itemMeta}>
                            Ukuran {item.variant?.size} • {item.quantity} pcs
                          </span>
                        </div>
                        <span className={styles.itemPrice}>{formatRupiah(Number(item.subtotal))}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Total & Action */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    borderTop: "1px solid var(--outline-variant)",
                    paddingTop: "1rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", display: "block" }}>
                      Metode Pembayaran: {order.payment?.method || "Online"}
                    </span>
                    <strong style={{ fontSize: "1.25rem", color: "var(--on-surface)" }}>
                      Total: {formatRupiah(Number(order.totalAmount))}
                    </strong>
                  </div>

                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo Butik AURA Atelier,\nSaya ingin menanyakan update status untuk Nomor Pesanan: *${order.invoiceNumber}*. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={14} />}>
                      Hubungi Bantuan WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className={styles.pageContainer}>
      <Navbar cartCount={0} onOpenCart={() => {}} />
      <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat pelacakan pesanan...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
