import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Memulai seeding database butik di TiDB Cloud...");

  // 1. Seed Super Admin
  const adminEmail = "admin@butik.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("adminaura2026", salt);

    await prisma.user.create({
      data: {
        name: "Super Admin AURA",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        phone: "081299998888",
      },
    });
    console.log("✅ Super Admin berhasil dibuat (admin@butik.com)");
  }

  // 2. Seed Default Cashier
  const cashierEmail = "kasir@butik.com";
  const existingCashier = await prisma.user.findUnique({
    where: { email: cashierEmail },
  });

  if (!existingCashier) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("kasiraura2026", salt);

    await prisma.user.create({
      data: {
        name: "Siti Rahma (Kasir Utama)",
        email: cashierEmail,
        passwordHash,
        role: "CASHIER",
        phone: "081233445566",
      },
    });
    console.log("✅ Akun Kasir berhasil dibuat (kasir@butik.com)");
  }

  // 3. Seed Categories
  const categoriesData = [
    { name: "Dresses & Gowns", slug: "dresses", description: "Gaun malam dan dress atelier sutra eksklusif" },
    { name: "Tops & Blouses", slug: "tops", description: "Blus sutra dan kemeja linen premium" },
    { name: "Outerwear & Blazers", slug: "outerwear", description: "Mantel wol kasmir dan blazer tailored modern" },
    { name: "Accessories", slug: "accessories", description: "Syal sutra dan aksesori atelier elegan" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Kategori busana berhasil dibuat");

  // 4. Seed Products
  const dressesCategory = await prisma.category.findUnique({ where: { slug: "dresses" } });
  const topsCategory = await prisma.category.findUnique({ where: { slug: "tops" } });
  const outerCategory = await prisma.category.findUnique({ where: { slug: "outerwear" } });

  const productsData = [
    {
      title: "L'Aura Silk Drape Gown",
      slug: "laura-silk-drape-gown",
      description: "Gaun sutra murni mulberry 100% dengan potongan draping asimetris elegan untuk malam pesta formal.",
      basePrice: 1850000,
      material: "100% Pure Mulberry Silk (22 Momme)",
      careInstructions: "Dry clean only. Setrika uap suhu rendah.",
      isFeatured: true,
      categoryId: dressesCategory!.id,
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "S", color: "Champagne Gold", sku: "AURA-DR-001-S", stock: 12 },
        { size: "M", color: "Champagne Gold", sku: "AURA-DR-001-M", stock: 15 },
        { size: "L", color: "Champagne Gold", sku: "AURA-DR-001-L", stock: 8 },
      ],
    },
    {
      title: "Sovereign Tailored Wool Blazer",
      slug: "sovereign-tailored-wool-blazer",
      description: "Blazer wol kasmir dengan potongan terstruktur yang tegas nan mewah untuk tampilan eksekutif berkelas.",
      basePrice: 2450000,
      material: "Wool-Cashmere Blend & Italian Horn Buttons",
      careInstructions: "Dry clean specialist only.",
      isFeatured: true,
      categoryId: outerCategory!.id,
      imageUrl: "https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "S", color: "Noir Obsidian", sku: "AURA-BL-002-S", stock: 10 },
        { size: "M", color: "Noir Obsidian", sku: "AURA-BL-002-M", stock: 14 },
        { size: "L", color: "Noir Obsidian", sku: "AURA-BL-002-L", stock: 6 },
      ],
    },
    {
      title: "Ethereal Pleated Chiffon Dress",
      slug: "ethereal-pleated-chiffon-dress",
      description: "Dress sifon lipit halus dengan aksen pinggang satin dan siluet flowy yang mempesona.",
      basePrice: 1650000,
      material: "Silk Chiffon with French Satin Trim",
      careInstructions: "Cuci tangan lembut / Dry clean.",
      isFeatured: false,
      categoryId: dressesCategory!.id,
      imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "S", color: "Blush Rose", sku: "AURA-DR-003-S", stock: 14 },
        { size: "M", color: "Blush Rose", sku: "AURA-DR-003-M", stock: 18 },
        { size: "L", color: "Blush Rose", sku: "AURA-DR-003-L", stock: 9 },
      ],
    },
    {
      title: "Atelier Organza French Blouse",
      slug: "atelier-organza-french-blouse",
      description: "Blus organza sutra transparan lembut dengan detail kancing mutiara alami dan kerah pita klasik.",
      basePrice: 1250000,
      material: "Silk Organza & Mother of Pearl Buttons",
      careInstructions: "Dry clean only.",
      isFeatured: false,
      categoryId: topsCategory!.id,
      imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "S", color: "Pearl Ivory", sku: "AURA-TP-004-S", stock: 15 },
        { size: "M", color: "Pearl Ivory", sku: "AURA-TP-004-M", stock: 20 },
        { size: "L", color: "Pearl Ivory", sku: "AURA-TP-004-L", stock: 10 },
      ],
    },
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          description: prod.description,
          basePrice: prod.basePrice,
          material: prod.material,
          careInstructions: prod.careInstructions,
          isFeatured: prod.isFeatured,
          categoryId: prod.categoryId,
          images: {
            create: [{ imageUrl: prod.imageUrl, isPrimary: true, sortOrder: 0 }],
          },
          variants: {
            create: prod.variants.map((v) => ({
              size: v.size,
              color: v.color,
              sku: v.sku,
              stock: v.stock,
            })),
          },
        },
      });
      console.log(`✅ Produk "${prod.title}" berhasil di-seed`);
    }
  }

  console.log("🌸 Seeding database TiDB Cloud selesai dengan sempurna!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
