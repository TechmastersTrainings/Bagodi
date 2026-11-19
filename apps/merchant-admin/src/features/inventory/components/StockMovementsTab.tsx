import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { StockMovement, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import { RefreshCw } from "lucide-react";

export const StockMovementsTab: React.FC = () => {
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<StockMovement>>({
    queryKey: ["inventory-movements", page],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<StockMovement>>("/inventory/movements", {
        params: { page, pageSize: 15 },
      }),
  });

  const columns: Column<StockMovement>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (r) => formatDateTime(r.timestamp),
    },
    { key: "productName", header: "Garment" },
    {
      key: "sku",
      header: "SKU / Barcode",
      render: (r) => (
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{r.sku}</span>
          <p style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{r.barcode}</p>
        </div>
      ),
    },
    {
      key: "operationType",
      header: "Operation",
      render: (r) => {
        const isPositive = r.quantityChange > 0;
        return (
          <StatusBadge
            variant={isPositive ? "success" : "warning"}
            label={r.operationType.replace(/_/g, " ")}
          />
        );
      },
    },
    {
      key: "quantityChange",
      header: "Quantity Delta",
      render: (r) => (
        <strong style={{ color: r.quantityChange > 0 ? "var(--status-success)" : "var(--status-danger)" }}>
          {r.quantityChange > 0 ? `+${r.quantityChange}` : r.quantityChange} Units
        </strong>
      ),
    },
    {
      key: "newAvailableQuantity",
      header: "Available After",
      render: (r) => `${r.newAvailableQuantity} Units`,
    },
    {
      key: "reason",
      header: "Audit Reason",
      render: (r) => (
        <div>
          <span>{r.reason}</span>
          {r.referenceDocument && (
            <p style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Ref: {r.referenceDocument}</p>
          )}
        </div>
      ),
    },
    { key: "operatorName", header: "Auditor / Operator" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: "bold" }}>Immutable Stock Movement History</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Traceable audit trail of every stock-in, stock-out, receipt, and adjustment
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Refresh Ledger
        </Button>
      </div>

      {error ? (
        <ApiErrorCard message="Failed to load stock movements history." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Stock Movements Recorded"
          emptyDescription="Transactions initiated through barcode scans, stock receipts, and sales will be recorded here."
        />
      )}
    </div>
  );
};

