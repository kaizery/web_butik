import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, amountPaid, customerName, customerPhone, notes, cashierId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang kasir kosong. Pilih minimal satu busana." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Pilih metode pembayaran (TUNAI, QRIS, atau TRANSFER_BANK)." },
        { status: 400 }
      );
    }

    // Calculate total order amount
    let totalAmount = 0;
    for (const item of items) {
      const unitPrice = Number(item.unitPrice);
      totalAmount += unitPrice * Number(item.quantity);
    }

    const cleanCustomerName = customerName?.trim() || "Pelanggan Walk-In";
    const cleanCustomerPhone = customerPhone?.trim() || "-";

    // Generate unique invoice number: POS-AURA-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `POS-AURA-${dateStr}-${randomSuffix}`;

    // Perform database transaction: Create Order, Items, Payment, and Decrement Stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check and decrement stock for each variant
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: Number(item.variantId) },
        });

        if (!variant) {
          throw new Error(`Varian busana ID ${item.variantId} tidak ditemukan.`);
        }

        if (variant.stock < Number(item.quantity)) {
          throw new Error(
            `Stok untuk ukuran ${variant.size} tidak mencukupi (Tersisa: ${variant.stock}).`
          );
        }

        // Decrement stock in MySQL
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: variant.stock - Number(item.quantity),
          },
        });
      }

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          invoiceNumber,
          customerName: cleanCustomerName,
          customerPhone: cleanCustomerPhone,
          orderType: "IN_STORE",
          totalAmount,
          notes: notes || "Transaksi Kasir Butik Langsung",
          status: "COMPLETED",
          items: {
            create: items.map((item: any) => ({
              variantId: Number(item.variantId),
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              subtotal: Number(item.unitPrice) * Number(item.quantity),
            })),
          },
        },
      });

      // 3. Create Payment record
      const newPayment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod, // QRIS, TRANSFER_BANK, or TUNAI
          amount: totalAmount,
          status: "VERIFIED",
          paidAt: new Date(),
          verifiedAt: new Date(),
          verifiedById: cashierId ? Number(cashierId) : null,
        },
      });

      // 4. Log Activity in MySQL
      try {
        await tx.activityLog.create({
          data: {
            userId: cashierId ? Number(cashierId) : null,
            orderId: newOrder.id,
            action: "POS_CHECKOUT",
            entityName: "Order",
            entityId: newOrder.id,
            details: JSON.stringify({
              invoice: invoiceNumber,
              method: paymentMethod,
              total: totalAmount,
              amountPaid: amountPaid ? Number(amountPaid) : totalAmount,
            }),
          },
        });
      } catch {
        // ignore log fail
      }

      return { newOrder, newPayment };
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi kasir berhasil dicatat!",
      invoiceNumber,
      order: result.newOrder,
      totalAmount,
      amountPaid: amountPaid ? Number(amountPaid) : totalAmount,
      changeAmount: amountPaid ? Math.max(0, Number(amountPaid) - totalAmount) : 0,
      paymentMethod,
    });
  } catch (error: any) {
    console.error("POS Checkout API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses transaksi kasir." },
      { status: 400 }
    );
  }
}
