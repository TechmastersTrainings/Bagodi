# Bagodi E-Commerce Frontend Platform

Architected and developed by **TechMasters Innovations Private Limited** for **Bagodi** (Bidar, Karnataka).

## Architecture Highlights
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Pure CSS & CSS Modules (Zero Tailwind CSS / Bootstrap dependencies).
- **Tactile 3D UX**: Pure CSS 3D perspectives, dynamic specular glare cards, multi-level depth elevation.
- **Strict Integrity**: Zero dummy data, zero mock data, genuine loading, empty, and error states.
- **Hardware Integration**: High-speed USB and Bluetooth barcode scanner input detection.
- **Shared Mobile Codebase**: Capacitor Android wrapper targeting `customer-web`.

## Quick Start
```bash
# Install workspace dependencies
npm install

# Start Customer Web Storefront (Port 3000)
npm run dev:customer

# Start Bagodi Merchant Admin (Port 3001)
npm run dev:admin

# Start TechMasters Super Admin (Port 3002)
npm run dev:super
```

## Structure
```
├── apps/
│   ├── customer-web/       # Customer Storefront
│   ├── customer-android/   # Capacitor Native Shell
│   ├── merchant-admin/     # Store Operations & Inventory
│   └── super-admin/        # TechMasters Platform Governance
├── packages/
│   ├── api-client/         # Centralized /api/v1/ Client
│   ├── authentication/     # Auth Context & Token Strategy
│   ├── design-system/      # Plain CSS & 3D Tokens
│   ├── shared-components/  # UI Library & 10 States
│   ├── shared-types/       # OpenAPI Contracts
│   ├── utilities/          # INR Currency, Barcode Scanner
│   └── validation/         # Zod Schemas
└── docs/
    ├── api-contracts/
    └── frontend-architecture/
```

