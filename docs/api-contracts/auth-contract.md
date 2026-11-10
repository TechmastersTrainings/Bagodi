# Authentication API Contract Specification
**Base Path:** `/api/v1/auth`  
**Security Standard:** Bearer JWT (Access Token) + HTTP-safe Refresh Token  
**Owner:** Backend Developer (FastAPI + SQLAlchemy)

---

## 1. Customer Authentication Endpoints

### 1.1 Send OTP
* **Endpoint:** `POST /api/v1/auth/customer/send-otp`
* **Access:** Public (Rate limited: 5 requests / min per IP)
* **Request Payload:**
```json
{
  "phoneOrEmail": "9876543210",
  "channel": "SMS"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "referenceId": "otp_ref_8f7b2c",
    "expiresInSeconds": 60,
    "maskedDestination": "+91 ******3210"
  }
}
```

### 1.2 Verify OTP
* **Endpoint:** `POST /api/v1/auth/customer/verify-otp`
* **Access:** Public
* **Request Payload:**
```json
{
  "referenceId": "otp_ref_8f7b2c",
  "phoneOrEmail": "9876543210",
  "otp": "482910"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_c8192a",
      "fullName": "Suresh Kumar",
      "email": "suresh@example.com",
      "phone": "9876543210",
      "role": "CUSTOMER",
      "permissions": [],
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00Z"
    },
    "tokens": {
      "accessToken": "ey...",
      "refreshToken": "ey...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
}
```

### 1.3 Customer Password Login
* **Endpoint:** `POST /api/v1/auth/customer/login-password`
* **Request Payload:**
```json
{
  "emailOrPhone": "suresh@example.com",
  "password": "Password@123"
}
```

### 1.4 Customer Registration
* **Endpoint:** `POST /api/v1/auth/customer/register`
* **Request Payload:**
```json
{
  "fullName": "Suresh Kumar",
  "email": "suresh@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "acceptTerms": true
}
```

---

## 2. Merchant Admin Authentication

### 2.1 Staff Login
* **Endpoint:** `POST /api/v1/auth/merchant/login`
* **Request Payload:**
```json
{
  "email": "manager@bagodi.in",
  "password": "StorePassword@123",
  "storeId": "str_bidar_01"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_staff_12",
      "fullName": "Rajesh Sharma",
      "email": "manager@bagodi.in",
      "role": "STORE_MANAGER",
      "merchantId": "mer_bagodi",
      "storeId": "str_bidar_01",
      "activeStore": {
        "id": "str_bidar_01",
        "name": "Bagodi Flagship Store",
        "code": "BDR-01",
        "city": "Bidar",
        "isFlagship": true
      },
      "availableStores": [
        {
          "id": "str_bidar_01",
          "name": "Bagodi Flagship Store",
          "code": "BDR-01",
          "city": "Bidar",
          "isFlagship": true
        }
      ],
      "permissions": [
        "inventory:read",
        "inventory:write",
        "orders:read",
        "orders:manage",
        "returns:read",
        "returns:inspect"
      ],
      "isActive": true,
      "createdAt": "2026-01-10T09:00:00Z"
    },
    "tokens": {
      "accessToken": "ey...",
      "refreshToken": "ey...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
}
```

---

## 3. Super Admin Platform Authentication

### 3.1 Super Admin Login
* **Endpoint:** `POST /api/v1/auth/super/login`
* **Request Payload:**
```json
{
  "email": "root@techmasters.in",
  "password": "SuperSecretPlatformKey@123",
  "securityKey": "optional-hardware-token"
}
```
* **Rule:** Rejects all credentials unless user role is strictly `SUPER_ADMIN`.

---

## 4. Session Renewal and Invalidation

### 4.1 Token Refresh
* **Endpoint:** `POST /api/v1/auth/refresh`
* **Request Payload:**
```json
{
  "refreshToken": "ey..."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "ey...",
    "expiresIn": 900
  }
}
```

### 4.2 Invalidate Session (Logout)
* **Endpoint:** `POST /api/v1/auth/logout`
* **Request Payload:**
```json
{
  "refreshToken": "ey..."
}
```

### 4.3 Get Current Session Profile
* **Endpoint:** `GET /api/v1/auth/me`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Success Response (200 OK):** Returns current `AuthUser`.
