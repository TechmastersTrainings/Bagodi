import React from "react";
import { Order } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import { Printer } from "lucide-react";

export interface PackingSlipModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Store Packing Slip & Invoice" maxWidth="800px">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
        <Button size="sm" leftIcon={<Printer size={16} />} onClick={handlePrint}>
          Print Packing Slip (PDF)
        </Button>
      </div>

      {/* Printable Sheet */}
      <div
        id="printable-packing-slip"
        style={{
          background: "#FFFFFF",
          color: "#000000",
          padding: "var(--space-8)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)",
          border: "1px solid #D0D0D0",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", margin: 0, fontWeight: 700, letterSpacing: "0.1em" }}>
              BAGODI SHOPPING MALL
            </h1>
            <p style={{ fontSize: "11px", margin: "4px 0", color: "#555" }}>
              Near Shivaji Chowk, Main Commercial Road, Bidar, Karnataka - 585401
            </p>
            <p style={{ fontSize: "11px", margin: 0, color: "#555" }}>
              GSTIN: 29AABCB1234F1Z5 • State Code: 29 (Karnataka)
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", background: "#000", color: "#FFF", padding: "3px 8px" }}>
              PACKING SLIP & INVOICE
            </span>
            <p style={{ fontSize: "12px", fontWeight: 700, marginTop: "8px", margin: 0 }}>
              Order #: {order.orderNumber}
            </p>
            <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>
              Date: {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)", fontSize: "12px" }}>
          <div>
            <strong style={{ textTransform: "uppercase", fontSize: "11px", color: "#333", borderBottom: "1px solid #CCC", display: "block", paddingBottom: 2, marginBottom: 4 }}>
              Ship To / Consignee:
            </strong>
            <div style={{ fontWeight: 700 }}>{order.customerName || "Customer"}</div>
            <div>{order.shippingAddress.addressLine1}</div>
            {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
            <div>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode || order.shippingAddress.postalCode}
            </div>
            <div>Phone: {order.customerPhone || "N/A"}</div>
          </div>

          <div>
            <strong style={{ textTransform: "uppercase", fontSize: "11px", color: "#333", borderBottom: "1px solid #CCC", display: "block", paddingBottom: 2, marginBottom: 4 }}>
              Fulfillment Metadata:
            </strong>
            <div>Payment Mode: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</div>
            <div>Courier Partner: {order.courierPartner || "Standard Boutique Dispatch"}</div>
            <div>AWB / Tracking: {order.trackingNumber || "Pending Dispatch Manifest"}</div>
            <div>Dispatch Warehouse: Bidar Flagship (Store 01)</div>
          </div>
        </div>

        {/* Garments Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left", marginBottom: "var(--space-6)" }}>
          <thead>
            <tr style={{ background: "#F5F5F5", borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
              <th style={{ padding: "6px" }}>#</th>
              <th style={{ padding: "6px" }}>Garment Description</th>
              <th style={{ padding: "6px" }}>SKU</th>
              <th style={{ padding: "6px" }}>Size</th>
              <th style={{ padding: "6px", textAlign: "center" }}>Qty</th>
              <th style={{ padding: "6px", textAlign: "right" }}>Rate</th>
              <th style={{ padding: "6px", textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #E0E0E0" }}>
                <td style={{ padding: "6px" }}>{idx + 1}</td>
                <td style={{ padding: "6px", fontWeight: 600 }}>{item.productName}</td>
                <td style={{ padding: "6px", fontFamily: "var(--font-mono)" }}>{item.sku}</td>
                <td style={{ padding: "6px" }}>{item.size}</td>
                <td style={{ padding: "6px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "6px", textAlign: "right" }}>{formatINR(item.unitPrice)}</td>
                <td style={{ padding: "6px", textAlign: "right", fontWeight: 600 }}>{formatINR(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: "10px", color: "#666", maxWidth: 300 }}>
            <p style={{ margin: 0 }}>This is an authentic computer-generated dispatch challan from Bagodi Shopping Mall, Bidar.</p>
            <div style={{ marginTop: 24, borderTop: "1px dashed #999", paddingTop: 4 }}>
              Store Dispatch Executive Signature
            </div>
          </div>

          <div style={{ width: 220, fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#008000" }}>
                <span>Discount:</span>
                <span>-{formatINR(order.discountTotal)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Delivery:</span>
              <span>{order.deliveryCharge === 0 ? "FREE" : formatINR(order.deliveryCharge)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "4px 0", marginTop: 4, fontWeight: 700, fontSize: "13px" }}>
              <span>Invoice Total:</span>
              <span>{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
