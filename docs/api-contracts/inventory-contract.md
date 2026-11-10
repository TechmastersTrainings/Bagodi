# Inventory Management & Barcode Workflows API Contract Specification
**Base Path:** `/api/v1/inventory`  
**Security Standard:** Bearer JWT with `inventory:read` and `inventory:write` permissions  
**Owner:** Backend Developer (FastAPI + SQLAlchemy)

---

## 1. Multi-Store Stock Ledger

### 1.1 Query Inventory Table
* **Endpoint:** `GET /api/v1/inventory`
* **Access:** Requires `inventory:read`
* **Query Parameters:**
  * `storeId?: string` (defaults to active store context, e.g. Bidar Store 01)
  * `status?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"`
  * `search?: string` (matches SKU, barcode, garment title)
  * `page?: number`
  * `pageSize?: number`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inv_01",
        "productId": "prd_01",
        "productName": "Classic Hand-Woven Silk Kurta",
        "variantId": "var_01",
        "variant": {
          "id": "var_01",
          "size": "M",
          "colorName": "Midnight Navy",
          "sku": "BGD-KURTA-NVY-M",
          "barcode": "8904567890123"
        },
        "sku": "BGD-KURTA-NVY-M",
        "barcode": "8904567890123",
        "storeId": "str_bidar_01",
        "storeName": "Bagodi Flagship Store (Bidar)",
        "onHandQuantity": 10,
        "reservedQuantity": 2,
        "availableQuantity": 8,
        "reorderLevel": 3,
        "stockStatus": "IN_STOCK",
        "updatedAt": "2026-03-01T11:30:00Z"
      }
    ],
    "total": 128,
    "page": 1,
    "pageSize": 15,
    "totalPages": 9
  }
}
```

---

## 2. Barcode Scanner Workflows

### 2.1 Live Barcode Identification
* **Endpoint:** `GET /api/v1/inventory/barcode/{barcode_code}`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "found": true,
    "productName": "Classic Hand-Woven Silk Kurta",
    "variant": {
      "id": "var_01",
      "sku": "BGD-KURTA-NVY-M",
      "barcode": "8904567890123",
      "size": "M",
      "colorName": "Midnight Navy"
    },
    "inventory": {
      "id": "inv_01",
      "onHandQuantity": 10,
      "reservedQuantity": 2,
      "availableQuantity": 8,
      "stockStatus": "IN_STOCK"
    }
  }
}
```

### 2.2 Post Stock Transaction (Barcode Workflow Execution)
* **Endpoint:** `POST /api/v1/inventory/adjust`
* **Access:** Requires `inventory:write`
* **Request Payload:**
```json
{
  "inventoryId": "inv_01",
  "variantId": "var_01",
  "operationType": "STOCK_RECEIPT",
  "quantityChange": 5,
  "reason": "Direct store PO delivery receipt",
  "referenceDocument": "PO-9812"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_8921a",
    "updatedItem": {
      "id": "inv_01",
      "onHandQuantity": 15,
      "reservedQuantity": 2,
      "availableQuantity": 13,
      "stockStatus": "IN_STOCK"
    }
  }
}
```

---

## 3. Audit Ledger & Movements

### 3.1 Immutable Stock Movement History
* **Endpoint:** `GET /api/v1/inventory/movements`
* **Returns:** Chronological audit stream of all inventory modifications with operator ID, previous and new stock counts, and justification.

---

## 4. Physical Reconciliation

### 4.1 Reconciliation Items
* **Endpoint:** `GET /api/v1/inventory/reconciliation`
* **Returns:** Items with discrepancy between system ledger and floor count.

### 4.2 Authorize Reconciliation Adjustment
* **Endpoint:** `POST /api/v1/inventory/reconcile`
* **Request Payload:** `{ inventoryId, countedQuantity, reason }`

---

## 5. Purchase Orders & Receipts

### 5.1 List Purchase Orders
* **Endpoint:** `GET /api/v1/inventory/purchase-orders`

### 5.2 Receive PO Goods
* **Endpoint:** `POST /api/v1/inventory/purchase-orders/receive`
* **Request Payload:** `{ poId, receivedItems: [{ itemId, quantityReceived }], notes }`

---

## 6. Financial Valuation

### 6.1 Stock Valuation Metrics
* **Endpoint:** `GET /api/v1/inventory/valuation`
* **Returns:** Total asset valuation (INR), total units, low stock count, out-of-stock count, and brand/category breakdowns.
