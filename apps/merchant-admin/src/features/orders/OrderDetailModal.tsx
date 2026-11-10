import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order, OrderStatus, UpdateOrderStatusPayload } from "@bagodi/shared-types";
import { Modal, Button, StatusBadge } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import {
  Phone,
  Mail,
  Printer,
  AlertTriangle,
} from "lucide-react";

export interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPackingSlip: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenPackingSlip,
}) => {
  const queryClient = useQueryClient();

  // Status Form State
  const [targetStatus, setTargetStatus] = useState<OrderStatus>("CONFIRMED");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) =>
      defaultApiClient.patch<Order>(`/orders/${order?.id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to update order status");
    },
  });

  if (!order) return null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (targetStatus === "SHIPPED") {
      if (!courierPartner.trim() || !trackingNumber.trim()) {
        setFormError("Both Courier Partner and Tracking Number are required to dispatch.");
        return;
      }
    }

    if (targetStatus === "CANCELLED") {
      if (!cancellationReason.trim() || cancellationReason.trim().length < 5) {
        setFormError("Please enter a detailed cancellation reason (min 5 characters).");
        return;
      }
    }

    updateStatusMutation.mutate({
      status: targetStatus,
      courierPartner: courierPartner.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      cancellationReason: cancellationReason.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      maxWidth="800px"
    >
      <div style={{ color: "#F7F1E7", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* Top Header Card */}
        <div
          style={{
            background: "#121413",
            border: "1px solid rgba(197, 161, 91, 0.25)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Bidar Flagship • Store 01
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 2 }}>
              Placed: {formatDateTime(order.createdAt)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <StatusBadge
              variant={order.paymentStatus === "COLLECTED" ? "success" : "warning"}
              label={`Payment: ${order.paymentStatus}`}
            />
            <StatusBadge
              variant="info"
              label={`Status: ${order.status.replace(/_/g, " ")}`}
            />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer size={14} />}
              onClick={() => onOpenPackingSlip(order)}
            >
              Packing Slip
            </Button>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-4)",
            background: "#191B1A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
          }}
        >
          <div>
            <h4 style={{ fontSize: "var(--text-xs)", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-2)" }}>
              Customer Details
            </h4>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#FFFFFF" }}>
              {order.customerName || "Retail Customer"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 4 }}>
              <Phone size={12} /> {order.customerPhone || "N/A"}
            </div>
            {order.customerEmail && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 2 }}>
                <Mail size={12} /> {order.customerEmail}
              </div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: "var(--text-xs)", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-2)" }}>
              Delivery Destination
            </h4>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-warm-beige)", lineHeight: 1.6 }}>
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              <strong>{order.shippingAddress.pincode || order.shippingAddress.postalCode}</strong>
            </div>
          </div>
        </div>

        {/* Itemized Garments List */}
        <div>
          <h4 style={{ fontSize: "var(--text-xs)", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-3)" }}>
            Garments in Order ({order.items?.length || 0})
          </h4>
          <div
            style={{
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#121413", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--color-muted-grey)" }}>
                  <th style={{ padding: "8px 12px" }}>Garment</th>
                  <th style={{ padding: "8px 12px" }}>SKU</th>
                  <th style={{ padding: "8px 12px" }}>Size</th>
                  <th style={{ padding: "8px 12px" }}>Qty</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#FFFFFF" }}>{item.productName}</td>
                    <td style={{ padding: "10px 12px", color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)" }}>{item.sku}</td>
                    <td style={{ padding: "10px 12px" }}>{item.size}</td>
                    <td style={{ padding: "10px 12px" }}>{item.quantity}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>{formatINR(item.unitPrice)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#FFFFFF" }}>{formatINR(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-3)" }}>
            <div style={{ width: 240, fontSize: "var(--text-xs)", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-grey)" }}>
                <span>Subtotal:</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--status-success)" }}>
                  <span>Discount:</span>
                  <span>-{formatINR(order.discountTotal)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-grey)" }}>
                <span>Delivery:</span>
                <span>{order.deliveryCharge === 0 ? "FREE" : formatINR(order.deliveryCharge)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-champagne-gold)", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 4 }}>
                <span>Grand Total:</span>
                <span>{formatINR(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Status Workflow Controller */}
        <form
          onSubmit={handleStatusSubmit}
          style={{
            background: "#191B1A",
            border: "1px solid rgba(197, 161, 91, 0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
          }}
        >
          <h4 style={{ fontSize: "var(--text-xs)", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-3)" }}>
            Update Fulfillment State
          </h4>

          {formError && (
            <div style={{ color: "var(--status-danger)", fontSize: "var(--text-xs)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> {formError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "block", marginBottom: 4 }}>
                Transition Order To:
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                style={{
                  width: "100%",
                  background: "#121413",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  fontSize: "var(--text-xs)",
                }}
              >
                <option value="CONFIRMED">CONFIRMED (Awaiting Packing)</option>
                <option value="PACKED">PACKED (Ready for Courier / Pickup)</option>
                <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {targetStatus === "SHIPPED" && (
              <>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "block", marginBottom: 4 }}>
                    Courier Partner:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bluedart, Delhivery, DTDC"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#121413",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "var(--text-xs)",
                    }}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "block", marginBottom: 4 }}>
                    Tracking / AWB Number:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-982138128"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#121413",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "var(--text-xs)",
                    }}
                  />
                </div>
              </>
            )}

            {targetStatus === "CANCELLED" && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "block", marginBottom: 4 }}>
                  Cancellation Reason:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested cancellation / Out of stock"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#121413",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    color: "#FFFFFF",
                    fontSize: "var(--text-xs)",
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
            <Button
              type="submit"
              size="sm"
              isLoading={updateStatusMutation.isPending}
            >
              Update Status in Backend
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
