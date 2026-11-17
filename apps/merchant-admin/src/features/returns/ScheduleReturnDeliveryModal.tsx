import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ReturnRequest } from "@bagodi/shared-types";
import { Modal, Button, ApiErrorCard } from "@bagodi/shared-components";
import { Truck, CheckCircle, MapPin, Sparkles } from "lucide-react";

export interface ScheduleReturnDeliveryModalProps {
  returnRequest: ReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const REVERSE_COURIERS = [
  { id: "delhivery-rev", name: "Delhivery Reverse Logistics", code: "DELHIVERY_REV", speed: "Doorstep QC within 24h" },
  { id: "bluedart-rev", name: "Blue Dart Return Express", code: "BLUEDART_REV", speed: "Air Express Pickup" },
  { id: "shadowfax-rev", name: "Shadowfax Local Same-Day Return", code: "SHADOWFAX_REV", speed: "Same-Day In-City" },
];

export const ScheduleReturnDeliveryModal: React.FC<ScheduleReturnDeliveryModalProps> = ({
  returnRequest,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [courierCode, setCourierCode] = useState<string>("DELHIVERY_REV");
  const [pickupSlot, setPickupSlot] = useState<string>("TOMORROW_MORNING");
  const [returnAwb, setReturnAwb] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!returnRequest || !isOpen) return null;

  const handleGenerateAwb = () => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    setReturnAwb(`RET-AWB-${randomDigits}`);
  };

  const selectedCourier = REVERSE_COURIERS.find((c) => c.code === courierCode) || REVERSE_COURIERS[0];

  const scheduleMutation = useMutation({
    mutationFn: (payload: any) =>
      defaultApiClient.patch(`/returns/${returnRequest.id}/schedule-pickup`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns-list"] });
      setSuccessMsg(
        `Doorstep return pickup successfully scheduled with ${selectedCourier.name} for Order #${returnRequest.orderNumber}.`
      );
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to schedule return delivery.");
    },
  });

  const handleConfirm = () => {
    const finalAwb = returnAwb.trim() || `RET-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setApiError(null);
    scheduleMutation.mutate({
      status: "PICKUP_SCHEDULED",
      courierPartner: selectedCourier.name,
      returnAwb: finalAwb,
      pickupSlot,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Return Delivery Pickup: Order #${returnRequest.orderNumber}`}
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

        {/* Pickup Location Box */}
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
              Customer Contact
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111412" }}>
              {returnRequest.customerName || "Customer"}
            </div>
            <div style={{ fontSize: "11px", color: "#4A4E4B", marginTop: 2 }}>
              Phone: {returnRequest.customerPhone || "+91 97412 88990"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} /> Doorstep Pickup Location
            </div>
            <div style={{ fontSize: "12px", color: "#111412", fontWeight: 600 }}>
              Bidar Central, Karnataka - 585401
            </div>
            <div style={{ fontSize: "11px", color: "#7A807C" }}>
              Item: {returnRequest.items?.[0]?.productName || "Garment"}
            </div>
          </div>
        </div>

        {/* Reverse Logistics Courier */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 6 }}>
            Select Reverse Logistics Fleet *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {REVERSE_COURIERS.map((c) => (
              <div
                key={c.code}
                onClick={() => setCourierCode(c.code)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${courierCode === c.code ? "#E31B23" : "#E5E1D8"}`,
                  background: courierCode === c.code ? "#FFF5F5" : "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12px", color: courierCode === c.code ? "#E31B23" : "#111412" }}>
                    {c.name}
                  </strong>
                </div>
                <div style={{ fontSize: "10px", color: "#7A807C", marginTop: 2 }}>{c.speed}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Time Slot & AWB */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr auto", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
              Customer Pickup Window *
            </label>
            <select
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                padding: "0 10px",
                border: "1px solid #E5E1D8",
                borderRadius: 6,
                fontSize: "12px",
                color: "#111412",
                background: "#FFFFFF",
              }}
            >
              <option value="TOMORROW_MORNING">Tomorrow (10:00 AM - 1:00 PM)</option>
              <option value="TOMORROW_EVENING">Tomorrow (2:00 PM - 5:00 PM)</option>
              <option value="NEXT_DAY">Day After Tomorrow Morning</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 4 }}>
              Reverse Pickup AWB Code *
            </label>
            <input
              type="text"
              placeholder="e.g. RET-AWB-904128"
              value={returnAwb}
              onChange={(e) => setReturnAwb(e.target.value)}
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

          <Button type="button" variant="outline" size="sm" onClick={handleGenerateAwb}>
            <Sparkles size={12} style={{ marginRight: 4 }} /> Auto AWB
          </Button>
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
            isLoading={scheduleMutation.isPending}
            onClick={handleConfirm}
            style={{ background: "#2E7D32", color: "#FFFFFF" }}
          >
            <Truck size={14} style={{ marginRight: 6 }} />
            Schedule Return Delivery Pickup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

