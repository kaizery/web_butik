import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch all completed orders
    const allOrders = await prisma.order.findMany({
      include: {
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalRevenue = 0;
    let cashRevenue = 0;
    let qrisRevenue = 0;
    let transferRevenue = 0;
    let inStoreOrdersCount = 0;
    let onlineOrdersCount = 0;

    const productSalesMap: { [key: string]: { title: string; count: number; revenue: number } } = {};

    for (const order of allOrders) {
      const amount = Number(order.totalAmount);

      if (order.status === "COMPLETED" || order.status === "SHIPPED" || order.status === "PROCESSING") {
        totalRevenue += amount;

        const method = order.payment?.method || "TUNAI";
        if (method === "TUNAI") cashRevenue += amount;
        else if (method === "QRIS") qrisRevenue += amount;
        else transferRevenue += amount;
      }

      if (order.orderType === "IN_STORE") inStoreOrdersCount++;
      else onlineOrdersCount++;

      // Aggregate product sales
      for (const item of order.items) {
        const prodTitle = item.variant?.product?.title || "Busana Butik";
        if (!productSalesMap[prodTitle]) {
          productSalesMap[prodTitle] = { title: prodTitle, count: 0, revenue: 0 };
        }
        productSalesMap[prodTitle].count += item.quantity;
        productSalesMap[prodTitle].revenue += Number(item.subtotal);
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Count total staff & customers
    const totalStaff = await prisma.user.count({
      where: { role: { in: ["ADMIN", "CASHIER"] } },
    });
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    return NextResponse.json({
      success: true,
      report: {
        totalRevenue,
        cashRevenue,
        qrisRevenue,
        transferRevenue,
        totalOrders: allOrders.length,
        inStoreOrdersCount,
        onlineOrdersCount,
        topSellingProducts,
        totalStaff,
        totalCustomers,
      },
    });
  } catch (error: any) {
    console.error("Admin Reports API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat rekap laporan penjualan." },
      { status: 500 }
    );
  }
}
