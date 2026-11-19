/**
 * Store Operational Intelligence & Analytics Reports Types
 */

export interface SalesPerformanceReport {
  period: "TODAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
  grossSales: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscountGiven: number;
  taxCollected: number;
  dailyTrend: {
    date: string;
    sales: number;
    orders: number;
  }[];
}

export interface CategoryPerformanceReport {
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  percentageContribution: number;
}

export interface FulfillmentSlaReport {
  averageDispatchHours: number;
  onTimeDeliveryRate: number; // percentage e.g. 96.4
  rtoRate: number; // percentage e.g. 2.1
  courierPerformance: {
    courierName: string;
    totalHandedOver: number;
    deliveredCount: number;
    rtoCount: number;
    averageDeliveryDays: number;
  }[];
}

export interface InventoryVelocityReport {
  fastMovingItems: {
    sku: string;
    productName: string;
    unitsSoldLast30Days: number;
    daysOfInventoryLeft: number;
  }[];
  slowMovingItems: {
    sku: string;
    productName: string;
    stockOnHand: number;
    daysSinceLastSale: number;
  }[];
  stockoutRisksCount: number;
}

