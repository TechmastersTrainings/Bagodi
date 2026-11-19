import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { StockReconciliationItem, PaginatedResponse } from "@bagodi/shared-types";
import {
  DataTable,
  Column,
  StatusBadge,
  Button,
  Modal,
  TextInput,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { RefreshCw } from "lucide-react";

export const StockReconciliationTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAuditItem, setSelectedAuditItem] = useState<StockReconciliationItem | null>(null);
  const [countedCount, setCountedCount] = useState<number>(0);
  const [justification, setJustification] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<StockReconciliationItem>>({
    queryKey: ["inventory-reconciliation"],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<StockReconciliationItem>>("/inventory/reconciliation"),
  });

  const reconcileMutation = useMutation({
    mutationFn: (payload: { inventoryId: string; countedQuantity: number; reason: string }) =>
      defaultApiClient.post("/inventory/reconcile", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      setSelectedAuditItem(null);
      setJustification("");
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Reconciliation update failed.");
    },
  });

  const columns: Column<StockReconciliationItem>[] = [
    { key: "productName", header: "Garment" },
    { key: "sku", header: "SKU" },
    { key: "barcode", header: "Barcode" },
    { key: "systemQuantity", header: "System Ledger", render: (r) => `${r.systemQuantity} Units` },
    { key: "countedQuantity", header: "Physical Count", render: (r) => <strong>{r.countedQuantity} Units</strong> },
    {
      key: "variance",
      header: "Variance",
      render: (r) => {
        if (r.variance === 0) return <StatusBadge variant="success" label="0 (Matched)" />;
        const isDeficit = r.variance < 0;
        return (
          <StatusBadge
            variant={isDeficit ? "danger" : "warning"}
            label={`${r.variance > 0 ? `+${r.variance}` : r.variance} Units`}
          />
        );
      },
    },
    {
      key: "status",
      header: "Audit Status",
      render: (r) => (
        <StatusBadge
          variant={r.status === "MATCHED" ? "success" : r.status === "RECONCILED" ? "info" : "warning"}
          label={r.status.replace(/_/g, " ")}
        />
      ),
    },
    {
      key: "actions",
      header: "Reconcile Action",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          disabled={r.status === "MATCHED"}
          onClick={() => {
            setSelectedAuditItem(r);
            setCountedCount(r.countedQuantity);
          }}
        >
          {r.status === "RECONCILED" ? "View Audit" : "Reconcile"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: "bold" }}>Store Physical Stock Reconciliation</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Compare physical store floor counts with system ledger records to identify and reconcile shrinkage or surpluses
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Sync Ledger
        </Button>
      </div>

      {error ? (
        <ApiErrorCard message="Failed to load stock audit records." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyTitle="No Reconciliation Audits Pending"
          emptyDescription="All store physical stock counts match the authoritative ledger."
        />
      )}

      {/* Reconciliation Form Modal */}
      {selectedAuditItem && (
        <Modal
          isOpen={!!selectedAuditItem}
          onClose={() => setSelectedAuditItem(null)}
          title={`Reconcile Stock: ${selectedAuditItem.productName} (${selectedAuditItem.sku})`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {apiError && <ApiErrorCard message={apiError} />}

            <div style={{ padding: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>System Expected Quantity:</span>
                <strong>{selectedAuditItem.systemQuantity} Units</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Calculated Variance:</span>
                <strong style={{ color: countedCount - selectedAuditItem.systemQuantity < 0 ? "var(--status-danger)" : "var(--status-success)" }}>
                  {countedCount - selectedAuditItem.systemQuantity} Units
                </strong>
              </div>
            </div>

            <TextInput
              label="Verified Physical Count Units *"
              type="number"
              min={0}
              value={countedCount}
              onChange={(e) => setCountedCount(parseInt(e.target.value, 10) || 0)}
              isRequired
            />

            <TextInput
              label="Auditor Justification / Investigation Note *"
              placeholder="e.g. Physical inventory count verified, shrinkage written off"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              isRequired
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              <Button size="sm" variant="outline" onClick={() => setSelectedAuditItem(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!justification.trim()}
                isLoading={reconcileMutation.isPending}
                onClick={() => {
                  reconcileMutation.mutate({
                    inventoryId: selectedAuditItem.inventoryId,
                    countedQuantity: countedCount,
                    reason: justification,
                  });
                }}
              >
                Approve & Post Ledger Reconciliation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

