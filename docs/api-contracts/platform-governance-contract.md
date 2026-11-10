# Bagodi E-Commerce Frontend Platform — Phase 8 API Contract Specification
## TechMasters Platform Governance, Multi-Tenant Management & System Health

### 1. Platform Telemetry & System Health

#### GET `/api/v1/super/platform-summary`
Returns global multi-tenant operational indicators and microservices health status.

- **Response `200 OK`**:
  ```json
  {
    "totalMerchants": 1,
    "activeMerchants": 1,
    "suspendedMerchants": 0,
    "activeTenants": 1,
    "totalStores": 1,
    "platformLifetimeGmv": 4250000,
    "totalEndUsers": 1420,
    "overallHealth": "HEALTHY",
    "services": [
      {
        "serviceName": "Auth, Session & RBAC Mutex Engine",
        "status": "HEALTHY",
        "latencyMs": 14,
        "uptimePercentage": 99.99,
        "lastPingAt": "2026-11-08T10:45:00Z"
      },
      {
        "serviceName": "Catalogue & Fast Search Pipeline",
        "status": "HEALTHY",
        "latencyMs": 22,
        "uptimePercentage": 99.98,
        "lastPingAt": "2026-11-08T10:45:00Z"
      },
      {
        "serviceName": "Real-Time Inventory & Hardware Barcode Mutex",
        "status": "HEALTHY",
        "latencyMs": 18,
        "uptimePercentage": 99.95,
        "lastPingAt": "2026-11-08T10:45:00Z"
      },
      {
        "serviceName": "Razorpay Payment Webhook Settlement Listener",
        "status": "HEALTHY",
        "latencyMs": 31,
        "uptimePercentage": 99.99,
        "lastPingAt": "2026-11-08T10:45:00Z"
      },
      {
        "serviceName": "Multi-Carrier Dispatch & Tracking Bridge",
        "status": "HEALTHY",
        "latencyMs": 45,
        "uptimePercentage": 99.92,
        "lastPingAt": "2026-11-08T10:45:00Z"
      }
    ]
  }
  ```

---

### 2. Multi-Tenant Merchant Management

#### GET `/api/v1/super/merchants`
Retrieves paginated commercial merchant tenants.

- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 15)
  - `status` (`ACTIVE` | `SUSPENDED` | `ONBOARDING` | `ALL`)
  - `search` (string: merchant name, slug, legal entity, or GSTIN)

#### POST `/api/v1/super/merchants`
Provisions a new commercial tenant, generates initial store location, and issues API key.

- **Request Body**:
  ```json
  {
    "name": "Bagodi Shopping Mall",
    "slug": "bagodi-bidar",
    "legalEntityName": "TechMasters Innovations Private Limited",
    "gstin": "29AABCB1234F1Z5",
    "contactEmail": "contact@bagodi.in",
    "contactPhone": "9876543210",
    "plan": "ENTERPRISE",
    "primaryStore": {
      "name": "Bidar Flagship Showroom",
      "code": "BIDAR-01",
      "addressLine1": "Near Shivaji Chowk",
      "city": "Bidar",
      "state": "Karnataka",
      "pincode": "585401"
    },
    "adminUser": {
      "fullName": "Store Director",
      "email": "director@bagodi.in",
      "phoneNumber": "9876543210"
    }
  }
  ```

#### PATCH `/api/v1/super/merchants/{tenantId}/status`
Suspends or activates a tenant.

- **Request Body**:
  ```json
  {
    "status": "SUSPENDED"
  }
  ```

---

### 3. Platform Users & Immutable Audit Trail

#### GET `/api/v1/super/platform-users`
Retrieves platform administrators and auditors.

#### POST `/api/v1/super/platform-users`
Issues privileged platform access.

#### GET `/api/v1/super/audit-logs`
Retrieves security audit logs.
- **Query Parameters**:
  - `page`, `pageSize`, `action`, `search`

#### POST `/api/v1/super/purge-cache`
Flushes global CDN and Redis cache edge nodes.

