import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./BarcodeWorkflowHUD.module.css";
import { defaultApiClient } from "@bagodi/api-client";
import {
  BarcodeLookupResult,
  InventoryOperationType,
  InventoryAdjustmentPayload,
} from "@bagodi/shared-types";
import {
  Modal,
  Button,
  TextInput,
  StatusBadge,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { useBarcodeScanner } from "@bagodi/utilities";
import {
  Barcode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export interface BarcodeWorkflowHUDProps {
  isOpen: boolean;
  onClose: () => void;
  initialBarcode?: string;
}

export const BarcodeWorkflowHUD: React.FC<BarcodeWorkflowHUDProps> = ({
  isOpen,
  onClose,
  initialBarcode = "",
}) => {
  const queryClient = useQueryClient();

  const [barcodeInput, setBarcodeInput] = useState<string>(initialBarcode);
  const [activeBarcode, setActiveBarcode] = useState<string>(initialBarcode);
  const [selectedOperation, setSelectedOperation] = useState<InventoryOperationType>("STOCK_RECEIPT");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [referenceDoc, setReferenceDoc] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // USB / Bluetooth scanner hardware listener
  useBarcodeScanner({
    enabled: isOpen,
    onScan: (scannedCode) => {
      setBarcodeInput(scannedCode);
      setActiveBarcode(scannedCode);
      setIsConfirming(false);
      setSuccessFeedback(null);
      setApiError(null);
    },
  });

  useEffect(() => {
    if (initialBarcode) {
      setBarcodeInput(initialBarcode);
      setActiveBarcode(initialBarcode);
    }
  }, [initialBarcode]);

  // Query Backend Barcode Identification
  const {
    data: lookupResult,
    isLoading: isIdentifying,
    error: lookupError,
    refetch: retryLookup,
  } = useQuery<BarcodeLookupResult>({
    queryKey: ["barcode-lookup", activeBarcode],
    queryFn: () =>
      defaultApiClient.get<BarcodeLookupResult>(`/inventory/barcode/${encodeURIComponent(activeBarcode)}`),
    enabled: !!activeBarcode && isOpen,
    retry: 0,
  });

  // Mutate Stock Operation via FastAPI Backend
  const submitOperationMutation = useMutation({
    mutationFn: (payload: InventoryAdjustmentPayload) =>
      defaultApiClient.post("/inventory/adjust", payload),
    onSuccess: (res: any) => {
      // Invalidate relevant queries to refresh authoritative stock immediately
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["barcode-lookup", activeBarcode] });

      setSuccessFeedback(
        `Successfully logged ${selectedOperation} of ${quantity} unit(s). Updated live stock: ${res?.updatedItem?.availableQuantity ?? "Updated"}.`
      );
      setIsConfirming(false);
      setQuantity(1);
      setReason("");
      setReferenceDoc("");
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Inventory transaction rejected by backend.");
      setIsConfirming(false);
    },
  });

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      setActiveBarcode(barcodeInput.trim());
      setIsConfirming(false);
      setSuccessFeedback(null);
      setApiError(null);
    }
  };

  const handleExecuteOperation = () => {
    if (!lookupResult?.inventory && !lookupResult?.variant) return;

    const payload: InventoryAdjustmentPayload = {
      inventoryId: lookupResult.inventory?.id,
      variantId: lookupResult.variant?.id || lookupResult.inventory!.variantId,
      operationType: selectedOperation,
      quantityChange:
        selectedOperation === "STOCK_OUT" || selectedOperation === "DAMAGE_WRITE_OFF"
          ? -Math.abs(quantity)
          : Math.abs(quantity),
      reason,
      referenceDocument: referenceDoc || undefined,
    };

    submitOperationMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Barcode Scanner Workflow Cockpit" maxWidth="680px">
      <div className={styles.hudModalRoot}>
        {/* 1. Hardware Scanner Viewport & Laser Sweep */}
        <div className={styles.scannerViewport}>
          <div className={styles.laserSweep} />
          <div className={styles.scannerOverlayText}>
            <Barcode size={32} style={{ color: "var(--admin-accent)" }} />
            <span>Ready for USB / Bluetooth Laser Reader or Manual Entry</span>
          </div>
        </div>

        {/* Input Barcode Form */}
        <form onSubmit={handleManualSearch} style={{ display: "flex", gap: "var(--space-2)" }}>
          <TextInput
            placeholder="Scan barcode or enter manually (e.g. 8901234567890)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            leftIcon={<Barcode size={18} />}
          />
          <Button type="submit" size="md" variant="secondary">
            Identify
          </Button>
        </form>

        {apiError && <ApiErrorCard message={apiError} />}
        {successFeedback && (
          <div style={{ padding: "var(--space-3)", background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)", borderRadius: "var(--radius-md)", color: "var(--status-success)", fontSize: "var(--text-xs)", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{successFeedback}</span>
          </div>
        )}

        {/* 2. IDENTIFY VARIANT STATE */}
        {isIdentifying && (
          <div style={{ textAlign: "center", padding: "var(--space-4)", color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
            <RefreshCw size={18} className="animate-spin" style={{ display: "inline-block", marginRight: 8 }} />
            Resolving variant from backend inventory engine...
          </div>
        )}

        {lookupError && (
          <ApiErrorCard
            title="Barcode Lookup Failed"
            message={`No inventory record matches barcode "${activeBarcode}". Ensure barcode is assigned to a product variant.`}
            onRetry={retryLookup}
          />
        )}

        {/* 3. DISPLAY STOCK & VARIANT METADATA */}
        {lookupResult?.found && lookupResult.inventory && (
          <div className={styles.variantIdentifiedCard}>
            <div className={styles.variantHeader}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)" }}>
                  Identified Apparel Variant
                </span>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: "bold", color: "var(--text-primary)" }}>
                  {lookupResult.productName}
                </h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                  Size: <strong>{lookupResult.variant?.size}</strong> • Color: <strong>{lookupResult.variant?.colorName}</strong> • SKU: <span style={{ fontFamily: "var(--font-mono)" }}>{lookupResult.variant?.sku}</span>
                </p>
              </div>
              <StatusBadge
                variant={lookupResult.inventory.availableQuantity > 0 ? "success" : "danger"}
                label={lookupResult.inventory.stockStatus.replace(/_/g, " ")}
              />
            </div>

            {/* Authoritative Stock Breakdown (Distinguishes On-Hand, Reserved, Available) */}
            <div className={styles.stockBreakdownGrid}>
              <div className={styles.stockMetricBox}>
                <span className={styles.stockMetricLabel}>On-Hand Stock</span>
                <span className={styles.stockMetricValue}>{lookupResult.inventory.onHandQuantity}</span>
              </div>
              <div className={styles.stockMetricBox}>
                <span className={styles.stockMetricLabel}>Reserved Stock</span>
                <span className={styles.stockMetricValue} style={{ color: "var(--stock-reserved)" }}>
                  {lookupResult.inventory.reservedQuantity}
                </span>
              </div>
              <div className={styles.stockMetricBox}>
                <span className={styles.stockMetricLabel}>Available to Sell</span>
                <span className={styles.stockMetricValue} style={{ color: "var(--stock-instock)" }}>
                  {lookupResult.inventory.availableQuantity}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. SELECT OPERATION & ENTER QUANTITY */}
        {lookupResult?.found && lookupResult.inventory && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className={styles.operationSelector}>
              <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Select Stock Operation
              </label>
              <div className={styles.operationPills}>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "STOCK_RECEIPT" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("STOCK_RECEIPT")}
                >
                  Stock Receipt (+)
                </button>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "STOCK_IN" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("STOCK_IN")}
                >
                  Stock In (+)
                </button>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "STOCK_ADJUSTMENT" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("STOCK_ADJUSTMENT")}
                >
                  Adjustment (±)
                </button>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "STOCK_OUT" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("STOCK_OUT")}
                >
                  Stock Out (-)
                </button>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "DAMAGE_WRITE_OFF" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("DAMAGE_WRITE_OFF")}
                >
                  Damage Write-Off (-)
                </button>
                <button
                  type="button"
                  className={`${styles.opPill} ${selectedOperation === "RETURN_INSPECTION_RESTOCK" ? styles.opPillActive : ""}`}
                  onClick={() => setSelectedOperation("RETURN_INSPECTION_RESTOCK")}
                >
                  Restock Return (+)
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: "var(--space-3)" }}>
              <TextInput
                label="Units"
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <TextInput
                label="Mandatory Reason *"
                placeholder="e.g. PO Receipt, Inspection Pass"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                isRequired
              />
              <TextInput
                label="Ref Document #"
                placeholder="e.g. PO-8902, RETURN-12"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
              />
            </div>

            {/* 5. CONFIRMATION STAGE */}
            {!isConfirming ? (
              <Button
                variant="primary"
                size="md"
                disabled={!reason.trim() || quantity <= 0}
                onClick={() => setIsConfirming(true)}
                rightIcon={<ArrowRight size={16} />}
              >
                Review & Confirm Transaction
              </Button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div className={styles.confirmationBanner}>
                  <AlertTriangle size={16} />
                  <span>
                    Confirm {selectedOperation.replace(/_/g, " ")} of <strong>{quantity} units</strong> for SKU <strong>{lookupResult.variant?.sku}</strong>.
                  </span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
                  <Button variant="outline" size="sm" onClick={() => setIsConfirming(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={submitOperationMutation.isPending}
                    onClick={handleExecuteOperation}
                  >
                    Authorize & Post to Ledger
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

