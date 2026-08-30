import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Mengambil daftar seluruh staf & kasir butik
export async function GET() {
  try {
    const staffList = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "CASHIER"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      staff: staffList,
    });
  } catch (error: any) {
    console.error("Get Staff API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar akun staf." },
      { status: 500 }
    );
  }
}

// POST: Membuat akun Staf / Kasir baru dengan password terenkripsi bcrypt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    const assignedRole = role === "ADMIN" ? "ADMIN" : "CASHIER";
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Gunakan email lain." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStaff = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Akun ${assignedRole === "ADMIN" ? "Admin" : "Kasir"} atas nama ${newStaff.name} berhasil dibuat!`,
        staff: newStaff,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Staff API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat akun staf." },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus akun Staf / Kasir dari MySQL
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("id");
    const adminId = searchParams.get("adminId");

    if (!staffId) {
      return NextResponse.json(
        { error: "ID akun staf/kasir wajib disertakan." },
        { status: 400 }
      );
    }

    const targetId = Number(staffId);

    // Mencegah admin menghapus akunnya sendiri yang sedang aktif digunakan
    if (adminId && Number(adminId) === targetId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Akun karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hapus akun dari database MySQL
    await prisma.user.delete({
      where: { id: targetId },
    });

    // Catat log aktivitas penghapusan
    try {
      await prisma.activityLog.create({
        data: {
          userId: adminId ? Number(adminId) : null,
          action: "STAFF_DELETED",
          entityName: "User",
          entityId: targetId,
          details: JSON.stringify({
            deletedName: targetUser.name,
            deletedEmail: targetUser.email,
            deletedRole: targetUser.role,
          }),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.name} (${targetUser.role}) berhasil dihapus dari sistem.`,
    });
  } catch (error: any) {
    console.error("Delete Staff API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus akun staf." },
      { status: 500 }
    );
  }
}
