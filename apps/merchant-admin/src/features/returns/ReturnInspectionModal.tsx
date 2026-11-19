import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ReturnRequest, InspectReturnPayload } from "@bagodi/shared-types";
import { Modal, Button, StatusBadge } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import {
  RotateCcw,
  AlertTriangle,
  Package,
  ShieldCheck,
} from "lucide-react";

export interface ReturnInspectionModalProps {
  returnRequest: ReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  returnRequest,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Inspection Checklist State
  const [tagsIntact, setTagsIntact] = useState(false);
  const [unwornCondition, setUnwornCondition] = useState(false);
  const [fabricFlawless, setFabricFlawless] = useState(false);

  // Resolution Form State
  const [conditionStatus, setConditionStatus] = useState<"PASSED" | "FAILED">("PASSED");
  const [resolutionAction, setResolutionAction] = useState<
    "APPROVE_REFUND" | "DISPATCH_EXCHANGE" | "REJECT_RETURN"
  >("APPROVE_REFUND");
  const [replacementSku, setReplacementSku] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Mutation
  const inspectMutation = useMutation({
    mutationFn: (payload: InspectReturnPayload) =>
      defaultApiClient.patch<ReturnRequest>(`/returns/${returnRequest?.id}/inspect`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to submit return inspection."
      );
    },
  });

  if (!returnRequest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (inspectionNotes.trim().length < 5) {
      setFormError("Please enter detailed inspection notes (minimum 5 characters).");
      return;
    }

    if (conditionStatus === "PASSED" && (!tagsIntact || !unwornCondition || !fabricFlawless)) {
      setFormError(
        "To mark condition as PASSED, all 3 retail verification standards must be verified."
      );
      return;
    }

    if (resolutionAction === "DISPATCH_EXCHANGE" && !replacementSku.trim()) {
      setFormError("Please provide the replacement SKU/Variant ID for dispatch.");
      return;
    }

    const payload: InspectReturnPayload = {
      conditionStatus,
      inspectionNotes: inspectionNotes.trim(),
      resolutionAction,
      replacementVariantId:
        resolutionAction === "DISPATCH_EXCHANGE" ? replacementSku.trim() : undefined,
    };

    inspectMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Return Inspection — Order #${returnRequest.orderNumber}`}
      maxWidth="760px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Request Header Summary */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(197, 161, 91, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase" }}>
              Request Type
            </div>
            <div style={{ fontWeight: 600, color: "#FFFFFF", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <RotateCcw size={14} color="var(--color-champagne-gold)" />
              {returnRequest.isExchange ? "Product Exchange" : "Return & Refund"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase" }}>
              Customer Reason
            </div>
            <div style={{ fontWeight: 500, color: "var(--color-light-champagne)", marginTop: "2px" }}>
              {returnRequest.reason}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase" }}>
              Requested On
            </div>
            <div style={{ fontSize: "12px", color: "#FFFFFF", marginTop: "2px" }}>
              {formatDateTime(returnRequest.createdAt)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase" }}>
              Current Status
            </div>
            <div style={{ marginTop: "2px" }}>
              <StatusBadge variant="warning" label={returnRequest.status.replace(/_/g, " ")} />
            </div>
          </div>
        </div>

        {/* Garment Items Received */}
        <div>
          <h4
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-base)",
              color: "#FFFFFF",
              marginBottom: "var(--space-3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Package size={16} color="var(--color-champagne-gold)" /> Items Returned for Inspection
          </h4>
          <div
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            {returnRequest.items && returnRequest.items.length > 0 ? (
              returnRequest.items.map((item, idx) => (
                <div
                  key={item.orderItemId || idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-3) var(--space-4)",
                    background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                    borderBottom:
                      idx < returnRequest.items.length - 1
                        ? "1px solid rgba(255, 255, 255, 0.06)"
                        : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "13px" }}>
                      {item.productName || "Bagodi Luxury Apparel"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", marginTop: "2px" }}>
                      SKU: {item.sku || item.variantId} • Size: {item.size || "Standard"} • Qty: {item.quantity}
                    </div>
                  </div>
                  {item.unitPrice && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--color-champagne-gold)",
                      }}
                    >
                      {formatINR(item.unitPrice * item.quantity)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "var(--space-4)", color: "var(--color-muted-grey)", fontSize: "12px" }}>
                Single garment return item under Order #{returnRequest.orderNumber}
              </div>
            )}
          </div>
        </div>

        {/* Verification Checklist */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div
            style={{
              background: "#161817",
              border: "1px solid rgba(197, 161, 91, 0.25)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-champagne-gold)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "var(--space-3)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck size={16} /> Physical Quality Checklist (Bagodi Luxury Standards)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#E0E0E0", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={tagsIntact}
                  onChange={(e) => setTagsIntact(e.target.checked)}
                  style={{ accentColor: "var(--color-champagne-gold)", width: 16, height: 16 }}
                />
                <span>Brand security tags, authenticity barcodes, and labels are intact and untampered.</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#E0E0E0", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={unwornCondition}
                  onChange={(e) => setUnwornCondition(e.target.checked)}
                  style={{ accentColor: "var(--color-champagne-gold)", width: 16, height: 16 }}
                />
                <span>Garment is unworn, unwashed, unaltered with original showroom folds and pleating.</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#E0E0E0", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={fabricFlawless}
                  onChange={(e) => setFabricFlawless(e.target.checked)}
                  style={{ accentColor: "var(--color-champagne-gold)", width: 16, height: 16 }}
                />
                <span>Fabric surface is flawless (zero snagging, stains, makeup marks, or perfume odors).</span>
              </label>
            </div>
          </div>

          {/* Condition Status & Resolution Action */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Inspection Verdict
              </label>
              <select
                value={conditionStatus}
                onChange={(e) => {
                  const val = e.target.value as "PASSED" | "FAILED";
                  setConditionStatus(val);
                  if (val === "FAILED") {
                    setResolutionAction("REJECT_RETURN");
                  } else {
                    setResolutionAction(returnRequest.isExchange ? "DISPATCH_EXCHANGE" : "APPROVE_REFUND");
                  }
                }}
                style={{
                  width: "100%",
                  background: "#121413",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="PASSED">PASSED — Meets Showroom Resell Standard</option>
                <option value="FAILED">FAILED — Does Not Meet Resell Standard</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Resolution Action
              </label>
              <select
                value={resolutionAction}
                onChange={(e) => setResolutionAction(e.target.value as any)}
                style={{
                  width: "100%",
                  background: "#121413",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {conditionStatus === "PASSED" ? (
                  <>
                    <option value="APPROVE_REFUND">Approve & Issue Source Refund</option>
                    <option value="DISPATCH_EXCHANGE">Dispatch Replacement Garment</option>
                  </>
                ) : (
                  <option value="REJECT_RETURN">Reject Return & Ship Back to Customer</option>
                )}
              </select>
            </div>
          </div>

          {/* Replacement SKU Input if Exchange */}
          {resolutionAction === "DISPATCH_EXCHANGE" && (
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-champagne-gold)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Exchange Replacement SKU / Barcode *
              </label>
              <input
                type="text"
                placeholder="Enter replacement SKU or Scan Barcode (e.g. RAY-SUIT-42R)"
                value={replacementSku}
                onChange={(e) => setReplacementSku(e.target.value)}
                style={{
                  width: "100%",
                  background: "#121413",
                  border: "1px solid var(--color-champagne-gold)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                }}
                required
              />
            </div>
          )}

          {/* Inspection Notes */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Quality Inspector Notes *
            </label>
            <textarea
              rows={3}
              placeholder="Record condition notes, barcode verification, packaging integrity..."
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
              }}
              required
            />
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div
              style={{
                background: "rgba(179, 58, 58, 0.15)",
                border: "1px solid var(--status-danger)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                color: "#FF9E9E",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={15} />
              {formError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" type="button" onClick={onClose} disabled={inspectMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={inspectMutation.isPending}
              variant={conditionStatus === "PASSED" ? "primary" : "secondary"}
            >
              {conditionStatus === "PASSED" ? "Confirm & Finalize Inspection" : "Reject Return Request"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
