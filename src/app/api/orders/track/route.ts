import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get("invoice")?.trim();
    const phone = searchParams.get("phone")?.trim();

    if (!invoice && !phone) {
      return NextResponse.json(
        { error: "Masukkan Nomor Invoice (Contoh: ORD-AURA-...) atau Nomor WhatsApp Anda." },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (invoice) {
      whereClause.invoiceNumber = { equals: invoice };
    } else if (phone) {
      whereClause.customerPhone = { contains: phone };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan. Periksa kembali Nomor Invoice atau Nomor WhatsApp Anda." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Order Track API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mencari status pesanan." },
      { status: 500 }
    );
  }
}
