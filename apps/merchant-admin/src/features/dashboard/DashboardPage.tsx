import React from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ApiErrorCard, SkeletonCard, EmptyState, PerspectiveCard3D } from "@bagodi/shared-components";

import { formatINR } from "@bagodi/utilities";

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
  const { data: metrics, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => defaultApiClient.get<DashboardMetrics>("/reports/dashboard-summary"),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>
          Store Overview • Bidar
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)" }}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} height="140px" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorCard
        title="Dashboard Metrics Unavailable"
        message="Could not connect to the backend analytics and reporting service. Verify that the backend aggregation API is running."
        onRetry={() => refetch()}
      />
    );
  }

  if (!metrics) {
    return (
      <EmptyState
        title="No Operational Metrics Recorded"
        description="As store transactions, inventory receipts, and orders are processed, live operational indicators will update here."
      />
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>
        Store Overview • Bidar
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)" }}>
        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Revenue</span>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0" }}>
              {formatINR(metrics.totalSales)}
            </h2>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--status-info)" }}>Aggregated from payments</span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Orders</span>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0" }}>
              {metrics.totalOrders}
            </h2>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--status-warning)" }}>{metrics.pendingOrders} pending confirmation</span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>COD Outstanding</span>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0" }}>
              {formatINR(metrics.codOutstanding)}
            </h2>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Pending delivery collection</span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Stock On Hand</span>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0" }}>
              {metrics.totalStockUnits} units
            </h2>
            <span style={{ fontSize: "var(--text-xs)", color: metrics.lowStockCount > 0 ? "var(--status-danger)" : "var(--status-success)" }}>
              {metrics.lowStockCount} low stock alerts
            </span>
          </div>
        </PerspectiveCard3D>
      </div>
    </div>
  );
};

