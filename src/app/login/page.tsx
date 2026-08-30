"use client";

import React, { useState, useEffect } from "react";
import styles from "./login.module.css";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  User,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type LoginRole = "CUSTOMER" | "ADMIN";

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<LoginRole>("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setErrorMsg("Akses ditolak");
        if (err.includes("kasir") || err.includes("admin")) {
          setActiveRole("ADMIN");
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Mohon masukkan email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: activeRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan login. Silakan periksa kembali data Anda.");
      }

      setSuccessMsg(`Login berhasil. Selamat datang, ${data.user.name}!`);

      if (typeof window !== "undefined") {
        localStorage.setItem("aura_boutique_user", JSON.stringify(data.user));
      }

      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          window.location.href = "/portal-admin";
        } else if (data.user.role === "CASHIER") {
          window.location.href = "/kasir";
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kendala saat login. Pastikan database aktif.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Subtle Ambient Background Glow */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />

      <main className={styles.mainGrid}>
        {/* Left Column: Editorial Visual Showcase */}
        <section className={styles.editorialShowcase}>
          <div className={styles.showcaseBackground} />
          <div className={styles.showcaseOverlay} />

          <div className={styles.showcaseHeader}>
            <div className={styles.brandBadge}>
              <Sparkles size={14} />
              <span>Autumn / Winter Collection 2026</span>
            </div>
          </div>

          <div className={styles.showcaseBody}>
            <div className={styles.quoteMark}>“</div>
            <h1 className={styles.editorialQuote}>
              Elegance is not about being noticed, it is about being <em>remembered</em>.
            </h1>
            <div className={styles.quoteAuthor}>
              <span className={styles.authorLine} />
              <span className={styles.authorText}>Aura Atelier & Haute Couture</span>
            </div>
          </div>

          <div className={styles.showcaseFooter}>
            <div className={styles.featuresPills}>
              <div className={styles.featureItem}>
                <ShieldCheck size={16} />
                <span>100% Authentic Fabric</span>
              </div>
              <div className={styles.featureItem}>
                <ShoppingBag size={16} />
                <span>Curated Silhouettes</span>
              </div>
            </div>
            <span>© 2026 AURA BOUTIQUE</span>
          </div>
        </section>

        {/* Right Column: Glassmorphism Login Card */}
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            {/* Top Brand Logo */}
            <div className={styles.topLogoArea}>
              <Link href="/">
                <h2 className={styles.brandLogo}>AURA</h2>
                <span className={styles.brandSubtext}>Boutique & Atelier</span>
              </Link>
            </div>

            {/* Role Switcher Tab */}
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleTab} ${activeRole === "CUSTOMER" ? styles.roleTabActive : ""}`}
                onClick={() => {
                  setActiveRole("CUSTOMER");
                  setErrorMsg(null);
                }}
              >
                <User size={15} />
                <span>Pelanggan</span>
              </button>
              <button
                type="button"
                className={`${styles.roleTab} ${activeRole === "ADMIN" ? styles.roleTabActive : ""}`}
                onClick={() => {
                  setActiveRole("ADMIN");
                  setErrorMsg(null);
                }}
              >
                <ShieldCheck size={15} />
                <span>Staf & Kasir</span>
              </button>
            </div>

            {/* Form Title */}
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>
                {activeRole === "CUSTOMER" ? "Masuk ke Akun Anda" : "Portal Staf Butik"}
              </h3>
              <p className={styles.formSubtitle}>
                {activeRole === "CUSTOMER"
                  ? "Akses pesanan, riwayat belanja, dan koleksi eksklusif Anda."
                  : "Kelola stok baju, verifikasi transfer & kasir butik."}
              </p>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Manual Login Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Alamat Email"
                id="login-email"
                type="email"
                placeholder={activeRole === "CUSTOMER" ? "nama@domain.com" : "staf@auraboutique.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                required
                autoComplete="email"
              />

              <Input
                label="Kata Sandi"
                id="login-password"
                isPassword
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                required
                autoComplete="current-password"
              />

              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ingat saya</span>
                </label>

                <a href="#forgot" className={styles.forgotLink}>
                  Lupa kata sandi?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                {activeRole === "CUSTOMER" ? "Masuk Sekarang" : "Masuk ke Dashboard"}
              </Button>
            </form>

            {/* Bottom Footer */}
            <div className={styles.cardFooter}>
              <span>Belum memiliki akun pelanggan?</span>
              <Link href="/register" className={styles.registerLink}>
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
