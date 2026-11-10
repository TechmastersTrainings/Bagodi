# Bagodi E-Commerce Frontend Platform
## Phase 4 API Contract: Cart, Server-Authoritative Totals, Address & Checkout

**Merchant Context**: Bagodi (Flagship: Bidar, Karnataka)  
**Parent Org**: TechMasters Innovations Private Limited  
**API Specification**: FastAPI `/api/v1/` OpenAPI  

---

### 1. Overview & Architectural Principles

1. **Server-Authoritative Pricing**:
   - The frontend never calculates discounts, tax lines, or final payable totals.
   - All cart and checkout mutations return an authoritative `CartPricing` object from `/api/v1/cart`.
   - Any client calculation mismatch triggers an authoritative resynchronization.
2. **Indian Retail Address Validation**:
   - Strict 6-digit PIN code (`^\d{6}$`) validation.
   - 10-digit Indian mobile phone validation (`^[6-9]\d{9}$`).
3. **Razorpay SDK Gateway Mutex**:
   - Dynamic standard script loading (`checkout.js`).
   - Order creation handshake via `/api/v1/orders`.
   - Client signature verification callback to `/api/v1/orders/{orderId}/verify-payment`.

---

### 2. Endpoints

#### A. Shopping Cart (`/api/v1/cart`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Retrieve current customer cart with authoritative price breakdown | Optional (Session / Bearer) |
| `POST` | `/cart/items` | Add product variant to cart (`variantId`, `quantity`) | Optional |
| `PATCH` | `/cart/items/{itemId}` | Update quantity of a line item | Optional |
| `DELETE` | `/cart/items/{itemId}` | Remove a line item | Optional |
| `POST` | `/cart/apply-coupon` | Apply promotional coupon code (`couponCode`) | Optional |
| `DELETE` | `/cart/coupon` | Remove currently applied coupon | Optional |

#### B. Customer Addresses (`/api/v1/customer/addresses`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/customer/addresses` | List saved shipping addresses for authenticated customer | Yes (`CUSTOMER`) |
| `POST` | `/customer/addresses` | Create new shipping address | Yes (`CUSTOMER`) |
| `PUT` | `/customer/addresses/{id}` | Update existing shipping address | Yes (`CUSTOMER`) |
| `DELETE` | `/customer/addresses/{id}` | Delete a saved address | Yes (`CUSTOMER`) |

#### C. Order Placement & Checkout (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Create confirmed order from active cart | Yes (`CUSTOMER`) |
| `POST` | `/orders/{orderId}/verify-payment` | Verify Razorpay payment signature | Yes (`CUSTOMER`) |
| `GET` | `/orders/{orderId}` | Fetch confirmed order details & timeline | Yes (`CUSTOMER`) |
| `GET` | `/customer/orders` | List order history for customer account | Yes (`CUSTOMER`) |

---

### 3. Payload Schemas

#### Cart Response Model
```json
{
  "id": "c7a8b9d0-1234-4567-89ab-cdef01234567",
  "itemCount": 2,
  "items": [
    {
      "id": "item-001",
      "productId": "prod-101",
      "productName": "Bidar Heritage Raw Silk Kurta",
      "variantId": "var-201",
      "variant": {
        "id": "var-201",
        "sku": "BGD-SLK-KRT-M",
        "size": "M",
        "colorName": "Emerald Green",
        "availableStock": 4
      },
      "quantity": 1,
      "unitPrice": 3499,
      "totalPrice": 3499,
      "imageUrl": "https://assets.bagodi.com/products/kurta-emerald-1.jpg"
    }
  ],
  "pricing": {
    "subtotal": 3499,
    "discountTotal": 350,
    "deliveryCharge": 0,
    "taxTotal": 175,
    "finalTotal": 3149
  },
  "couponCode": "BAGODI10",
  "isCouponApplied": true
}
```

#### Create Order Payload
```json
{
  "shippingAddressId": "addr-8812",
  "deliverySpeed": "STANDARD",
  "paymentMethod": "RAZORPAY",
  "customerNotes": "Please deliver between 10 AM and 6 PM"
}
```

