# TechMasters Innovations — Bagodi Platform Production Deployment Runbook
**Platform Version:** 1.0.0-PROD  
**Target Environment:** Production Cloud Infrastructure & Bidar Flagship Retail Node  
**Main Domain:** `bagodi.in`  
**Date:** November 2026

---

## 1. Architectural Topology Overview

The Bagodi Luxury E-Commerce platform consists of three distinct high-performance single-page frontend applications coordinated through an Nginx reverse proxy gateway and backed by the FastAPI REST engine.

| Tier | Portal | Production Hostname | Container Port | Base Technology |
|---|---|---|---|---|
| **Tier 1** | Customer Web Storefront | `bagodi.in` / `www.bagodi.in` | `3000` (Nginx:80) | React 18, Plain CSS Design System |
| **Tier 2** | Merchant Operations Admin | `admin.bagodi.in` | `3001` (Nginx:80) | React 18, Aurélien Luxe Dark Console |
| **Tier 3** | Super Admin Governance | `super.bagodi.in` | `3002` (Nginx:80) | React 18, Multi-Tenant Platform Cockpit |
| **Gateway**| Nginx Reverse Proxy | `80` (HTTP) / `443` (HTTPS) | Gateway Port | Nginx 1.25 Alpine, Brotli/Gzip, HTTP/2 |

---

## 2. Server Infrastructure Prerequisites

The minimum production host specifications:
- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS x86_64
- **Compute:** 4 vCPUs, 8 GB RAM (16 GB Recommended for peak festive sale traffic)
- **Disk:** 80 GB NVMe SSD
- **Network:** 1 Gbps port, Static IPv4 + IPv6
- **Installed Software:**
  - Docker Engine >= 24.0.0
  - Docker Compose >= 2.20.0
  - Certbot >= 2.8.0

---

## 3. Environment Secrets Matrix

Before deployment, create the respective `.env` files in each app directory based on the provided `.env.example` templates:

### 3.1 Customer Storefront (`apps/customer-web/.env`)
```bash
VITE_API_BASE_URL=https://api.bagodi.in
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
VITE_APP_ENV=production
VITE_DEFAULT_STORE_ID=store_bidar_flagship_01
```

### 3.2 Merchant Operations Admin (`apps/merchant-admin/.env`)
```bash
VITE_API_BASE_URL=https://api.bagodi.in
VITE_APP_ENV=production
VITE_SCANNER_DEBOUNCE_MS=60
```

### 3.3 Super Admin Governance (`apps/super-admin/.env`)
```bash
VITE_API_BASE_URL=https://api.bagodi.in
VITE_APP_ENV=production
VITE_SESSION_TIMEOUT_MINUTES=60
```

---

## 4. Zero-Downtime Deployment Procedure

Execute the following deployment pipeline from the repository root:

```bash
# 1. Pull latest production release tag
git fetch --tags
git checkout tags/v1.0.0 -b release-v1.0.0

# 2. Build multi-stage optimized Docker containers
docker compose -f docker-compose.yml build --no-cache

# 3. Perform rolling deployment
docker compose -f docker-compose.yml up -d --remove-orphans

# 4. Verify container health status
docker compose ps
```

---

## 5. Automated SSL/TLS Configuration (Let's Encrypt)

Obtain certificates for all three subdomains:

```bash
sudo certbot certonly --standalone \
  -d bagodi.in \
  -d www.bagodi.in \
  -d admin.bagodi.in \
  -d super.bagodi.in \
  -d api.bagodi.in \
  --email devops@techmasters.in \
  --agree-tos \
  --non-interactive
```

Add automated renewal crontab entry:
```bash
0 3 * * 1 sudo certbot renew --quiet && docker exec bagodi-nginx-gateway nginx -s reload
```

---

## 6. Bidar Flagship Storefront Hardware Onboarding

For physical point-of-sale and warehouse operations at the Bidar Shopping Mall:
1. **USB Barcode Scanners (Zebra LS2208 / Honeywell Voyager):**
   - Configure scanner to **Keyboard Emulation (HID Mode)**.
   - Set suffix character to `[ENTER]` (`\r` or `\n`).
   - The built-in scanner listener in `@bagodi/utilities/barcode-scanner` will automatically capture rapid-input sequences (>3 chars within 60ms) and open the Inspection Modal or Stock Ledger automatically.
2. **Thermal Receipt Printers (Epson TM-T82III / TVS RP3200):**
   - Standard 80mm ESC/POS format.
   - Handover manifest documents in Phase 7 automatically format with `@media print` rules for clean paper output.

---

## 7. Disaster Recovery & Rollback Protocol

If an unexpected regression occurs:

```bash
# Immediate Rollback to previous container image:
docker compose down
docker compose -f docker-compose.yml.previous up -d

# Verify system health endpoint:
curl -I https://bagodi.in/
curl -I https://admin.bagodi.in/
curl -I https://super.bagodi.in/
```

