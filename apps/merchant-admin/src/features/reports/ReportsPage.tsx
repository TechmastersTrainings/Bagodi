import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import {
  SalesPerformanceReport,
  CategoryPerformanceReport,
  FulfillmentSlaReport,
  InventoryVelocityReport,
} from "@bagodi/shared-types";
import { ApiErrorCard, Button, SkeletonCard } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import styles from "./ReportsPage.module.css";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Truck,
  Boxes,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

type ReportTab = "SALES" | "CATEGORIES" | "FULFILLMENT_SLA" | "INVENTORY_VELOCITY";

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>("SALES");
  const [period, setPeriod] = useState<"TODAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR">("MONTH");

  // Query 1: Sales Performance
  const {
    data: salesData,
    isLoading: isSalesLoading,
    error: salesError,
    refetch: refetchSales,
    isFetching: isSalesFetching,
  } = useQuery<SalesPerformanceReport>({
    queryKey: ["admin-sales-report", period],
    queryFn: () =>
      defaultApiClient.get<SalesPerformanceReport>("/reports/sales-performance", {
        params: { period },
      }),
    enabled: activeTab === "SALES",
  });

  // Query 2: Category Performance
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<CategoryPerformanceReport[]>({
    queryKey: ["admin-categories-report", period],
    queryFn: () =>
      defaultApiClient.get<CategoryPerformanceReport[]>("/reports/category-performance", {
        params: { period },
      }),
    enabled: activeTab === "CATEGORIES",
  });

  // Query 3: Fulfillment SLA
  const {
    data: slaData,
    isLoading: isSlaLoading,
    error: slaError,
    refetch: refetchSla,
  } = useQuery<FulfillmentSlaReport>({
    queryKey: ["admin-fulfillment-sla-report", period],
    queryFn: () =>
      defaultApiClient.get<FulfillmentSlaReport>("/reports/fulfillment-sla", {
        params: { period },
      }),
    enabled: activeTab === "FULFILLMENT_SLA",
  });

  // Query 4: Inventory Velocity
  const {
    data: velocityData,
    isLoading: isVelocityLoading,
    error: velocityError,
    refetch: refetchVelocity,
  } = useQuery<InventoryVelocityReport>({
    queryKey: ["admin-inventory-velocity-report"],
    queryFn: () => defaultApiClient.get<InventoryVelocityReport>("/reports/inventory-velocity"),
    enabled: activeTab === "INVENTORY_VELOCITY",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.pageRoot}>
      {/* 1. Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Store Operations & Analytics Intelligence</h1>
          <p className={styles.pageSubtitle}>
            Executive sales velocity, category margins, courier dispatch SLAs, and inventory turnover for Bagodi Mall.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className={styles.periodSelect}
          >
            <option value="TODAY">Today (Live Scans)</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month (Current Cycle)</option>
            <option value="QUARTER">This Fiscal Quarter</option>
            <option value="YEAR">Annual Year-to-Date</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isSalesFetching ? "animate-spin" : ""} />}
            onClick={() => {
              if (activeTab === "SALES") refetchSales();
              if (activeTab === "CATEGORIES") refetchCategories();
              if (activeTab === "FULFILLMENT_SLA") refetchSla();
              if (activeTab === "INVENTORY_VELOCITY") refetchVelocity();
            }}
          >
            Refresh
          </Button>

          <Button variant="secondary" size="sm" leftIcon={<Printer size={14} />} onClick={handlePrint}>
            Export / Print Report
          </Button>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className={styles.tabsBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "SALES" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("SALES")}
        >
          <BarChart3 size={15} />
          <span>Sales & Revenue Velocity</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "CATEGORIES" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("CATEGORIES")}
        >
          <PieChart size={15} />
          <span>Category & Brand Contribution</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "FULFILLMENT_SLA" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("FULFILLMENT_SLA")}
        >
          <Truck size={15} />
          <span>Fulfillment & Courier SLAs</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "INVENTORY_VELOCITY" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("INVENTORY_VELOCITY")}
        >
          <Boxes size={15} />
          <span>Inventory Velocity & Deadstock</span>
        </button>
      </div>

      {/* TAB 1: SALES & REVENUE PERFORMANCE */}
      {activeTab === "SALES" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {salesError ? (
            <ApiErrorCard message="Failed to load sales performance records." onRetry={() => refetchSales()} />
          ) : isSalesLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Gross Sales GMV</span>
                    <TrendingUp size={14} color="var(--color-champagne-gold)" />
                  </div>
                  <div className={styles.metricValue}>{formatINR(salesData?.grossSales || 0)}</div>
                  <div className={styles.metricSubtext}>Pre-discount gross value</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Net Settled Revenue</span>
                    <TrendingUp size={14} color="var(--status-success)" />
                  </div>
                  <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
                    {formatINR(salesData?.netRevenue || 0)}
                  </div>
                  <div className={styles.metricSubtext}>Net realized revenue</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Average Order Value</span>
                    <BarChart3 size={14} color="var(--color-light-champagne)" />
                  </div>
                  <div className={styles.metricValue} style={{ color: "var(--color-champagne-gold)" }}>
                    {formatINR(salesData?.averageOrderValue || 0)}
                  </div>
                  <div className={styles.metricSubtext}>Across {salesData?.totalOrders || 0} completed orders</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Promotional Subsidies</span>
                    <AlertTriangle size={14} color="var(--color-muted-grey)" />
                  </div>
                  <div className={styles.metricValue}>{formatINR(salesData?.totalDiscountGiven || 0)}</div>
                  <div className={styles.metricSubtext}>Coupons & seasonal discounts</div>
                </div>
              </div>

              {/* Daily Trend Table */}
              <div className={styles.contentCard}>
                <h3 className={styles.sectionTitle}>
                  Daily Revenue Velocity Log ({period})
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Orders Handled</th>
                        <th style={{ textAlign: "right" }}>Daily Sales Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData?.dailyTrend && salesData.dailyTrend.length > 0 ? (
                        salesData.dailyTrend.map((d, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{d.date}</td>
                            <td style={{ color: "var(--text-secondary)" }}>{d.orders} orders</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--admin-accent)" }}>
                              {formatINR(d.sales)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                            No daily sales trends recorded for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORY & BRAND CONTRIBUTION */}
      {activeTab === "CATEGORIES" && (
        <div className={styles.contentCard}>
          <h3 className={styles.sectionTitle}>
            Garment Department & Collection Contribution
          </h3>

          {categoriesError ? (
            <ApiErrorCard message="Failed to load category performance." onRetry={() => refetchCategories()} />
          ) : isCategoriesLoading ? (
            <SkeletonCard />
          ) : categoriesData && categoriesData.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {categoriesData.map((cat) => (
                <div key={cat.categoryId} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cat.categoryName}</span>
                    <span style={{ color: "var(--admin-accent)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {formatINR(cat.revenue)} ({cat.percentageContribution.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    {cat.unitsSold} garments sold
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${Math.min(cat.percentageContribution, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "var(--space-6)", color: "var(--text-secondary)", textAlign: "center", fontSize: "12px" }}>
              Category sales distributions will generate as customer orders complete.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FULFILLMENT & COURIER SLAS */}
      {activeTab === "FULFILLMENT_SLA" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {slaError ? (
            <ApiErrorCard message="Failed to load fulfillment SLA report." onRetry={() => refetchSla()} />
          ) : isSlaLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Average Dispatch Time</span>
                    <Clock size={14} color="var(--color-champagne-gold)" />
                  </div>
                  <div className={styles.metricValue}>
                    {slaData?.averageDispatchHours || 0} <span style={{ fontSize: "14px" }}>hours</span>
                  </div>
                  <div className={styles.metricSubtext}>Order confirmation to handover</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>On-Time Delivery Rate</span>
                    <CheckCircle2 size={14} color="var(--status-success)" />
                  </div>
                  <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
                    {slaData?.onTimeDeliveryRate || 0}%
                  </div>
                  <div className={styles.metricSubtext}>Delivered within estimated SLA</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>
                    <span>Return to Origin (RTO)</span>
                    <ShieldAlert size={14} color="var(--status-danger)" />
                  </div>
                  <div className={styles.metricValue} style={{ color: "var(--status-danger)" }}>
                    {slaData?.rtoRate || 0}%
                  </div>
                  <div className={styles.metricSubtext}>Failed deliveries returned</div>
                </div>
              </div>

              {/* Carrier Scorecard */}
              <div className={styles.contentCard}>
                <h3 className={styles.sectionTitle}>
                  Courier Partner Performance Scorecard
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>Courier Partner</th>
                        <th>Parcels Handed Over</th>
                        <th>Delivered</th>
                        <th>RTO</th>
                        <th style={{ textAlign: "right" }}>Avg Delivery Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slaData?.courierPerformance && slaData.courierPerformance.length > 0 ? (
                        slaData.courierPerformance.map((c, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{c.courierName}</td>
                            <td>{c.totalHandedOver}</td>
                            <td style={{ color: "var(--status-success)", fontWeight: 600 }}>{c.deliveredCount}</td>
                            <td style={{ color: "var(--status-danger)", fontWeight: 600 }}>{c.rtoCount}</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                              {c.averageDeliveryDays.toFixed(1)} days
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                            Courier dispatch SLA benchmarks will populate as manifest tracking updates.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: INVENTORY VELOCITY & DEADSTOCK */}
      {activeTab === "INVENTORY_VELOCITY" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {velocityError ? (
            <ApiErrorCard message="Failed to load inventory velocity report." onRetry={() => refetchVelocity()} />
          ) : isVelocityLoading ? (
            <SkeletonCard />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
              {/* Fast Moving */}
              <div className={styles.contentCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} color="var(--status-success)" />
                  <h3 className={styles.sectionTitle}>
                    Fast-Moving Garments (High Turn)
                  </h3>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>Garment & SKU</th>
                        <th style={{ textAlign: "right" }}>30D Units</th>
                        <th style={{ textAlign: "right" }}>Days Stock Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {velocityData?.fastMovingItems && velocityData.fastMovingItems.length > 0 ? (
                        velocityData.fastMovingItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.productName}</div>
                              <div style={{ fontSize: "10px", color: "var(--admin-accent)", fontFamily: "var(--font-mono)" }}>
                                {item.sku}
                              </div>
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--status-success)" }}>
                              {item.unitsSoldLast30Days}
                            </td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: item.daysOfInventoryLeft < 7 ? "var(--status-danger)" : "var(--text-primary)" }}>
                              {item.daysOfInventoryLeft} days
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
                            Inventory sales velocity will record as purchases occur.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slow Moving / Deadstock */}
              <div className={styles.contentCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} color="var(--status-warning)" />
                  <h3 className={styles.sectionTitle}>
                    Slow-Moving / Deadstock Alerts
                  </h3>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>Garment & SKU</th>
                        <th style={{ textAlign: "right" }}>On Hand</th>
                        <th style={{ textAlign: "right" }}>Days Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {velocityData?.slowMovingItems && velocityData.slowMovingItems.length > 0 ? (
                        velocityData.slowMovingItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.productName}</div>
                              <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                                {item.sku}
                              </div>
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 600 }}>{item.stockOnHand}</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--status-warning)" }}>
                              {item.daysSinceLastSale} days
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
                            Zero deadstock alerts detected in the showroom.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
