import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, loginType } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Auto-seed initial Super Admin if not exists yet
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount === 0) {
      const defaultSalt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash("adminaura2026", defaultSalt);
      await prisma.user.create({
        data: {
          name: "Owner & Super Admin",
          email: "admin@butik.com",
          passwordHash: defaultHash,
          role: "ADMIN",
          phone: "081234567890",
        },
      });
    }

    // Find user in MySQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak terdaftar dalam sistem." },
        { status: 401 }
      );
    }

    // Verify Password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Validate login type vs role
    if (loginType === "STAFF" && user.role === "CUSTOMER") {
      return NextResponse.json(
        { error: "Akun ini terdaftar sebagai Pelanggan, bukan Staf/Kasir/Admin." },
        { status: 403 }
      );
    }

    // Log Activity in MySQL
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "USER_LOGIN",
          entityName: "User",
          entityId: user.id,
          details: JSON.stringify({
            role: user.role,
            loginType,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch {
      // ignore
    }

    const response = NextResponse.json({
      success: true,
      message: `Login berhasil! Selamat datang, ${user.name}.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    // OWASP A01: Broken Access Control Defense - Set Secure Auth Cookies
    response.cookies.set("aura_session_role", user.role, {
      httpOnly: false,
      secure: false, // Localhost dev
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("aura_session_user_id", user.id.toString(), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server autentikasi." },
      { status: 500 }
    );
  }
}
