import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ReturnRequest } from "@bagodi/shared-types";
import { Modal, Button, ApiErrorCard } from "@bagodi/shared-components";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export interface ReturnDecisionModalProps {
  returnRequest: ReturnRequest | null;
  mode: "ACCEPT" | "REJECT";
  isOpen: boolean;
  onClose: () => void;
  onAcceptedSuccess?: (req: ReturnRequest) => void;
}

export const ReturnDecisionModal: React.FC<ReturnDecisionModalProps> = ({
  returnRequest,
  mode,
  isOpen,
  onClose,
  onAcceptedSuccess,
}) => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState<string>("");
  const [resolutionAction, setResolutionAction] = useState<"REFUND" | "EXCHANGE">("REFUND");
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!returnRequest || !isOpen) return null;

  const isAccept = mode === "ACCEPT";

  const decisionMutation = useMutation({
    mutationFn: (payload: any) =>
      defaultApiClient.patch(`/returns/${returnRequest.id}/decision`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns-list"] });
      setSuccessMsg(
        isAccept
          ? `Return for Order #${returnRequest.orderNumber} accepted. Return delivery can now be scheduled.`
          : `Return for Order #${returnRequest.orderNumber} rejected.`
      );
      setTimeout(() => {
        onClose();
        if (isAccept && onAcceptedSuccess) {
          onAcceptedSuccess(returnRequest);
        }
      }, 900);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to record return decision.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccept && !note.trim()) {
      setApiError("Please provide a rejection note explaining the decision.");
      return;
    }
    setApiError(null);
    decisionMutation.mutate({
      status: isAccept ? "APPROVED" : "REJECTED",
      merchantNote: note.trim() || (isAccept ? "Garment condition accepted for return" : "Return rejected"),
      resolutionAction: isAccept ? resolutionAction : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAccept ? `Accept Customer Return: Order #${returnRequest.orderNumber}` : `Reject Return: Order #${returnRequest.orderNumber}`}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {apiError && <ApiErrorCard message={apiError} />}

        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: isAccept ? "#E8F5E9" : "#FFF5F5",
              border: `1px solid ${isAccept ? "#A5D6A7" : "#FFCDD2"}`,
              borderRadius: 8,
              color: isAccept ? "#1B5E20" : "#C62828",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isAccept ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {successMsg}
          </div>
        )}

        {/* Customer Issue Context Box */}
        <div
          style={{
            padding: "12px 14px",
            background: "#F8F7F5",
            borderRadius: 8,
            border: "1px solid #E5E1D8",
          }}
        >
          <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase" }}>
            Customer Stated Issue
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#111412", marginTop: 2 }}>
            {returnRequest.customerName || "Customer"} • {returnRequest.reason}
          </div>
          <div style={{ fontSize: "11px", color: "#4A4E4B", marginTop: 4 }}>
            Garment: {returnRequest.items?.[0]?.productName || "Couture Garment"} (Size: {returnRequest.items?.[0]?.size || "Standard"})
          </div>
        </div>

        {isAccept ? (
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 6 }}>
              Resolution Workflow *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                onClick={() => setResolutionAction("REFUND")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${resolutionAction === "REFUND" ? "#2E7D32" : "#E5E1D8"}`,
                  background: resolutionAction === "REFUND" ? "#E8F5E9" : "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: "12px", color: resolutionAction === "REFUND" ? "#1B5E20" : "#111412", display: "block" }}>
                  Approve Refund
                </strong>
                <span style={{ fontSize: "10px", color: "#7A807C" }}>
                  Issue bank / UPI refund upon doorstep quality inspection
                </span>
              </div>

              <div
                onClick={() => setResolutionAction("EXCHANGE")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${resolutionAction === "EXCHANGE" ? "#C5A15B" : "#E5E1D8"}`,
                  background: resolutionAction === "EXCHANGE" ? "#FFF9EE" : "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: "12px", color: resolutionAction === "EXCHANGE" ? "#B08A3E" : "#111412", display: "block" }}>
                  Size / Fabric Exchange
                </strong>
                <span style={{ fontSize: "10px", color: "#7A807C" }}>
                  Dispatch replacement unit to customer
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "10px 12px",
              background: "#FFF5F5",
              border: "1px solid #FFCDD2",
              borderRadius: 8,
              color: "#C62828",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            Rejecting this return will notify the customer with the explanation below.
          </div>
        )}

        {/* Note Field */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
            {isAccept ? "Merchant Assessment Note (Optional)" : "Rejection Reason & Explanation *"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isAccept
                ? "e.g. Issue verified against customer uploaded photos. Approved for reverse pickup."
                : "e.g. Garment tags have been removed or request is outside the 7-day return policy."
            }
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #E5E1D8",
              fontFamily: "inherit",
              fontSize: "12px",
              color: "#111412",
              background: "#FFFFFF",
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #EBE7DF",
            paddingTop: 16,
          }}
        >
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            isLoading={decisionMutation.isPending}
            style={{
              background: isAccept ? "#2E7D32" : "#E31B23",
              color: "#FFFFFF",
            }}
          >
            {isAccept ? "Confirm & Accept Return" : "Confirm Rejection"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

