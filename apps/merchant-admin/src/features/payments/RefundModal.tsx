import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Modal, Button } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { RefundPayload, RefundResponse } from "@bagodi/shared-types";
import { RotateCcw, AlertTriangle } from "lucide-react";

export interface RefundModalProps {
  transaction: {
    id: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    gatewayTransactionId?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ transaction, isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [refundAmount, setRefundAmount] = useState<number>(transaction?.amount || 0);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<"ORIGINAL_SOURCE" | "STORE_CREDIT">("ORIGINAL_SOURCE");
  const [formError, setFormError] = useState<string | null>(null);

  // Sync initial amount when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setRefundAmount(transaction.amount);
      setReason("");
      setFormError(null);
    }
  }, [transaction]);

  const refundMutation = useMutation({
    mutationFn: (payload: RefundPayload) =>
      defaultApiClient.post<RefundResponse>("/payments/refunds", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to process payment refund."
      );
    },
  });

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (refundAmount <= 0) {
      setFormError("Refund amount must be greater than zero.");
      return;
    }

    if (refundAmount > transaction.amount) {
      setFormError(`Refund amount cannot exceed transaction total of ${formatINR(transaction.amount)}.`);
      return;
    }

    if (reason.trim().length < 5) {
      setFormError("Please enter a valid reason for this refund (min 5 characters).");
      return;
    }

    const payload: RefundPayload = {
      orderId: transaction.orderId,
      amount: refundAmount,
      reason: reason.trim(),
      refundMethod,
    };

    refundMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue Refund — Order #${transaction.orderNumber}`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Transaction Summary */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
            fontSize: "12px",
          }}
        >
          <div>
            <div style={{ color: "var(--color-muted-grey)" }}>Customer</div>
            <div style={{ fontWeight: 600, color: "#FFFFFF" }}>{transaction.customerName}</div>
          </div>
          <div>
            <div style={{ color: "var(--color-muted-grey)" }}>Method</div>
            <div style={{ fontWeight: 600, color: "var(--color-champagne-gold)" }}>
              {transaction.paymentMethod}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--color-muted-grey)" }}>Gateway Reference</div>
            <div style={{ fontFamily: "var(--font-mono)", color: "#CCC", fontSize: "11px" }}>
              {transaction.gatewayTransactionId || transaction.id}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--color-muted-grey)" }}>Transaction Total</div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
              {formatINR(transaction.amount)}
            </div>
          </div>
        </div>

        {/* Refund Amount Input */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Refund Amount (INR) *
          </label>
          <input
            type="number"
            step="1"
            min="1"
            max={transaction.amount}
            value={refundAmount}
            onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              color: "#FFFFFF",
              fontSize: "14px",
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
            required
          />
          <span style={{ fontSize: "11px", color: "var(--color-muted-grey)", marginTop: "4px", display: "block" }}>
            Max eligible refund: {formatINR(transaction.amount)}
          </span>
        </div>

        {/* Refund Routing Method */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Disbursement Destination
          </label>
          <select
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value as any)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option value="ORIGINAL_SOURCE">
              Original Payment Source (Instant Gateway Reversal)
            </option>
            <option value="STORE_CREDIT">
              Bagodi Store Credit / Retail Gift Voucher
            </option>
          </select>
        </div>

        {/* Reason Textarea */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Audit Reason for Refund *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Garment out-of-stock after store inspection, customer requested cancellation, verified return passed..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
              resize: "vertical",
            }}
            required
          />
        </div>

        {/* Error Alert */}
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

        {/* Form Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={refundMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={refundMutation.isPending}
            leftIcon={<RotateCcw size={14} />}
          >
            Authorize & Disburse Refund
          </Button>
        </div>
      </form>
    </Modal>
  );
};
