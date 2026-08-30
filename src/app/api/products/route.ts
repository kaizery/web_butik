import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INITIAL_BOUTIQUE_PRODUCTS = [
  {
    title: "Aura Silk Slip Evening Dress",
    slug: "aura-silk-slip-evening-dress",
    categorySlug: "dresses",
    categoryName: "Dresses & Gowns",
    description: "Gaun malam berbahan sutra mulberry premium dengan siluet jatuh yang anggun dan potongan bias-cut yang memeluk tubuh secara elegan.",
    basePrice: 850000,
    material: "100% Mulberry Silk (19 Momme)",
    careInstructions: "Dry clean only atau cuci tangan lembut dengan detergen sutra.",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Champagne Blush", sku: "DRS-SLK-01-S", stock: 12, priceAdjustment: 0 },
      { size: "M", color: "Champagne Blush", sku: "DRS-SLK-01-M", stock: 18, priceAdjustment: 0 },
      { size: "L", color: "Champagne Blush", sku: "DRS-SLK-01-L", stock: 8, priceAdjustment: 0 },
      { size: "M", color: "Midnight Noir", sku: "DRS-SLK-02-M", stock: 15, priceAdjustment: 0 }
    ]
  },
  {
    title: "Atelier Structured Linen Blazer",
    slug: "atelier-structured-linen-blazer",
    categorySlug: "outerwear",
    categoryName: "Outerwear & Blazers",
    description: "Blazer potongan tailored klasik berbahan linen Prancis organik dengan kancing tempurung mutiara dan lining satin lembut.",
    basePrice: 920000,
    material: "French Organic Linen & Acetate Satin Lining",
    careInstructions: "Dry clean direkomendasikan. Setrika uap dengan suhu sedang.",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Warm Alabaster", sku: "BLZ-LIN-01-S", stock: 7, priceAdjustment: 0 },
      { size: "M", color: "Warm Alabaster", sku: "BLZ-LIN-01-M", stock: 14, priceAdjustment: 0 },
      { size: "L", color: "Warm Alabaster", sku: "BLZ-LIN-01-L", stock: 5, priceAdjustment: 0 },
      { size: "M", color: "Olive Muted", sku: "BLZ-LIN-02-M", stock: 9, priceAdjustment: 0 }
    ]
  },
  {
    title: "Ethereal Pleated Satin Midi Skirt",
    slug: "ethereal-pleated-satin-midi-skirt",
    categorySlug: "skirts",
    categoryName: "Skirts & Bottoms",
    description: "Rok midi lipit mikro dengan kilau lembut saat bergerak. Dilengkapi ban pinggang elastis tersembunyi untuk kenyamanan maksimal.",
    basePrice: 590000,
    material: "Heavy Luster Poly-Satin",
    careInstructions: "Cuci tangan dengan air dingin. Jangan diperas dengan mesin.",
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Muted Gold", sku: "SKT-SAT-01-S", stock: 20, priceAdjustment: 0 },
      { size: "M", color: "Muted Gold", sku: "SKT-SAT-01-M", stock: 16, priceAdjustment: 0 },
      { size: "L", color: "Muted Gold", sku: "SKT-SAT-01-L", stock: 10, priceAdjustment: 0 }
    ]
  },
  {
    title: "Organza Sheer Blouse & Cami Set",
    slug: "organza-sheer-blouse-cami-set",
    categorySlug: "tops",
    categoryName: "Tops & Blouses",
    description: "Kemeja organza transparan dengan aksen pita leher romantis dan lengan balon yang dilengkapi tanktop sutra senada.",
    basePrice: 680000,
    material: "Fine Silk Organza + Stretch Rayon Cami",
    careInstructions: "Cuci manual menggunakan air dingin dan setrika uap.",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Ivory Pearl", sku: "TOP-ORG-01-S", stock: 15, priceAdjustment: 0 },
      { size: "M", color: "Ivory Pearl", sku: "TOP-ORG-01-M", stock: 22, priceAdjustment: 0 },
      { size: "L", color: "Ivory Pearl", sku: "TOP-ORG-01-L", stock: 6, priceAdjustment: 0 }
    ]
  },
  {
    title: "Couture Cashmere Knit Vest Set",
    slug: "couture-cashmere-knit-vest-set",
    categorySlug: "sets",
    categoryName: "Couture Sets",
    description: "Set rompi rajut kasmir ultra-lembut dipadukan dengan celana wide-leg rajut yang memberikan siluet modern dan nyaman sepanjang hari.",
    basePrice: 1150000,
    material: "70% Mongolian Cashmere, 30% Fine Merino Wool",
    careInstructions: "Cuci kering atau cuci tangan datar (lay flat to dry).",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Soft Taupe", sku: "SET-CSH-01-S", stock: 8, priceAdjustment: 0 },
      { size: "M", color: "Soft Taupe", sku: "SET-CSH-01-M", stock: 11, priceAdjustment: 0 },
      { size: "L", color: "Soft Taupe", sku: "SET-CSH-01-L", stock: 4, priceAdjustment: 0 }
    ]
  },
  {
    title: "Velvet Corset Silhouette Maxi Dress",
    slug: "velvet-corset-silhouette-maxi-dress",
    categorySlug: "dresses",
    categoryName: "Dresses & Gowns",
    description: "Gaun maxi beludru mewah dengan detail struktur korset klasik dan belahan samping tinggi untuk acara formal butik.",
    basePrice: 1250000,
    material: "Plush Silk-Velvet with Boning Structure",
    careInstructions: "Dry clean khusus kain beludru.",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80"
    ],
    variants: [
      { size: "S", color: "Emerald Forest", sku: "DRS-VLV-01-S", stock: 5, priceAdjustment: 0 },
      { size: "M", color: "Emerald Forest", sku: "DRS-VLV-01-M", stock: 8, priceAdjustment: 0 },
      { size: "L", color: "Emerald Forest", sku: "DRS-VLV-01-L", stock: 3, priceAdjustment: 0 }
    ]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");
    const searchFilter = searchParams.get("search");

    let products = [];

    // Attempt to query products from MySQL via Prisma
    try {
      const count = await prisma.product.count();

      // If database is empty, auto-seed with curated boutique clothes
      if (count === 0) {
        for (const item of INITIAL_BOUTIQUE_PRODUCTS) {
          let category = await prisma.category.findUnique({
            where: { slug: item.categorySlug }
          });

          if (!category) {
            category = await prisma.category.create({
              data: {
                name: item.categoryName,
                slug: item.categorySlug,
                description: `Koleksi busana ${item.categoryName}`
              }
            });
          }

          const createdProduct = await prisma.product.create({
            data: {
              title: item.title,
              slug: item.slug,
              description: item.description,
              basePrice: item.basePrice,
              material: item.material,
              careInstructions: item.careInstructions,
              isFeatured: item.isFeatured,
              categoryId: category.id,
              images: {
                create: item.images.map((url, idx) => ({
                  imageUrl: url,
                  isPrimary: idx === 0,
                  sortOrder: idx
                }))
              },
              variants: {
                create: item.variants.map((v) => ({
                  size: v.size,
                  color: v.color,
                  sku: v.sku,
                  stock: v.stock,
                  priceAdjustment: v.priceAdjustment
                }))
              }
            }
          });
        }
      }

      // Query products with relations from MySQL
      const whereClause: any = { isActive: true };
      if (categoryFilter && categoryFilter !== "all") {
        whereClause.category = { slug: categoryFilter };
      }
      if (searchFilter) {
        whereClause.OR = [
          { title: { contains: searchFilter } },
          { description: { contains: searchFilter } }
        ];
      }

      products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: true,
          images: {
            orderBy: { sortOrder: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } catch (dbError) {
      console.warn("Notice: Prisma query to MySQL unavailable, using fallback collection:", dbError);
      // Format fallback
      products = INITIAL_BOUTIQUE_PRODUCTS.map((p, idx) => ({
        id: idx + 1,
        categoryId: idx + 1,
        title: p.title,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        material: p.material,
        careInstructions: p.careInstructions,
        isFeatured: p.isFeatured,
        isActive: true,
        category: { id: idx + 1, name: p.categoryName, slug: p.categorySlug },
        images: p.images.map((url, imgIdx) => ({
          id: imgIdx + 1,
          productId: idx + 1,
          imageUrl: url,
          isPrimary: imgIdx === 0,
          sortOrder: imgIdx
        })),
        variants: p.variants.map((v, vIdx) => ({
          id: vIdx + 1,
          productId: idx + 1,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          priceAdjustment: v.priceAdjustment
        }))
      }));
    }

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Products GET API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat katalog produk butik." },
      { status: 500 }
    );
  }
}
