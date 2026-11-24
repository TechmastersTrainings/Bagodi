import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { Modal, Button, ApiErrorCard } from "@bagodi/shared-components";
import { Truck, CheckCircle, MapPin, Sparkles } from "lucide-react";

export interface PushToDeliveryModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const COURIER_OPTIONS: { id: string; name: string; code: string; sla: string }[] = [
  { id: "c-internal", name: "Bagodi Internal Fleet (Bidar)", code: "INTERNAL", sla: "Within 2 Hours (Rider App + OTP + UPI QR)" },
  { id: "c-bluedart", name: "Blue Dart Express Air", code: "BLUEDART", sla: "1-2 Days Express" },
  { id: "c-delhivery", name: "Delhivery Surface & Air", code: "DELHIVERY", sla: "2-3 Days Standard" },
  { id: "c-dtdc", name: "DTDC Premium Express", code: "DTDC", sla: "2 Days Express" },
  { id: "c-shadowfax", name: "Shadowfax Hyperlocal", code: "SHADOWFAX", sla: "Same Day / 4 Hours" },
];

export const PushToDeliveryModal: React.FC<PushToDeliveryModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [courierCode, setCourierCode] = useState<string>("INTERNAL");
  const [selectedRider, setSelectedRider] = useState<string>("DEL-BID-001");
  const [trackingNumber, setTrackingNumber] = useState<string>("BAGODI-BID-10024");
  const [pickupSlot, setPickupSlot] = useState<string>("IMMEDIATE_DISPATCH");
  const [weightKg, setWeightKg] = useState<number>(1.2);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedCourier = COURIER_OPTIONS.find((c) => c.code === courierCode) || COURIER_OPTIONS[0];

  const pushToDeliveryMutation = useMutation({
    mutationFn: (payload: any) =>
      defaultApiClient.patch(`/orders/${order?.id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
      setSuccessMsg(
        `Order #${order?.orderNumber} successfully scheduled and pushed to ${selectedCourier.name} portal!`
      );
      setTimeout(() => {
        onClose();
      }, 1100);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to push order to delivery portal.");
    },
  });

  if (!order || !isOpen) return null;

  const handleGenerateTracking = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    if (courierCode === "INTERNAL") {
      setTrackingNumber(`BAGODI-BID-${randomDigits}`);
    } else {
      const prefix = courierCode === "BLUEDART" ? "BD" : courierCode === "DELHIVERY" ? "DEL" : "DTDC";
      setTrackingNumber(`${prefix}-${randomDigits}`);
    }
  };

  const handleConfirm = () => {
    const finalTracking = trackingNumber.trim() || `BD-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setApiError(null);
    pushToDeliveryMutation.mutate({
      status: "SHIPPED",
      courierPartner: selectedCourier.name,
      trackingNumber: finalTracking,
      pickupSlot,
      weightKg,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dispatch & Handover to Delivery Partner: #${order.orderNumber}`}
      maxWidth="680px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {apiError && <ApiErrorCard message={apiError} />}

        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              borderRadius: 8,
              color: "#1B5E20",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Customer & Destination Summary */}
        <div
          style={{
            padding: "12px 14px",
            background: "#F8F7F5",
            borderRadius: 8,
            border: "1px solid #E5E1D8",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase" }}>
              Customer & Order
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111412" }}>
              {order.customerName} • #{order.orderNumber}
            </div>
            <div style={{ fontSize: "11px", color: "#4A4E4B", marginTop: 2 }}>
              {order.items?.length || 1} Garment item(s) • Total: INR {order.grandTotal?.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} /> Delivery Destination
            </div>
            <div style={{ fontSize: "12px", color: "#111412", fontWeight: 600 }}>
              {order.shippingAddress?.city || "Bidar"}, {order.shippingAddress?.state || "Karnataka"} - {order.shippingAddress?.pincode || "585401"}
            </div>
            <div style={{ fontSize: "11px", color: "#7A807C" }}>
              {order.shippingAddress?.addressLine1 || "Customer address"}
            </div>
          </div>
        </div>

        {/* Courier Partner Selection */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 6 }}>
            Select Logistics Partner *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {COURIER_OPTIONS.map((c) => (
              <div
                key={c.code}
                onClick={() => setCourierCode(c.code)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${courierCode === c.code ? "#E31B23" : "#E5E1D8"}`,
                  background: courierCode === c.code ? "#FFF5F5" : "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12px", color: courierCode === c.code ? "#E31B23" : "#111412" }}>
                    {c.name}
                  </strong>
                  <span style={{ fontSize: "9px", background: "#F0EDE6", padding: "1px 6px", borderRadius: 4, color: "#4A4E4B" }}>
                    {c.sla}
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#7A807C" }}>Official Bagodi Retail Courier Bridge</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated Internal Rider Selector */}
        {courierCode === "INTERNAL" && (
          <div
            style={{
              padding: "12px 14px",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                Dedicated Delivery Agent (Bidar Fleet)
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#15803D" }}>
                Dynamic UPI QR & OTP Handover Active
              </span>
            </div>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: 6,
                border: "1px solid #86EFAC",
                background: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 600,
                color: "#14532D",
              }}
            >
              <option value="DEL-BID-001">Vikram Jadhav • Hero Splendor KA-38-EA-1024 (On-Duty • Bidar Central)</option>
              <option value="DEL-BID-002">Mohammed Zeeshan • Honda Activa KA-38-EA-2048 (On-Duty • Mailoor / Fort)</option>
            </select>
          </div>
        )}

        {/* Tracking Number & Weight */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr auto 1fr", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
              Tracking AWB / Manifest Code *
            </label>
            <input
              type="text"
              placeholder="e.g. BD-904128912"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                padding: "0 10px",
                border: "1px solid #E5E1D8",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "#111412",
              }}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateTracking}>
            <Sparkles size={12} style={{ marginRight: 4 }} /> Auto AWB
          </Button>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
              Parcel Weight (Kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              style={{
                width: "100%",
                height: 40,
                padding: "0 10px",
                border: "1px solid #E5E1D8",
                borderRadius: 6,
                fontSize: "12px",
                color: "#111412",
              }}
            />
          </div>
        </div>

        {/* Pickup Time Window */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
            Store Pickup Schedule Window *
          </label>
          <select
            value={pickupSlot}
            onChange={(e) => setPickupSlot(e.target.value)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              border: "1px solid #E5E1D8",
              borderRadius: 6,
              fontSize: "12px",
              color: "#111412",
              background: "#FFFFFF",
            }}
          >
            <option value="TODAY_EVENING">Today Afternoon/Evening (2:00 PM - 5:00 PM)</option>
            <option value="TOMORROW_MORNING">Tomorrow Morning Slot (9:30 AM - 12:30 PM)</option>
            <option value="IMMEDIATE_HYPERLOCAL">Immediate Hyperlocal Dispatch (within 60 mins)</option>
          </select>
        </div>

        {/* Action Buttons */}
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
            type="button"
            size="sm"
            isLoading={pushToDeliveryMutation.isPending}
            onClick={handleConfirm}
            style={{ background: "#E31B23", color: "#FFFFFF" }}
          >
            <Truck size={14} style={{ marginRight: 6 }} />
            Confirm Schedule & Push to Delivery
          </Button>
        </div>
      </div>
    </Modal>
  );
};
