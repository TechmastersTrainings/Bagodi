/**
 * Inventory Adjustment, Reconciliation and Barcode Operation Validation Schemas
 */

import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  inventoryId: z.string().optional(),
  variantId: z.string().min(1, "Variant ID is required"),
  storeId: z.string().optional(),
  operationType: z.enum([
    "STOCK_IN",
    "STOCK_OUT",
    "STOCK_ADJUSTMENT",
    "STOCK_RECEIPT",
    "DAMAGE_WRITE_OFF",
    "RETURN_INSPECTION_RESTOCK",
    "STORE_TRANSFER",
  ]),
  quantityChange: z
    .number()
    .int("Quantity must be a whole number")
    .refine((val) => val !== 0, "Quantity cannot be zero"),
  reason: z.string().min(3, "Audit reason is required for inventory movements"),
  referenceDocument: z.string().optional(),
  notes: z.string().optional(),
});

export const barcodeScanSchema = z.object({
  barcode: z
    .string()
    .min(4, "Barcode must be at least 4 characters")
    .trim(),
});

export const reconciliationAuditSchema = z.object({
  inventoryId: z.string().min(1, "Inventory record required"),
  countedQuantity: z.number().int().min(0, "Physical count cannot be negative"),
  reason: z.string().min(3, "Variance justification required"),
});

export const purchaseOrderCreateSchema = z.object({
  supplierName: z.string().min(2, "Supplier name is required"),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string().min(1, "Variant required"),
      orderedQuantity: z.number().int().min(1, "Quantity must be at least 1"),
      unitCost: z.number().min(0, "Cost cannot be negative"),
    })
  ).min(1, "At least one item must be added to purchase order"),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type BarcodeScanFormData = z.infer<typeof barcodeScanSchema>;
export type ReconciliationAuditFormData = z.infer<typeof reconciliationAuditSchema>;
export type PurchaseOrderCreateFormData = z.infer<typeof purchaseOrderCreateSchema>;
