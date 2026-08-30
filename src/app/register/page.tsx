"use client";

import React, { useState } from "react";
import styles from "./register.module.css";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  User,
  Mail,
  Lock,
  Phone,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation checks
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Mohon lengkapi seluruh kolom formulir pendaftaran.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi yang Anda masukkan.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Anda harus menyetujui Syarat & Ketentuan Layanan Butik.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftarkan akun. Silakan periksa data Anda.");
      }

      setSuccessMsg("Pendaftaran berhasil! Mengalihkan Anda ke halaman login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kendala saat mendaftar. Pastikan koneksi database MySQL aktif.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Subtle Ambient Background Glows */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />

      <main className={styles.mainGrid}>
        {/* Left Column: Visual Editorial Showcase */}
        <section className={styles.editorialShowcase}>
          <div className={styles.showcaseBackground} />
          <div className={styles.showcaseOverlay} />

          <div className={styles.showcaseHeader}>
            <div className={styles.brandBadge}>
              <Sparkles size={14} />
              <span>Aura Private Membership 2026</span>
            </div>
          </div>

          <div className={styles.showcaseBody}>
            <div className={styles.quoteMark}>“</div>
            <h1 className={styles.editorialQuote}>
              Join our atelier circle for exclusive <em>couture</em> & curated collections.
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
                <span>Priority Order Tracking</span>
              </div>
              <div className={styles.featureItem}>
                <ShoppingBag size={16} />
                <span>Exclusive Drop Access</span>
              </div>
            </div>
            <span>© 2026 AURA BOUTIQUE</span>
          </div>
        </section>

        {/* Right Column: Registration Form Card */}
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            {/* Top Brand Logo */}
            <div className={styles.topLogoArea}>
              <Link href="/">
                <h2 className={styles.brandLogo}>AURA</h2>
                <span className={styles.brandSubtext}>Boutique & Atelier</span>
              </Link>
            </div>

            {/* Form Header */}
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Daftar Akun Baru</h3>
              <p className={styles.formSubtitle}>
                Daftarkan akun Anda untuk menikmati kemudahan berbelanja busana butik eksklusif.
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Nama Lengkap"
                id="register-name"
                type="text"
                placeholder="Contoh: Alya Putri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} />}
                required
                autoComplete="name"
              />

              <Input
                label="Alamat Email"
                id="register-email"
                type="email"
                placeholder="nama@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                required
                autoComplete="email"
              />

              <Input
                label="Nomor WhatsApp / Telepon"
                id="register-phone"
                type="tel"
                placeholder="0812xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={18} />}
                helperText="Digunakan untuk konfirmasi pesanan dan resi pengiriman baju."
                autoComplete="tel"
              />

              <Input
                label="Kata Sandi"
                id="register-password"
                isPassword
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                required
                autoComplete="new-password"
              />

              <Input
                label="Konfirmasi Kata Sandi"
                id="register-confirm-password"
                isPassword
                placeholder="Ulangi kata sandi Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                required
                autoComplete="new-password"
              />

              <label className={styles.agreementOption}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <span className={styles.agreementText}>
                  Saya menyetujui <a>Syarat & Ketentuan</a> serta Kebijakan Privasi Aura Boutique.
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                Daftar Sekarang
              </Button>
            </form>

            {/* Bottom Footer */}
            <div className={styles.cardFooter}>
              <span>Sudah memiliki akun pelanggan?</span>
              <Link href="/login" className={styles.loginLink}>
                Masuk di Sini
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
