"use client";

import React, { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  Activity,
  Users,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminTab = "OVERVIEW" | "LOGS" | "STAFF";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");

  // Report & Analytics State
  const [report, setReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);

  // Activity Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Staff Management State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("CASHIER");
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Banner Message
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check Admin Authentication Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aura_boutique_user");
      if (!stored) {
        router.replace("/login?error=unauthorized");
        return;
      }
      try {
        const user = JSON.parse(stored);
        if (user.role !== "ADMIN") {
          if (user.role === "CASHIER") router.replace("/kasir");
          else router.replace("/login?error=forbidden");
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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load Sales & Cashflow Report
  const loadReport = async () => {
    setIsLoadingReport(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.report) setReport(data.report);
    } catch (err) {
      console.error("Gagal memuat rekap penjualan:", err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Load Activity Logs
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/logs?limit=50");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Gagal memuat log aktivitas:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Load Staff List
  const loadStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.staff) setStaffList(data.staff);
    } catch (err) {
      console.error("Gagal memuat akun staf:", err);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (activeTab === "OVERVIEW") loadReport();
    else if (activeTab === "LOGS") loadLogs();
    else if (activeTab === "STAFF") loadStaff();
  }, [activeTab]);

  // Create Staff Account
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      showBanner("error", "Nama, email, dan kata sandi wajib diisi.");
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          password: staffPassword,
          role: staffRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      setIsAddStaffOpen(false);
      setStaffName("");
      setStaffEmail("");
      setStaffPhone("");
      setStaffPassword("");
      loadStaff();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal membuat akun staf.");
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  // Delete Staff Account
  const handleDeleteStaff = async (id: number, name: string) => {
    if (id === currentUser?.id) {
      showBanner("error", "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.");
      return;
    }

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus akun karyawan "${name}"? Tindakan ini akan menghapus akses staf secara permanen.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}&adminId=${currentUser?.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showBanner("success", data.message);
      loadStaff();
      loadLogs();
    } catch (err: any) {
      showBanner("error", err.message || "Gagal menghapus akun staf.");
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)", flexDirection: "column", gap: "1rem" }}>
        <ShieldCheck size={38} color="var(--primary)" />
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9375rem" }}>
          Memverifikasi Hak Akses Super Admin...
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
          <span className={styles.portalBadge}>Super Admin & Owner Portal</span>
        </div>

        <div className={styles.adminInfo}>
          <div className={styles.adminPill}>
            <ShieldCheck size={16} />
            <span>{currentUser?.name || "Super Admin"}</span>
          </div>

          <Link href="/kasir">
            <Button variant="secondary" size="sm" leftIcon={<ShoppingBag size={14} />}>
              Buka Portal Kasir
            </Button>
          </Link>

          <Link href="/" target="_blank">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink size={14} />}>
              Toko Depan
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
          className={`${styles.tabButton} ${activeTab === "OVERVIEW" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("OVERVIEW")}
        >
          <BarChart3 size={18} />
          <span>Rekap Penjualan & Kas Harian</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "LOGS" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("LOGS")}
        >
          <Activity size={18} />
          <span>Activity Log & Audit Trail</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "STAFF" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("STAFF")}
        >
          <Users size={18} />
          <span>Manajemen Akun Staf / Kasir</span>
        </button>
      </nav>

      {/* Banner */}
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

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* ========================================================================= */}
        {/* TAB 1: REKAP PENJUALAN & KAS HARIAN */}
        {/* ========================================================================= */}
        {activeTab === "OVERVIEW" && (
          <div>
            {isLoadingReport ? (
              <p>Memuat ringkasan omset penjualan...</p>
            ) : !report ? (
              <p>Data penjualan belum tersedia.</p>
            ) : (
              <>
                {/* KPI Cards */}
                <div className={styles.kpiGrid}>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Total Omset Pendapatan</span>
                    <span className={styles.kpiValue}>{formatRupiah(report.totalRevenue)}</span>
                    <span className={styles.kpiSub}>Dari {report.totalOrders} Transaksi Terverifikasi</span>
                  </div>

                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Kas Masuk Tunai (Cash)</span>
                    <span className={styles.kpiValue} style={{ color: "#2e7d32" }}>
                      {formatRupiah(report.cashRevenue)}
                    </span>
                    <span className={styles.kpiSub}>Kasir Fisik Butik</span>
                  </div>

                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Kas Masuk QRIS</span>
                    <span className={styles.kpiValue} style={{ color: "#775a19" }}>
                      {formatRupiah(report.qrisRevenue)}
                    </span>
                    <span className={styles.kpiSub}>Pembayaran Instan Digital</span>
                  </div>

                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Kas Transfer Bank</span>
                    <span className={styles.kpiValue} style={{ color: "#1565c0" }}>
                      {formatRupiah(report.transferRevenue)}
                    </span>
                    <span className={styles.kpiSub}>BCA / Mandiri / EDC</span>
                  </div>
                </div>

                {/* Detailed Analytics */}
                <div className={styles.analyticsGrid}>
                  {/* Payment Breakdown Card */}
                  <div className={styles.analyticsCard}>
                    <h3 className={styles.cardTitle}>
                      <CreditCard size={20} color="var(--tertiary)" />
                      <span>Rincian Sumber Transaksi</span>
                    </h3>

                    <div className={styles.breakdownList}>
                      <div className={styles.breakdownItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <ShoppingBag size={18} />
                          <span>Transaksi Langsung Toko (Kasir Walk-In)</span>
                        </div>
                        <strong>{report.inStoreOrdersCount} Transaksi</strong>
                      </div>

                      <div className={styles.breakdownItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <TrendingUp size={18} />
                          <span>Pesanan Online Website</span>
                        </div>
                        <strong>{report.onlineOrdersCount} Pesanan</strong>
                      </div>

                      <div className={styles.breakdownItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Users size={18} />
                          <span>Total Karyawan Aktif</span>
                        </div>
                        <strong>{report.totalStaff} Orang</strong>
                      </div>
                    </div>
                  </div>

                  {/* Best Selling Products */}
                  <div className={styles.analyticsCard}>
                    <h3 className={styles.cardTitle}>
                      <TrendingUp size={20} color="var(--tertiary)" />
                      <span>Busana Butik Terlaris (Best Seller)</span>
                    </h3>

                    <div className={styles.breakdownList}>
                      {report.topSellingProducts.length === 0 ? (
                        <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                          Belum ada data penjualan busana.
                        </p>
                      ) : (
                        report.topSellingProducts.map((prod: any, idx: number) => (
                          <div key={idx} className={styles.breakdownItem}>
                            <div>
                              <strong>#{idx + 1} {prod.title}</strong>
                              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                                Terjual {prod.count} pcs
                              </span>
                            </div>
                            <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                              {formatRupiah(prod.revenue)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACTIVITY LOGS & AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === "LOGS" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Audit Activity Log</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                  Catatan aktivitas real-time untuk transparansi dan audit keamanan toko butik.
                </p>
              </div>

              <Button variant="ghost" size="sm" onClick={loadLogs} leftIcon={<RefreshCw size={14} />}>
                Refresh Log
              </Button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.logsTable}>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Aktor (User)</th>
                    <th>Aksi (Event)</th>
                    <th>Objek</th>
                    <th>Rincian Aktivitas</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                        Memuat log aktivitas...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                        Belum ada catatan aktivitas tercatat.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Clock size={13} color="var(--tertiary)" />
                            <span>{new Date(log.createdAt).toLocaleString("id-ID")}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{log.user?.name || "Sistem"}</strong>
                          <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--on-surface-variant)" }}>
                            {log.user?.role || "SYSTEM"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.actionPill}>{log.action}</span>
                        </td>
                        <td>{log.entityName || "-"}</td>
                        <td style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", maxWidth: "350px", wordBreak: "break-word" }}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MANAJEMEN AKUN STAF & KASIR */}
        {/* ========================================================================= */}
        {activeTab === "STAFF" && (
          <div>
            <div className={styles.staffHeader}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Daftar Akun Karyawan Butik</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                  Kelola staf yang memiliki hak akses kasir dan pengelolaan pesanan butik.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddStaffOpen(true)}
                leftIcon={<Plus size={16} />}
              >
                + Buat Akun Kasir/Staf Baru
              </Button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.staffTable}>
                <thead>
                  <tr>
                    <th>Nama Karyawan</th>
                    <th>Alamat Email</th>
                    <th>No. WhatsApp</th>
                    <th>Hak Akses (Role)</th>
                    <th>Tanggal Didaftarkan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingStaff ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                        Memuat daftar staf...
                      </td>
                    </tr>
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                        Belum ada staf kasir yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((st) => (
                      <tr key={st.id}>
                        <td style={{ fontWeight: 600 }}>{st.name}</td>
                        <td>{st.email}</td>
                        <td>{st.phone || "-"}</td>
                        <td>
                          <span className={st.role === "ADMIN" ? styles.roleAdmin : styles.roleCashier}>
                            {st.role === "ADMIN" ? "SUPER ADMIN" : "KASIR BUTIK"}
                          </span>
                        </td>
                        <td>{new Date(st.createdAt).toLocaleDateString("id-ID")}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.deleteStaffBtn}
                            disabled={st.id === currentUser?.id}
                            onClick={() => handleDeleteStaff(st.id, st.name)}
                            title={
                              st.id === currentUser?.id
                                ? "Akun Anda saat ini (tidak dapat dihapus)"
                                : `Hapus akun ${st.name}`
                            }
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </div>
        )}
      </main>

      {/* Add Staff Account Modal */}
      {isAddStaffOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
              Buat Akun Staf / Kasir Baru
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
              Daftarkan akun karyawan untuk mengoperasikan kasir dan pesanan butik.
            </p>

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Nama Lengkap Karyawan"
                placeholder="Contoh: Siti Rahma"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />

              <Input
                label="Alamat Email Login"
                type="email"
                placeholder="kasir@auraboutique.com"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                required
              />

              <Input
                label="No. WhatsApp / HP"
                placeholder="0812xxxxxxxx"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.75rem" }}>
                <Input
                  label="Kata Sandi Awal"
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                />

                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                    Hak Akses (Role)
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--outline-variant)",
                      backgroundColor: "var(--surface-container-low)",
                    }}
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="CASHIER">Kasir Butik (CASHIER)</option>
                    <option value="ADMIN">Staf Admin (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button variant="ghost" size="md" type="button" onClick={() => setIsAddStaffOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" isLoading={isSubmittingStaff}>
                  Buat Akun Karyawan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
