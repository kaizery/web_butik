import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal harus terdiri dari 6 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : null;

    // Check if user with same email already exists in MySQL
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda." },
          { status: 409 }
        );
      }
    } catch (dbError: unknown) {
      console.error("Database connection error on register:", dbError);
      return NextResponse.json(
        {
          error:
            "Tidak dapat terhubung ke database MySQL. Pastikan server database aktif di localhost:3306.",
        },
        { status: 503 }
      );
    }

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in MySQL database with role CUSTOMER
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        phone: cleanPhone,
        role: "CUSTOMER",
      },
    });

    // Record activity log in MySQL
    try {
      await prisma.activityLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTER",
          entityName: "User",
          entityId: newUser.id,
          details: JSON.stringify({
            role: newUser.role,
            registeredAt: new Date().toISOString(),
          }),
        },
      });
    } catch (logError) {
      console.warn("Gagal mencatat register activity log:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran akun berhasil! Silakan masuk dengan akun baru Anda.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API route error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server saat mendaftarkan akun." },
      { status: 500 }
    );
  }
}
