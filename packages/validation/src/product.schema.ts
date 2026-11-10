/**
 * Product, Variant, Category & Brand Validation Schemas
 */

import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Please provide a detailed garment description"),
  details: z.string().optional(),
  fabricDetails: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  brandId: z.string().min(1, "Please select a brand"),
  basePrice: z.number().min(0, "Base price must be greater than or equal to 0"),
  returnEligible: z.boolean().default(true),
  exchangeEligible: z.boolean().default(true),
  returnWindowDays: z.number().int().min(0).max(30).default(7),
});

export const variantCreateSchema = z.object({
  productId: z.string().min(1, "Product reference is required"),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .regex(/^[A-Z0-9-_]+$/, "SKU must contain uppercase letters, numbers, hyphens, or underscores"),
  barcode: z
    .string()
    .min(4, "Barcode must be at least 4 characters")
    .trim(),
  size: z.string().min(1, "Size is required (e.g. S, M, L, XL, 32, 34)"),
  colorName: z.string().min(2, "Color name is required (e.g. Royal Navy, Crimson)"),
  colorHex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color code (e.g. #1A365D)")
    .optional(),
  mrp: z.number().min(1, "MRP must be greater than 0"),
  sellingPrice: z.number().min(1, "Selling price must be greater than 0"),
  initialStock: z.number().int().min(0).default(0),
}).refine((data) => data.sellingPrice <= data.mrp, {
  message: "Selling price cannot exceed MRP",
  path: ["sellingPrice"],
});

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z
    .string()
    .min(2, "Category slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const brandCreateSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
  slug: z
    .string()
    .min(2, "Brand slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ProductCreateFormData = z.input<typeof productCreateSchema>;
export type VariantCreateFormData = z.input<typeof variantCreateSchema>;
export type CategoryCreateFormData = z.infer<typeof categoryCreateSchema>;
export type BrandCreateFormData = z.infer<typeof brandCreateSchema>;

