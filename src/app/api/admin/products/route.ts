import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: Tambah busana baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      categorySlug,
      categoryName,
      description,
      basePrice,
      material,
      careInstructions,
      imageUrl,
      variants, // Array of { size, color, sku, stock }
    } = body;

    if (!title || !basePrice || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: "Nama busana, harga dasar, dan minimal satu varian ukuran wajib diisi." },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;

    let category = await prisma.category.findUnique({
      where: { slug: categorySlug || "dresses" },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName || "Boutique Collection",
          slug: categorySlug || "dresses",
        },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        categoryId: category.id,
        title: title.trim(),
        slug,
        description: description?.trim() || "Busana butik eksklusif.",
        basePrice: Number(basePrice),
        material: material?.trim() || "Premium Fabric",
        careInstructions: careInstructions?.trim() || "Dry clean only.",
        isFeatured: false,
        isActive: true,
        images: {
          create: [
            {
              imageUrl:
                imageUrl?.trim() ||
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        variants: {
          create: variants.map((v: any) => ({
            size: v.size || "M",
            color: v.color || "Standard",
            sku: v.sku || `SKU-${Date.now().toString().slice(-6)}-${v.size}`,
            stock: Math.max(0, Number(v.stock) || 0),
            priceAdjustment: Number(v.priceAdjustment) || 0,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Busana baru berhasil ditambahkan ke katalog & stok butik!",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add Product API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan produk baru." },
      { status: 500 }
    );
  }
}

// PUT: Perbarui Detail Busana & Rincian Stok Varian
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, title, basePrice, material, careInstructions, variants, staffId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "ID Busana wajib disertakan." },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update general product info
      const prod = await tx.product.update({
        where: { id: Number(productId) },
        data: {
          title: title ? title.trim() : undefined,
          basePrice: basePrice ? Number(basePrice) : undefined,
          material: material ? material.trim() : undefined,
          careInstructions: careInstructions ? careInstructions.trim() : undefined,
        },
      });

      // 2. Update stock and details for each variant
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: Number(v.id) },
              data: {
                stock: Math.max(0, Number(v.stock)),
                color: v.color || undefined,
                sku: v.sku || undefined,
              },
            });
          }
        }
      }

      // 3. Log Activity in MySQL
      try {
        await tx.activityLog.create({
          data: {
            userId: staffId ? Number(staffId) : null,
            action: "PRODUCT_STOCK_UPDATED",
            entityName: "Product",
            entityId: Number(productId),
            details: JSON.stringify({
              title: prod.title,
              variantsUpdated: variants?.length || 0,
            }),
          },
        });
      } catch {
        // ignore
      }

      return prod;
    });

    return NextResponse.json({
      success: true,
      message: `Detail & stok untuk ${updatedProduct.title} berhasil diperbarui!`,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Update Product API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui detail stok busana." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Busana & Seluruh Stok Variannya
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    const staffId = searchParams.get("staffId");

    if (!productId) {
      return NextResponse.json(
        { error: "ID Busana wajib disertakan." },
        { status: 400 }
      );
    }

    const prodId = Number(productId);

    const product = await prisma.product.findUnique({
      where: { id: prodId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Busana tidak ditemukan." },
        { status: 404 }
      );
    }

    // Delete product, variants, and images in cascade transaction
    await prisma.$transaction(async (tx) => {
      // Delete images
      await tx.productImage.deleteMany({
        where: { productId: prodId },
      });

      // Delete variants
      await tx.productVariant.deleteMany({
        where: { productId: prodId },
      });

      // Delete product
      await tx.product.delete({
        where: { id: prodId },
      });

      // Log activity
      try {
        await tx.activityLog.create({
          data: {
            userId: staffId ? Number(staffId) : null,
            action: "PRODUCT_DELETED",
            entityName: "Product",
            entityId: prodId,
            details: JSON.stringify({
              deletedTitle: product.title,
              variantsCount: product.variants.length,
            }),
          },
        });
      } catch {
        // ignore
      }
    });

    return NextResponse.json({
      success: true,
      message: `Busana "${product.title}" beserta seluruh varian stoknya berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Delete Product API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus busana dari stok." },
      { status: 500 }
    );
  }
}
