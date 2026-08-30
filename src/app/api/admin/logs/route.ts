import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const logs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error("Activity Logs API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat activity logs." },
      { status: 500 }
    );
  }
}
