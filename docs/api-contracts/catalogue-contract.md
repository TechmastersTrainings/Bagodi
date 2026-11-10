# Catalogue & Variant Management API Contract Specification
**Base Path:** `/api/v1`  
**Owner:** Backend Developer (FastAPI + SQLAlchemy)

---

## 1. Product Catalogue Queries

### 1.1 List Products (Server-Side Filtered & Paginated)
* **Endpoint:** `GET /api/v1/products`
* **Query Parameters:**
  * `categoryId?: string`
  * `brandId?: string`
  * `sizes?: string` (comma-separated: `S,M,L`)
  * `minPrice?: number`
  * `maxPrice?: number`
  * `inStockOnly?: boolean`
  * `search?: string`
  * `sortBy?: "newest" | "price_asc" | "price_desc" | "popular"`
  * `page?: number` (default: 1)
  * `pageSize?: number` (default: 12)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prd_01",
        "name": "Classic Hand-Woven Silk Kurta",
        "slug": "classic-hand-woven-silk-kurta",
        "description": "Pure mulberry silk festive kurta tailored for formal ceremonies.",
        "category": { "id": "cat_festive", "name": "Festive Wear", "slug": "festive-wear" },
        "brand": { "id": "brd_bagodi", "name": "Bagodi Heritage", "slug": "bagodi-heritage" },
        "basePrice": 2999,
        "currency": "INR",
        "isActive": true,
        "isArchived": false,
        "images": [
          { "id": "img_01", "url": "https://cdn.bagodi.in/kurta_front.jpg", "isPrimary": true, "displayOrder": 1 }
        ],
        "variants": [
          {
            "id": "var_01",
            "productId": "prd_01",
            "sku": "BGD-KURTA-NVY-M",
            "barcode": "8904567890123",
            "size": "M",
            "colorName": "Midnight Navy",
            "colorHex": "#1a243b",
            "mrp": 3499,
            "sellingPrice": 2999,
            "availableStock": 8,
            "reservedStock": 1,
            "isActive": true
          }
        ],
        "returnEligible": true,
        "exchangeEligible": true,
        "returnWindowDays": 7,
        "createdAt": "2026-02-15T10:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 12,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 1.2 Get Single Product Details (PDP)
* **Endpoint:** `GET /api/v1/products/{id_or_slug}`
* **Success Response (200 OK):**
Returns single `Product` object with full variant list, all photographs, and optional `sizeChart` measurements.

---

## 2. Product Management (Admin Operations)

### 2.1 Create Garment
* **Endpoint:** `POST /api/v1/products`
* **Access:** Requires `products:write` permission
* **Request Payload:** `ProductCreatePayload`

### 2.2 Create Variant
* **Endpoint:** `POST /api/v1/variants`
* **Access:** Requires `products:write` permission
* **Rule:** SKU and Barcode must be globally unique. Selling price cannot exceed MRP.

### 2.3 Archive Garment
* **Endpoint:** `DELETE /api/v1/products/{id}`
* **Access:** Requires `products:write` permission
* **Behavior:** Soft delete. Sets `isArchived = true`. Hidden from public customer catalogue.

---

## 3. Categories & Brands

### 3.1 List Categories Hierarchy
* **Endpoint:** `GET /api/v1/categories`
* **Success Response (200 OK):** Returns array of `Category` items with nested `subcategories`.

### 3.2 List Brands
* **Endpoint:** `GET /api/v1/brands`
* **Success Response (200 OK):** Returns array of active `Brand` items.

