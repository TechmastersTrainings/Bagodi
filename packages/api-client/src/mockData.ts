import {
  AuthSessionResponse,
  Category,
  Brand,
  Product,
  InventoryItem,
  Order,
  ReturnRequest,
  DeliveryShipment,
  CourierPartner,
  Coupon,
  SalesPerformanceReport,
  CategoryPerformanceReport,
  FulfillmentSlaReport,
  InventoryVelocityReport,
  MerchantTenant,
  PlatformUser,
  AuditLogEntry,
  PlatformGovernanceSummary,
  SystemServiceHealth,
  PaginatedResponse,
} from "@bagodi/shared-types";

// ============================================================================
// 1. Authentication Mock Sessions
// ============================================================================

export const MOCK_STAFF_SESSION: AuthSessionResponse = {
  user: {
    id: "usr_staff_12",
    fullName: "Rajesh Sharma",
    email: "manager@bagodi.in",
    role: "STORE_MANAGER",
    merchantId: "mer_bagodi",
    storeId: "str_bidar_01",
    activeStore: {
      id: "str_bidar_01",
      name: "Bagodi Flagship Store",
      code: "BDR-01",
      city: "Bidar",
      isFlagship: true,
    },
    availableStores: [
      {
        id: "str_bidar_01",
        name: "Bagodi Flagship Store",
        code: "BDR-01",
        city: "Bidar",
        isFlagship: true,
      },
    ],
    permissions: [
      "inventory:read",
      "inventory:write",
      "orders:read",
      "orders:manage",
      "returns:read",
      "returns:inspect",
      "delivery:read",
      "delivery:manage",
      "reports:read",
      "coupons:read",
      "coupons:manage",
    ],
    isActive: true,
    createdAt: "2026-01-10T09:00:00Z",
  },
  tokens: {
    accessToken: "mock_staff_jwt_token_valid",
    refreshToken: "mock_staff_refresh_token_valid",
    tokenType: "Bearer",
    expiresIn: 86400,
  },
};

export const MOCK_SUPER_SESSION: AuthSessionResponse = {
  user: {
    id: "usr_super_01",
    fullName: "TechMasters Root Admin",
    email: "root@techmasters.in",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  tokens: {
    accessToken: "mock_super_jwt_token_valid",
    refreshToken: "mock_super_refresh_token_valid",
    tokenType: "Bearer",
    expiresIn: 86400,
  },
};

// ============================================================================
// 2. Categories & Brands
// ============================================================================

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "sarees",
    name: "Silk Sarees",
    slug: "sarees",
    description: "Silk Mark certified Kanjeevarams, Banarasis, and pure Mysore crepes.",
    displayOrder: 1,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "women-ethnic",
    name: "Women's Ethnic",
    slug: "women-ethnic",
    description: "Designer Anarkalis, shararas, and festive coordinates.",
    displayOrder: 2,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "men-suiting",
    name: "Men's & Raymond",
    slug: "men-suiting",
    description: "Raymond master tailored suiting, Italian cut blazers, and tuxedos.",
    displayOrder: 3,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "wedding",
    name: "Wedding Collection",
    slug: "wedding",
    description: "Royal bridal couture and regal groom sherwanis.",
    displayOrder: 4,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "kids-festive",
    name: "Kids' Festive",
    slug: "kids-festive",
    description: "Traditional dhoti kurta sets, pattu pavadai, and celebratory wear.",
    displayOrder: 5,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1503944570028-568c0764c92b?auto=format&fit=crop&w=600&q=80",
  },
];

export const MOCK_BRANDS: Brand[] = [
  { id: "silk-mark", name: "Silk Mark India", slug: "silk-mark-india", isActive: true },
  { id: "raymond", name: "Raymond", slug: "raymond", isActive: true },
  { id: "bagodi-atelier", name: "Bagodi Royal Atelier", slug: "bagodi-royal-atelier", isActive: true },
  { id: "manyavar", name: "Manyavar", slug: "manyavar", isActive: true },
  { id: "biba", name: "Biba", slug: "biba", isActive: true },
];

// ============================================================================
// 3. Products
// ============================================================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-saree-01",
    name: "Royal Crimson Kanjeevaram Silk Saree with Pure Gold Zari",
    slug: "royal-crimson-kanjeevaram-silk-saree",
    description: "Heirloom bridal Kanjeevaram woven from 100% natural Mulberry silk with certified gold-dipped silver zari pallu.",
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[0],
    basePrice: 28500,
    currency: "INR",
    isActive: true,
    isArchived: false,
    isFeatured: true,
    returnEligible: true,
    exchangeEligible: true,
    returnWindowDays: 7,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    images: [
      {
        id: "img-s1",
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        altText: "Kanjeevaram Saree",
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-saree-01",
        productId: "prod-saree-01",
        sku: "BAG-SR-KANJ-01",
        barcode: "890123456701",
        size: "Free Size (6.3m)",
        colorName: "Royal Crimson & Gold",
        colorHex: "#B8141B",
        mrp: 34500,
        sellingPrice: 28500,
        discountPercentage: 17,
        availableStock: 8,
        reservedStock: 1,
        isActive: true,
      },
    ],
  },
  {
    id: "saree-chanderi-organza-powder-blue",
    name: "Handwoven Chanderi Organza Silk Saree with Silver Mukaish",
    slug: "handwoven-chanderi-organza-silk-saree",
    description: "Airy sheer Chanderi organza woven with real silver zari buttis, scalloped resham borders, and unstitched raw silk blouse.",
    details: "Modern pastel elegance honoring century-old handloom techniques.",
    fabricDetails: "Silk Organza & Fine Cotton Chanderi",
    careInstructions: "Gentle Dry Clean Only.",
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[0],
    basePrice: 14200,
    currency: "INR",
    isActive: true,
    isArchived: false,
    isFeatured: true,
    returnEligible: true,
    exchangeEligible: true,
    returnWindowDays: 7,
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    images: [
      {
        id: "img-saree-4a",
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
        altText: "Handwoven Chanderi Organza Silk Saree",
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-saree-4",
        productId: "saree-chanderi-organza-powder-blue",
        sku: "BAG-SR-CHAN-04",
        barcode: "890123456704",
        size: "Free Size (6.3m)",
        colorName: "Powder Blue & Silver",
        colorHex: "#B0C4DE",
        mrp: 17500,
        sellingPrice: 14200,
        discountPercentage: 18,
        availableStock: 6,
        reservedStock: 0,
        isActive: true,
      },
    ],
  },
  {
    id: "prod-suit-01",
    name: "Raymond Made-to-Measure Midnight Navy Fine Wool 2-Piece Suit",
    slug: "raymond-midnight-navy-wool-suit",
    description: "Crafted from Australian Super 120s pure merino wool with canvas construction and horn buttons.",
    category: MOCK_CATEGORIES[2],
    brand: MOCK_BRANDS[1],
    basePrice: 22999,
    currency: "INR",
    isActive: true,
    isArchived: false,
    isFeatured: true,
    returnEligible: true,
    exchangeEligible: true,
    returnWindowDays: 7,
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    images: [
      {
        id: "img-m1",
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        altText: "Raymond Navy Suit",
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-suit-38",
        productId: "prod-suit-01",
        sku: "BAG-RM-SUIT-38",
        barcode: "890123456704",
        size: "38",
        colorName: "Midnight Navy",
        colorHex: "#1B2A4A",
        mrp: 27999,
        sellingPrice: 22999,
        discountPercentage: 18,
        availableStock: 6,
        reservedStock: 0,
        isActive: true,
      },
      {
        id: "var-suit-40",
        productId: "prod-suit-01",
        sku: "BAG-RM-SUIT-40",
        barcode: "890123456705",
        size: "40",
        colorName: "Midnight Navy",
        colorHex: "#1B2A4A",
        mrp: 27999,
        sellingPrice: 22999,
        discountPercentage: 18,
        availableStock: 9,
        reservedStock: 2,
        isActive: true,
      },
    ],
  },
  {
    id: "prod-lehenga-01",
    name: "Bagodi Royal Heritage Rose Gold Zardozi Bridal Lehenga",
    slug: "bagodi-rose-gold-zardozi-bridal-lehenga",
    description: "Master bridal couture featuring 16 kalis hand-embroidered with dabka, naqshi, and resham threadwork.",
    category: MOCK_CATEGORIES[3],
    brand: MOCK_BRANDS[2],
    basePrice: 58000,
    currency: "INR",
    isActive: true,
    isArchived: false,
    isFeatured: true,
    returnEligible: true,
    exchangeEligible: false,
    returnWindowDays: 5,
    createdAt: "2026-01-25T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    images: [
      {
        id: "img-w1",
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        altText: "Bridal Lehenga",
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-lh-m",
        productId: "prod-lehenga-01",
        sku: "BAG-AT-LEH-M",
        barcode: "890123456708",
        size: "M",
        colorName: "Rose Gold & Ruby",
        colorHex: "#C5837B",
        mrp: 68000,
        sellingPrice: 58000,
        discountPercentage: 15,
        availableStock: 3,
        reservedStock: 1,
        isActive: true,
      },
    ],
  },
  {
    id: "ethnic-peplum-sharara-mustard",
    name: "Bagodi Atelier Silk Peplum Kurti & Flared Sharara Set",
    slug: "bagodi-silk-peplum-kurti-sharara-set",
    description: "Vibrant mustard raw silk peplum top adorned with kundan buttons, paired with a layered georgette sharara and mirror-work dupatta.",
    details: "Lightweight festive silhouette celebrating Karnataka heritage traditions.",
    fabricDetails: "Raw Silk Top & Georgette Sharara",
    careInstructions: "Dry Clean Only.",
    category: MOCK_CATEGORIES[1],
    brand: MOCK_BRANDS[2],
    basePrice: 13499,
    currency: "INR",
    isActive: true,
    isArchived: false,
    isFeatured: true,
    returnEligible: true,
    exchangeEligible: true,
    returnWindowDays: 14,
    createdAt: "2026-02-08T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    images: [
      {
        id: "img-shar-1a",
        url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85",
        altText: "Bagodi Silk Peplum Kurti & Sharara Set",
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: "img-shar-1b",
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=85",
        altText: "Bagodi Silk Peplum Kurti & Sharara Set Detail",
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    variants: [
      {
        id: "var-shar-m",
        productId: "ethnic-peplum-sharara-mustard",
        sku: "BAG-SHAR-MS-M",
        barcode: "890123457402",
        size: "M",
        colorName: "Festive Mustard & Gold",
        colorHex: "#E1A100",
        mrp: 16999,
        sellingPrice: 13499,
        discountPercentage: 21,
        availableStock: 7,
        reservedStock: 1,
        isActive: true,
      },
      {
        id: "var-shar-l",
        productId: "ethnic-peplum-sharara-mustard",
        sku: "BAG-SHAR-MS-L",
        barcode: "890123457403",
        size: "L",
        colorName: "Festive Mustard & Gold",
        colorHex: "#E1A100",
        mrp: 16999,
        sellingPrice: 13499,
        discountPercentage: 21,
        availableStock: 5,
        reservedStock: 0,
        isActive: true,
      },
      {
        id: "var-shar-xl",
        productId: "ethnic-peplum-sharara-mustard",
        sku: "BAG-SHAR-MS-XL",
        barcode: "890123457404",
        size: "XL",
        colorName: "Festive Mustard & Gold",
        colorHex: "#E1A100",
        mrp: 16999,
        sellingPrice: 13499,
        discountPercentage: 21,
        availableStock: 4,
        reservedStock: 0,
        isActive: true,
      },
    ],
  },
];

// ============================================================================
// 4. Inventory Items
// ============================================================================

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-01",
    productId: "prod-saree-01",
    productName: "Royal Crimson Kanjeevaram Silk Saree with Pure Gold Zari",
    variantId: "var-saree-01",
    variant: MOCK_PRODUCTS[0].variants[0],
    sku: "BAG-SR-KANJ-01",
    barcode: "890123456701",
    storeId: "str_bidar_01",
    storeName: "Bagodi Flagship Store (Bidar)",
    onHandQuantity: 9,
    reservedQuantity: 1,
    availableQuantity: 8,
    reorderLevel: 3,
    stockStatus: "IN_STOCK",
    updatedAt: "2026-03-08T10:15:00Z",
  },
  {
    id: "inv-02",
    productId: "prod-suit-01",
    productName: "Raymond Made-to-Measure Midnight Navy Fine Wool Suit (Size 38)",
    variantId: "var-suit-38",
    variant: MOCK_PRODUCTS[1].variants[0],
    sku: "BAG-RM-SUIT-38",
    barcode: "890123456704",
    storeId: "str_bidar_01",
    storeName: "Bagodi Flagship Store (Bidar)",
    onHandQuantity: 6,
    reservedQuantity: 0,
    availableQuantity: 6,
    reorderLevel: 2,
    stockStatus: "IN_STOCK",
    updatedAt: "2026-03-08T11:20:00Z",
  },
  {
    id: "inv-03",
    productId: "prod-suit-01",
    productName: "Raymond Made-to-Measure Midnight Navy Fine Wool Suit (Size 40)",
    variantId: "var-suit-40",
    variant: MOCK_PRODUCTS[1].variants[1],
    sku: "BAG-RM-SUIT-40",
    barcode: "890123456705",
    storeId: "str_bidar_01",
    storeName: "Bagodi Flagship Store (Bidar)",
    onHandQuantity: 11,
    reservedQuantity: 2,
    availableQuantity: 9,
    reorderLevel: 4,
    stockStatus: "IN_STOCK",
    updatedAt: "2026-03-08T12:00:00Z",
  },
  {
    id: "inv-04",
    productId: "prod-lehenga-01",
    productName: "Bagodi Royal Heritage Rose Gold Zardozi Bridal Lehenga",
    variantId: "var-lh-m",
    variant: MOCK_PRODUCTS[2].variants[0],
    sku: "BAG-AT-LEH-M",
    barcode: "890123456708",
    storeId: "str_bidar_01",
    storeName: "Bagodi Flagship Store (Bidar)",
    onHandQuantity: 4,
    reservedQuantity: 1,
    availableQuantity: 3,
    reorderLevel: 2,
    stockStatus: "LOW_STOCK",
    updatedAt: "2026-03-08T14:30:00Z",
  },
];

// ============================================================================
// 5. Orders
// ============================================================================

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-8912",
    orderNumber: "BAG-2026-8912",
    customerId: "usr_cust_01",
    customerName: "Aarav Deshmukh",
    customerEmail: "aarav.deshmukh@gmail.com",
    customerPhone: "+91 98231 45670",
    shippingAddress: {
      fullName: "Aarav Deshmukh",
      phone: "+91 98231 45670",
      addressLine1: "Flat 402, Royal Palms Residency",
      landmark: "Near Shivaji Circle",
      city: "Bidar",
      state: "Karnataka",
      pincode: "585401",
    },
    items: [
      {
        id: "item-01",
        orderId: "ord-8912",
        productId: "prod-saree-01",
        productName: "Royal Crimson Kanjeevaram Silk Saree with Pure Gold Zari",
        variantId: "var-saree-01",
        sku: "BAG-SR-KANJ-01",
        size: "Free Size (6.3m)",
        colorName: "Royal Crimson & Gold",
        unitPrice: 28500,
        quantity: 1,
        totalPrice: 28500,
      },
    ],
    subtotal: 28500,
    taxAmount: 1425,
    shippingFee: 0,
    discountAmount: 1000,
    totalAmount: 28925,
    currency: "INR",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "PROCESSING",
    fulfillmentStatus: "UNFULFILLED",
    merchantId: "mer_bagodi",
    storeId: "str_bidar_01",
    createdAt: "2026-03-08T09:12:00Z",
    updatedAt: "2026-03-08T09:15:00Z",
  },
  {
    id: "ord-8911",
    orderNumber: "BAG-2026-8911",
    customerId: "usr_cust_02",
    customerName: "Pooja Kulkarni",
    customerEmail: "pooja.kulkarni@yahoo.com",
    customerPhone: "+91 94481 23456",
    shippingAddress: {
      fullName: "Pooja Kulkarni",
      phone: "+91 94481 23456",
      addressLine1: "Plot 18, Gurunagar Extension",
      city: "Bidar",
      state: "Karnataka",
      pincode: "585403",
    },
    items: [
      {
        id: "item-02",
        orderId: "ord-8911",
        productId: "prod-suit-01",
        productName: "Raymond Midnight Navy Fine Wool Suit",
        variantId: "var-suit-40",
        sku: "BAG-RM-SUIT-40",
        size: "40",
        colorName: "Midnight Navy",
        unitPrice: 22999,
        quantity: 1,
        totalPrice: 22999,
      },
    ],
    subtotal: 22999,
    taxAmount: 1150,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 24149,
    currency: "INR",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    orderStatus: "SHIPPED",
    fulfillmentStatus: "FULFILLED",
    merchantId: "mer_bagodi",
    storeId: "str_bidar_01",
    createdAt: "2026-03-07T16:45:00Z",
    updatedAt: "2026-03-08T08:30:00Z",
  },
  {
    id: "ord-8910",
    orderNumber: "BAG-2026-8910",
    customerId: "usr_cust_03",
    customerName: "Vikram Patil",
    customerEmail: "vikram.patil@outlook.com",
    customerPhone: "+91 97412 88990",
    shippingAddress: {
      fullName: "Vikram Patil",
      phone: "+91 97412 88990",
      addressLine1: "House No 5-2-110, Gandhi Gunj",
      city: "Bidar",
      state: "Karnataka",
      pincode: "585401",
    },
    items: [
      {
        id: "item-03",
        orderId: "ord-8910",
        productId: "prod-lehenga-01",
        productName: "Bagodi Royal Heritage Rose Gold Zardozi Bridal Lehenga",
        variantId: "var-lh-m",
        sku: "BAG-AT-LEH-M",
        size: "M",
        colorName: "Rose Gold & Ruby",
        unitPrice: 58000,
        quantity: 1,
        totalPrice: 58000,
      },
    ],
    subtotal: 58000,
    taxAmount: 2900,
    shippingFee: 0,
    discountAmount: 2500,
    totalAmount: 58400,
    currency: "INR",
    paymentMethod: "NETBANKING",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    fulfillmentStatus: "FULFILLED",
    merchantId: "mer_bagodi",
    storeId: "str_bidar_01",
    createdAt: "2026-03-05T11:00:00Z",
    updatedAt: "2026-03-07T14:20:00Z",
  },
];

// ============================================================================
// 6. Return Requests
// ============================================================================

export const MOCK_RETURNS: ReturnRequest[] = [
  {
    id: "ret-01",
    returnNumber: "RET-2026-0041",
    orderId: "ord-8910",
    orderNumber: "BAG-2026-8910",
    customerId: "usr_cust_03",
    customerName: "Vikram Patil",
    customerPhone: "+91 97412 88990",
    items: [
      {
        orderItemId: "item-03",
        productName: "Bagodi Royal Heritage Rose Gold Zardozi Bridal Lehenga",
        size: "M",
        reason: "Size fit adjustment requested for blouse alteration",
        quantity: 1,
      },
    ],
    status: "INSPECTION_PENDING",
    requestedAt: "2026-03-08T08:00:00Z",
    storeId: "str_bidar_01",
  },
];

// ============================================================================
// 7. Delivery Shipments & Couriers
// ============================================================================

export const MOCK_COURIERS: CourierPartner[] = [
  { id: "c-bluedart", name: "Blue Dart Express", code: "BLUEDART", isActive: true, rating: 4.8 },
  { id: "c-delhivery", name: "Delhivery Surface & Air", code: "DELHIVERY", isActive: true, rating: 4.6 },
  { id: "c-dtdc", name: "DTDC Premium Express", code: "DTDC", isActive: true, rating: 4.5 },
  { id: "c-shadowfax", name: "Shadowfax Local Same-Day", code: "SHADOWFAX", isActive: true, rating: 4.7 },
];

export const MOCK_SHIPMENTS: DeliveryShipment[] = [
  {
    id: "shp-01",
    trackingNumber: "BD-904128912",
    orderId: "ord-8911",
    orderNumber: "BAG-2026-8911",
    courierPartner: "Blue Dart Express",
    courierCode: "BLUEDART",
    status: "IN_TRANSIT",
    currentLocation: "Bidar Sorting Hub",
    destinationCity: "Bidar",
    destinationPincode: "585403",
    estimatedDelivery: "2026-03-09T18:00:00Z",
    dispatchedAt: "2026-03-08T08:30:00Z",
    isOutForDelivery: false,
    timeline: [
      { status: "MANIFEST_CREATED", timestamp: "2026-03-07T18:00:00Z", location: "Bagodi Flagship Store" },
      { status: "PICKED_UP", timestamp: "2026-03-08T08:30:00Z", location: "Bagodi Flagship Store" },
      { status: "IN_TRANSIT", timestamp: "2026-03-08T11:00:00Z", location: "Bidar Sorting Hub" },
    ],
  },
];

// ============================================================================
// 8. Promotional Coupons
// ============================================================================

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "cpn-festive15",
    code: "FESTIVE15",
    description: "Flat 15% off on Silk Sarees and Bridal Couture across all stores",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValue: 5000,
    maxDiscountAmount: 3000,
    usageLimit: 500,
    usageCount: 142,
    isActive: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
  },
  {
    id: "cpn-royal10",
    code: "ROYAL10",
    description: "10% off for Raymond Suiting and Luxury Menswear",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 10000,
    maxDiscountAmount: 2500,
    usageLimit: 300,
    usageCount: 88,
    isActive: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
  },
  {
    id: "cpn-bidar100",
    code: "BIDAR100",
    description: "Flat Rs 100 off on first in-store order",
    discountType: "FLAT",
    discountValue: 100,
    minOrderValue: 999,
    usageLimit: 1000,
    usageCount: 423,
    isActive: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
  },
];

// ============================================================================
// 9. Analytics & Operational Reports
// ============================================================================

export const MOCK_SALES_REPORT: SalesPerformanceReport = {
  period: "MONTH",
  grossSales: 2845600,
  netRevenue: 2712300,
  totalOrders: 184,
  averageOrderValue: 15465,
  totalDiscountGiven: 133300,
  taxCollected: 135615,
  dailyTrend: [
    { date: "2026-03-01", sales: 84200, orders: 6 },
    { date: "2026-03-02", sales: 96500, orders: 7 },
    { date: "2026-03-03", sales: 112000, orders: 8 },
    { date: "2026-03-04", sales: 145000, orders: 11 },
    { date: "2026-03-05", sales: 132000, orders: 9 },
    { date: "2026-03-06", sales: 158000, orders: 12 },
    { date: "2026-03-07", sales: 184000, orders: 15 },
    { date: "2026-03-08", sales: 124000, orders: 9 },
  ],
};

export const MOCK_CATEGORY_REPORT: CategoryPerformanceReport[] = [
  { categoryId: "sarees", categoryName: "Silk Sarees", unitsSold: 58, revenue: 1240000, percentageContribution: 43.6 },
  { categoryId: "men-suiting", categoryName: "Men's & Raymond", unitsSold: 46, revenue: 820000, percentageContribution: 28.8 },
  { categoryId: "wedding", categoryName: "Wedding Collection", unitsSold: 12, revenue: 510000, percentageContribution: 17.9 },
  { categoryId: "women-ethnic", categoryName: "Women's Ethnic", unitsSold: 42, revenue: 215600, percentageContribution: 7.6 },
  { categoryId: "kids-festive", categoryName: "Kids' Festive", unitsSold: 26, revenue: 60000, percentageContribution: 2.1 },
];

export const MOCK_FULFILLMENT_REPORT: FulfillmentSlaReport = {
  averageDispatchHours: 3.4,
  onTimeDeliveryRate: 98.2,
  rtoRate: 1.4,
  courierPerformance: [
    { courierName: "Blue Dart Express", totalHandedOver: 92, deliveredCount: 91, rtoCount: 1, averageDeliveryDays: 1.8 },
    { courierName: "Delhivery Surface", totalHandedOver: 64, deliveredCount: 62, rtoCount: 1, averageDeliveryDays: 2.3 },
    { courierName: "Shadowfax Local", totalHandedOver: 28, deliveredCount: 28, rtoCount: 0, averageDeliveryDays: 0.5 },
  ],
};

export const MOCK_VELOCITY_REPORT: InventoryVelocityReport = {
  fastMovingItems: [
    { sku: "BAG-SR-KANJ-01", productName: "Royal Crimson Kanjeevaram Silk Saree", unitsSoldLast30Days: 28, daysOfInventoryLeft: 8 },
    { sku: "BAG-RM-SUIT-40", productName: "Raymond Midnight Navy Suit (Size 40)", unitsSoldLast30Days: 22, daysOfInventoryLeft: 12 },
  ],
  slowMovingItems: [
    { sku: "BAG-AT-LEH-M", productName: "Bagodi Royal Heritage Bridal Lehenga (Size M)", unitsSoldLast30Days: 2, daysOfInventoryLeft: 45 },
  ],
};

// ============================================================================
// 10. Super Admin Platform Tenants & Audit Logs
// ============================================================================

export const MOCK_SUPER_SERVICES: SystemServiceHealth[] = [
  {
    serviceName: "Auth, Session & RBAC Mutex Engine",
    status: "HEALTHY",
    latencyMs: 14,
    uptimePercentage: 99.99,
    lastPingAt: "2026-03-08T10:30:00Z",
  },
  {
    serviceName: "Catalogue & Fast Search Pipeline",
    status: "HEALTHY",
    latencyMs: 22,
    uptimePercentage: 99.98,
    lastPingAt: "2026-03-08T10:30:00Z",
  },
  {
    serviceName: "Real-Time Inventory & Hardware Barcode Mutex",
    status: "HEALTHY",
    latencyMs: 18,
    uptimePercentage: 99.95,
    lastPingAt: "2026-03-08T10:30:00Z",
  },
  {
    serviceName: "Razorpay Payment Webhook Settlement Listener",
    status: "HEALTHY",
    latencyMs: 31,
    uptimePercentage: 99.99,
    lastPingAt: "2026-03-08T10:30:00Z",
  },
  {
    serviceName: "Multi-Carrier Dispatch & Tracking Bridge",
    status: "HEALTHY",
    latencyMs: 45,
    uptimePercentage: 99.92,
    lastPingAt: "2026-03-08T10:30:00Z",
  },
];

export const MOCK_SUPER_SUMMARY: PlatformGovernanceSummary = {
  totalMerchants: 3,
  activeMerchants: 3,
  suspendedMerchants: 0,
  activeTenants: 3,
  totalStores: 4,
  platformLifetimeGmv: 14850000,
  totalEndUsers: 14200,
  overallHealth: "HEALTHY",
  services: MOCK_SUPER_SERVICES,
  recentAuditLogs: [],
};

export const MOCK_MERCHANTS: MerchantTenant[] = [
  {
    id: "mer_bagodi",
    slug: "bagodi-mall",
    name: "Bagodi Shopping Mall",
    legalEntityName: "Bagodi Textiles & Couture Private Limited",
    gstin: "29AAAAA0000A1Z5",
    contactEmail: "admin@bagodi.in",
    contactPhone: "+91 94481 00001",
    domain: "bagodi.in",
    plan: "ENTERPRISE",
    status: "ACTIVE",
    storeCount: 1,
    totalProductsCount: 148,
    totalOrdersCount: 2480,
    grossSalesVolume: 14200000,
    apiKeyPrefix: "bgd_live_ent_",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "mer_raymond_bidar",
    slug: "raymond-store-bidar",
    name: "Raymond Authorized Showroom Bidar",
    legalEntityName: "Bidar Fine Fabrics LLP",
    gstin: "29BBBBB1111B1Z2",
    contactEmail: "raymond.bidar@bagodi.in",
    contactPhone: "+91 98450 22334",
    plan: "GROWTH",
    status: "ACTIVE",
    storeCount: 1,
    totalProductsCount: 84,
    totalOrdersCount: 890,
    grossSalesVolume: 6400000,
    apiKeyPrefix: "rym_live_grw_",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
];

export const MOCK_PLATFORM_USERS: PlatformUser[] = [
  {
    id: "usr_super_01",
    fullName: "TechMasters Root Admin",
    email: "root@techmasters.in",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    lastLoginAt: "2026-03-08T09:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "usr_ops_02",
    fullName: "Priya Nair",
    email: "priya.nair@techmasters.in",
    role: "PLATFORM_SUPPORT",
    status: "ACTIVE",
    lastLoginAt: "2026-03-07T14:30:00Z",
    createdAt: "2026-01-15T00:00:00Z",
  },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-01",
    actorId: "usr_staff_12",
    actorName: "Rajesh Sharma (Store Manager)",
    action: "INVENTORY_RESTOCK",
    entityType: "INVENTORY",
    entityId: "inv-01",
    ipAddress: "192.168.1.104",
    details: "Restocked 10 units of Royal Crimson Kanjeevaram Saree (SKU: BAG-SR-KANJ-01)",
    timestamp: "2026-03-08T10:15:00Z",
  },
  {
    id: "aud-02",
    actorId: "usr_super_01",
    actorName: "TechMasters Root Admin",
    action: "MERCHANT_CONFIG_UPDATE",
    entityType: "MERCHANT",
    entityId: "mer_bagodi",
    ipAddress: "10.0.0.1",
    details: "Updated platform SLA threshold to 4 hours for Bagodi Flagship",
    timestamp: "2026-03-07T18:00:00Z",
  },
];

// Helper to wrap lists in PaginatedResponse
export function toPaginatedResponse<T>(items: T[], page = 1, pageSize = 20): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: data,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

