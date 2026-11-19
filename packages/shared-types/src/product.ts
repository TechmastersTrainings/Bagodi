/**
 * Product, Category, Brand and Variant Types
 * Matching FastAPI /api/v1/catalogue and /api/v1/products OpenAPI Specifications
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  size: string;
  colorName: string;
  colorHex?: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage?: number;
  availableStock: number;
  reservedStock: number;
  isActive: boolean;
  images?: string[];
}

export interface SizeChartMeasurement {
  size: string;
  chestInches: number;
  waistInches: number;
  lengthInches: number;
  shoulderInches: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string;
  fabricDetails?: string;
  careInstructions?: string;
  category: Category;
  brand: Brand;
  basePrice: number;
  currency: string;
  isActive: boolean;
  isArchived: boolean;
  isFeatured?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  sizeChart?: SizeChartMeasurement[];
  returnEligible: boolean;
  exchangeEligible: boolean;
  returnWindowDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStockOnly?: boolean;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  pageSize?: number;
}

export interface ProductCreatePayload {
  name: string;
  slug: string;
  description: string;
  details?: string;
  fabricDetails?: string;
  careInstructions?: string;
  categoryId: string;
  brandId: string;
  basePrice: number;
  returnEligible: boolean;
  exchangeEligible: boolean;
  returnWindowDays?: number;
  images?: Array<{ url: string; isPrimary: boolean; displayOrder: number }>;
}

export interface VariantCreatePayload {
  productId: string;
  sku: string;
  barcode: string;
  size: string;
  colorName: string;
  colorHex?: string;
  mrp: number;
  sellingPrice: number;
  initialStock?: number;
}

