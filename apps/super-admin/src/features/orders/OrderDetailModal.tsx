import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order, OrderStatus, UpdateOrderStatusPayload } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import {
  Phone,
  Mail,
  Printer,
  AlertTriangle,
  Truck,
  Bike,
  KeyRound,
  QrCode,
  MapPin,
  CheckCircle2,
  Package,
  ShoppingBag,
  Store,
  Calendar,
  CreditCard,
  User,
  ShieldAlert,
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

  const isCollected = order.paymentStatus === "COLLECTED";
  const awbCode = order.trackingNumber || `BAGODI-BID-${order.orderNumber.slice(-5).toUpperCase()}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      maxWidth="880px"
    >
      <div
        style={{
          color: "#111412",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* 1. Top Executive Store & Status Bar */}
        <div
          style={{
            background: "#F9F7F2",
            border: "1.5px solid #E5DED3",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8E7238",
                  background: "#FFF9EE",
                  border: "1px solid #E8D9B5",
                  borderRadius: "6px",
                  padding: "3px 9px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <Store size={12} color="#8E7238" />
                Bidar Flagship • Store 01
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6B655D",
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Calendar size={13} color="#8E7238" />
              <span>
                Placed: <strong>{formatDateTime(order.createdAt)}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Payment Badge */}
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "6px",
                letterSpacing: "0.03em",
                background: isCollected ? "#E8F5E9" : "#FFF8E1",
                color: isCollected ? "#1B5E20" : "#B78103",
                border: `1px solid ${isCollected ? "#A5D6A7" : "#FFE082"}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <CreditCard size={12} />
              Payment: {order.paymentStatus}
            </span>

            {/* Fulfillment Status Badge */}
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "6px",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                background:
                  order.status === "DELIVERED"
                    ? "#E8F5E9"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#E0F2FE"
                    : order.status === "CANCELLED"
                    ? "#FFEBEE"
                    : "#F3E8FF",
                color:
                  order.status === "DELIVERED"
                    ? "#1B5E20"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#0369A1"
                    : order.status === "CANCELLED"
                    ? "#C62828"
                    : "#6B21A8",
                border: `1px solid ${
                  order.status === "DELIVERED"
                    ? "#A5D6A7"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#7DD3FC"
                    : order.status === "CANCELLED"
                    ? "#EF9A9A"
                    : "#D8B4FE"
                }`,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Package size={12} />
              Status: {order.status.replace(/_/g, " ")}
            </span>

            <button
              type="button"
              onClick={() => onOpenPackingSlip(order)}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #C5A15B",
                color: "#8E7238",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
              }}
              title="Print Bagodi Tax Invoice & Store Packing Slip"
            >
              <Printer size={13} color="#8E7238" />
              Packing Slip
            </button>
          </div>
        </div>

        {/* 2. Customer & Shipping Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Customer Details Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5DED3",
              borderRadius: "12px",
              padding: "16px 18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#8E7238",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={13} color="#8E7238" />
              Customer Details
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111412" }}>
              {order.customerName || "Retail Client"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "12.5px",
                color: "#4A4E4B",
                marginTop: "6px",
              }}
            >
              <Phone size={13} color="#8E7238" />
              <a
                href={`tel:${order.customerPhone || order.shippingAddress?.phone || ""}`}
                style={{ color: "#111412", textDecoration: "none", fontWeight: 600 }}
              >
                {order.customerPhone || order.shippingAddress?.phone || "No phone listed"}
              </a>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "12.5px",
                color: "#4A4E4B",
                marginTop: "4px",
              }}
            >
              <Mail size={13} color="#8E7238" />
              <a
                href={`mailto:${order.customerEmail || ""}`}
                style={{ color: "#0284C7", textDecoration: "none" }}
              >
                {order.customerEmail || "No email listed"}
              </a>
            </div>
          </div>

          {/* Delivery Destination Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5DED3",
              borderRadius: "12px",
              padding: "16px 18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#8E7238",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <MapPin size={13} color="#8E7238" />
              Delivery Destination
            </div>
            <div style={{ fontSize: "13px", color: "#26231F", lineHeight: 1.6 }}>
              <div>{order.shippingAddress?.addressLine1 || "Direct Store Pickup / Retail Counter"}</div>
              {order.shippingAddress?.addressLine2 && (
                <div>{order.shippingAddress.addressLine2}</div>
              )}
              <div style={{ marginTop: "2px" }}>
                {order.shippingAddress?.city && `${order.shippingAddress.city}, `}
                {order.shippingAddress?.state && `${order.shippingAddress.state} - `}
                <strong style={{ color: "#111412" }}>
                  {order.shippingAddress?.pincode || order.shippingAddress?.postalCode || "585401"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Delivery Logistics & Rider Assignment */}
        <div
          style={{
            background: "#FAF9F5",
            border: "1.5px solid #E5DED3",
            borderRadius: "12px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <h4
              style={{
                fontSize: "11.5px",
                color: "#8E7238",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Truck size={15} color="#8E7238" />
              Delivery Logistics & Rider Assignment
            </h4>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "12px",
                background:
                  order.status === "DELIVERED"
                    ? "#E8F5E9"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#E0F2FE"
                    : "#FFF8E1",
                color:
                  order.status === "DELIVERED"
                    ? "#1B5E20"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#0369A1"
                    : "#B78103",
                border: `1px solid ${
                  order.status === "DELIVERED"
                    ? "#A5D6A7"
                    : order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                    ? "#7DD3FC"
                    : "#FFE082"
                }`,
              }}
            >
              {order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY"
                ? "Out with Delivery Partner"
                : order.status === "DELIVERED"
                ? "Doorstep Handover Complete"
                : "Awaiting Dispatch Assignment"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "14px",
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "14px 16px",
              border: "1px solid #ECE7DD",
            }}
          >
            {/* Rider & Fleet Details */}
            <div>
              <div style={{ fontSize: "10.5px", color: "#7A756D", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
                Assigned Delivery Partner
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: "#111412",
                  marginTop: "3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Bike size={15} color="#8E7238" />
                <span>{order.courierPartner || "Bagodi Dedicated Fleet (Bidar Hyperlocal)"}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#3E3B36", marginTop: "5px" }}>
                Rider: <strong>Vikram Jadhav</strong> (ID: <code style={{ background: "#F5F2EB", padding: "1px 5px", borderRadius: 4 }}>DEL-BID-001</code>)
              </div>
              <div style={{ fontSize: "12px", color: "#6B655D", marginTop: "3px" }}>
                Vehicle: <strong>KA-38-EA-1024</strong> (Hero Splendor Pro) • Phone:{" "}
                <a href="tel:+919845011221" style={{ color: "#0284C7", textDecoration: "none", fontWeight: 600 }}>
                  +919845011221
                </a>
              </div>
            </div>

            {/* OTP Handover & Tracking Code */}
            <div>
              <div style={{ fontSize: "10.5px", color: "#7A756D", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
                Handover Verification & Tracking
              </div>
              <div style={{ fontSize: "12px", color: "#111412", marginTop: "3px" }}>
                AWB Tracking:{" "}
                <strong
                  style={{
                    color: "#8E7238",
                    fontFamily: "monospace",
                    background: "#FFF9EE",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    border: "1px solid #E8D9B5",
                  }}
                >
                  {awbCode}
                </strong>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#B45309",
                  marginTop: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <KeyRound size={13} color="#B45309" />
                <span>
                  Customer Delivery OTP:{" "}
                  <strong
                    style={{
                      fontFamily: "monospace",
                      background: "#FEF3C7",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      border: "1px solid #FDE68A",
                      color: "#92400E",
                    }}
                  >
                    584912
                  </strong>{" "}
                  (Required for Handover)
                </span>
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#6B655D",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <QrCode size={13} color="#8E7238" />
                <span>
                  Collection: {isCollected ? "Prepaid Online" : "COD Cash or Dynamic UPI QR"}{" "}
                  <strong style={{ color: "#111412" }}>({formatINR(order.grandTotal)})</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Itemized Garments List */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E5DED3",
            borderRadius: "12px",
            padding: "16px 18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4
              style={{
                fontSize: "11.5px",
                color: "#8E7238",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShoppingBag size={14} color="#8E7238" />
              Garments in Order ({order.items?.length || 0})
            </h4>
          </div>

          <div
            style={{
              border: "1px solid #E5DED3",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F4F0E8", borderBottom: "1.5px solid #E0D9CC", color: "#3E3B36" }}>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px" }}>Garment</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px" }}>SKU</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>Size</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr
                    key={item.id || index}
                    style={{
                      borderBottom: index === (order.items?.length || 0) - 1 ? "none" : "1px solid #F0ECE4",
                      background: index % 2 === 0 ? "#FFFFFF" : "#FCFBF9",
                    }}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111412" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              objectFit: "cover",
                              border: "1px solid #E5DED3",
                            }}
                          />
                        )}
                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          color: "#8E7238",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          background: "#FFF9EE",
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: "1px solid #E8D9B5",
                        }}
                      >
                        {item.sku}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "#F5F2EB",
                          color: "#333333",
                          fontWeight: 700,
                          fontSize: "11px",
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        {item.size || "FREE"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#111412" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#4A4E4B", fontFamily: "monospace" }}>
                      {formatINR(item.unitPrice)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#111412", fontFamily: "monospace" }}>
                      {formatINR(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <div
              style={{
                width: 270,
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                background: "#FAF9F6",
                border: "1px solid #E8E3D9",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6B655D" }}>
                <span>Subtotal:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#111412" }}>
                  {formatINR(order.subtotal)}
                </span>
              </div>
              {order.discountTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#B91C1C" }}>
                  <span>Discount:</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                    -{formatINR(order.discountTotal)}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6B655D" }}>
                <span>Delivery:</span>
                <span style={{ fontWeight: 700, color: "#15803D" }}>
                  {order.deliveryCharge === 0 ? "FREE" : formatINR(order.deliveryCharge)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#111412",
                  borderTop: "1.5px solid #D5CBBB",
                  paddingTop: "6px",
                  marginTop: "2px",
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: "#8E7238", fontFamily: "monospace" }}>
                  {formatINR(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Fulfillment Status Workflow Controller */}
        <form
          onSubmit={handleStatusSubmit}
          style={{
            background: "#FAF9F5",
            border: "1.5px solid #E0D7C5",
            borderRadius: "12px",
            padding: "16px 18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <h4
            style={{
              fontSize: "11.5px",
              color: "#8E7238",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
              margin: 0,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 size={15} color="#8E7238" />
            Update Fulfillment State
          </h4>

          {formError && (
            <div
              style={{
                color: "#B91C1C",
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "12px",
                marginTop: "10px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertTriangle size={14} /> {formError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#6B655D", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                Transition Order To:
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1.5px solid #D5CDBC",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#111412",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  outline: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <option value="CONFIRMED">CONFIRMED (Awaiting Packing)</option>
                <option value="PACKED">PACKED (Ready for Courier / Pickup)</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (Local Courier Handover)</option>
                <option value="DELIVERED">DELIVERED (Doorstep Handover Complete)</option>
                <option value="SHIPPED">SHIPPED (Handed to Courier Partner)</option>
                <option value="CANCELLED">CANCELLED (Void / Cancel Order)</option>
              </select>
            </div>

            {targetStatus === "SHIPPED" && (
              <>
                <div>
                  <label style={{ fontSize: "11px", color: "#6B655D", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                    Courier Partner:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bluedart, Delhivery, DTDC"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#FFFFFF",
                      border: "1.5px solid #D5CDBC",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#111412",
                      fontSize: "12.5px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#6B655D", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                    Tracking / AWB Number:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-982138128"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#FFFFFF",
                      border: "1.5px solid #D5CDBC",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#111412",
                      fontSize: "12.5px",
                      outline: "none",
                    }}
                  />
                </div>
              </>
            )}

            {targetStatus === "CANCELLED" && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "11px", color: "#6B655D", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                  Cancellation Reason:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested cancellation / Out of stock"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    border: "1.5px solid #D5CDBC",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#111412",
                    fontSize: "12.5px",
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <Button
              type="submit"
              size="sm"
              isLoading={updateStatusMutation.isPending}
              style={{
                background: "#A51F27",
                borderColor: "#A51F27",
                color: "#FFFFFF",
                fontWeight: 700,
                padding: "8px 18px",
              }}
            >
              Update Order Status
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
