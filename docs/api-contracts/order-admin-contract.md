# Bagodi E-Commerce Frontend Platform — Phase 6 API Contract Specification
## Merchant Order Administration, Payments, Settlements & Returns/Exchanges

### 1. Order Management & Fulfillment Controller

#### GET `/api/v1/orders`
Retrieves paginated store orders with operational filtering.

- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 15)
  - `status` (`CONFIRMED` | `PACKED` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `ALL`)
  - `paymentStatus` (`COLLECTED` | `PENDING` | `REFUNDED` | `FAILED` | `ALL`)
  - `search` (string: order number, customer name, or phone number)

- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2026-89412",
        "userId": "uuid",
        "customerName": "Ramesh Patil",
        "customerPhone": "9876543210",
        "customerEmail": "ramesh@example.com",
        "storeId": "store_bidar_01",
        "items": [
          {
            "id": "uuid",
            "productId": "uuid",
            "productName": "Raymond Executive Suiting 2-Piece",
            "variantId": "uuid",
            "sku": "RAY-SUIT-BLK-42R",
            "size": "42R",
            "quantity": 1,
            "unitPrice": 14999,
            "totalPrice": 14999
          }
        ],
        "subtotal": 14999,
        "discountTotal": 0,
        "deliveryCharge": 0,
        "taxTotal": 1800,
        "grandTotal": 14999,
        "paymentMethod": "RAZORPAY_UPI",
        "paymentStatus": "COLLECTED",
        "status": "PACKED",
        "shippingAddress": {
          "fullName": "Ramesh Patil",
          "phoneNumber": "9876543210",
          "addressLine1": "Near Shivaji Chowk",
          "city": "Bidar",
          "state": "Karnataka",
          "postalCode": "585401"
        },
        "trackingNumber": null,
        "courierPartner": null,
        "createdAt": "2026-11-08T10:30:00Z",
        "updatedAt": "2026-11-08T11:15:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 15,
    "totalPages": 3
  }
  ```

#### PATCH `/api/v1/orders/{orderId}/status`
Transitions an order through the fulfillment pipeline.

- **Request Body**:
  ```json
  {
    "status": "SHIPPED",
    "courierPartner": "BlueDart Express",
    "trackingNumber": "BD84729103IN",
    "cancellationReason": null
  }
  ```
- **Validation**:
  - `status === "SHIPPED"` requires `courierPartner` and `trackingNumber`.
  - `status === "CANCELLED"` requires `cancellationReason` (min 5 characters).

---

### 2. Returns & Exchanges Workbench

#### GET `/api/v1/returns`
Retrieves reverse logistics return and exchange requests.

- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 15)
  - `status` (`PENDING_APPROVAL` | `RECEIVED` | `INSPECTED_PASSED` | `INSPECTED_FAILED` | `REFUND_INITIATED` | `COMPLETED` | `ALL`)
  - `isExchange` (boolean, optional)
  - `search` (string: order number, return ID, or SKU)

- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "orderNumber": "ORD-2026-89412",
        "userId": "uuid",
        "isExchange": true,
        "reason": "Size 40 chest too snug; requesting size 42R exchange",
        "conditionNotes": "Showroom labels and tag seal intact",
        "status": "RECEIVED",
        "items": [
          {
            "orderItemId": "uuid",
            "variantId": "uuid",
            "sku": "RAY-SUIT-BLK-40R",
            "productName": "Raymond Executive Suiting 2-Piece",
            "size": "40R",
            "quantity": 1,
            "unitPrice": 14999
          }
        ],
        "refundAmount": null,
        "createdAt": "2026-11-07T14:20:00Z",
        "updatedAt": "2026-11-08T09:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 15,
    "totalPages": 1
  }
  ```

#### PATCH `/api/v1/returns/{returnId}/inspect`
Applies retail quality inspection verdict and selects resolution action.

- **Request Body**:
  ```json
  {
    "conditionStatus": "PASSED",
    "inspectionNotes": "Garment security seals intact, unworn condition verified at Bidar Mall showroom.",
    "resolutionAction": "DISPATCH_EXCHANGE",
    "replacementVariantId": "RAY-SUIT-BLK-42R"
  }
  ```

---

### 3. Payments, Gateway & Financial Ledger

#### GET `/api/v1/payments/transactions`
Retrieves financial ledger transactions with escrow settlement status.

- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 15)
  - `status` (`CAPTURED` | `SETTLED` | `REFUNDED` | `FAILED` | `ALL`)
  - `paymentMethod` (`RAZORPAY` | `UPI` | `CREDIT_CARD` | `NETBANKING` | `COD` | `ALL`)
  - `search` (string: gateway transaction ID, order number, or customer name)

#### POST `/api/v1/payments/refunds`
Processes instant payment refund via Razorpay gateway or Store Credit.

- **Request Body**:
  ```json
  {
    "orderId": "uuid",
    "amount": 14999,
    "reason": "Garment returned and passed quality inspection",
    "refundMethod": "ORIGINAL_SOURCE"
  }
  ```

- **Response `200 OK`**:
  ```json
  {
    "refundId": "rfnd_K8a912Lkmz9823",
    "orderId": "uuid",
    "amount": 14999,
    "status": "PROCESSED",
    "currency": "INR",
    "refundMethod": "ORIGINAL_SOURCE",
    "gatewayReference": "pay_982341298412",
    "createdAt": "2026-11-08T11:45:00Z"
  }
  ```

