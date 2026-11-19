import React from "react";
import { DeliveryShipment } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { Printer } from "lucide-react";

export interface ManifestModalProps {
  shipments: DeliveryShipment[];
  courierName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ManifestModal: React.FC<ManifestModalProps> = ({
  shipments,
  courierName,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalWeightKg = (
    shipments.reduce((sum, s) => sum + (s.weightGrams || 500), 0) / 1000
  ).toFixed(2);

  const totalCod = shipments.reduce((sum, s) => sum + (s.codAmount || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Courier Handover Manifest" maxWidth="800px">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
        <Button size="sm" leftIcon={<Printer size={16} />} onClick={handlePrint}>
          Print Manifest Sheet (PDF)
        </Button>
      </div>

      <div
        id="printable-courier-manifest"
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
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", margin: 0, fontWeight: 700, letterSpacing: "0.08em" }}>
              BAGODI RETAIL DISPATCH MANIFEST
            </h1>
            <p style={{ fontSize: "11px", margin: "4px 0", color: "#444" }}>
              Bagodi Shopping Mall, Shivaji Chowk, Bidar, Karnataka - 585401
            </p>
            <p style={{ fontSize: "11px", margin: 0, color: "#444" }}>
              Hub Contact: +91 8482 225588 • GSTIN: 29AABCB1234F1Z5
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              MNF-{Date.now().toString().slice(-8)}
            </div>
            <div style={{ fontSize: "12px", color: "#333", marginTop: "2px" }}>
              Handover Date: <strong>{todayStr}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              Partner: <strong>{courierName || "All Courier Partners"}</strong>
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", background: "#F4F4F4", padding: "10px 14px", borderRadius: 4, marginBottom: "var(--space-4)", fontSize: "12px" }}>
          <div>
            Total Parcels: <strong>{shipments.length}</strong>
          </div>
          <div>
            Total Weight: <strong>{totalWeightKg} KG</strong>
          </div>
          <div>
            Total COD Due: <strong>{formatINR(totalCod)}</strong>
          </div>
        </div>

        {/* Shipments Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left", marginBottom: "var(--space-6)" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333", background: "#EEE" }}>
              <th style={{ padding: "6px 8px" }}>#</th>
              <th style={{ padding: "6px 8px" }}>AWB / Tracking Number</th>
              <th style={{ padding: "6px 8px" }}>Order Ref</th>
              <th style={{ padding: "6px 8px" }}>Customer</th>
              <th style={{ padding: "6px 8px" }}>Pincode</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>COD Amount</th>
              <th style={{ padding: "6px 8px", textAlign: "center" }}>Courier Check</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => (
              <tr key={s.id || idx} style={{ borderBottom: "1px solid #DDD" }}>
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{s.trackingNumber}</td>
                <td style={{ padding: "8px" }}>{s.orderNumber}</td>
                <td style={{ padding: "8px" }}>{s.customerName}</td>
                <td style={{ padding: "8px" }}>{s.destinationPincode}</td>
                <td style={{ padding: "8px", textAlign: "right", fontWeight: s.codAmount ? 700 : 400 }}>
                  {s.codAmount ? formatINR(s.codAmount) : "PREPAID"}
                </td>
                <td style={{ padding: "8px", textAlign: "center" }}>[ &nbsp; ]</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Verification Block */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)", borderTop: "1px solid #999", paddingTop: "var(--space-6)", marginTop: "var(--space-8)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "35px" }}>
              Store Logistics Officer Signature & Seal:
            </div>
            <div style={{ borderTop: "1px dashed #333", paddingTop: "4px", fontSize: "11px", fontWeight: 600 }}>
              Bagodi Mall Dispatch Team (Bidar)
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "35px" }}>
              Courier Driver / Representative Acceptance:
            </div>
            <div style={{ borderTop: "1px dashed #333", paddingTop: "4px", fontSize: "11px", fontWeight: 600 }}>
              Received {shipments.length} sealed parcels intact
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
