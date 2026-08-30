export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceAdjustment: number;
  imageUrl?: string | null;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Product {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  material?: string | null;
  careInstructions?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  category?: Category;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface CartItem {
  id: string; // unique key combining variantId + timestamp
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}
