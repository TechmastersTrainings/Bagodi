/**
 * Inventory Operation & Barcode Validation Schemas Test Suite
 */

import {
  stockAdjustmentSchema,
  barcodeScanSchema,
  reconciliationAuditSchema,
  purchaseOrderCreateSchema,
} from "../inventory.schema";

describe("Inventory Validation Schemas", () => {
  describe("stockAdjustmentSchema", () => {
    it("should accept valid stock receipt operation", () => {
      const res = stockAdjustmentSchema.safeParse({
        variantId: "var_100",
        operationType: "STOCK_RECEIPT",
        quantityChange: 20,
        reason: "Supplier batch delivery PO-4091",
        referenceDocument: "PO-4091",
      });
      expect(res.success).toBe(true);
    });

    it("should reject zero quantity change", () => {
      const res = stockAdjustmentSchema.safeParse({
        variantId: "var_100",
        operationType: "STOCK_ADJUSTMENT",
        quantityChange: 0,
        reason: "Test adjustment",
      });
      expect(res.success).toBe(false);
    });

    it("should reject operation without mandatory audit reason", () => {
      const res = stockAdjustmentSchema.safeParse({
        variantId: "var_100",
        operationType: "DAMAGE_WRITE_OFF",
        quantityChange: -2,
        reason: "", // Empty reason not allowed
      });
      expect(res.success).toBe(false);
    });
  });

  describe("barcodeScanSchema", () => {
    it("should accept valid numeric or alphanumeric barcode", () => {
      const res1 = barcodeScanSchema.safeParse({ barcode: "8901234567890" });
      expect(res1.success).toBe(true);

      const res2 = barcodeScanSchema.safeParse({ barcode: "BGD-BDR-109" });
      expect(res2.success).toBe(true);
    });

    it("should reject barcodes shorter than 4 characters", () => {
      const res = barcodeScanSchema.safeParse({ barcode: "123" });
      expect(res.success).toBe(false);
    });
  });

  describe("reconciliationAuditSchema", () => {
    it("should reject negative counted quantities", () => {
      const res = reconciliationAuditSchema.safeParse({
        inventoryId: "inv_1",
        countedQuantity: -5,
        reason: "Shrinkage",
      });
      expect(res.success).toBe(false);
    });

    it("should accept valid count with reason", () => {
      const res = reconciliationAuditSchema.safeParse({
        inventoryId: "inv_1",
        countedQuantity: 12,
        reason: "Annual audit count",
      });
      expect(res.success).toBe(true);
    });
  });
});

