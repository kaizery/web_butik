"use client";

import React from "react";
import styles from "./receiptModal.module.css";
import { Printer, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface ReceiptItem {
  title: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ReceiptData {
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  cashierName: string;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export function ReceiptModal({
  receipt,
  isOpen,
  onClose,
  onNewTransaction,
}: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div id="printable-receipt" className={styles.receiptCard} onClick={(e) => e.stopPropagation()}>
        {/* Receipt Header */}
        <div className={styles.receiptHeader}>
          <h2 className={styles.brandTitle}>AURA</h2>
          <span className={styles.brandSubtitle}>Boutique & Atelier</span>
          <div className={styles.invoiceInfo}>
            <span>No: <strong>{receipt.invoiceNumber}</strong></span>
            <span>Waktu: {new Date(receipt.createdAt).toLocaleString("id-ID")}</span>
            <span>Kasir: {receipt.cashierName}</span>
            <span>Pelanggan: {receipt.customerName}</span>
          </div>
        </div>

        {/* Items List */}
        <div className={styles.itemsTable}>
          {receipt.items.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
              <div className={styles.itemLeft}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemMeta}>
                  {item.size} • {item.color} (x{item.quantity} @ {formatRupiah(item.unitPrice)})
                </span>
              </div>
              <span style={{ fontWeight: 600 }}>{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Payment Breakdown */}
        <div className={styles.paymentBreakdown}>
          <div className={styles.breakdownRow}>
            <span>Metode Bayar</span>
            <strong>{receipt.paymentMethod}</strong>
          </div>
          <div className={`${styles.breakdownRow} ${styles.totalHighlight}`}>
            <span>Total Tagihan</span>
            <span>{formatRupiah(receipt.totalAmount)}</span>
          </div>
          {receipt.paymentMethod === "TUNAI" && (
            <>
              <div className={styles.breakdownRow}>
                <span>Uang Tunai Diterima</span>
                <span>{formatRupiah(receipt.amountPaid)}</span>
              </div>
              <div className={styles.breakdownRow} style={{ color: "#2e7d32", fontWeight: 600 }}>
                <span>Uang Kembalian</span>
                <span>{formatRupiah(receipt.changeAmount)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.receiptFooter}>
          <p>Terima kasih telah berbelanja di Aura Boutique.</p>
          <p>Barang yang sudah dibeli dapat ditukar ukuran dalam 7 hari dengan menyertakan struk ini.</p>
        </div>

        {/* Actions */}
        <div className={styles.actionButtons}>
          <Button
            variant="secondary"
            fullWidth
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer size={16} />}
          >
            Cetak Struk
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="md"
            onClick={onNewTransaction}
            leftIcon={<RotateCcw size={16} />}
          >
            Transaksi Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
