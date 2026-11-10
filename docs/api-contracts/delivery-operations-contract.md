# Bagodi E-Commerce Frontend Platform — Phase 7 API Contract Specification
## Delivery Logistics, Promotional Coupons & Store Operations Analytics

### 1. Delivery Logistics & Fleet Dispatch

#### GET `/api/v1/delivery/shipments`
Retrieves paginated delivery shipments with tracking numbers and live status.

- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 15)
  - `status` (`MANIFESTED` | `PICKED_UP` | `IN_TRANSIT` | `OUT_FOR_DELIVERY` | `DELIVERED` | `RTO` | `ALL`)
  - `courierPartnerId` (string, optional)
  - `search` (string: AWB tracking number, order number, customer name, or pincode)

- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "orderNumber": "ORD-2026-89412",
        "customerName": "Ramesh Patil",
        "customerPhone": "9876543210",
        "destinationCity": "Bidar",
        "destinationPincode": "585401",
        "courierPartnerId": "cp_bluedart",
        "courierPartnerName": "Blue Dart Express",
        "trackingNumber": "BD84729103IN",
        "shippingLabelUrl": "https://cdn.bagodi.in/labels/BD84729103IN.pdf",
        "status": "IN_TRANSIT",
        "estimatedDeliveryDate": "2026-11-10T18:00:00Z",
        "weightGrams": 850,
        "codAmount": 0,
        "milestones": [
          {
            "timestamp": "2026-11-08T11:00:00Z",
            "location": "Bidar Flagship Mall Hub",
            "status": "MANIFESTED",
            "activityDescription": "Package sealed and shipping label generated"
          },
          {
            "timestamp": "2026-11-08T14:30:00Z",
            "location": "Bidar Sorting Center",
            "status": "IN_TRANSIT",
            "activityDescription": "Scanned into outbound express transit network"
          }
        ],
        "createdAt": "2026-11-08T11:00:00Z",
        "updatedAt": "2026-11-08T14:30:00Z"
      }
    ],
    "total": 35,
    "page": 1,
    "pageSize": 15,
    "totalPages": 3
  }
  ```

#### POST `/api/v1/delivery/shipments`
Dispatches a packed order and creates a courier shipment record.

- **Request Body**:
  ```json
  {
    "orderId": "uuid",
    "courierPartnerId": "cp_bluedart",
    "trackingNumber": "BD84729103IN",
    "weightGrams": 850,
    "packageDimensions": {
      "lengthCm": 35,
      "widthCm": 25,
      "heightCm": 10
    },
    "specialInstructions": "Handle with care, festive silk saree inside"
  }
  ```

#### PATCH `/api/v1/delivery/shipments/{shipmentId}/status`
Records a physical checkpoint scan along the transit corridor.

- **Request Body**:
  ```json
  {
    "status": "OUT_FOR_DELIVERY",
    "location": "Bidar City Delivery Station",
    "activityDescription": "Dispatched with delivery rider for doorstep delivery"
  }
  ```

---

### 2. Promotional Coupons & Discount Vouchers

#### GET `/api/v1/promotions/coupons`
Retrieves store marketing coupons and privilege discount codes.

#### POST `/api/v1/promotions/coupons`
Creates a new promotional campaign voucher.

- **Request Body**:
  ```json
  {
    "code": "FESTIVE2026",
    "description": "15% off festive and wedding collections",
    "discountType": "PERCENTAGE",
    "discountValue": 15,
    "maxDiscountAmount": 2000,
    "minimumOrderValue": 4999,
    "usageLimitTotal": 500,
    "usageLimitPerCustomer": 1,
    "validFrom": "2026-11-01",
    "validUntil": "2026-11-30",
    "isActive": true
  }
  ```

#### POST `/api/v1/promotions/validate-coupon`
Validates coupon eligibility against current cart contents during checkout.

- **Request Body**:
  ```json
  {
    "code": "FESTIVE2026",
    "cartTotal": 5999
  }
  ```

- **Response `200 OK`**:
  ```json
  {
    "isValid": true,
    "code": "FESTIVE2026",
    "discountType": "PERCENTAGE",
    "discountAmount": 900,
    "message": "FESTIVE2026 applied! You saved ₹900."
  }
  ```

---

### 3. Store Operations & Analytics Intelligence

#### GET `/api/v1/reports/sales-performance`
- **Query**: `period` (`TODAY` | `WEEK` | `MONTH` | `QUARTER` | `YEAR`)
- Returns `grossSales`, `netRevenue`, `totalOrders`, `averageOrderValue`, `totalDiscountGiven`, `dailyTrend`.

#### GET `/api/v1/reports/category-performance`
- Returns departmental revenue share and percentage contribution across saree, suiting, ethnic, and western lines.

#### GET `/api/v1/reports/fulfillment-sla`
- Returns `averageDispatchHours`, `onTimeDeliveryRate`, `rtoRate`, and carrier-by-carrier delivery turnaround scorecards.

#### GET `/api/v1/reports/inventory-velocity`
- Returns high-turn velocity garments and slow-moving deadstock inventory alerts.

