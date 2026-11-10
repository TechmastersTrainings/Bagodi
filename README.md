# Bagodi E-Commerce Frontend Platform

Architected and developed by **TechMasters Innovations Private Limited** for **Bagodi** (Bidar, Karnataka).

A production-grade, multi-tenant luxury fashion and retail e-commerce monorepo powering customer shopping, retail store operations, and platform governance.

---

## Applications & Local Endpoints

The monorepo contains three independent web applications configured to run simultaneously:

| Portal | Port | Target Audience | Primary Role |
| :--- | :--- | :--- | :--- |
| **Customer Web Storefront** | `http://localhost:3000` | Shoppers & End Users | Luxury catalog, bridal wear, Raymond suits, cart & checkout |
| **Bagodi Merchant Admin** | `http://localhost:3001` | Store Managers & Cashiers | Store inventory, orders, returns, barcode scanning, operations reports |
| **TechMasters Super Admin** | `http://localhost:3002` | Platform Governance | Multi-tenant merchants, microservices health matrix, platform audit logs |

---

## Pre-Configured Demo Credentials

The platform includes a built-in mock router engine in `@bagodi/api-client` that allows 100% offline front-end execution. Use the following credentials to access the administrative portals:

### 1. Merchant Operations Portal (`http://localhost:3001/login`)
- **Email**: `manager@bagodi.in`
- **Password**: `StorePassword@123`
- **Assigned Store**: Bagodi Flagship Store (Bidar Mall)
- **Role**: Store Manager (Full retail inventory, barcode scanning, coupon, and returns access)

### 2. Platform Super Admin Cockpit (`http://localhost:3002/login`)
- **Email**: `root@techmasters.in`
- **Password**: `SuperRoot@2026`
- **Role**: Master Super Administrator (Tenant onboarding, infrastructure health, system audit trails)

---

## Key Features & UX Innovations

- **Standalone Offline Execution**: Self-contained client-side API mock router and realistic payloads across all endpoints. No live backend servers or external databases required to run and test all frontends.
- **Adaptive Theme Engine**: 1-click Bright Luxury / Dark Luxury mode switcher in the Merchant Admin with persistent local storage.
- **Pure CSS & CSS Modules Architecture**: Zero runtime styling overhead; completely free of Tailwind CSS and Bootstrap dependencies.
- **Tactile 3D Micro-Interactions**: Dynamic specular glare cards, multi-axis perspective elevation, and luxury gold metallic accenting.
- **Hardware Barcode Scanner Support**: High-speed USB and Bluetooth barcode wedge scanner detection with debounced keystroke listeners.
- **Responsive 4-Column KPI Cockpits**: Adaptive financial telemetry displaying gross GMV, completed orders, pending logistics, and settlement matrices.
- **QuickView Atelier Modal**: Interactive modal with rich image zoom, real-time size selection, and direct cart interaction.

---

## Quick Start

### Prerequisites
- Node.js version 20 or higher
- npm 10 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Servers

Run any of the applications independently or in separate terminal tabs:

```bash
# Start Customer Web Storefront (Port 3000)
npm run dev:customer

# Start Bagodi Merchant Admin (Port 3001)
npm run dev:admin

# Start TechMasters Super Admin (Port 3002)
npm run dev:super
```

### 3. Verify TypeScript Types Across All Workspaces
```bash
npm run typecheck:all
```

---

## Monorepo Architecture

```
├── apps/
│   ├── customer-web/       # Luxury customer storefront (React 18 + Vite)
│   ├── customer-android/   # Capacitor native mobile Android shell
│   ├── merchant-admin/     # Store operations, inventory, coupons, returns (React 18 + Vite)
│   └── super-admin/        # Multi-tenant platform governance cockpit (React 18 + Vite)
├── packages/
│   ├── api-client/         # Centralized HTTP client with mock router & test fixtures
│   ├── authentication/     # JWT session management, RBAC, and permission guards
│   ├── design-system/      # CSS design tokens, typography, and theme definitions
│   ├── shared-components/  # Shared button, card, input, and modal components
│   ├── shared-types/       # Canonical TypeScript domain interfaces and schemas
│   ├── utilities/          # Currency formatters (INR), date helpers, barcode handlers
│   └── validation/         # Zod schemas for forms, checkout, and store workflows
└── docs/
    ├── api-contracts/      # REST API schemas and backend specifications
    └── frontend-architecture/ # Monorepo design patterns and styling guidelines
```

---

## License & Credits

Developed by **TechMasters Innovations Private Limited** for **Bagodi Retail**. All rights reserved.
