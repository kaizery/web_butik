import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { variantId, stockChange, newStock, staffId, reason } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "ID Varian busana wajib disertakan." },
        { status: 400 }
      );
    }

    const currentVariant = await prisma.productVariant.findUnique({
      where: { id: Number(variantId) },
      include: { product: true },
    });

    if (!currentVariant) {
      return NextResponse.json(
        { error: "Varian busana tidak ditemukan." },
        { status: 404 }
      );
    }

    let finalStock = currentVariant.stock;
    if (newStock !== undefined) {
      finalStock = Math.max(0, Number(newStock));
    } else if (stockChange !== undefined) {
      finalStock = Math.max(0, currentVariant.stock + Number(stockChange));
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { stock: finalStock },
    });

    // Record Activity Log in MySQL
    try {
      await prisma.activityLog.create({
        data: {
          userId: staffId ? Number(staffId) : null,
          action: "STOCK_ADJUSTMENT",
          entityName: "ProductVariant",
          entityId: updatedVariant.id,
          details: JSON.stringify({
            product: currentVariant.product.title,
            size: currentVariant.size,
            oldStock: currentVariant.stock,
            newStock: finalStock,
            reason: reason || "Penyesuaian stok kasir / restock butik",
          }),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Stok ukuran ${updatedVariant.size} berhasil diubah menjadi ${finalStock} pcs.`,
      variant: updatedVariant,
    });
  } catch (error: any) {
    console.error("Stock adjustment API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyesuaikan stok busana." },
      { status: 500 }
    );
  }
}
