import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { PurchaseOrder, PaginatedResponse } from "@bagodi/shared-types";
import {
  DataTable,
  Column,
  StatusBadge,
  Button,
  Modal,
  TextInput,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { formatINR, formatDate } from "@bagodi/utilities";
import { PackagePlus, RefreshCw } from "lucide-react";

export const PurchaseOrdersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [receivedCounts, setReceivedCounts] = useState<Record<string, number>>({});
  const [receivingNotes, setReceivingNotes] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: ["admin-purchase-orders"],
    queryFn: () => defaultApiClient.get<PaginatedResponse<PurchaseOrder>>("/inventory/purchase-orders"),
  });

  const receivePoMutation = useMutation({
    mutationFn: (payload: { poId: string; receivedItems: Array<{ itemId: string; quantityReceived: number }>; notes?: string }) =>
      defaultApiClient.post("/inventory/purchase-orders/receive", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      setSelectedPo(null);
      setReceivedCounts({});
      setReceivingNotes("");
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to record PO receipt.");
    },
  });

  const handleOpenReceiveModal = (po: PurchaseOrder) => {
    setSelectedPo(po);
    const initialCounts: Record<string, number> = {};
    po.items.forEach((item) => {
      initialCounts[item.id] = Math.max(0, item.orderedQuantity - item.receivedQuantity);
    });
    setReceivedCounts(initialCounts);
  };

  const columns: Column<PurchaseOrder>[] = [
    { key: "poNumber", header: "PO Number", render: (r) => <strong style={{ fontFamily: "var(--font-mono)" }}>{r.poNumber}</strong> },
    { key: "supplierName", header: "Supplier / Manufacturer" },
    { key: "orderDate", header: "Order Date", render: (r) => formatDate(r.orderDate) },
    { key: "expectedDeliveryDate", header: "Expected", render: (r) => formatDate(r.expectedDeliveryDate) },
    { key: "totalCost", header: "PO Total Value", render: (r) => formatINR(r.totalCost) },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const variantMap = {
          COMPLETED: "success" as const,
          PARTIALLY_RECEIVED: "warning" as const,
          ORDERED: "info" as const,
          DRAFT: "neutral" as const,
          CANCELLED: "danger" as const,
        };
        return <StatusBadge variant={variantMap[r.status] || "neutral"} label={r.status.replace(/_/g, " ")} />;
      },
    },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          disabled={r.status === "COMPLETED" || r.status === "CANCELLED"}
          leftIcon={<PackagePlus size={14} />}
          onClick={() => handleOpenReceiveModal(r)}
        >
          Receive Goods
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: "bold" }}>Purchase Orders & Stock Receipts</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Manage supplier purchase orders and verify incoming batches into active store inventory
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Sync POs
        </Button>
      </div>

      {error ? (
        <ApiErrorCard message="Failed to load purchase orders." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyTitle="No Purchase Orders"
          emptyDescription="Vendor purchase orders generated for garment replenishment will be listed here."
        />
      )}

      {/* PO Receiving Modal */}
      {selectedPo && (
        <Modal
          isOpen={!!selectedPo}
          onClose={() => setSelectedPo(null)}
          title={`Receive Stock from PO: ${selectedPo.poNumber} (${selectedPo.supplierName})`}
          maxWidth="700px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {apiError && <ApiErrorCard message={apiError} />}

            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
              Enter the actual units verified by the receiving dock. Items will immediately be credited into available on-hand stock.
            </p>

            <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {selectedPo.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "var(--space-3)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "bold" }}>{item.productName}</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Size: {item.size} • Color: {item.colorName} • SKU: {item.sku}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: 2 }}>
                      Ordered: {item.orderedQuantity} | Previously Received: {item.receivedQuantity}
                    </p>
                  </div>

                  <div style={{ width: "120px" }}>
                    <TextInput
                      type="number"
                      min={0}
                      label="Receiving"
                      value={receivedCounts[item.id] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setReceivedCounts((prev) => ({ ...prev, [item.id]: val }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <TextInput
              label="Receiving Dock Notes / Delivery Challan Ref"
              placeholder="e.g. Challan #9821, all garment seals verified"
              value={receivingNotes}
              onChange={(e) => setReceivingNotes(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              <Button size="sm" variant="outline" onClick={() => setSelectedPo(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                isLoading={receivePoMutation.isPending}
                onClick={() => {
                  const itemsPayload = Object.entries(receivedCounts)
                    .filter(([_, qty]) => qty > 0)
                    .map(([itemId, qty]) => ({ itemId, quantityReceived: qty }));

                  receivePoMutation.mutate({
                    poId: selectedPo.id,
                    receivedItems: itemsPayload,
                    notes: receivingNotes,
                  });
                }}
              >
                Confirm Receipt & Update Inventory
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

