import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      userId,
      proofImageUrl,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang belanja Anda kosong. Silakan pilih busana terlebih dahulu." },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Nama pembeli dan Nomor WhatsApp/HP wajib diisi." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Pilih metode pembayaran (QRIS, TRANSFER_BANK, atau TUNAI)." },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const unitPrice = Number(item.unitPrice);
      totalAmount += unitPrice * Number(item.quantity);
    }

    // Generate unique invoice number: ORD-AURA-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `ORD-AURA-${dateStr}-${randomSuffix}`;

    // Perform database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check and decrement stock for each variant
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: Number(item.variantId) },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`Busana ID ${item.variantId} tidak ditemukan.`);
        }

        if (variant.stock < Number(item.quantity)) {
          throw new Error(
            `Stok untuk "${variant.product.title}" (Ukuran ${variant.size}) tidak mencukupi (Tersisa: ${variant.stock}).`
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

      // Initial Order Status
      const initialStatus =
        paymentMethod === "TUNAI"
          ? "UNPAID"
          : proofImageUrl
          ? "PENDING_VERIFICATION"
          : "PENDING_VERIFICATION";

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          invoiceNumber,
          userId: userId ? Number(userId) : null,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim() || null,
          customerAddress: customerAddress?.trim() || "Ambil di Butik (Store Pickup)",
          orderType: "ONLINE",
          totalAmount,
          notes: notes?.trim() || null,
          status: initialStatus,
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
          method: paymentMethod,
          amount: totalAmount,
          proofImageUrl: proofImageUrl || null,
          status: "PENDING",
          paidAt: proofImageUrl ? new Date() : null,
        },
      });

      // 4. Log Activity in MySQL
      try {
        await tx.activityLog.create({
          data: {
            userId: userId ? Number(userId) : null,
            action: "ONLINE_ORDER_PLACED",
            entityType: "ORDER",
            entityId: newOrder.id,
            entityName: invoiceNumber,
            details: `Pesanan online ${invoiceNumber} senilai Rp ${totalAmount.toLocaleString("id-ID")} dibuat oleh ${customerName} (${paymentMethod}).`,
          },
        });
      } catch (logErr) {
        console.warn("Log activity error:", logErr);
      }

      return { order: newOrder, payment: newPayment };
    });

    return NextResponse.json({
      success: true,
      message: "Pesanan online Anda berhasil dibuat!",
      invoiceNumber: result.order.invoiceNumber,
      orderId: result.order.id,
      totalAmount,
      status: result.order.status,
      paymentMethod,
    });
  } catch (error: any) {
    console.error("Online checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses pesanan." },
      { status: 500 }
    );
  }
}
