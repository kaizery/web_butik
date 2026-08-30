import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const orderTypeFilter = searchParams.get("type");

    const whereClause: any = {};
    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }
    if (orderTypeFilter && orderTypeFilter !== "ALL") {
      whereClause.orderType = orderTypeFilter;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Admin Orders GET API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar pesanan butik." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, trackingNumber, staffId, rejectionNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID Pesanan wajib disertakan." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (orderStatus) updateData.status = orderStatus;
    if (trackingNumber) {
      updateData.notes = `No. Resi Pengiriman: ${trackingNumber}`;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: updateData,
      include: { payment: true },
    });

    // Update payment record if payment status is provided
    if (paymentStatus && updatedOrder.payment) {
      await prisma.payment.update({
        where: { id: updatedOrder.payment.id },
        data: {
          status: paymentStatus,
          verifiedById: staffId ? Number(staffId) : null,
          verifiedAt: new Date(),
          rejectionNotes: rejectionNotes || null,
        },
      });
    }

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: staffId ? Number(staffId) : null,
          orderId: Number(orderId),
          action: "ORDER_STATUS_UPDATE",
          entityName: "Order",
          entityId: Number(orderId),
          details: JSON.stringify({
            orderStatus,
            paymentStatus,
            trackingNumber,
          }),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: "Status pesanan berhasil diperbarui.",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Admin Orders PATCH API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui status pesanan." },
      { status: 500 }
    );
  }
}
