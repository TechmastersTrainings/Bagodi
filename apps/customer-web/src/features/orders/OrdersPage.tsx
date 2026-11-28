import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { EmptyState, ApiErrorCard, SkeletonLine, StatusBadge, Button } from "@bagodi/shared-components";
import { Package, Clock, KeyRound, FileText, XCircle } from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import { CustomerDeliveryTrackingModal } from "./CustomerDeliveryTrackingModal";
import { AccountNavTabs } from "../account/AccountNavTabs";

function openTaxInvoicePrintWindow(order: any) {
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) return;
  const orderNumber = order.orderNumber || order.order_number;
  const taxable = Number(order.taxableAmount ?? 0);
  const cgst = Number(order.cgstAmount ?? 0);
  const sgst = Number(order.sgstAmount ?? 0);
  const total = Number(order.grandTotal ?? order.total_amount ?? 0);
  const itemsHtml = (order.items || [])
    .map(
      (i: any) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.productName || i.product_name} (${i.variantName || i.variant_name || i.sku})</td><td style="padding:8px;border-bottom:1px solid #eee">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">₹${Number(i.unitPrice ?? i.unit_price).toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #eee">₹${Number(i.totalPrice ?? i.total_price).toFixed(2)}</td></tr>`
    )
    .join("");
  win.document.write(`<!doctype html><html><head><title>Tax Invoice #${orderNumber}</title></head><body style="font-family:Inter,Arial,sans-serif;padding:32px;color:#1b1917">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;">
      <img src="/bagodi-logo.jpg" alt="Bagodi Shopping Mall" style="height:56px;width:auto;" />
      <div>
        <h2 style="margin:0;color:#A51F27">BAGODI SHOPPING MALL • TAX INVOICE</h2>
        <p style="margin:4px 0 0;font-size:12px;color:#555">Meenakshi Tower, Udgir Road, Bidar, Karnataka 585401 | GSTIN: 29AABCB1234F1Z1</p>
      </div>
    </div>
    <p><strong>Order:</strong> #${orderNumber} &nbsp;|&nbsp; <strong>Customer:</strong> ${order.customerName || order.customer_name || ""} (${order.customerPhone || order.customer_phone || ""})</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f6f1e9;text-align:left"><th style="padding:8px">Item</th><th style="padding:8px">Qty</th><th style="padding:8px">Unit Rate</th><th style="padding:8px">Total (Incl. GST)</th></tr></thead><tbody>${itemsHtml}</tbody></table>
    <div style="text-align:right;font-size:14px;line-height:1.7">
      <div>Taxable Value: ₹${taxable.toFixed(2)}</div>
      <div>CGST: ₹${cgst.toFixed(2)} &nbsp;|&nbsp; SGST: ₹${sgst.toFixed(2)}</div>
      <div><strong>Grand Total: ₹${total.toFixed(2)}</strong></div>
    </div>
    <script>window.print();</script>
  </body></html>`);
  win.document.close();
}

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: orders, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ["customer-orders"],
    queryFn: () => defaultApiClient.get<Order[]>("/customer/orders"),
    retry: 1,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderNumber: string) =>
      defaultApiClient.post(`/orders/${orderNumber}/cancel`, {
        reason: "Cancelled by customer from My Orders",
      }),
    onSuccess: () => {
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (err: any) => {
      setCancelError(err?.message || "Unable to cancel order.");
    },
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SkeletonLine height="32px" width="220px" />
        <SkeletonLine height="140px" width="100%" />
      </div>
    );
  }

  if (error) {
    return <ApiErrorCard message="Failed to load your orders history." onRetry={() => refetch()} />;
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Placed Yet"
        description="When you place orders on the Bagodi online store, your orders and live tracking timeline will appear here."
        icon={<Package size={36} />}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-6) var(--space-4)" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>
        Order History
      </h1>
      <AccountNavTabs />
      {cancelError && (
        <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "#FEF2F2", color: "#991B1B", fontSize: "var(--text-sm)" }}>
          {cancelError}
        </div>
      )}
      {orders.map((order) => {
        const orderNumber = order.orderNumber || (order as any).order_number;
        const canCancel = ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING"].includes(String(order.status).toUpperCase());
        return (
        <div
          key={order.id}
          style={{
            padding: "var(--space-6)",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Order #{orderNumber}</span>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{formatDateTime(order.createdAt)}</p>
            </div>
            <StatusBadge variant="info" label={order.status.replace(/_/g, " ")} />
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{order.items?.length || 0} items</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: "bold", fontSize: "var(--text-base)" }}>{formatINR(order.grandTotal)}</span>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<KeyRound size={14} color="#C5A15B" />}
                onClick={() => setSelectedOrderForTracking(order)}
              >
                Track & OTP
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText size={14} />}
                onClick={() => openTaxInvoicePrintWindow(order)}
              >
                GST Invoice
              </Button>
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<XCircle size={14} color="#A51F27" />}
                  disabled={cancelOrderMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Cancel order #${orderNumber}?`)) {
                      cancelOrderMutation.mutate(orderNumber);
                    }
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {/* Timeline events from actual backend timestamps */}
          {order.trackingEvents && order.trackingEvents.length > 0 && (
            <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--accent-primary)" }}>
                <Clock size={14} /> Status Timeline
              </div>
              {order.trackingEvents.map((event, idx) => (
                <div key={idx} style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                  • {event.title} — {formatDateTime(event.timestamp)}
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}

      {/* Customer Live Delivery Tracking & Handover OTP Modal */}
      {selectedOrderForTracking && (
        <CustomerDeliveryTrackingModal
          isOpen={Boolean(selectedOrderForTracking)}
          onClose={() => setSelectedOrderForTracking(null)}
          orderId={selectedOrderForTracking.id}
          orderNumber={selectedOrderForTracking.orderNumber}
        />
      )}
    </div>
  );
};

