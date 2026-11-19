/**
 * Product & Variant Validation Schemas Test Suite
 */

import {
  productCreateSchema,
  variantCreateSchema,
  categoryCreateSchema,
  brandCreateSchema,
} from "../product.schema";

describe("Product & Variant Validation Schemas", () => {
  describe("productCreateSchema", () => {
    it("should accept valid product payload", () => {
      const res = productCreateSchema.safeParse({
        name: "Festive Embroidered Kurta",
        slug: "festive-embroidered-kurta",
        description: "Intricately hand-woven silk festive kurta with zari work.",
        categoryId: "cat_festive",
        brandId: "brd_bagodi",
        basePrice: 2999,
        returnEligible: true,
        exchangeEligible: true,
        returnWindowDays: 7,
      });
      expect(res.success).toBe(true);
    });

    it("should reject invalid slug containing uppercase or special characters", () => {
      const res = productCreateSchema.safeParse({
        name: "Kurta",
        slug: "Festive_Kurta!",
        description: "Description test.",
        categoryId: "cat_1",
        brandId: "brd_1",
        basePrice: 1000,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("variantCreateSchema", () => {
    it("should accept valid variant with sellingPrice <= MRP", () => {
      const res = variantCreateSchema.safeParse({
        productId: "prd_100",
        sku: "BGD-KURTA-SLK-M",
        barcode: "8901234567890",
        size: "M",
        colorName: "Midnight Navy",
        colorHex: "#1B2A4A",
        mrp: 3499,
        sellingPrice: 2999,
        initialStock: 15,
      });
      expect(res.success).toBe(true);
    });

    it("should reject variant where sellingPrice exceeds MRP", () => {
      const res = variantCreateSchema.safeParse({
        productId: "prd_100",
        sku: "BGD-KURTA-SLK-M",
        barcode: "8901234567890",
        size: "M",
        colorName: "Navy",
        mrp: 2000,
        sellingPrice: 2500, // Invalid: selling price > MRP
        initialStock: 10,
      });
      expect(res.success).toBe(false);
    });

    it("should reject empty barcode or SKU", () => {
      const res = variantCreateSchema.safeParse({
        productId: "prd_100",
        sku: "",
        barcode: "",
        size: "L",
        colorName: "Ivory",
        mrp: 1000,
        sellingPrice: 900,
      });
      expect(res.success).toBe(false);
    });
  });
});

