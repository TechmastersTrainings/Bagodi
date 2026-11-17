import {
  MOCK_STAFF_SESSION,
  MOCK_SUPER_SESSION,
  MOCK_CATEGORIES,
  MOCK_BRANDS,
  MOCK_PRODUCTS,
  MOCK_INVENTORY_ITEMS,
  MOCK_ORDERS,
  MOCK_RETURNS,
  MOCK_COURIERS,
  MOCK_SHIPMENTS,
  MOCK_COUPONS,
  MOCK_SALES_REPORT,
  MOCK_CATEGORY_REPORT,
  MOCK_FULFILLMENT_REPORT,
  MOCK_VELOCITY_REPORT,
  MOCK_SUPER_SUMMARY,
  MOCK_MERCHANTS,
  MOCK_PLATFORM_USERS,
  MOCK_AUDIT_LOGS,
  toPaginatedResponse,
} from "./mockData";

export function getMockResponse(
  method: string,
  rawPath: string,
  body?: unknown,
  params?: Record<string, unknown>
): unknown {
  const normalizedMethod = method.toUpperCase();
  const cleanPath = rawPath.replace(/^\/api\/v1/, "").replace(/\/$/, "");

  // --- 1. Authentication ---
  if (cleanPath === "/auth/merchant/login") {
    const creds = body as { email?: string; password?: string } | undefined;
    return {
      ...MOCK_STAFF_SESSION,
      user: {
        ...MOCK_STAFF_SESSION.user,
        email: creds?.email || MOCK_STAFF_SESSION.user.email,
      },
    };
  }

  if (cleanPath === "/auth/super/login") {
    const creds = body as { email?: string; password?: string } | undefined;
    return {
      ...MOCK_SUPER_SESSION,
      user: {
        ...MOCK_SUPER_SESSION.user,
        email: creds?.email || MOCK_SUPER_SESSION.user.email,
      },
    };
  }

  if (cleanPath === "/auth/me") {
    return MOCK_STAFF_SESSION.user;
  }

  if (cleanPath === "/auth/refresh") {
    return {
      accessToken: "mock_refreshed_access_token_" + Date.now(),
      refreshToken: "mock_refreshed_refresh_token_" + Date.now(),
      tokenType: "Bearer",
      expiresIn: 86400,
    };
  }

  // --- 2. Analytics & Operational Reports ---
  if (cleanPath === "/reports/dashboard-summary") {
    return {
      totalSales: 2845600,
      totalOrders: 184,
      pendingOrders: 14,
      deliveredOrders: 162,
      cancelledOrders: 8,
      codOutstanding: 48500,
      totalStockUnits: 4120,
      lowStockCount: 9,
      outOfStockCount: 2,
      returnRequestsCount: 4,
    };
  }

  if (cleanPath === "/reports/sales-performance") {
    return MOCK_SALES_REPORT;
  }

  if (cleanPath === "/reports/category-performance") {
    return MOCK_CATEGORY_REPORT;
  }

  if (cleanPath === "/reports/fulfillment-sla") {
    return MOCK_FULFILLMENT_REPORT;
  }

  if (cleanPath === "/reports/inventory-velocity") {
    return MOCK_VELOCITY_REPORT;
  }

  // --- 3. Inventory Workflows ---
  if (cleanPath.startsWith("/inventory/barcode/")) {
    const barcode = cleanPath.split("/").pop() || "";
    const matched = MOCK_INVENTORY_ITEMS.find((i) => i.barcode === barcode || i.sku === barcode) || MOCK_INVENTORY_ITEMS[0];
    return {
      found: true,
      item: matched,
      variant: matched.variant,
      availableQuantity: matched.availableQuantity,
    };
  }

  if (cleanPath === "/inventory/valuation") {
    return {
      totalCostValuation: 4850000,
      totalRetailValuation: 7200000,
      totalUnits: 4120,
      currency: "INR",
      categoryBreakdown: [
        { categoryName: "Silk Sarees", units: 1420, valuation: 3200000 },
        { categoryName: "Men's & Raymond", units: 1100, valuation: 1950000 },
        { categoryName: "Wedding Collection", units: 620, valuation: 1250000 },
        { categoryName: "Women's Ethnic", units: 980, valuation: 800000 },
      ],
    };
  }

  if (cleanPath === "/inventory/movements") {
    return toPaginatedResponse([
      {
        id: "mov-01",
        sku: "BAG-SR-KANJ-01",
        productName: "Royal Crimson Kanjeevaram Saree",
        movementType: "STOCK_IN",
        quantity: 10,
        source: "Master Artisan Weavers Kanchipuram",
        destination: "Bidar Store 01",
        timestamp: "2026-03-08T10:15:00Z",
        performedBy: "Rajesh Sharma",
      },
      {
        id: "mov-02",
        sku: "BAG-RM-SUIT-40",
        productName: "Raymond Midnight Navy Suit",
        movementType: "STOCK_OUT",
        quantity: 1,
        source: "Bidar Store 01",
        destination: "Order BAG-2026-8911",
        timestamp: "2026-03-08T08:30:00Z",
        performedBy: "System Dispatch",
      },
    ]);
  }

  if (cleanPath === "/inventory/reconciliation") {
    return toPaginatedResponse([
      {
        id: "rec-01",
        sku: "BAG-SR-KANJ-01",
        productName: "Royal Crimson Kanjeevaram Saree",
        systemStock: 9,
        physicalCount: 9,
        variance: 0,
        status: "MATCHED",
        lastCountDate: "2026-03-07",
      },
      {
        id: "rec-02",
        sku: "BAG-AT-LEH-M",
        productName: "Bagodi Royal Heritage Bridal Lehenga",
        systemStock: 4,
        physicalCount: 4,
        variance: 0,
        status: "MATCHED",
        lastCountDate: "2026-03-07",
      },
    ]);
  }

  if (cleanPath === "/inventory/purchase-orders") {
    return toPaginatedResponse([
      {
        id: "po-01",
        poNumber: "PO-2026-0089",
        vendorName: "Silk Mark Cooperative Weavers Society",
        totalUnits: 40,
        totalAmount: 640000,
        status: "RECEIVED",
        orderedAt: "2026-02-20T00:00:00Z",
        receivedAt: "2026-03-05T00:00:00Z",
      },
      {
        id: "po-02",
        poNumber: "PO-2026-0090",
        vendorName: "Raymond Luxury Suiting Division",
        totalUnits: 25,
        totalAmount: 425000,
        status: "DISPATCHED",
        orderedAt: "2026-03-01T00:00:00Z",
      },
    ]);
  }

  if (cleanPath === "/inventory/push-to-catalogue" && normalizedMethod === "POST") {
    const { inventoryId } = (body as any) || {};
    const inv = MOCK_INVENTORY_ITEMS.find((i) => i.id === inventoryId);
    if (inv) {
      (inv as any).isPushedToCatalogue = true;
      const matchedCategory = MOCK_CATEGORIES.find((c) => c.name.toLowerCase().includes((inv as any).categoryName?.toLowerCase() || "")) || MOCK_CATEGORIES[0];
      const newProduct = {
        id: inv.productId || "prod-" + Date.now(),
        name: inv.productName,
        slug: inv.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        description: `Handcrafted luxury apparel from in-store inventory. Serial/Barcode: ${inv.barcode}.`,
        details: "Pushed from physical warehouse inventory. Review and enrich details before publishing.",
        fabricDetails: "Pure Indian Handloom / Fine Fabric",
        careInstructions: "Dry Clean Only",
        category: matchedCategory,
        brand: MOCK_BRANDS[0],
        basePrice: inv.variant?.sellingPrice || 19999,
        currency: "INR",
        isActive: false, // Staged, not live until merchant clicks "Make Live"
        isArchived: false,
        isFeatured: false,
        returnEligible: true,
        exchangeEligible: true,
        returnWindowDays: 7,
        images: (inv as any).images || [],
        variants: inv.variant ? [inv.variant] : [],
        createdAt: new Date().toISOString(),
      };
      // Check if already in catalogue
      const existingIdx = MOCK_PRODUCTS.findIndex((p) => p.id === newProduct.id);
      if (existingIdx >= 0) {
        MOCK_PRODUCTS[existingIdx] = { ...MOCK_PRODUCTS[existingIdx], ...newProduct };
      } else {
        MOCK_PRODUCTS.unshift(newProduct as any);
      }
      return { success: true, product: newProduct };
    }
    return { success: false, message: "Inventory item not found" };
  }

  if (cleanPath === "/inventory") {
    if (normalizedMethod === "POST") {
      const invData = body as any;
      const newId = "inv-" + Date.now();
      const newProductId = "prod-" + Date.now();
      const newVariantId = "var-" + Date.now();
      const variant = {
        id: newVariantId,
        productId: newProductId,
        sku: invData.sku || invData.serialNumber || `SKU-${Date.now()}`,
        barcode: invData.barcode || invData.serialNumber || `${Date.now()}`,
        size: invData.size || "Free Size",
        colorName: invData.colorName || "Crimson Red",
        mrp: Number(invData.mrp) || Number(invData.price) || 29999,
        sellingPrice: Number(invData.price) || 24999,
        availableStock: Number(invData.onHandQuantity) || 10,
        reservedStock: 0,
        isActive: true,
      };

      const newItem = {
        id: newId,
        productId: newProductId,
        productName: invData.productName || "New In-Store Garment",
        variantId: newVariantId,
        variant,
        sku: variant.sku,
        barcode: variant.barcode,
        storeId: "str_bidar_01",
        storeName: "Bagodi Flagship Store (Bidar)",
        onHandQuantity: Number(invData.onHandQuantity) || 10,
        reservedQuantity: 0,
        availableQuantity: Number(invData.onHandQuantity) || 10,
        reorderLevel: 2,
        stockStatus: "IN_STOCK",
        updatedAt: new Date().toISOString(),
        categoryName: invData.categoryName || "Silk Sarees",
        images: invData.images || [],
        isPushedToCatalogue: Boolean(invData.pushToCatalogue),
      };

      MOCK_INVENTORY_ITEMS.unshift(newItem as any);

      if (invData.pushToCatalogue) {
        const matchedCategory = MOCK_CATEGORIES.find((c) => c.name.toLowerCase().includes(invData.categoryName?.toLowerCase() || "")) || MOCK_CATEGORIES[0];
        const newProduct = {
          id: newProductId,
          name: newItem.productName,
          slug: newItem.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          description: `Handcrafted luxury apparel from in-store inventory. Serial/Barcode: ${newItem.barcode}.`,
          details: "Pushed from physical warehouse inventory. Ready for photography and price review.",
          fabricDetails: "Pure Indian Silk / Couture Fabric",
          careInstructions: "Dry Clean Only",
          category: matchedCategory,
          brand: MOCK_BRANDS[0],
          basePrice: variant.sellingPrice,
          currency: "INR",
          isActive: false, // Staged, merchant must click "Make Live"
          isArchived: false,
          isFeatured: false,
          returnEligible: true,
          exchangeEligible: true,
          returnWindowDays: 7,
          images: invData.images || [],
          variants: [variant],
          createdAt: new Date().toISOString(),
        };
        MOCK_PRODUCTS.unshift(newProduct as any);
      }

      return newItem;
    }

    const search = String(params?.search || "").toLowerCase();
    let items = [...MOCK_INVENTORY_ITEMS];
    if (search) {
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(search) ||
          i.sku.toLowerCase().includes(search) ||
          i.barcode.includes(search)
      );
    }
    return toPaginatedResponse(items, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/inventory/") && normalizedMethod === "POST") {
    return { success: true, message: "Inventory adjustment saved", newStock: 12 };
  }

  // --- 4. Catalog Entities ---
  if (cleanPath === "/categories") {
    return MOCK_CATEGORIES;
  }

  if (cleanPath === "/brands") {
    return MOCK_BRANDS;
  }

  if (cleanPath === "/products") {
    if (normalizedMethod === "POST") {
      const pData = body as any;
      const category = MOCK_CATEGORIES.find((c) => c.id === pData?.categoryId) || MOCK_CATEGORIES[0];
      const brand = MOCK_BRANDS.find((b) => b.id === pData?.brandId) || MOCK_BRANDS[0];
      const newProduct = {
        id: "prod-" + Date.now(),
        name: pData?.name || "New Garment",
        slug: pData?.slug || "garment-" + Date.now(),
        description: pData?.description || "",
        details: pData?.details || "",
        fabricDetails: pData?.fabricDetails || "",
        careInstructions: pData?.careInstructions || "",
        category,
        brand,
        basePrice: Number(pData?.basePrice) || 0,
        currency: "INR",
        isActive: true,
        isArchived: false,
        isFeatured: false,
        returnEligible: pData?.returnEligible ?? true,
        exchangeEligible: pData?.exchangeEligible ?? true,
        returnWindowDays: pData?.returnWindowDays || 7,
        images: Array.isArray(pData?.images) ? pData.images : [],
        variants: [],
        createdAt: new Date().toISOString(),
      };
      MOCK_PRODUCTS.unshift(newProduct as any);
      return newProduct;
    }

    let list = [...MOCK_PRODUCTS];
    if (params?.isFeatured === true || params?.isFeatured === "true") {
      const featured = list.filter((p) => p.isFeatured);
      if (featured.length > 0) list = featured;
    }
    if (params?.categoryId) {
      list = list.filter((p) => p.category?.id === params.categoryId || (p as any).categoryId === params.categoryId);
    }
    if (params?.search && typeof params.search === "string") {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return toPaginatedResponse(list, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/products/")) {
    const rawId = cleanPath.replace("/products/", "").replace(/\/images$/, "").trim();
    const identifier = decodeURIComponent(rawId);
    const matchedIndex = MOCK_PRODUCTS.findIndex(
      (p) =>
        p.id === identifier ||
        p.slug === identifier ||
        p.id.toLowerCase() === identifier.toLowerCase() ||
        p.slug.toLowerCase() === identifier.toLowerCase()
    );

    if (matchedIndex >= 0) {
      if (normalizedMethod === "PUT" || normalizedMethod === "PATCH") {
        const updateData = body as any;
        const updated = {
          ...MOCK_PRODUCTS[matchedIndex],
          ...(updateData?.images ? { images: updateData.images } : updateData),
        };
        MOCK_PRODUCTS[matchedIndex] = updated;
        return updated;
      }
      if (normalizedMethod === "DELETE") {
        MOCK_PRODUCTS[matchedIndex].isArchived = true;
        return { success: true };
      }
      return MOCK_PRODUCTS[matchedIndex];
    }
    return null;
  }

  // --- 5. Orders ---
  if (cleanPath === "/orders") {
    return toPaginatedResponse(MOCK_ORDERS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/orders/") && cleanPath.endsWith("/status")) {
    return { ...MOCK_ORDERS[0], orderStatus: "FULFILLED" };
  }

  // --- 6. Returns ---
  if (cleanPath === "/returns") {
    return toPaginatedResponse(MOCK_RETURNS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/returns/") && cleanPath.endsWith("/inspect")) {
    return { ...MOCK_RETURNS[0], status: "INSPECTED_ACCEPTED" };
  }

  if (cleanPath.startsWith("/returns/") && cleanPath.endsWith("/decision")) {
    const decBody = body as any;
    if (MOCK_RETURNS[0]) {
      MOCK_RETURNS[0].status = decBody.status || "APPROVED";
      (MOCK_RETURNS[0] as any).merchantNote = decBody.merchantNote;
      return MOCK_RETURNS[0];
    }
    return { success: true };
  }

  if (cleanPath.startsWith("/returns/") && cleanPath.endsWith("/schedule-pickup")) {
    const scBody = body as any;
    if (MOCK_RETURNS[0]) {
      MOCK_RETURNS[0].status = "PICKUP_SCHEDULED";
      (MOCK_RETURNS[0] as any).returnAwb = scBody.returnAwb;
      return MOCK_RETURNS[0];
    }
    return { success: true };
  }

  // --- 7. Payments ---
  if (cleanPath === "/payments" || cleanPath.startsWith("/payments/transactions")) {
    return toPaginatedResponse([
      {
        id: "pay-01",
        transactionId: "TXN_UPI_9841289",
        orderId: "ord-8912",
        orderNumber: "BAG-2026-8912",
        amount: 28925,
        currency: "INR",
        method: "UPI",
        gateway: "Razorpay",
        status: "CAPTURED",
        customerName: "Aarav Deshmukh",
        createdAt: "2026-03-08T09:15:00Z",
      },
      {
        id: "pay-02",
        transactionId: "TXN_CARD_4129841",
        orderId: "ord-8911",
        orderNumber: "BAG-2026-8911",
        amount: 24149,
        currency: "INR",
        method: "CARD",
        gateway: "Razorpay",
        status: "CAPTURED",
        customerName: "Pooja Kulkarni",
        createdAt: "2026-03-07T16:50:00Z",
      },
    ]);
  }

  if (cleanPath === "/payments/refunds") {
    return {
      refundId: "rfnd_mock_01",
      status: "PROCESSED",
      amount: 1000,
      currency: "INR",
      processedAt: new Date().toISOString(),
    };
  }

  // --- 8. Delivery & Shipments ---
  if (cleanPath === "/delivery/courier-partners") {
    return MOCK_COURIERS;
  }

  if (cleanPath === "/delivery/shipments") {
    return toPaginatedResponse(MOCK_SHIPMENTS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/delivery/shipments/") && cleanPath.endsWith("/status")) {
    return { ...MOCK_SHIPMENTS[0], status: "DELIVERED" };
  }

  // --- 9. Coupons ---
  if (cleanPath === "/promotions/coupons") {
    return toPaginatedResponse(MOCK_COUPONS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath.startsWith("/promotions/coupons/")) {
    return { ...MOCK_COUPONS[0], isActive: true };
  }

  // --- 10. Super Admin Platform Governance ---
  if (cleanPath === "/super/platform-summary") {
    return MOCK_SUPER_SUMMARY;
  }

  if (cleanPath === "/super/merchants") {
    return toPaginatedResponse(MOCK_MERCHANTS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath === "/super/platform-users") {
    return toPaginatedResponse(MOCK_PLATFORM_USERS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath === "/super/audit-logs") {
    return toPaginatedResponse(MOCK_AUDIT_LOGS, Number(params?.page) || 1, Number(params?.pageSize) || 20);
  }

  if (cleanPath === "/super/purge-cache") {
    return { success: true, timestamp: new Date().toISOString() };
  }

  // Generic fallback for any other path
  return {
    success: true,
    message: "Operation completed successfully in standalone mock mode",
    path: cleanPath,
    timestamp: new Date().toISOString(),
  };
}

