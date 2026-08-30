"use client";

import React, { useState, useEffect } from "react";
import styles from "./installPwa.module.css";
import { Smartphone, Download, X, Share2, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Check if already installed & running in standalone app mode
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) return;

      // 2. Check if device is iOS (iPhone/iPad)
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isAppleDevice);

      // 3. Listen for native browser PWA install event (Android/Desktop Chrome)
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handler);

      // 4. On Mobile Devices, if beforeinstallprompt doesn't fire (e.g. iOS or HTTP IP), show banner after 1.5s
      const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent);
      if (isMobile) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handler);
        };
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native 1-click install prompt on Android Chrome
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // If accessed via local IP HTTP or iOS Safari, show the clear step-by-step guide
      setIsGuideOpen(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner */}
      <aside className={styles.installBanner} aria-label="Pasang Aplikasi Kasir AURA">
        <div className={styles.iconWrapper}>
          <Smartphone size={22} />
        </div>

        <div className={styles.textContent}>
          <h4 className={styles.title}>Pasang Aplikasi Kasir</h4>
          <p className={styles.description}>Buka kasir &amp; admin layar penuh di Tablet / HP</p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleInstallClick}
            leftIcon={<Download size={14} />}
          >
            Pasang
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            className={styles.closeBtn}
            aria-label="Tutup banner pasang aplikasi"
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* Interactive Step-by-Step Installation Guide Modal */}
      {isGuideOpen && (
        <div className={styles.guideModalBackdrop} onClick={() => setIsGuideOpen(false)}>
          <div className={styles.guideModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: 0 }}>
                Cara Pasang Aplikasi di HP
              </h3>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            {isIOS ? (
              // iOS Safari Instructions
              <div>
                <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)", marginBottom: "1rem" }}>
                  Untuk pengguna <strong>iPhone / iPad (Safari)</strong>:
                </p>
                <div className={styles.guideStepList}>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>1</span>
                    <span>
                      Ketuk tombol <strong>Bagikan / Share</strong> (<Share2 size={15} style={{ display: "inline", verticalAlign: "middle" }} />) di bagian bawah layar Safari.
                    </span>
                  </div>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>2</span>
                    <span>
                      Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home Screen</em>).
                    </span>
                  </div>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>3</span>
                    <span>
                      Ketuk <strong>"Tambah"</strong> di sudut kanan atas. Ikon <strong>AURA POS</strong> akan langsung muncul di layar utama HP Anda!
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Android Chrome Instructions
              <div>
                <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)", marginBottom: "1rem" }}>
                  Untuk pengguna <strong>Android (Chrome)</strong>:
                </p>
                <div className={styles.guideStepList}>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>1</span>
                    <span>
                      Ketuk tombol menu titik tiga (<strong>⋮</strong>) di sudut kanan atas browser Chrome.
                    </span>
                  </div>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>2</span>
                    <span>
                      Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </span>
                  </div>
                  <div className={styles.guideStepItem}>
                    <span className={styles.stepNumber}>3</span>
                    <span>
                      Ketuk <strong>"Instal"</strong>. Aplikasi <strong>AURA POS</strong> akan otomatis terpasang sebagai aplikasi mandiri!
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "0.5rem" }}>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => setIsGuideOpen(false)}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Saya Mengerti
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
