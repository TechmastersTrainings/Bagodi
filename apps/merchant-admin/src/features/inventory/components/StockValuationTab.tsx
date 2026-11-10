import React from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { StockValuationSummary } from "@bagodi/shared-types";
import { PerspectiveCard3D, SkeletonCard, EmptyState, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { RefreshCw } from "lucide-react";

export const StockValuationTab: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery<StockValuationSummary>({
    queryKey: ["inventory-valuation"],
    queryFn: () => defaultApiClient.get<StockValuationSummary>("/inventory/valuation"),
  });

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)" }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} height="140px" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorCard
        title="Stock Valuation Unavailable"
        message="Could not connect to the inventory valuation engine. Please verify the backend reporting service."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No Valuation Data"
        description="Inventory financial indicators will populate when variants are added to stock."
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: "bold" }}>Financial Stock Valuation & Metrics</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Real-time asset valuation of retail ready-made garments and stock distribution
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Recalculate
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Total Retail Asset Value
            </span>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0", color: "var(--accent-primary)" }}>
              {formatINR(data.totalRetailValuation)}
            </h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Across all sellable variants</span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Total Units On Hand
            </span>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0" }}>
              {data.totalUnitsOnHand} Units
            </h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--stock-reserved)" }}>
              {data.totalUnitsReserved} reserved in carts & orders
            </span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Low Stock Alerts
            </span>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0", color: "var(--status-warning)" }}>
              {data.lowStockItemsCount} SKUs
            </h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Nearing reorder threshold</span>
          </div>
        </PerspectiveCard3D>

        <PerspectiveCard3D maxTiltDeg={4}>
          <div style={{ padding: "var(--space-6)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Out-of-Stock SKUs
            </span>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "bold", margin: "var(--space-2) 0", color: "var(--status-danger)" }}>
              {data.outOfStockItemsCount} SKUs
            </h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>0 units available to sell</span>
          </div>
        </PerspectiveCard3D>
      </div>

      {/* Brand & Category Valuation Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        <div style={{ padding: "var(--space-6)", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)" }}>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>Valuation by Brand / Label</h4>
          {Object.entries(data.valuationByBrand || {}).map(([brand, val]) => (
            <div key={brand} style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "var(--text-xs)" }}>
              <span>{brand}</span>
              <strong>{formatINR(val)}</strong>
            </div>
          ))}
        </div>

        <div style={{ padding: "var(--space-6)", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)" }}>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>Valuation by Category</h4>
          {Object.entries(data.valuationByCategory || {}).map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "var(--text-xs)" }}>
              <span>{cat}</span>
              <strong>{formatINR(val)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

