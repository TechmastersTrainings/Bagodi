import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { CourierPartner, CreateShipmentPayload, DeliveryShipment, Order, PaginatedResponse } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { Truck, AlertTriangle } from "lucide-react";

export interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedOrder?: Order | null;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  preselectedOrder,
}) => {
  const queryClient = useQueryClient();

  // Form State
  const [orderId, setOrderId] = useState<string>(preselectedOrder?.id || "");
  const [courierPartnerId, setCourierPartnerId] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [weightGrams, setWeightGrams] = useState<number>(650);
  const [lengthCm, setLengthCm] = useState<number>(35);
  const [widthCm, setWidthCm] = useState<number>(25);
  const [heightCm, setHeightCm] = useState<number>(8);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Sync when preselected order changes
  React.useEffect(() => {
    if (preselectedOrder) {
      setOrderId(preselectedOrder.id);
    }
  }, [preselectedOrder]);

  // Fetch Courier Partners
  const { data: partnersData } = useQuery<CourierPartner[]>({
    queryKey: ["courier-partners-list"],
    queryFn: () => defaultApiClient.get<CourierPartner[]>("/delivery/courier-partners"),
  });

  const partners = partnersData || [
    { id: "cp_bluedart", name: "Blue Dart Express (Air)", code: "BLUEDART", isActive: true, serviceType: "AIR_EXPRESS" },
    { id: "cp_delhivery", name: "Delhivery Surface Logistics", code: "DELHIVERY", isActive: true, serviceType: "STANDARD_SURFACE" },
    { id: "cp_dtdc", name: "DTDC Premium Express", code: "DTDC", isActive: true, serviceType: "STANDARD_SURFACE" },
    { id: "cp_inhouse", name: "Bagodi Bidar City Hyperlocal Fleet", code: "BAGODI_INHOUSE", isActive: true, serviceType: "LOCAL_HYPERLOCAL" },
  ];

  // Auto select first partner if empty
  React.useEffect(() => {
    if (!courierPartnerId && partners.length > 0) {
      setCourierPartnerId(partners[0].id);
    }
  }, [partners, courierPartnerId]);

  // Fetch packed orders waiting for shipment
  const { data: packedOrdersData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["admin-packed-orders"],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<Order>>("/orders", {
        params: { status: "PACKED", pageSize: 50 },
      }),
    enabled: isOpen && !preselectedOrder,
  });

  const packedOrders = packedOrdersData?.items || [];

  const shipmentMutation = useMutation({
    mutationFn: (payload: CreateShipmentPayload) =>
      defaultApiClient.post<DeliveryShipment>("/delivery/shipments", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipments-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to create courier shipment."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!orderId) {
      setFormError("Please select a packed order to dispatch.");
      return;
    }

    if (!courierPartnerId) {
      setFormError("Please select a courier partner.");
      return;
    }

    if (trackingNumber.trim().length < 4) {
      setFormError("Please enter or scan a valid AWB / Tracking number (min 4 characters).");
      return;
    }

    if (weightGrams <= 0) {
      setFormError("Package weight must be greater than 0 grams.");
      return;
    }

    const payload: CreateShipmentPayload = {
      orderId,
      courierPartnerId,
      trackingNumber: trackingNumber.trim(),
      weightGrams,
      packageDimensions: {
        lengthCm,
        widthCm,
        heightCm,
      },
      specialInstructions: specialInstructions.trim() || undefined,
    };

    shipmentMutation.mutate(payload);
  };

  const handleGenerateAWB = () => {
    const selected = partners.find((p) => p.id === courierPartnerId);
    const prefix = selected ? selected.code.substring(0, 3) : "BGD";
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    setTrackingNumber(`${prefix}${randomDigits}IN`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispatch Order & Create Shipment" maxWidth="640px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Order Selection */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Order to Dispatch *
          </label>
          {preselectedOrder ? (
            <div
              style={{
                background: "#191B1A",
                border: "1px solid rgba(197, 161, 91, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                color: "#FFFFFF",
                fontSize: "13px",
              }}
            >
              Order <strong>#{preselectedOrder.orderNumber}</strong> • {preselectedOrder.customerName} ({preselectedOrder.shippingAddress.city})
            </div>
          ) : (
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
              required
            >
              <option value="">Select a packed order...</option>
              {packedOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.orderNumber} — {o.customerName} ({o.shippingAddress.city}, {o.shippingAddress.pincode || o.shippingAddress.postalCode})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Courier Partner Selection */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Assigned Courier Partner *
          </label>
          <select
            value={courierPartnerId}
            onChange={(e) => setCourierPartnerId(e.target.value)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
            }}
            required
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.serviceType.replace(/_/g, " ")})
              </option>
            ))}
          </select>
        </div>

        {/* Tracking Number / AWB */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase" }}>
              AWB / Tracking Number *
            </label>
            <button
              type="button"
              onClick={handleGenerateAWB}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-champagne-gold)",
                fontSize: "11px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Generate Partner Barcode
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="e.g. BD982348234IN or scan barcode"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{
                flex: 1,
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
              required
            />
          </div>
        </div>

        {/* Package Dimensions & Weight */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "10px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Weight (Grams) *
            </label>
            <input
              type="number"
              min="50"
              value={weightGrams}
              onChange={(e) => setWeightGrams(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Length (cm)
            </label>
            <input
              type="number"
              value={lengthCm}
              onChange={(e) => setLengthCm(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Width (cm)
            </label>
            <input
              type="number"
              value={widthCm}
              onChange={(e) => setWidthCm(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Height (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Special Handover Instructions
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Fragile silk garment inside, keep dry, signature required on delivery"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Form Error */}
        {formError && (
          <div style={{ color: "#FF8F8F", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {formError}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={shipmentMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={shipmentMutation.isPending} leftIcon={<Truck size={14} />}>
            Generate Shipment & Label
          </Button>
        </div>
      </form>
    </Modal>
  );
};
