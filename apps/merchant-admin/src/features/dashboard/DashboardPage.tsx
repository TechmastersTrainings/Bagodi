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
  Shirt,
  Zap,
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
    queryFn: () => defaultApiClient.get<PaginatedResponse<Order>>("/orders", { params: { pageSize: 4 } }),
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
            <SkeletonCard key={i} height="140px" />
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

  // Single-page launchpad buttons for all operational departments
  const commandModules = [
    {
      title: "Products & Catalogue",
      description: "Manage 148 luxury ethnic garments, Raymond suiting & price points",
      path: "/products",
      icon: <Shirt size={20} />,
      accentColor: "#E31B23",
      statLabel: "148 SKUs",
      actionText: "Manage Catalogue",
    },
    {
      title: "Inventory & Barcodes",
      description: "Live warehouse stock mutex, bin allocation & handheld barcode scanning",
      path: "/inventory",
      icon: <Boxes size={20} />,
      accentColor: "#C5A15B",
      statLabel: `${metrics.totalStockUnits} Units`,
      actionText: "Open Inventory",
    },
    {
      title: "Orders & Fulfillment",
      description: "Customer dispatch pipeline, picking verification & packing slips",
      path: "/orders",
      icon: <ShoppingBag size={20} />,
      accentColor: "#1E88E5",
      statLabel: `${metrics.pendingOrders} Pending`,
      actionText: "Process Orders",
    },
    {
      title: "Returns & Exchanges",
      description: "Inspect customer returns, verify garment condition & issue credits",
      path: "/returns",
      icon: <RotateCcw size={20} />,
      accentColor: "#FB8C00",
      statLabel: `${metrics.returnRequestsCount} Inspection`,
      actionText: "Inspect Returns",
    },
    {
      title: "Payments & Ledger",
      description: "Razorpay online settlements, UPI reconciliations & COD cash deposits",
      path: "/payments",
      icon: <CreditCard size={20} />,
      accentColor: "#2E7D32",
      statLabel: formatINR(metrics.totalSales),
      actionText: "View Ledger",
    },
    {
      title: "Coupons & Discounts",
      description: "Festive promotion engine, percentage codes & cart threshold rules",
      path: "/coupons",
      icon: <Tag size={20} />,
      accentColor: "#D81B60",
      statLabel: "Active Vouchers",
      actionText: "Configure Coupons",
    },
  ];

  return (
    <div className={styles.dashboardRoot}>
      {/* 1. Header Banner */}
      <div className={styles.headerArea}>
        <div className={styles.titleGroup}>
          <div className={styles.breadcrumbBadge}>
            <span>BIDAR FLAGSHIP MALL</span>
            <span className={styles.dotSeparator}>•</span>
            <span>TERMINAL 01</span>
          </div>
          <h1 className={styles.pageTitle}>
            Store Command Center <span className={styles.pageTitleRed}>• Operations Hub</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Consolidated single-page terminal for retail inventory, customer orders, quality returns, and daily ledger reconciliations.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.liveIndicatorBadge}>
            <span className={styles.liveDot} />
            <span>Terminal Synchronized</span>
          </div>

          <button
            type="button"
            className={styles.syncBtn}
            onClick={() => refetchMetrics()}
            title="Refresh Real-Time Metrics"
          >
            <RefreshCw size={13} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 2. Operations Launchpad: Single Page Department Buttons */}
      <div className={styles.launchpadSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleCol}>
            <h2 className={styles.sectionHeading}>
              <Zap size={18} color="#E31B23" />
              <span>Operations Launchpad</span>
            </h2>
            <p className={styles.sectionDesc}>
              Direct access buttons to all 6 store departments and core workflow controllers
            </p>
          </div>
          <span className={styles.moduleCountBadge}>6 Core Operations Live</span>
        </div>

        <div className={styles.launchpadGrid}>
          {commandModules.map((mod) => (
            <Link key={mod.path} to={mod.path} className={styles.launchpadTile}>
              <div className={styles.tileHeader}>
                <div
                  className={styles.tileIconWrap}
                  style={{
                    backgroundColor: `${mod.accentColor}12`,
                    color: mod.accentColor,
                    borderColor: `${mod.accentColor}30`,
                  }}
                >
                  {mod.icon}
                </div>
                <span
                  className={styles.tileStatBadge}
                  style={{
                    backgroundColor: `${mod.accentColor}10`,
                    color: mod.accentColor,
                  }}
                >
                  {mod.statLabel}
                </span>
              </div>

              <div className={styles.tileBody}>
                <h3 className={styles.tileTitle}>{mod.title}</h3>
                <p className={styles.tileDesc}>{mod.description}</p>
              </div>

              <div className={styles.tileFooter}>
                <span className={styles.tileActionLink}>{mod.actionText}</span>
                <div className={styles.tileArrowWrap}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Primary KPI Metrics Grid */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Total Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Total Store Revenue</span>
            <div className={`${styles.iconCircle} ${styles.redIcon}`}>
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
            <div className={`${styles.iconCircle} ${styles.goldIcon}`}>
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

      {/* 4. Secondary Operations Intelligence: Recent Orders & Quick Scans */}
      <div className={styles.sectionsGrid}>
        {/* Left: Recent Priority Store Orders */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleCol}>
              <h3 className={styles.panelTitle}>Recent Store Orders</h3>
              <p className={styles.panelSubtitle}>Live incoming orders routed to Bidar Flagship</p>
            </div>
            <Link to="/orders" className={styles.panelActionLink}>
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderItemRow}>
                <div className={styles.orderItemLeft}>
                  <div className={styles.orderIconWrap}>
                    <ShoppingBag size={14} color="#E31B23" />
                  </div>
                  <div className={styles.orderMetaCol}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                    <span className={styles.orderCustomer}>
                      {order.customerName} • {order.items?.[0]?.productName || "Luxury Garment"}
                    </span>
                  </div>
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

        {/* Right: Barcode Scanner & Quick Operations HUD */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleCol}>
              <h3 className={styles.panelTitle}>Quick Actions & Scanner</h3>
              <p className={styles.panelSubtitle}>Fast cashier operations & bin allocation</p>
            </div>
            <span className={styles.storeBadgeSmall}>Store 01</span>
          </div>

          <div className={styles.quickActionsList}>
            <Link to="/inventory" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.redIcon}`}>
                <Barcode size={18} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Scan Barcode & Stock</span>
                <span className={styles.actionTileDesc}>Instant SKU receipt and bin allocation</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/returns" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.amberIcon}`}>
                <RotateCcw size={18} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Inspect Returns ({metrics.returnRequestsCount})</span>
                <span className={styles.actionTileDesc}>Verify garment condition for restock</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/inventory" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.crimsonIcon}`}>
                <AlertTriangle size={18} />
              </div>
              <div className={styles.actionTileContent}>
                <span className={styles.actionTileTitle}>Low Stock Reorder ({metrics.lowStockCount})</span>
                <span className={styles.actionTileDesc}>Auto-generate weaver purchase orders</span>
              </div>
              <ArrowRight size={14} className={styles.actionTileArrow} />
            </Link>

            <Link to="/coupons" className={styles.actionTile}>
              <div className={`${styles.actionTileIcon} ${styles.emeraldIcon}`}>
                <Tag size={18} />
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
