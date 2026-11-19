/**
 * Inventory Management & Barcode Workflows Types
 * Matching FastAPI /api/v1/inventory OpenAPI Specifications
 */

import { ProductVariant } from "./variant";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variant: ProductVariant;
  sku: string;
  barcode: string;
  storeId: string;
  storeName: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  damagedQuantity?: number;
  reorderLevel: number;
  stockStatus: StockStatus;
  updatedAt: string;
}

export type InventoryOperationType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "STOCK_ADJUSTMENT"
  | "STOCK_RECEIPT"
  | "DAMAGE_WRITE_OFF"
  | "RETURN_INSPECTION_RESTOCK"
  | "STORE_TRANSFER";

export interface InventoryAdjustmentPayload {
  inventoryId?: string;
  variantId: string;
  storeId?: string;
  operationType: InventoryOperationType;
  quantityChange: number;
  reason: string;
  referenceDocument?: string;
  notes?: string;
}

export interface BarcodeLookupResult {
  found: boolean;
  inventory?: InventoryItem;
  variant?: ProductVariant;
  productName?: string;
  message?: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  inventoryId: string;
  productName: string;
  sku: string;
  barcode: string;
  operationType: InventoryOperationType;
  quantityChange: number;
  previousAvailableQuantity: number;
  newAvailableQuantity: number;
  reason: string;
  referenceDocument?: string;
  operatorName: string;
}

export interface PurchaseOrderItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  size: string;
  colorName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  status: "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "COMPLETED" | "CANCELLED";
  orderDate: string;
  expectedDeliveryDate?: string;
  totalCost: number;
  items: PurchaseOrderItem[];
}

export interface StockReconciliationItem {
  id: string;
  inventoryId: string;
  variantId: string;
  productName: string;
  sku: string;
  barcode: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  status: "MATCHED" | "VARIANCE_PENDING" | "RECONCILED";
  notes?: string;
  auditedAt: string;
}

export interface StockValuationSummary {
  totalUnitsOnHand: number;
  totalUnitsReserved: number;
  totalRetailValuation: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  valuationByBrand: Record<string, number>;
  valuationByCategory: Record<string, number>;
}

