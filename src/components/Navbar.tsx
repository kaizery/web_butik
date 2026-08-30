"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import { ShoppingBag, User, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { Button } from "./ui/Button";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aura_boutique_user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aura_boutique_user");
      setCurrentUser(null);
      router.push("/");
    }
  };

  // Navigasi Section Body Halaman Utama
  const navSections = [
    { label: "Beranda", targetId: "hero" },
    { label: "Katalog Produk", targetId: "collection" },
    { label: "Tentang Atelier", targetId: "atelier" },
    { label: "Keunggulan", targetId: "layanan" },
    { label: "Kontak Butik", targetId: "kontak" },
  ];

  const handleScrollToSection = (targetId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(targetId);

    if (pathname === "/") {
      if (targetId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      router.push(`/#${targetId}`);
    }
  };

  return (
    <header className={styles.navbarContainer}>
      <div className={styles.mainNav}>
        {/* Left: Brand Logo */}
        <Link href="/" className={styles.brandLeft} onClick={() => handleScrollToSection("hero")}>
          <span className={styles.brandLogo}>AURA</span>
          <span className={styles.brandSubtext}>Boutique & Atelier</span>
        </Link>

        {/* Center: Navigation Links to Body Sections */}
        <nav aria-label="Navigasi Halaman">
          <ul className={styles.navLinks}>
            {navSections.map((sec) => (
              <li key={sec.targetId} className={styles.navItem}>
                <button
                  type="button"
                  className={`${styles.navLink} ${
                    activeSection === sec.targetId ? styles.navLinkActive : ""
                  }`}
                  onClick={() => handleScrollToSection(sec.targetId)}
                >
                  {sec.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions (User Profile, Admin link, & Cart) */}
        <div className={styles.navActions}>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {currentUser.role === "ADMIN" ? (
                <Link
                  href="/portal-admin"
                  className={styles.userBadgeLink}
                  title="Masuk ke Portal Super Admin & Owner"
                >
                  <ShieldCheck size={14} />
                  <span>Portal Admin</span>
                </Link>
              ) : currentUser.role === "CASHIER" ? (
                <Link
                  href="/kasir"
                  className={styles.userBadgeLink}
                  title="Masuk ke Portal Kasir Butik"
                >
                  <ShieldCheck size={14} />
                  <span>Portal Kasir</span>
                </Link>
              ) : (
                <div className={styles.userBadgeLink} title={`Akun Pelanggan: ${currentUser.name}`}>
                  <User size={14} />
                  <span>{currentUser.name.split(" ")[0]}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className={styles.actionButton}
                title="Keluar dari Akun"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" leftIcon={<User size={16} />}>
                Masuk
              </Button>
            </Link>
          )}

          {/* Cart Bag Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className={styles.actionButton}
            aria-label="Buka Kantong Belanja"
            title="Buka Kantong Belanja"
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>

          {/* Mobile Menu Icon */}
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu navigasi mobile"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navSections.map((sec) => (
            <button
              key={sec.targetId}
              type="button"
              className={styles.mobileCategoryLink}
              onClick={() => handleScrollToSection(sec.targetId)}
            >
              {sec.label}
            </button>
          ))}
          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--outline-variant)" }}>
            {currentUser ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Halo, {currentUser.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut size={15} />}>
                  Keluar
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="md">
                  Masuk / Daftar Akun
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
