import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ApiErrorCard, SkeletonCard } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { Order, PaginatedResponse } from "@bagodi/shared-types";
import styles from "./DashboardPage.module.css";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Boxes,
  Barcode,
  ArrowRight,
  RotateCcw,
  Tag,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  codOutstanding: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  returnRequestsCount: number;
}

export const DashboardPage: React.FC = () => {
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery<DashboardMetrics>({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => defaultApiClient.get<DashboardMetrics>("/reports/dashboard-summary"),
    retry: 1,
  });

  const { data: ordersData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["admin-recent-orders"],
    queryFn: () => defaultApiClient.get<PaginatedResponse<Order>>("/orders", { params: { pageSize: 3 } }),
    retry: 1,
  });

  if (isMetricsLoading) {
    return (
      <div className={styles.dashboardRoot}>
        <div className={styles.headerArea}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Store Operations & Overview</h1>
            <p className={styles.pageSubtitle}>Loading real-time flagship store metrics...</p>
          </div>
        </div>
        <div className={styles.kpiGrid}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} height="150px" />
          ))}
        </div>
      </div>
    );
  }

  if (metricsError || !metrics) {
    return (
      <div className={styles.dashboardRoot}>
        <ApiErrorCard
          title="Dashboard Metrics Unavailable"
          message="Could not connect to the operational metrics stream. Verify that local mock data is active."
          onRetry={() => refetchMetrics()}
        />
      </div>
    );
  }

  const recentOrders = ordersData?.items || [];

  return (
    <div className={styles.dashboardRoot}>
      {/* 1. Header Banner */}
      <div className={styles.headerArea}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>
            Store Overview <span className={styles.pageTitleGold}>• Bidar Flagship</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Live inventory velocity, aggregated revenues, and fulfillment indicators
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.storeStatusBadge}>
            <span className={styles.pulseDot} />
            <span>Store Terminal Online</span>
          </div>

          <button
            type="button"
            className={styles.actionTile}
            style={{ padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.12)" }}
            onClick={() => refetchMetrics()}
            title="Refresh Metrics"
          >
            <RefreshCw size={13} />
            <span style={{ fontSize: "11px", fontWeight: 600 }}>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Metrics Grid */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Total Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Total Store Revenue</span>
            <div className={`${styles.iconCircle} ${styles.goldIcon}`}>
              <TrendingUp size={18} />
            </div>
          </div>

          <div className={styles.kpiValueRow}>
            <h2 className={styles.kpiValue}>{formatINR(metrics.totalSales)}</h2>
            <p className={styles.kpiSubtext}>Aggregated payments from Bidar Flagship</p>
          </div>

          <div className={styles.kpiBottomRow}>
            <span className={styles.trendBadgeGreen}>+18.4% vs last week</span>
            <span className={styles.kpiFootnote}>Razorpay & UPI</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Store Orders</span>
            <div className={`${styles.iconCircle} ${styles.crimsonIcon}`}>
              <ShoppingBag size={18} />
            </div>
          </div>

          <div className={styles.kpiValueRow}>
            <h2 className={styles.kpiValue}>{metrics.totalOrders} Orders</h2>
            <p className={styles.kpiSubtext}>98.2% on-time dispatch rate</p>
          </div>

          <div className={styles.kpiBottomRow}>
            <span className={styles.trendBadgeAmber}>{metrics.pendingOrders} pending confirmation</span>
            <span className={styles.kpiFootnote}>{metrics.deliveredOrders} fulfilled</span>
          </div>
        </div>

        {/* Card 3: COD Outstanding */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>COD Outstanding</span>
            <div className={`${styles.iconCircle} ${styles.amberIcon}`}>
              <CreditCard size={18} />
            </div>
          </div>

          <div className={styles.kpiValueRow}>
            <h2 className={styles.kpiValue}>{formatINR(metrics.codOutstanding)}</h2>
            <p className={styles.kpiSubtext}>Pending courier partner remittance</p>
          </div>

          <div className={styles.kpiBottomRow}>
            <span className={styles.trendBadgeAmber}>Blue Dart & Delhivery</span>
            <span className={styles.kpiFootnote}>Due in 48h</span>
          </div>
        </div>

        {/* Card 4: Inventory On Hand */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Total Stock On Hand</span>
            <div className={`${styles.iconCircle} ${styles.emeraldIcon}`}>
              <Boxes size={18} />
            </div>
          </div>

          <div className={styles.kpiValueRow}>
            <h2 className={styles.kpiValue}>{metrics.totalStockUnits.toLocaleString("en-IN")} Units</h2>
            <p className={styles.kpiSubtext}>Across 148 verified luxury SKUs</p>
          </div>

          <div className={styles.kpiBottomRow}>
            <span className={metrics.lowStockCount > 0 ? styles.trendBadgeRed : styles.trendBadgeGreen}>
              {metrics.lowStockCount} low stock alerts
            </span>
            <span className={styles.kpiFootnote}>{metrics.outOfStockCount} out of stock</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Operations Command Section */}
      <div className={styles.sectionsGrid}>
        {/* Left Column: Recent Priority Orders */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recent Store Orders</h3>
            <Link to="/orders" className={styles.panelActionLink}>
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderItemRow}>
                <div className={styles.orderItemLeft}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={styles.orderCustomer}>
                    {order.customerName} • {order.items?.[0]?.productName || "Luxury Garment"}
                  </span>
                </div>

                <div className={styles.orderItemRight}>
                  <span className={styles.orderAmount}>{formatINR(order.grandTotal)}</span>
                  <span
                    className={
                      order.status === "PROCESSING" || order.status === "CONFIRMED" || order.status === "PACKED"
                        ? styles.statusPillProcessing
                        : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                        ? styles.statusPillShipped
                        : styles.statusPillDelivered
                    }
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Operations Shortcuts HUD */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Quick Operations</h3>
            <span style={{ fontSize: "11px", color: "#8E8D86" }}>Store 01</span>
          </div>

          <div className={styles.quickActionsList}>
            <Link to="/inventory" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.goldIcon}`}>
                <Barcode size={16} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Scan Barcode & Stock</span>
                <span className={styles.actionTileDesc}>Instant SKU receipt and bin allocation</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/returns" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.amberIcon}`}>
                <RotateCcw size={16} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Inspect Returns ({metrics.returnRequestsCount})</span>
                <span className={styles.actionTileDesc}>Verify garment condition for restock</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/inventory" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.crimsonIcon}`}>
                <AlertTriangle size={16} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Low Stock Reorder ({metrics.lowStockCount})</span>
                <span className={styles.actionTileDesc}>Auto-generate weaver purchase orders</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/coupons" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.emeraldIcon}`}>
                <Tag size={16} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Promotional Vouchers</span>
                <span className={styles.actionTileDesc}>Issue festive seasonal discounts</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
