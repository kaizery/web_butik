"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./checkout.module.css";
import { Navbar } from "@/components/Navbar";
import { CartItem } from "@/types/product";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "TRANSFER_BANK" | "TUNAI">("QRIS");
  const [proofImage, setProofImage] = useState<string | null>(null);

  // Status & UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Load cart
      const savedCart = localStorage.getItem("aura_cart");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch {
          // ignore
        }
      }

      // 2. Load user if logged in
      const savedUser = localStorage.getItem("aura_boutique_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setCustomerName(user.name || "");
          setCustomerEmail(user.email || "");
          if (user.phone) setCustomerPhone(user.phone);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc + (Number(item.product.basePrice) + Number(item.selectedVariant.priceAdjustment)) * item.quantity,
    0
  );

  // Copy Bank Account
  const handleCopyAccount = (accountNum: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(accountNum);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // Handle Slip Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage("Ukuran file bukti transfer maksimal 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProofImage(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMessage("Keranjang belanja kosong.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage("Nama lengkap dan Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          variantId: item.selectedVariant.id,
          quantity: item.quantity,
          unitPrice: Number(item.product.basePrice) + Number(item.selectedVariant.priceAdjustment),
        })),
        paymentMethod,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        notes: orderNotes,
        userId: currentUser?.id || null,
        proofImageUrl: proofImage || null,
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      // Clear local cart
      if (typeof window !== "undefined") {
        localStorage.removeItem("aura_cart");
      }

      setOrderResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare WhatsApp confirmation link
  const getWhatsAppLink = (invoice: string, total: number) => {
    const msg = `Halo Butik AURA Atelier,\nSaya sudah melakukan pesanan online dengan Nomor Invoice: *${invoice}* senilai *${formatRupiah(
      total
    )}* melalui metode *${paymentMethod}*.\nMohon bantu verifikasi pesanan saya. Terima kasih!`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar cartCount={cartItems.length} onOpenCart={() => {}} />

      <main className={styles.checkoutMain}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Beranda</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--on-surface)", fontWeight: 500 }}>Pembayaran Pesanan</span>
        </div>

        {/* Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Konfirmasi &amp; Pembayaran Butik</h1>
          <p className={styles.pageSubtitle}>
            Lengkapi data pengiriman dan pilih metode pembayaran resmi AURA Atelier.
          </p>
        </div>

        {/* Feedback Alert */}
        {errorMessage && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              backgroundColor: "var(--error-container)",
              color: "var(--on-error-container)",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {cartItems.length === 0 && !orderResult ? (
          <div
            className={styles.card}
            style={{ textAlign: "center", padding: "3rem 1.5rem", alignItems: "center" }}
          >
            <ShoppingBag size={48} color="var(--outline)" />
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginTop: "1rem" }}>
              Kantong Belanja Anda Kosong
            </h3>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "0.875rem", maxWidth: "450px" }}>
              Silakan pilih busana gaun eksklusif favorit Anda dari etalase butik terlebih dahulu.
            </p>
            <Link href="/" style={{ marginTop: "1rem" }}>
              <Button variant="primary" size="md">
                Jelajahi Koleksi Butik
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className={styles.checkoutGrid}>
            {/* Left Column: Forms */}
            <div className={styles.formSection}>
              {/* 1. Customer & Shipping Info */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Truck size={20} color="var(--tertiary)" />
                  <h3 className={styles.cardTitle}>1. Informasi Pembeli &amp; Alamat Pengiriman</h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <Input
                    label="Nama Lengkap"
                    placeholder="Contoh: Sarah Jenkins"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <Input
                    label="Nomor WhatsApp / HP"
                    placeholder="0812xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Alamat Email (Untuk Bukti Nota)"
                  type="email"
                  placeholder="sarah@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    Alamat Lengkap Pengiriman (Atau tulis "Ambil di Butik")
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nama Jalan, Nomor Rumah, Kecamatan, Kota, Kode Pos..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--outline-variant)",
                      backgroundColor: "var(--surface-container-low)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.875rem",
                      resize: "vertical",
                    }}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>

                <Input
                  label="Catatan Khusus Pesanan (Opsional)"
                  placeholder="Contoh: Tolong packing kado pita satin atau catatan fitting..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              {/* 2. Payment Method */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <CreditCard size={20} color="var(--tertiary)" />
                  <h3 className={styles.cardTitle}>2. Metode Pembayaran Resmi</h3>
                </div>

                <div className={styles.paymentGrid}>
                  {/* QRIS */}
                  <div
                    className={`${styles.paymentOption} ${
                      paymentMethod === "QRIS" ? styles.paymentOptionActive : ""
                    }`}
                    onClick={() => setPaymentMethod("QRIS")}
                  >
                    <QrCode size={26} color={paymentMethod === "QRIS" ? "var(--primary)" : "var(--outline)"} />
                    <span className={styles.paymentName}>QRIS Instan</span>
                    <span className={styles.paymentSub}>BCA, Mandiri, GoPay, OVO, Dana</span>
                  </div>

                  {/* Transfer Bank */}
                  <div
                    className={`${styles.paymentOption} ${
                      paymentMethod === "TRANSFER_BANK" ? styles.paymentOptionActive : ""
                    }`}
                    onClick={() => setPaymentMethod("TRANSFER_BANK")}
                  >
                    <CreditCard
                      size={26}
                      color={paymentMethod === "TRANSFER_BANK" ? "var(--primary)" : "var(--outline)"}
                    />
                    <span className={styles.paymentName}>Transfer Bank</span>
                    <span className={styles.paymentSub}>Rekening Resmi Butik BCA</span>
                  </div>

                  {/* Tunai / In-Store */}
                  <div
                    className={`${styles.paymentOption} ${
                      paymentMethod === "TUNAI" ? styles.paymentOptionActive : ""
                    }`}
                    onClick={() => setPaymentMethod("TUNAI")}
                  >
                    <Banknote
                      size={26}
                      color={paymentMethod === "TUNAI" ? "var(--primary)" : "var(--outline)"}
                    />
                    <span className={styles.paymentName}>Bayar di Toko</span>
                    <span className={styles.paymentSub}>Fitting &amp; Ambil di Atelier</span>
                  </div>
                </div>

                {/* QRIS Instructions */}
                {paymentMethod === "QRIS" && (
                  <div className={styles.instructionBox}>
                    <div className={styles.qrisBox}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                        QRIS RESMI AURA BOUTIQUE ATELIER
                      </span>
                      {/* Generative QR visual representation */}
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AURA-BOUTIQUE-PAYMENT-IDN"
                        alt="QRIS Code AURA"
                        className={styles.qrisImage}
                      />
                      <p style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                        Scan QRIS di atas menggunakan aplikasi BCA Mobile, Livin by Mandiri, GoPay, OVO, ShopeePay,
                        atau Dana Anda.
                      </p>
                      <strong style={{ fontSize: "1.1rem", color: "var(--on-surface)" }}>
                        Total Tagihan: {formatRupiah(subtotal)}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Transfer Bank Instructions */}
                {paymentMethod === "TRANSFER_BANK" && (
                  <div className={styles.instructionBox}>
                    <div className={styles.bankAccountCard}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                          Bank Central Asia (BCA)
                        </span>
                        <h4 style={{ fontFamily: "monospace", fontSize: "1.35rem", fontWeight: 700, margin: "0.15rem 0" }}>
                          8820-1928-3910
                        </h4>
                        <span style={{ fontSize: "0.8125rem", color: "var(--on-surface)" }}>
                          a.n. <strong>AURA ATELIER STUDIO</strong>
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyAccount("882019283910")}
                        leftIcon={copiedBank ? <Check size={14} color="#2e7d32" /> : <Copy size={14} />}
                      >
                        {copiedBank ? "Tersalin!" : "Salin No. Rekening"}
                      </Button>
                    </div>

                    {/* Upload Transfer Slip */}
                    <div>
                      <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.45rem" }}>
                        Lampirkan Bukti Transfer (Opsional):
                      </label>
                      <label className={styles.uploadZone}>
                        <UploadCloud size={28} color="var(--tertiary)" />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                          {proofImage ? "Ganti Foto Bukti Transfer" : "Ketuk untuk Mengunggah Bukti Pembayaran"}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "var(--outline)" }}>
                          Format JPG / PNG (Maksimal 3MB)
                        </span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
                      </label>

                      {proofImage && (
                        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                          <img src={proofImage} alt="Bukti Transfer" className={styles.previewImage} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* In-Store Pickup */}
                {paymentMethod === "TUNAI" && (
                  <div className={styles.instructionBox}>
                    <p style={{ fontSize: "0.875rem", color: "var(--on-surface)", lineHeight: 1.5 }}>
                      🛍️ <strong>Pengambilan Langsung di Butik:</strong>
                      <br />
                      Pesanan Anda akan disiapkan dan disimpan di atelier kami. Anda dapat mencoba fitting busana dan
                      melakukan pembayaran tunai / kartu langsung saat pengambilan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className={styles.summaryPanel}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <ShoppingBag size={18} color="var(--tertiary)" />
                  <h3 className={styles.cardTitle}>Ringkasan Pesanan ({cartItems.length})</h3>
                </div>

                {/* Items */}
                <div className={styles.itemList}>
                  {cartItems.map((item) => {
                    const imgUrl =
                      item.product.images[0]?.imageUrl ||
                      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=200&q=80";
                    const price =
                      Number(item.product.basePrice) + Number(item.selectedVariant.priceAdjustment);

                    return (
                      <div key={item.id} className={styles.itemRow}>
                        <img src={imgUrl} alt={item.product.title} className={styles.itemImg} />
                        <div className={styles.itemDetails}>
                          <h5 className={styles.itemTitle}>{item.product.title}</h5>
                          <span className={styles.itemMeta}>
                            Ukuran {item.selectedVariant.size} • Qty: {item.quantity}
                          </span>
                          <span className={styles.itemPrice}>{formatRupiah(price * item.quantity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cost Calculation */}
                <div className={styles.costBreakdown}>
                  <div className={styles.costRow}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Subtotal Busana</span>
                    <strong>{formatRupiah(subtotal)}</strong>
                  </div>
                  <div className={styles.costRow}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Biaya Pengiriman</span>
                    <span style={{ color: "#2e7d32", fontWeight: 600 }}>GRATIS (Complimentary)</span>
                  </div>
                  <div className={styles.grandTotalRow}>
                    <span>Total Pembayaran</span>
                    <span className={styles.grandTotalAmount}>{formatRupiah(subtotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Bayar Sekarang ({formatRupiah(subtotal)})
                </Button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem",
                    fontSize: "0.75rem",
                    color: "var(--on-surface-variant)",
                    textAlign: "center",
                  }}
                >
                  <ShieldCheck size={16} color="var(--tertiary)" />
                  <span>Transaksi Terenkripsi &amp; Garansi Orisinalitas 100%</span>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Order Success Modal */}
        {orderResult && (
          <div className={styles.successBackdrop}>
            <div className={styles.successCard}>
              <div className={styles.successIconBadge}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--on-surface)" }}>
                Pesanan Berhasil Dibuat!
              </h3>

              <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                Terima kasih telah berbelanja di <strong>AURA Boutique &amp; Atelier</strong>. Nomor pesanan Anda adalah:
              </p>

              <div className={styles.invoicePill}>{orderResult.invoiceNumber}</div>

              <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)", fontWeight: 600 }}>
                Total Tagihan: {formatRupiah(orderResult.totalAmount)}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", width: "100%", marginTop: "0.5rem" }}>
                <a
                  href={getWhatsAppLink(orderResult.invoiceNumber, orderResult.totalAmount)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <Button variant="primary" fullWidth size="md" rightIcon={<ExternalLink size={16} />}>
                    Konfirmasi via WhatsApp Toko
                  </Button>
                </a>

                <Link
                  href={`/lacak?invoice=${orderResult.invoiceNumber}`}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <Button variant="secondary" fullWidth size="md" rightIcon={<Truck size={16} />}>
                    Lacak Status Pesanan Ini
                  </Button>
                </Link>

                <Link href="/" style={{ width: "100%", textDecoration: "none" }}>
                  <Button variant="ghost" fullWidth size="sm">
                    Kembali ke Beranda Toko
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
