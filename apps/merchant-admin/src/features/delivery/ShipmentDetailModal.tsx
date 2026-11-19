import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { DeliveryShipment, ShipmentStatus, UpdateShipmentStatusPayload } from "@bagodi/shared-types";
import { Modal, Button, StatusBadge } from "@bagodi/shared-components";
import { formatDateTime, formatINR } from "@bagodi/utilities";
import {
  Truck,
  MapPin,
  Clock,
  Plus,
  AlertTriangle,
  Printer,
} from "lucide-react";
import styles from "./DeliveryPage.module.css";

export interface ShipmentDetailModalProps {
  shipment: DeliveryShipment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Status Update State
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("IN_TRANSIT");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: (payload: UpdateShipmentStatusPayload) =>
      defaultApiClient.patch<DeliveryShipment>(`/delivery/shipments/${shipment?.id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipments-list"] });
      setIsAddingUpdate(false);
      setNewLocation("");
      setNewDescription("");
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || "Failed to update milestone.");
    },
  });

  if (!shipment) return null;

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newLocation.trim().length < 2) {
      setFormError("Location is required (e.g. Bidar Hub).");
      return;
    }

    if (newDescription.trim().length < 5) {
      setFormError("Please enter detailed scan activity description (min 5 chars).");
      return;
    }

    const payload: UpdateShipmentStatusPayload = {
      status: newStatus,
      location: newLocation.trim(),
      activityDescription: newDescription.trim(),
    };

    statusMutation.mutate(payload);
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case "DELIVERED":
        return <StatusBadge variant="success" label="Delivered" />;
      case "OUT_FOR_DELIVERY":
        return <StatusBadge variant="info" label="Out For Delivery" />;
      case "IN_TRANSIT":
        return <StatusBadge variant="warning" label="In Transit" />;
      case "PICKED_UP":
        return <StatusBadge variant="warning" label="Picked Up by Courier" />;
      case "MANIFESTED":
        return <StatusBadge variant="neutral" label="Manifested (Ready)" />;
      case "RTO":
        return <StatusBadge variant="danger" label="Returned to Origin" />;
      default:
        return <StatusBadge variant="neutral" label={status} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Shipment Tracking — AWB #${shipment.trackingNumber}`}
      maxWidth="760px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Header Summary */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(197, 161, 91, 0.25)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "var(--space-3)",
            fontSize: "12px",
          }}
        >
          <div>
            <div style={{ color: "var(--color-muted-grey)", textTransform: "uppercase", fontSize: "11px" }}>
              Courier Partner
            </div>
            <div style={{ fontWeight: 600, color: "#FFFFFF", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={14} color="var(--color-champagne-gold)" />
              {shipment.courierPartnerName}
            </div>
          </div>

          <div>
            <div style={{ color: "var(--color-muted-grey)", textTransform: "uppercase", fontSize: "11px" }}>
              Order Reference
            </div>
            <div style={{ fontWeight: 600, color: "var(--color-champagne-gold)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
              {shipment.orderNumber}
            </div>
          </div>

          <div>
            <div style={{ color: "var(--color-muted-grey)", textTransform: "uppercase", fontSize: "11px" }}>
              Destination
            </div>
            <div style={{ color: "#FFFFFF", marginTop: "2px" }}>
              {shipment.destinationCity} — <strong>{shipment.destinationPincode}</strong>
            </div>
          </div>

          <div>
            <div style={{ color: "var(--color-muted-grey)", textTransform: "uppercase", fontSize: "11px" }}>
              Status
            </div>
            <div style={{ marginTop: "2px" }}>
              {getStatusBadge(shipment.status)}
            </div>
          </div>
        </div>

        {/* Courier Details & Tracking Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ fontSize: "12px", color: "var(--color-muted-grey)" }}>
            Recipient: <strong style={{ color: "#FFFFFF" }}>{shipment.customerName}</strong> • Phone: {shipment.customerPhone}
            {shipment.codAmount ? ` • COD Due: ${formatINR(shipment.codAmount)}` : " • Prepaid Order"}
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            {shipment.shippingLabelUrl && (
              <a
                href={shipment.shippingLabelUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button size="sm" variant="ghost" leftIcon={<Printer size={14} />}>
                  Print Label
                </Button>
              </a>
            )}
            <Button
              size="sm"
              variant={isAddingUpdate ? "outline" : "primary"}
              leftIcon={<Plus size={14} />}
              onClick={() => setIsAddingUpdate(!isAddingUpdate)}
            >
              {isAddingUpdate ? "Cancel Update" : "Add Status Scan"}
            </Button>
          </div>
        </div>

        {/* Add Status Scan Form */}
        {isAddingUpdate && (
          <form
            onSubmit={handleAddMilestone}
            style={{
              background: "#161817",
              border: "1px solid rgba(197, 161, 91, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-champagne-gold)", textTransform: "uppercase" }}>
              Record Operational Checkpoint Scan
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
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
                  <option value="PICKED_UP">Picked Up from Mall</option>
                  <option value="IN_TRANSIT">In Transit at Hub</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered to Recipient</option>
                  <option value="RTO">Return to Origin (RTO)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Scan Hub / Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bidar Central Logistics Center"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
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
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Activity Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Bag sorted and loaded on vehicle for final delivery"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
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
                required
              />
            </div>

            {formError && (
              <div style={{ color: "#FF8F8F", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={14} /> {formError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingUpdate(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={statusMutation.isPending}>
                Save Checkpoint Scan
              </Button>
            </div>
          </form>
        )}

        {/* Milestone Timeline */}
        <div>
          <h4
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-base)",
              color: "#FFFFFF",
              marginBottom: "var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={16} color="var(--color-champagne-gold)" /> Milestone Scan History
          </h4>

          {shipment.milestones && shipment.milestones.length > 0 ? (
            <div className={styles.timeline}>
              {shipment.milestones.map((m, idx) => (
                <div key={idx} className={styles.timelineNode}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineDate}>{formatDateTime(m.timestamp)}</div>
                  <div className={styles.timelineTitle}>{m.activityDescription}</div>
                  <div className={styles.timelineLocation}>
                    <MapPin size={11} style={{ display: "inline", marginRight: 4 }} />
                    {m.location} • Status: {m.status.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "var(--space-6)",
                background: "#121413",
                borderRadius: "var(--radius-md)",
                color: "var(--color-muted-grey)",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              No checkpoint scans recorded yet. Package manifested and awaiting courier pickup from Bidar Mall.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
