#!/usr/bin/env python3
"""
Bagodi Luxury E-Commerce Platform — Comprehensive PDF Report Generator
Pure Python standard library implementation with zero external dependencies.
Generates an ISO 32000-1 / PDF-1.4 multi-page document with luxury styling.
"""

import sys
import os

class PDFBuilder:
    def __init__(self):
        self.objects = []
        self.pages = []
        self.page_streams = []

    def _add_object(self, content: bytes) -> int:
        self.objects.append(content)
        return len(self.objects)

    def add_page(self, stream_commands: str):
        self.page_streams.append(stream_commands.encode('latin1'))

    def build(self) -> bytes:
        # Pre-allocate font objects
        # Fonts: F1 = Helvetica-Bold, F2 = Helvetica, F3 = Times-Bold, F4 = Courier
        f1_idx = 1
        f2_idx = 2
        f3_idx = 3
        f4_idx = 4
        
        catalog_idx = 5
        pages_root_idx = 6

        num_pages = len(self.page_streams)
        # Page object indices: pages_root_idx + 1, + 3, + 5...
        # Content stream indices: pages_root_idx + 2, + 4, + 6...
        page_obj_indices = []
        for i in range(num_pages):
            p_idx = pages_root_idx + 1 + (i * 2)
            c_idx = p_idx + 1
            page_obj_indices.append((p_idx, c_idx))

        # Re-build objects list
        objects = [b""] * (pages_root_idx + 1 + (num_pages * 2))

        # Font 1: Helvetica-Bold
        objects[f1_idx] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
        # Font 2: Helvetica
        objects[f2_idx] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        # Font 3: Times-Bold
        objects[f3_idx] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>"
        # Font 4: Courier
        objects[f4_idx] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>"

        # Catalog
        objects[catalog_idx] = f"<< /Type /Catalog /Pages {pages_root_idx} 0 R >>".encode('ascii')

        # Pages Root
        kids_str = " ".join([f"{p[0]} 0 R" for p in page_obj_indices])
        objects[pages_root_idx] = (
            f"<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>"
        ).encode('ascii')

        # Pages and Streams
        for i, (p_idx, c_idx) in enumerate(page_obj_indices):
            stream_data = self.page_streams[i]
            stream_len = len(stream_data)

            objects[p_idx] = (
                f"<< /Type /Page /Parent {pages_root_idx} 0 R /MediaBox [0 0 595 842] "
                f"/Contents {c_idx} 0 R "
                f"/Resources << /Font << /F1 {f1_idx} 0 R /F2 {f2_idx} 0 R /F3 {f3_idx} 0 R /F4 {f4_idx} 0 R >> >> >>"
            ).encode('ascii')

            objects[c_idx] = (
                f"<< /Length {stream_len} >>\nstream\n".encode('ascii')
                + stream_data
                + b"\nendstream"
            )

        # Assemble PDF with cross-reference table
        output = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
        xref_offsets = []

        for idx in range(1, len(objects)):
            xref_offsets.append(len(output))
            output += f"{idx} 0 obj\n".encode('ascii')
            output += objects[idx]
            output += b"\nendobj\n"

        xref_start = len(output)
        output += f"xref\n0 {len(objects)}\n".encode('ascii')
        output += b"0000000000 65535 f \n"
        for offset in xref_offsets:
            output += f"{offset:010d} 00000 n \n".encode('ascii')

        output += (
            f"trailer\n<< /Size {len(objects)} /Root {catalog_idx} 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode('ascii')

        return output


def escape_pdf(text: str) -> str:
    # Sanitize special unicode characters for standard Type 1 fonts
    text = (text
        .replace('\u2014', '--')
        .replace('\u2013', '-')
        .replace('\u2022', '*')
        .replace('\u2192', '->')
        .replace('“', '"')
        .replace('”', '"')
        .replace('‘', "'")
        .replace('’', "'")
    )
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def draw_header_footer(p_num: int, total_pages: int = 5) -> str:
    # Page height = 842, width = 595
    # Running top border and header
    s = ""
    # Top rule in gold
    s += "q 0.772 0.631 0.356 RG 1.5 w 40 812 m 555 812 l S Q\n"
    s += "BT /F1 8 Tf 0.125 0.137 0.129 rg 40 818 Td (BAGODI LUXURY PLATFORM -- ENGINEERING & AUDIT REPORT) Tj ET\n"
    s += f"BT /F2 8 Tf 0.521 0.517 0.490 rg 450 818 Td (TECHMASTERS CONFIDENTIAL) Tj ET\n"

    # Bottom rule and footer
    s += "q 0.898 0.870 0.823 RG 0.75 w 40 32 m 555 32 l S Q\n"
    s += f"BT /F2 8 Tf 0.521 0.517 0.490 rg 40 22 Td (Bidar Retail Flagship Node | v1.0.0-PROD) Tj ET\n"
    s += f"BT /F1 8 Tf 0.125 0.137 0.129 rg 500 22 Td (Page {p_num} of {total_pages}) Tj ET\n"
    return s


def build_page_1() -> str:
    s = ""
    # Header & Footer
    s += draw_header_footer(1)

    # Big Obsidian Hero Banner
    # Top rect: x=40, y=665, w=515, h=130
    s += "q 0.125 0.137 0.129 rg 40 665 515 130 re f Q\n"
    # Gold border
    s += "q 0.772 0.631 0.356 RG 1.5 w 40 665 515 130 re s Q\n"

    # Banner Text
    s += "BT /F1 10 Tf 0.772 0.631 0.356 rg 58 765 Td (TECHMASTERS INNOVATIONS PRIVATE LIMITED) Tj ET\n"
    s += "BT /F1 22 Tf 1 1 1 rg 58 735 Td (BAGODI LUXURY E-COMMERCE) Tj ET\n"
    s += "BT /F2 11 Tf 0.898 0.870 0.823 rg 58 715 Td (Physical Shopping Mall & Multi-Brand Fashion Ecosystem) Tj ET\n"
    s += "BT /F1 9 Tf 0.772 0.631 0.356 rg 58 685 Td (FLAGSHIP STORE: SHIVAJI CHOWK, BIDAR, KARNATAKA | RC v1.0.0) Tj ET\n"

    # Section 1: Executive Summary
    s += "BT /F1 13 Tf 0.125 0.137 0.129 rg 40 635 Td (1. EXECUTIVE SUMMARY & ARCHITECTURAL SCOPE) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 627 m 350 627 l S Q\n"

    intro = [
        "The Bagodi Digital Ecosystem is an enterprise-grade luxury retail platform engineered as",
        "the direct digital extension of the physical Bagodi Shopping Mall in Bidar, Karnataka.",
        "Featuring premier national partner brands including Raymond, Park Avenue, Parx, and ColorPlus,",
        "alongside Bagodi Couture Silk Sarees and Bridal Lehengas, the architecture guarantees an",
        "internationally competitive shopping experience while retaining authentic Indian retail heritage."
    ]
    y = 610
    for line in intro:
        s += f"BT /F2 9.5 Tf 0.090 0.098 0.094 rg 40 {y} Td ({escape_pdf(line)}) Tj ET\n"
        y -= 14

    # Core Architectural Highlights (Boxed Grid)
    s += "BT /F1 12 Tf 0.125 0.137 0.129 rg 40 520 Td (2. CORE ARCHITECTURAL PILLARS) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 512 m 260 512 l S Q\n"

    pillars = [
        ("A. Single Codebase Mobile Shell", "One customer codebase powers both Web (:3000) and Native Android APK via Capacitor 6."),
        ("B. Server-Authoritative Integrity", "Zero client price computations. Totals, GST, and coupons verified via FastAPI contracts."),
        ("C. Physical Mall Barcode HUD", "USB/Bluetooth scanner listener with 60ms debouncing for instant stock intake at Bidar."),
        ("D. Pure Plain CSS Token System", "Zero Tailwind/Bootstrap. Strict CSS modules with 3D tactile perspective and Obsidian/Gold palette."),
        ("E. Multi-Tenant Governance", "Decoupled Super Admin portal (:3002) for license issuance, RBAC, and immutable audit trails.")
    ]

    y_box = 480
    for title, desc in pillars:
        # Box background
        s += f"q 0.969 0.945 0.906 rg 40 {y_box-10} 515 32 re f Q\n"
        s += f"q 0.898 0.870 0.823 RG 0.5 w 40 {y_box-10} 515 32 re s Q\n"
        # Left gold bar
        s += f"q 0.772 0.631 0.356 rg 40 {y_box-10} 4 32 re f Q\n"
        s += f"BT /F1 9.5 Tf 0.125 0.137 0.129 rg 52 {y_box+10} Td ({escape_pdf(title)}) Tj ET\n"
        s += f"BT /F2 8.5 Tf 0.290 0.302 0.282 rg 52 {y_box-3} Td ({escape_pdf(desc)}) Tj ET\n"
        y_box -= 38

    # Metadata Stamp Box
    s += "q 0.125 0.137 0.129 rg 40 240 515 35 re f Q\n"
    s += "BT /F1 9 Tf 0.772 0.631 0.356 rg 52 254 Td (AUDIT VERIFICATION STATUS:) Tj ET\n"
    s += "BT /F1 9 Tf 1 1 1 rg 210 254 Td (10 / 10 PHASES FULLY IMPLEMENTED & OPERATIONAL) Tj ET\n"

    return s


def build_page_2() -> str:
    s = ""
    s += draw_header_footer(2)

    s += "BT /F1 13 Tf 0.125 0.137 0.129 rg 40 780 Td (3. PHASE DELIVERY AUDIT: FOUNDATION & STOREFRONT (PHASES 0 - 4)) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 772 m 480 772 l S Q\n"

    table_data = [
        ("Phase 0", "Monorepo & Foundation", "npm workspaces, Plain CSS tokens, 3D perspective elevation (1000px), shared UI component library, Axios client with JWT interceptors.", "VERIFIED"),
        ("Phase 1", "Authentication & RBAC", "Customer phone OTP + password flows, Merchant staff credentials, Super Admin master session, permission guards, hybrid token storage adapter.", "VERIFIED"),
        ("Phase 2", "Catalogue & Variants", "Category navigation tree, faceted server filters (Brand, Fabric, Size, Color), PDP gallery, variant SKU resolution, product manager modal.", "VERIFIED"),
        ("Phase 3", "18-Screen Inventory HUD", "Stock ledger, rapid stock adjustment workbench, USB/Bluetooth barcode scanner HUD modal, batch intake, low-stock threshold monitors.", "VERIFIED"),
        ("Phase 4", "Shopping & Checkout", "Server-authoritative cart, multi-address manager, Razorpay payment gateway integration, order confirmation lifecycle, privilege coupons.", "VERIFIED"),
    ]

    # Table Header
    y = 740
    s += f"q 0.125 0.137 0.129 rg 40 {y} 515 22 re f Q\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 48 {y+7} Td (PHASE) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 110 {y+7} Td (MODULE NAME) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 230 {y+7} Td (DELIVERABLES & TECHNICAL SCOPE) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 490 {y+7} Td (STATUS) Tj ET\n"

    y -= 5
    for phase, module, desc, status in table_data:
        box_h = 58
        y -= box_h
        s += f"q 0.98 0.97 0.95 rg 40 {y} 515 {box_h} re f Q\n"
        s += f"q 0.898 0.870 0.823 RG 0.5 w 40 {y} 515 {box_h} re s Q\n"

        s += f"BT /F1 9 Tf 0.392 0.122 0.196 rg 48 {y+36} Td ({phase}) Tj ET\n"
        s += f"BT /F1 9 Tf 0.125 0.137 0.129 rg 110 {y+36} Td ({escape_pdf(module)}) Tj ET\n"
        
        # Word wrap desc
        words = desc.split()
        l1 = " ".join(words[:9])
        l2 = " ".join(words[9:18])
        l3 = " ".join(words[18:])
        s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+40} Td ({escape_pdf(l1)}) Tj ET\n"
        s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+28} Td ({escape_pdf(l2)}) Tj ET\n"
        if l3:
            s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+16} Td ({escape_pdf(l3)}) Tj ET\n"

        # Badge
        s += f"q 0.235 0.467 0.341 rg 485 {y+30} 55 16 re f Q\n"
        s += f"BT /F1 7.5 Tf 1 1 1 rg 493 {y+35} Td ({status}) Tj ET\n"
        y -= 6

    # Bottom Callout for Raymond Partnership
    s += "q 0.125 0.137 0.129 rg 40 330 515 50 re f Q\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 330 515 50 re s Q\n"
    s += "BT /F1 9 Tf 0.772 0.631 0.356 rg 52 360 Td (RAYMOND AUTHORISED PARTNERSHIP INTEGRATION:) Tj ET\n"
    s += "BT /F2 8.5 Tf 1 1 1 rg 52 344 Td (Full bespoke suiting, blazers, and unstitched fabric cataloguing with custom tailoring notes) Tj ET\n"

    return s


def build_page_3() -> str:
    s = ""
    s += draw_header_footer(3)

    s += "BT /F1 13 Tf 0.125 0.137 0.129 rg 40 780 Td (4. PHASE DELIVERY AUDIT: REDESIGN, LOGISTICS & GOVERNANCE (PHASES 5 - 9)) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 772 m 530 772 l S Q\n"

    table_data = [
        ("Master UI", "Editorial Luxury Redesign", "Warm Ivory (#F7F1E7) background, Cormorant Garamond typography, DAR-E-AAB Kashmiri couture cinematic animated hero, multi-layer header.", "VERIFIED"),
        ("Phase 5", "Customer Android App", "Capacitor 6 native shell, hardware back-button listener, status bar styling (#202321), physical haptics, deep linking (bagodi://), safe-area insets.", "VERIFIED"),
        ("Phase 6", "Merchant Order Admin", "Order queue (CONFIRMED -> PACKED -> SHIPPED), printable 80mm ESC/POS packing slips, return/exchange pass/fail inspection workbench.", "VERIFIED"),
        ("Phase 7", "Logistics & Analytics", "Multi-carrier courier fleet (Shiprocket, Delhivery, BlueDart), driver handover manifests, dynamic Privilege Coupon engine, margin reporting.", "VERIFIED"),
        ("Phase 8", "Super Admin Governance", "Platform telemetry, multi-tenant merchant onboarding, operator RBAC assignment, immutable security audit trail, emergency maintenance dials.", "VERIFIED"),
        ("Phase 9", "Production Readiness", "Rollup chunk code-splitting (<200 kB), offline network resilience sentinel, multi-stage Dockerfiles, Nginx reverse proxy, CI/CD pipeline.", "VERIFIED"),
    ]

    y = 740
    s += f"q 0.125 0.137 0.129 rg 40 {y} 515 20 re f Q\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 48 {y+6} Td (PHASE) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 110 {y+6} Td (MODULE NAME) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 230 {y+6} Td (DELIVERABLES & TECHNICAL SCOPE) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 490 {y+6} Td (STATUS) Tj ET\n"

    y -= 4
    for phase, module, desc, status in table_data:
        box_h = 56
        y -= box_h
        s += f"q 0.98 0.97 0.95 rg 40 {y} 515 {box_h} re f Q\n"
        s += f"q 0.898 0.870 0.823 RG 0.5 w 40 {y} 515 {box_h} re s Q\n"

        s += f"BT /F1 9 Tf 0.392 0.122 0.196 rg 48 {y+34} Td ({phase}) Tj ET\n"
        s += f"BT /F1 9 Tf 0.125 0.137 0.129 rg 110 {y+34} Td ({escape_pdf(module)}) Tj ET\n"
        
        words = desc.split()
        l1 = " ".join(words[:9])
        l2 = " ".join(words[9:18])
        l3 = " ".join(words[18:])
        s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+38} Td ({escape_pdf(l1)}) Tj ET\n"
        s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+26} Td ({escape_pdf(l2)}) Tj ET\n"
        if l3:
            s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 230 {y+14} Td ({escape_pdf(l3)}) Tj ET\n"

        s += f"q 0.235 0.467 0.341 rg 485 {y+28} 55 16 re f Q\n"
        s += f"BT /F1 7.5 Tf 1 1 1 rg 493 {y+33} Td ({status}) Tj ET\n"
        y -= 6

    # Technical Quality Metrics Box
    s += "q 0.125 0.137 0.129 rg 40 300 515 50 re f Q\n"
    s += "BT /F1 9 Tf 0.772 0.631 0.356 rg 52 332 Td (CODE QUALITY & VERIFICATION SIGN-OFF:) Tj ET\n"
    s += "BT /F2 8.5 Tf 1 1 1 rg 52 316 Td (Monorepo TypeScript check: 0 errors | Vite production builds: 0 errors | All portals tested) Tj ET\n"

    return s


def build_page_4() -> str:
    s = ""
    s += draw_header_footer(4)

    s += "BT /F1 13 Tf 0.125 0.137 0.129 rg 40 780 Td (5. LUXURY DESIGN SYSTEM & TOKEN SPECIFICATIONS) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 772 m 450 772 l S Q\n"

    s += "BT /F2 9.5 Tf 0.090 0.098 0.094 rg 40 755 Td (The design system enforces a zero-utility-CSS rule with pure CSS custom properties and CSS Modules:) Tj ET\n"

    # Color Swatches Table
    colors = [
        ("Obsidian Charcoal", "#202321", "0.125 0.137 0.129", "1 1 1", "Dark surfaces, Admin shells, Top customer navigation bar"),
        ("Heritage Olive", "#34392D", "0.204 0.224 0.176", "1 1 1", "Secondary dark surfaces, architectural building textures"),
        ("Champagne Gold", "#C5A15B", "0.772 0.631 0.356", "0 0 0", "Primary metallic luxury accent, badges, dividers, borders"),
        ("Warm Ivory", "#F7F1E7", "0.969 0.945 0.906", "0 0 0", "Editorial light customer background, saree showcase backdrop"),
        ("Royal Burgundy", "#641F32", "0.392 0.122 0.196", "1 1 1", "Festive fashion campaigns, bridal lehengas, hero highlights"),
        ("Heritage Red", "#B5262E", "0.710 0.149 0.180", "1 1 1", "Brand logo accent, controlled sale tags, promotional pills"),
        ("Pure White", "#FFFFFF", "1.000 1.000 1.000", "0 0 0", "Product card tiles for maximum garment fabric color fidelity")
    ]

    y = 720
    for name, hex_val, rgb_str, text_color, role in colors:
        # Swatch rectangle
        s += f"q {rgb_str} rg 40 {y} 28 22 re f Q\n"
        s += f"q 0.772 0.631 0.356 RG 0.5 w 40 {y} 28 22 re s Q\n"

        s += f"BT /F1 9 Tf 0.125 0.137 0.129 rg 76 {y+12} Td ({name}) Tj ET\n"
        s += f"BT /F4 8.5 Tf 0.392 0.122 0.196 rg 76 {y+2} Td ({hex_val}) Tj ET\n"
        s += f"BT /F2 8.5 Tf 0.25 0.25 0.25 rg 180 {y+7} Td ({escape_pdf(role)}) Tj ET\n"
        y -= 28

    # Typography Hierarchy Box
    s += "BT /F1 12 Tf 0.125 0.137 0.129 rg 40 500 Td (6. TYPOGRAPHY & HIERARCHY SPECIFICATIONS) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 492 m 350 492 l S Q\n"

    typo = [
        ("Display Headings", "Playfair Display / Cormorant Garamond", "Editorial hero titles, DAR-E-AAB campaign, brand storytelling"),
        ("Interface Body", "Inter / Manrope", "Product titles, catalog prices, specifications, checkout forms"),
        ("Telemetry & Ledger", "JetBrains Mono / System Monospace", "Barcode SKU codes, courier AWB tracking, inventory audit entries")
    ]

    y_t = 460
    for category, font, usage in typo:
        s += f"q 0.969 0.945 0.906 rg 40 {y_t} 515 28 re f Q\n"
        s += f"q 0.898 0.870 0.823 RG 0.5 w 40 {y_t} 515 28 re s Q\n"
        s += f"BT /F1 9 Tf 0.125 0.137 0.129 rg 50 {y_t+9} Td ({category}:) Tj ET\n"
        s += f"BT /F1 8.5 Tf 0.392 0.122 0.196 rg 160 {y_t+9} Td ({font}) Tj ET\n"
        s += f"BT /F2 8 Tf 0.3 0.3 0.3 rg 340 {y_t+9} Td ({escape_pdf(usage)}) Tj ET\n"
        y_t -= 34

    return s


def build_page_5() -> str:
    s = ""
    s += draw_header_footer(5)

    s += "BT /F1 13 Tf 0.125 0.137 0.129 rg 40 780 Td (7. MULTI-PORTAL DEPLOYMENT TOPOLOGY & PORT REFERENCE) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 772 m 480 772 l S Q\n"

    ports = [
        ("Customer Web", ":3000", "bagodi.in", "Editorial luxury storefront, shopping cart, Razorpay checkout"),
        ("Merchant Admin", ":3001", "admin.bagodi.in", "18-screen inventory cockpit, barcode HUD, returns workbench"),
        ("Super Admin", ":3002", "super.bagodi.in", "Platform governance, multi-tenant onboarding, audit log ledger"),
        ("Customer Android", "APK", "Google Play Store", "Capacitor 6 native shell, hardware back button, haptics"),
        ("Gateway Nginx", ":80 / :443", "Reverse Proxy", "HTTP/2, Gzip/Brotli, SSL termination, CSP security headers")
    ]

    y = 740
    s += f"q 0.125 0.137 0.129 rg 40 {y} 515 20 re f Q\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 48 {y+6} Td (PORTAL) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 140 {y+6} Td (PORT) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 200 {y+6} Td (HOSTNAME) Tj ET\n"
    s += f"BT /F1 8.5 Tf 1 1 1 rg 310 {y+6} Td (CAPABILITIES & TARGET AUDIENCE) Tj ET\n"

    y -= 4
    for portal, port, host, desc in ports:
        y -= 26
        s += f"q 0.98 0.97 0.95 rg 40 {y} 515 24 re f Q\n"
        s += f"q 0.898 0.870 0.823 RG 0.5 w 40 {y} 515 24 re s Q\n"
        s += f"BT /F1 8.5 Tf 0.125 0.137 0.129 rg 48 {y+7} Td ({portal}) Tj ET\n"
        s += f"BT /F4 8.5 Tf 0.392 0.122 0.196 rg 140 {y+7} Td ({port}) Tj ET\n"
        s += f"BT /F2 8.5 Tf 0.25 0.25 0.25 rg 200 {y+7} Td ({host}) Tj ET\n"
        s += f"BT /F2 8 Tf 0.25 0.25 0.25 rg 310 {y+7} Td ({escape_pdf(desc)}) Tj ET\n"

    # Hardware Onboarding & Signoff
    s += "BT /F1 12 Tf 0.125 0.137 0.129 rg 40 550 Td (8. PHYSICAL STORE HARDWARE ONBOARDING (BIDAR MALL)) Tj ET\n"
    s += "q 0.772 0.631 0.356 RG 1 w 40 542 m 420 542 l S Q\n"

    hw = [
        "1. USB Barcode Scanners (Zebra LS2208 / Honeywell): Configured for HID keyboard emulation with [ENTER] suffix. Automatic 60ms sequence detection opens the Barcode HUD modal in <100ms.",
        "2. Thermal Receipt Printers (Epson / TVS RP3200): Pre-configured @media print CSS stylesheets ensure crisp 80mm dispatch manifests and store pickup receipts without dialog formatting issues.",
        "3. Offline Resilience: Built-in NetworkStatusBar automatically buffers user state and notifies staff during physical internet drops, auto-syncing upon cloud reconnection."
    ]
    y_hw = 520
    for line in hw:
        words = line.split()
        s += f"BT /F2 8.5 Tf 0.15 0.15 0.15 rg 40 {y_hw} Td ({escape_pdf(' '.join(words[:14]))}) Tj ET\n"
        s += f"BT /F2 8.5 Tf 0.15 0.15 0.15 rg 40 {y_hw-12} Td ({escape_pdf(' '.join(words[14:]))}) Tj ET\n"
        y_hw -= 30

    # Executive Sign-Off Stamp
    s += "q 0.125 0.137 0.129 rg 40 370 515 70 re f Q\n"
    s += "q 0.772 0.631 0.356 RG 1.5 w 40 370 515 70 re s Q\n"
    s += "BT /F1 10 Tf 0.772 0.631 0.356 rg 55 422 Td (EXECUTIVE ENGINEERING SIGN-OFF) Tj ET\n"
    s += "BT /F2 8.5 Tf 1 1 1 rg 55 404 Td (PLATFORM: Bagodi Luxury Fashion & Multi-Brand E-Commerce Platform) Tj ET\n"
    s += "BT /F2 8.5 Tf 1 1 1 rg 55 390 Td (DEVELOPMENT STATUS: Complete (Phases 0 through 9 + Master UI Redesign Verified)) Tj ET\n"
    s += "BT /F1 8.5 Tf 0.772 0.631 0.356 rg 55 376 Td (SIGNED: Senior Luxury Frontend Architect | TechMasters Innovations Private Limited) Tj ET\n"

    return s


def main():
    pdf = PDFBuilder()
    pdf.add_page(build_page_1())
    pdf.add_page(build_page_2())
    pdf.add_page(build_page_3())
    pdf.add_page(build_page_4())
    pdf.add_page(build_page_5())

    pdf_bytes = pdf.build()

    out_path = "/Volumes/SHIV BHALKE/Bagodi/docs/BAGODI_PLATFORM_ENGINEERING_REPORT.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)

    print(f"Successfully generated {out_path} ({len(pdf_bytes)} bytes)")

if __name__ == "__main__":
    main()
