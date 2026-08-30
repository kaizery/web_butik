"use client";

import React, { useState, useEffect } from "react";
import styles from "./kasir.module.css";
import { Product, ProductVariant } from "@/types/product";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import {
  ShoppingBag,
  ClipboardList,
  Boxes,
  Plus,
  Minus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  ShieldCheck,
  LogOut,
  Search,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ActiveTab = "POS" | "ORDERS" | "INVENTORY";
type PaymentMethod = "TUNAI" | "QRIS" | "TRANSFER_BANK";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PosCartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export default function KasirPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("POS");

  // Products & Inventory Data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [posSearch, setPosSearch] = useState("");
  const [posCategory, setPosCategory] = useState("all");

  // POS State
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState("Pelanggan Walk-In");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TUNAI");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isProcessingPos, setIsProcessingPos] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Orders Management State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("dresses");
  const [newCategoryName, setNewCategoryName] = useState("Dresses & Gowns");
  const [newPrice, setNewPrice] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newStockS, setNewStockS] = useState("10");
  const [newStockM, setNewStockM] = useState("15");
  const [newStockL, setNewStockL] = useState("8");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Edit / Detail Product Stock State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editMaterial, setEditMaterial] = useState("");
  const [editCare, setEditCare] = useState("");
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Notification Banner
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authentication & Role Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aura_boutique_user");
      if (!stored) {
        router.replace("/login?error=unauthorized");
        return;
      }
      try {
        const user = JSON.parse(stored);
        if (user.role !== "CASHIER" && user.role !== "ADMIN") {
          router.replace("/login?error=forbidden");
          return;
        }
        setCurrentUser(user);
        setIsAuthorized(true);
      } catch {
        router.replace("/login?error=unauthorized");
      }
    }
  }, [router]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aura_boutique_user");
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignore
      }
      setCurrentUser(null);
      router.replace("/login");
    }
  };

  // Load Products
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${orderStatusFilter}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Gagal memuat pesanan:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "ORDERS") {
      loadOrders();
    }
  }, [activeTab, orderStatusFilter]);

  // Format IDR Currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ==========================================
  // POS ACTIONS
  // ==========================================
  const handleAddPosItem = (product: Product, variant: ProductVariant) => {
    if (variant.stock <= 0) {
      showBanner("error", `Stok ukuran ${variant.size} untuk gaun ini telah habis.`);
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stock) {
          showBanner("error", `Maksimum stok ${variant.size} tercapai (${variant.stock} pcs).`);
          return prev;
        }
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          variant,
          quantity: 1,
          unitPrice: Number(product.basePrice) + Number(variant.priceAdjustment),
        },
      ];
    });
  };

  const handleUpdatePosQty = (variantId: number, newQty: number, maxStock: number) => {
    if (newQty <= 0) {
      setPosCart((prev) => prev.filter((item) => item.variant.id !== variantId));
      return;
    }
    if (newQty > maxStock) {
      showBanner("error", `Maksimum stok tersedia hanya ${maxStock} pcs.`);
      return;
    }
    setPosCart((prev) =>
      prev.map((item) => (item.variant.id === variantId ? { ...item, quantity: newQty } : item))
    );
  };

  const posTotal = posCart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const calculatedChange =
    paymentMethod === "TUNAI" && amountPaid ? Math.max(0, Number(amountPaid) - posTotal) : 0;

  const handleProcessPosCheckout = async () => {
    if (posCart.length === 0) {
      showBanner("error", "Keranjang kasir masih kosong.");
      return;
    }

    if (paymentMethod === "TUNAI") {
      const paid = Number(amountPaid) || 0;
      if (paid < posTotal) {
        showBanner("error", `Uang tunai kurang! Total tagihan adalah ${formatRupiah(posTotal)}.`);
        return;
      }
    }

    setIsProcessingPos(true);
    try {
      const payload = {
        items: posCart.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
        amountPaid: paymentMethod === "TUNAI" ? Number(amountPaid) : posTotal,
        customerName,
        customerPhone,
        cashierId: currentUser?.id || 1,
      };

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses transaksi kasir.");
      }

      // Prepare receipt data
      setReceiptData({
        invoiceNumber: data.invoiceNumber,
        createdAt: new Date().toISOString(),
        customerName,
        cashierName: currentUser?.name || "Kasir Butik",
        items: posCart.map((item) => ({
          title: item.product.title,
          size: item.variant.size,
          color: item.variant.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
        totalAmount: posTotal,
        paymentMethod,
        amountPaid: paymentMethod === "TUNAI" ? Number(amountPaid) : posTotal,
        changeAmount: calculatedChange,
      });

      setIsReceiptOpen(true);
      showBanner("success", `Transaksi ${data.invoiceNumber} berhasil dicatat!`);

      // Reset POS cart & reload products to sync stock
      setPosCart([]);
      setAmountPaid("");
      setCustomerName("Pelanggan Walk-In");
      setCustomerPhone("");
      loadProducts();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal memproses kasir.");
    } finally {
      setIsProcessingPos(false);
    }
  };

  // ==========================================
  // INVENTORY STOCK ACTIONS
  // ==========================================
  const handleAdjustStock = async (variantId: number, change: number) => {
    try {
      const res = await fetch("/api/admin/products/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          stockChange: change,
          staffId: currentUser?.id || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      loadProducts();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal mengubah stok.");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      showBanner("error", "Nama busana dan harga wajib diisi.");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const variants = [
        { size: "S", color: "Standard", sku: `SKU-${Date.now().toString().slice(-4)}-S`, stock: Number(newStockS) || 0 },
        { size: "M", color: "Standard", sku: `SKU-${Date.now().toString().slice(-4)}-M`, stock: Number(newStockM) || 0 },
        { size: "L", color: "Standard", sku: `SKU-${Date.now().toString().slice(-4)}-L`, stock: Number(newStockL) || 0 },
      ];

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          categorySlug: newCategorySlug,
          categoryName: newCategoryName,
          basePrice: Number(newPrice),
          material: newMaterial || "Fine Atelier Fabric",
          imageUrl: newImageUrl || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", "Busana baru berhasil ditambahkan!");
      setIsAddProductOpen(false);
      setNewTitle("");
      setNewPrice("");
      setNewMaterial("");
      setNewImageUrl("");
      loadProducts();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal menambahkan produk.");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Open Edit / Detail Stock Modal
  const handleOpenEditDetail = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.basePrice.toString());
    setEditMaterial(product.material || "");
    setEditCare(product.careInstructions || "");
    setEditVariants(
      product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
      }))
    );
  };

  // Save Edit / Detail Stock Changes
  const handleSaveEditDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          title: editTitle,
          basePrice: Number(editPrice),
          material: editMaterial,
          careInstructions: editCare,
          variants: editVariants,
          staffId: currentUser?.id || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal memperbarui stok.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Product & All Variants
  const handleDeleteProduct = async (productId: number, productTitle: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus busana "${productTitle}" beserta seluruh varian stoknya? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}&staffId=${currentUser?.id || 1}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      loadProducts();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal menghapus busana.");
    }
  };

  // ==========================================
  // ORDERS MANAGEMENT ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId: number, orderStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus,
          paymentStatus,
          staffId: currentUser?.id || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      loadOrders();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal memperbarui pesanan.");
    }
  };

  const handleSaveTrackingNumber = async () => {
    if (!trackingModalOrder || !trackingNumberInput) return;
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: trackingModalOrder.id,
          orderStatus: "SHIPPED",
          trackingNumber: trackingNumberInput,
          staffId: currentUser?.id || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", "Pesanan ditandai DIKIRIM dengan nomor resi kurir.");
      setTrackingModalOrder(null);
      setTrackingNumberInput("");
      loadOrders();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal menyimpan nomor resi.");
    }
  };

  // Filtered Products for POS
  const filteredPosProducts = products.filter((p) => {
    const matchCat = posCategory === "all" || p.category?.slug === posCategory;
    const matchSearch =
      !posSearch ||
      p.title.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(posSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)", flexDirection: "column", gap: "1rem" }}>
        <ShieldCheck size={38} color="var(--tertiary)" />
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9375rem" }}>
          Memverifikasi Hak Akses Kasir Butik...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link href="/">
            <span className={styles.brandLogo}>AURA</span>
          </Link>
          <span className={styles.portalBadge}>Portal Kasir Butik</span>
        </div>

        <div className={styles.staffInfo}>
          <div className={styles.staffPill}>
            <ShieldCheck size={15} color="var(--tertiary)" />
            <span>
              {currentUser?.name || "Kasir Toko"} ({currentUser?.role || "CASHIER"})
            </span>
          </div>

          <Link href="/" target="_blank">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink size={14} />}>
              Buka Toko Depan
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut size={16} />}>
            Keluar
          </Button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "POS" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("POS")}
        >
          <ShoppingBag size={18} />
          <span>Kasir Toko (POS)</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "ORDERS" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("ORDERS")}
        >
          <ClipboardList size={18} />
          <span>Verifikasi Pesanan Online</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "INVENTORY" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("INVENTORY")}
        >
          <Boxes size={18} />
          <span>Manajemen Stok Baju</span>
        </button>
      </nav>

      {/* Global Notification Banner */}
      {bannerMsg && (
        <div
          style={{
            padding: "0.75rem 2rem",
            backgroundColor: bannerMsg.type === "success" ? "#e8f5e9" : "#ffdad6",
            color: bannerMsg.type === "success" ? "#1b5e20" : "#93000a",
            fontSize: "0.875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {bannerMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className={styles.mainContent}>
        {/* ========================================================================= */}
        {/* TAB 1: KASIR CEPAT TOKO (POS MODE) */}
        {/* ========================================================================= */}
        {activeTab === "POS" && (
          <div className={styles.posGrid}>
            {/* Left: Product Catalog & Quick Add */}
            <section className={styles.catalogSection}>
              <div className={styles.searchBar}>
                <Input
                  placeholder="Cari nama busana atau model..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>

              {/* Category Filter Chips */}
              <div className={styles.posFilterChips}>
                {["all", "dresses", "outerwear", "tops", "skirts", "sets"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.posChip} ${posCategory === cat ? styles.posChipActive : ""}`}
                    onClick={() => setPosCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className={styles.posProductGrid}>
                {isLoadingProducts ? (
                  <p>Memuat produk...</p>
                ) : filteredPosProducts.length === 0 ? (
                  <p>Tidak ada produk yang cocok.</p>
                ) : (
                  filteredPosProducts.map((p) => {
                    const img =
                      p.images[0]?.imageUrl ||
                      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80";

                    return (
                      <div key={p.id} className={styles.posCard}>
                        <img src={img} alt={p.title} className={styles.posImage} />
                        <div>
                          <h5 className={styles.posTitle}>{p.title}</h5>
                          <span className={styles.posPrice}>{formatRupiah(Number(p.basePrice))}</span>
                        </div>

                        {/* Quick Size Selectors */}
                        <div className={styles.posVariantGrid}>
                          {p.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              className={styles.posSizeButton}
                              disabled={v.stock <= 0}
                              onClick={() => handleAddPosItem(p, v)}
                              title={`Stok: ${v.stock} pcs`}
                            >
                              {v.size} ({v.stock})
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Right: Cashier Register Panel */}
            <aside className={styles.registerPanel}>
              <h3 className={styles.registerTitle}>
                <ShoppingBag size={22} color="var(--tertiary)" />
                <span>Kasir Belanja ({posCart.length} Item)</span>
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.5rem" }}>
                <Input
                  label="Nama Pembeli"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="No. WA (Opsional)"
                  placeholder="0812..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              {/* Cart Items List */}
              <div className={styles.cartList}>
                {posCart.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--outline)", fontSize: "0.875rem", padding: "1.5rem 0" }}>
                    Klik ukuran baju di sebelah kiri untuk menambah ke kasir.
                  </p>
                ) : (
                  posCart.map((item) => (
                    <div key={item.variant.id} className={styles.cartItemRow}>
                      <div>
                        <strong style={{ fontSize: "0.875rem", display: "block" }}>{item.product.title}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                          Ukuran: {item.variant.size} • @ {formatRupiah(item.unitPrice)}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className={styles.posSizeButton}
                          onClick={() => handleUpdatePosQty(item.variant.id, item.quantity - 1, item.variant.stock)}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 600, minWidth: "1.2rem", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={styles.posSizeButton}
                          onClick={() => handleUpdatePosQty(item.variant.id, item.quantity + 1, item.variant.stock)}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", marginLeft: "0.25rem" }}
                          onClick={() => handleUpdatePosQty(item.variant.id, 0, item.variant.stock)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 700 }}>
                <span>Total Tagihan:</span>
                <span style={{ color: "var(--on-surface)" }}>{formatRupiah(posTotal)}</span>
              </div>

              {/* Payment Method Selector */}
              <div className={styles.methodSelector}>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${paymentMethod === "TUNAI" ? styles.methodBtnActive : ""}`}
                  onClick={() => setPaymentMethod("TUNAI")}
                >
                  <Banknote size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Tunai
                </button>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${paymentMethod === "QRIS" ? styles.methodBtnActive : ""}`}
                  onClick={() => setPaymentMethod("QRIS")}
                >
                  <QrCode size={14} style={{ display: "inline", marginRight: "4px" }} />
                  QRIS Toko
                </button>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${paymentMethod === "TRANSFER_BANK" ? styles.methodBtnActive : ""}`}
                  onClick={() => setPaymentMethod("TRANSFER_BANK")}
                >
                  <CreditCard size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Transfer / EDC
                </button>
              </div>

              {/* Payment Details Form */}
              {paymentMethod === "TUNAI" && (
                <div>
                  <Input
                    label="Uang Tunai Diterima (Rp)"
                    type="number"
                    placeholder="Masukkan jumlah uang..."
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />

                  {/* Quick Money Buttons */}
                  <div className={styles.quickMoneyGrid}>
                    <button type="button" className={styles.quickMoneyBtn} onClick={() => setAmountPaid(posTotal.toString())}>
                      Uang Pas
                    </button>
                    <button type="button" className={styles.quickMoneyBtn} onClick={() => setAmountPaid("1000000")}>
                      1 Juta
                    </button>
                    <button type="button" className={styles.quickMoneyBtn} onClick={() => setAmountPaid("2000000")}>
                      2 Juta
                    </button>
                  </div>

                  {Number(amountPaid) >= posTotal && posTotal > 0 && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.6rem 0.85rem",
                        backgroundColor: "#e8f5e9",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#2e7d32",
                      }}
                    >
                      <span>Kembalian Kasir:</span>
                      <span>{formatRupiah(calculatedChange)}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "QRIS" && (
                <div className={styles.qrisBox}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226580016ID.CO.AURA.BOUTIQUE5204581253033605802ID5913AURA_BOUTIQUE6007JAKARTA6304A1B2"
                    alt="QRIS Butik"
                    className={styles.qrisImg}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--tertiary)", fontWeight: 600 }}>
                    NMID: ID1029384910283 (AURA BOUTIQUE)
                  </span>
                  <p style={{ fontSize: "0.6875rem", color: "var(--on-surface-variant)" }}>
                    Minta pembeli memindai QRIS di atas untuk nominal <strong>{formatRupiah(posTotal)}</strong>.
                  </p>
                </div>
              )}

              {paymentMethod === "TRANSFER_BANK" && (
                <div style={{ fontSize: "0.8125rem", padding: "0.85rem", backgroundColor: "var(--surface-container)", borderRadius: "var(--radius-md)" }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Rekening Resmi Butik:</p>
                  <p>BCA: <strong>8820-1928-33</strong> (Aura Boutique Atelier)</p>
                  <p>Mandiri: <strong>132-00-99281-00</strong></p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleProcessPosCheckout}
                isLoading={isProcessingPos}
                disabled={posCart.length === 0}
              >
                Selesaikan Transaksi Kasir
              </Button>
            </aside>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VERIFIKASI PESANAN ONLINE */}
        {/* ========================================================================= */}
        {activeTab === "ORDERS" && (
          <div className={styles.ordersContainer}>
            <div className={styles.ordersFilterBar}>
              {[
                { label: "Semua Pesanan", val: "ALL" },
                { label: "Perlu Verifikasi", val: "PENDING_VERIFICATION" },
                { label: "Sedang Diproses", val: "PROCESSING" },
                { label: "Dikirim", val: "SHIPPED" },
                { label: "Selesai", val: "COMPLETED" },
                { label: "Belum Bayar", val: "UNPAID" },
              ].map((f) => (
                <button
                  key={f.val}
                  type="button"
                  className={`${styles.posChip} ${orderStatusFilter === f.val ? styles.posChipActive : ""}`}
                  onClick={() => setOrderStatusFilter(f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isLoadingOrders ? (
              <p>Memuat daftar pesanan online...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ color: "var(--on-surface-variant)" }}>Tidak ada pesanan pada filter ini.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <strong style={{ fontSize: "1.125rem", marginRight: "0.75rem" }}>{order.invoiceNumber}</strong>
                      <span style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className={styles.orderBody}>
                    {/* Customer Info */}
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Data Pelanggan:</p>
                      <p style={{ fontSize: "0.875rem" }}>{order.customerName}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                        Telp/WA: <a href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--tertiary)", textDecoration: "underline" }}>{order.customerPhone}</a>
                      </p>
                      {order.customerAddress && (
                        <p style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginTop: "0.35rem" }}>
                          Alamat: {order.customerAddress}
                        </p>
                      )}
                    </div>

                    {/* Items List */}
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Busana Dipesan:</p>
                      {order.items.map((item: any) => (
                        <div key={item.id} style={{ fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                          • {item.variant?.product?.title || "Busana"} (Ukuran: {item.variant?.size || "M"}) x{item.quantity} = {formatRupiah(Number(item.subtotal))}
                        </div>
                      ))}
                      <strong style={{ fontSize: "0.9375rem", marginTop: "0.5rem", display: "block" }}>
                        Total: {formatRupiah(Number(order.totalAmount))}
                      </strong>
                    </div>

                    {/* Payment Info & Actions */}
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Pembayaran:</p>
                      <p style={{ fontSize: "0.8125rem" }}>
                        Metode: <strong>{order.payment?.method || "TRANSFER"}</strong> • Status: <strong>{order.payment?.status || "PENDING"}</strong>
                      </p>

                      {order.notes && (
                        <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.25rem" }}>
                          {order.notes}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", flexWrap: "wrap" }}>
                        {order.status === "PENDING_VERIFICATION" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "PROCESSING", "VERIFIED")}
                              leftIcon={<CheckCircle2 size={15} />}
                            >
                              Terima Pembayaran
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED", "REJECTED")}
                              leftIcon={<XCircle size={15} />}
                            >
                              Tolak
                            </Button>
                          </>
                        )}

                        {order.status === "PROCESSING" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setTrackingModalOrder(order);
                              setTrackingNumberInput("");
                            }}
                            leftIcon={<Truck size={15} />}
                          >
                            Kirim & Input Resi
                          </Button>
                        )}

                        {order.status === "SHIPPED" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
                            leftIcon={<CheckCircle2 size={15} />}
                          >
                            Tandai Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MANAJEMEN STOK BAJU BUTIK */}
        {/* ========================================================================= */}
        {activeTab === "INVENTORY" && (
          <div className={styles.inventoryContainer}>
            <div className={styles.inventoryHeader}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Katalog & Matriks Stok Busana</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                  Kelola sisa stok baju per ukuran, lakukan restock harian toko fisik, atau tambah model baru.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddProductOpen(true)}
                leftIcon={<Plus size={16} />}
              >
                + Tambah Baju Baru
              </Button>
            </div>

            {/* Inventory Table */}
            <table className={styles.stockTable}>
              <thead>
                <tr>
                  <th>Busana</th>
                  <th>Kategori</th>
                  <th>Harga Dasar</th>
                  <th>Ukuran & SKU</th>
                  <th>Stok Tersedia</th>
                  <th>Penyesuaian Cepat</th>
                  <th>Kelola & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                      Memuat stok...
                    </td>
                  </tr>
                ) : (
                  products.map((p) =>
                    p.variants.map((v, idx) => (
                      <tr key={v.id}>
                        {idx === 0 ? (
                          <td rowSpan={p.variants.length} style={{ fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <img
                                src={p.images[0]?.imageUrl || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=100&q=80"}
                                alt={p.title}
                                style={{ width: "45px", height: "55px", objectFit: "cover", borderRadius: "4px" }}
                              />
                              <div>
                                <span>{p.title}</span>
                                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                                  {p.material || "Sutra / Linen"}
                                </span>
                              </div>
                            </div>
                          </td>
                        ) : null}

                        {idx === 0 ? (
                          <td rowSpan={p.variants.length}>{p.category?.name || "Boutique"}</td>
                        ) : null}

                        {idx === 0 ? (
                          <td rowSpan={p.variants.length} style={{ fontWeight: 600 }}>
                            {formatRupiah(Number(p.basePrice))}
                          </td>
                        ) : null}

                        <td>
                          <strong>Ukuran {v.size}</strong> ({v.color})<br />
                          <span style={{ fontSize: "0.6875rem", color: "var(--outline)" }}>{v.sku}</span>
                        </td>

                        <td>
                          {v.stock < 5 ? (
                            <span className={styles.stockAlert}>
                              <AlertTriangle size={14} /> Sisa {v.stock} pcs (Menipis!)
                            </span>
                          ) : (
                            <span className={styles.stockGood}>{v.stock} pcs</span>
                          )}
                        </td>

                        <td>
                          <div className={styles.stockControlGroup}>
                            <button
                              type="button"
                              className={styles.stockBtn}
                              onClick={() => handleAdjustStock(v.id, 1)}
                              title="Tambah 1"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              className={styles.stockBtn}
                              onClick={() => handleAdjustStock(v.id, 5)}
                              title="Restock 5 pcs"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              className={styles.stockBtn}
                              onClick={() => handleAdjustStock(v.id, 10)}
                              title="Restock 10 pcs"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              className={styles.stockBtn}
                              disabled={v.stock <= 0}
                              onClick={() => handleAdjustStock(v.id, -1)}
                              title="Kurangi 1 (Rusak/Cacat)"
                            >
                              -1
                            </button>
                          </div>
                        </td>

                        {idx === 0 ? (
                          <td rowSpan={p.variants.length}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                              <button
                                type="button"
                                className={styles.editDetailBtn}
                                onClick={() => handleOpenEditDetail(p)}
                                title="Lihat Detail & Ubah Stok Angka"
                              >
                                <Edit3 size={13} />
                                <span>Detail & Edit</span>
                              </button>
                              <button
                                type="button"
                                className={styles.deleteProdBtn}
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                title="Hapus Busana dari Toko"
                              >
                                <Trash2 size={13} />
                                <span>Hapus Busana</span>
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* POS Receipt Modal */}
      <ReceiptModal
        receipt={receiptData}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewTransaction={() => setIsReceiptOpen(false)}
      />

      {/* Tracking Number Input Modal */}
      {trackingModalOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem" }}>
              Input Nomor Resi Pengiriman
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
              Pesanan: <strong>{trackingModalOrder.invoiceNumber}</strong> ({trackingModalOrder.customerName})
            </p>

            <Input
              label="Nomor Resi Kurir (JNE / J&T / SiCepat)"
              placeholder="Contoh: JNE-992819201"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
              required
            />

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Button variant="ghost" size="md" onClick={() => setTrackingModalOrder(null)}>
                Batal
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveTrackingNumber} disabled={!trackingNumberInput}>
                Simpan & Tandai Dikirim
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddProductOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
              Tambah Busana Butik Baru
            </h4>

            <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Nama Busana"
                placeholder="Contoh: Royal Satin Wrap Dress"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                    Kategori
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--outline-variant)",
                      backgroundColor: "var(--surface-container-low)",
                    }}
                    value={newCategorySlug}
                    onChange={(e) => {
                      setNewCategorySlug(e.target.value);
                      const nameMap: any = {
                        dresses: "Dresses & Gowns",
                        outerwear: "Outerwear & Blazers",
                        tops: "Tops & Blouses",
                        skirts: "Skirts & Bottoms",
                        sets: "Couture Sets",
                      };
                      setNewCategoryName(nameMap[e.target.value] || "Boutique");
                    }}
                  >
                    <option value="dresses">Dresses & Gowns</option>
                    <option value="outerwear">Outerwear & Blazers</option>
                    <option value="tops">Tops & Blouses</option>
                    <option value="skirts">Skirts & Bottoms</option>
                    <option value="sets">Couture Sets</option>
                  </select>
                </div>

                <Input
                  label="Harga Dasar (Rp)"
                  type="number"
                  placeholder="850000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Material Kain"
                placeholder="Contoh: 100% Mulberry Silk / French Linen"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
              />

              <Input
                label="URL Foto Busana"
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />

              {/* Size Stocks Initial */}
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                  Stok Awal per Ukuran
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  <Input label="Ukuran S" type="number" value={newStockS} onChange={(e) => setNewStockS(e.target.value)} />
                  <Input label="Ukuran M" type="number" value={newStockM} onChange={(e) => setNewStockM(e.target.value)} />
                  <Input label="Ukuran L" type="number" value={newStockL} onChange={(e) => setNewStockL(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button variant="ghost" size="md" type="button" onClick={() => setIsAddProductOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" isLoading={isSubmittingProduct}>
                  Simpan Busana Baru
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Detail Product Stock Modal */}
      {editingProduct && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
              Detail & Edit Stok Busana
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
              Sesuaikan angka stok per ukuran dan harga sesuai kondisi fisik baju di butik.
            </p>

            <form onSubmit={handleSaveEditDetail} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Nama Busana"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Input
                  label="Harga Dasar (Rp)"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                />
                <Input
                  label="Material Kain"
                  value={editMaterial}
                  onChange={(e) => setEditMaterial(e.target.value)}
                />
              </div>

              <Input
                label="Petunjuk Perawatan Kain"
                value={editCare}
                onChange={(e) => setEditCare(e.target.value)}
              />

              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                  Rincian Stok Aktual per Ukuran
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {editVariants.map((v, idx) => (
                    <div key={v.id || idx} className={styles.variantEditRow}>
                      <div>
                        <strong style={{ fontSize: "0.9375rem" }}>Ukuran {v.size}</strong>
                        <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--outline)" }}>{v.sku}</span>
                      </div>
                      <Input
                        label="Stok Tersedia (Pcs)"
                        type="number"
                        value={v.stock.toString()}
                        onChange={(e) => {
                          const updated = [...editVariants];
                          updated[idx].stock = Math.max(0, Number(e.target.value) || 0);
                          setEditVariants(updated);
                        }}
                        required
                      />
                      <Input
                        label="Varian Warna"
                        value={v.color}
                        onChange={(e) => {
                          const updated = [...editVariants];
                          updated[idx].color = e.target.value;
                          setEditVariants(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button variant="ghost" size="md" type="button" onClick={() => setEditingProduct(null)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" isLoading={isSavingEdit}>
                  Simpan Perubahan Stok
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
