/**
 * Variant & SKU Types
 */

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface VariantInventorySummary {
  variantId: string;
  sku: string;
  barcode: string;
  size: string;
  colorName: string;
  availableStock: number;
  reservedStock: number;
}

export type { ProductVariant } from "./product";

