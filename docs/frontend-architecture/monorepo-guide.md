# Bagodi Frontend Monorepo Architecture

Developed for **TechMasters Innovations Private Limited**
Initial Merchant: **Bagodi (Flagship Store: Bidar, Karnataka)**

## Applications
- `apps/customer-web`: Vite + React + TS responsive e-commerce storefront.
- `apps/customer-android`: Capacitor native packaging wrapping the customer web build.
- `apps/merchant-admin`: Bagodi operations & barcode-driven inventory control.
- `apps/super-admin`: TechMasters multi-tenant governance platform.

## Shared Packages
- `packages/design-system`: Plain CSS tokens, 3D elevation, typography scale, resets.
- `packages/shared-types`: OpenAPI-aligned TypeScript models.
- `packages/api-client`: Centralized `/api/v1/` client with JWT refresh mutex.
- `packages/validation`: Zod schemas for forms and operations.
- `packages/authentication`: AuthProvider, secure token storage, permission guards.
- `packages/shared-components`: Buttons, 3D Perspective Cards, DataTables, 10 UI states.
- `packages/utilities`: Currency (INR), date formatting, hardware barcode scanner listener.

