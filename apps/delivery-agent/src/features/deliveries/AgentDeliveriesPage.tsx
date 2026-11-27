import React, { useState, useEffect } from "react";
import { defaultApiClient } from "@bagodi/api-client";
import { formatINR } from "@bagodi/utilities";
import {
  MapPin,
  Phone,
  Navigation,
  Package,
  CheckCircle2,
  Clock,
  QrCode,
  KeyRound,
  Building,
  Power,
  BarChart2,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Bike,
} from "lucide-react";
import { PaymentCollectionModal } from "./PaymentCollectionModal";
import { DeliveryOtpModal } from "./DeliveryOtpModal";
import { DailySummaryModal } from "../summary/DailySummaryModal";

export interface DeliveryShipment {
  id: string;
  shipment_number: string;
  order_id: string;
  order_number: string;
  status: "assigned" | "picked_up" | "out_for_delivery" | "delivered" | "failed";
  recipient_name: string;
  recipient_phone: string;
  destination_address: string;
  store_name: string;
  store_address: string;
  item_summary: string;
  amount_payable: number;
  payment_status: "captured" | "pending" | "cod";
  created_at: string;
}

export const AgentDeliveriesPage: React.FC = () => {
  const [dutyStatus, setDutyStatus] = useState<"AVAILABLE" | "OFFLINE">("AVAILABLE");
  const [shipments, setShipments] = useState<DeliveryShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingDuty, setIsUpdatingDuty] = useState(false);

  // Modals
  const [selectedShipmentForPayment, setSelectedShipmentForPayment] = useState<DeliveryShipment | null>(null);
  const [selectedShipmentForOtp, setSelectedShipmentForOtp] = useState<DeliveryShipment | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Rider identity
  const rider = {
    name: "Vikram Jadhav",
    code: "DEL-BID-001",
    phone: "+919845011221",
    vehicle: "KA-38-EA-1024 (Hero Splendor Pro)",
    zone: "Bidar Central (585401 - 585404)",
  };

  // Fetch Assigned Deliveries
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const resp = await defaultApiClient.get<any[]>("/delivery-staff/me/assigned-shipments");
      if (Array.isArray(resp)) {
        setShipments(
          resp.map((s) => ({
            id: s.id,
            shipment_number: s.shipment_number || `SHP-${s.id.slice(0, 8)}`,
            order_id: s.order_id,
            order_number: s.order_number || s.shipment_number || s.order_id,
            status: (String(s.status || "assigned").toLowerCase() as DeliveryShipment["status"]),
            recipient_name: s.recipient_name || "Customer",
            recipient_phone: s.recipient_phone || "",
            destination_address: s.destination_address || "",
            store_name: s.store_name || "Bagodi Flagship Store",
            store_address: s.store_address || "",
            item_summary: s.item_summary || `${s.items?.length || 1} package(s)`,
            amount_payable: Number(s.cod_amount ?? s.amount_payable ?? 0),
            payment_status: s.is_cod ? "cod" : "captured",
            created_at: s.created_at || new Date().toISOString(),
          }))
        );
      } else {
        setShipments([]);
      }
    } catch {
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Location Coordinate Heartbeat (every 30 seconds)
  useEffect(() => {
    if (dutyStatus !== "AVAILABLE") return;
    const interval = setInterval(async () => {
      try {
        await defaultApiClient.put("/delivery-staff/me/location", {
          latitude: 17.9104 + (Math.random() - 0.5) * 0.005,
          longitude: 77.5199 + (Math.random() - 0.5) * 0.005,
        });
      } catch {
        // silent heartbeat
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dutyStatus]);

  // Toggle Duty Status
  const handleToggleDuty = async () => {
    setIsUpdatingDuty(true);
    const nextStatus = dutyStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
    try {
      await defaultApiClient.put("/delivery-staff/me/duty-status", {
        duty_status: nextStatus,
      });
      setDutyStatus(nextStatus);
    } catch {
      // keep previous status when update fails
    } finally {
      setIsUpdatingDuty(false);
    }
  };

  // Step 1: Pickup from Store
  const handlePickupPackage = async (shipmentId: string) => {
    await defaultApiClient.post(`/delivery-staff/shipments/${shipmentId}/pickup`, {});
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status: "picked_up" } : s))
    );
  };

  // Step 2: Mark Out For Delivery
  const handleOutForDelivery = async (shipmentId: string) => {
    await defaultApiClient.post(`/delivery-staff/shipments/${shipmentId}/out-for-delivery`, {});
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status: "out_for_delivery" } : s))
    );
  };

  // Handle Payment Capture Success
  const handlePaymentSuccess = () => {
    if (!selectedShipmentForPayment) return;
    setShipments((prev) =>
      prev.map((s) =>
        s.id === selectedShipmentForPayment.id ? { ...s, payment_status: "captured" } : s
      )
    );
    setSelectedShipmentForPayment(null);
  };

  // Handle Handover Success
  const handleHandoverSuccess = () => {
    if (!selectedShipmentForOtp) return;
    setShipments((prev) =>
      prev.map((s) =>
        s.id === selectedShipmentForOtp.id ? { ...s, status: "delivered" } : s
      )
    );
    setSelectedShipmentForOtp(null);
  };

  // Collections metrics
  const completedShipments = shipments.filter((s) => s.status === "delivered");
  const totalCash = shipments
    .filter((s) => s.status === "delivered" && s.payment_status === "cod")
    .reduce((acc, curr) => acc + curr.amount_payable, 0);
  const totalUpi = shipments
    .filter((s) => s.status === "delivered" && s.payment_status === "captured")
    .reduce((acc, curr) => acc + curr.amount_payable, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F6F8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* 1. Rider Top HUD Header */}
      <div
        style={{
          background: "#0A2540",
          color: "#FFFFFF",
          padding: "20px 16px 16px 16px",
          boxShadow: "0 4px 12px rgba(10, 37, 64, 0.15)",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Top Brand Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "18px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: "#C5A15B",
                }}
              >
                BAGODI
              </span>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  background: "rgba(255,255,255,0.12)",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                LAST-MILE FLEET
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                title="Daily Trips & Cash Summary"
                style={{
                  background: "rgba(197, 161, 91, 0.18)",
                  border: "1px solid rgba(197, 161, 91, 0.4)",
                  color: "#C5A15B",
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <BarChart2 size={14} />
                <span>Summary</span>
              </button>

              <button
                type="button"
                onClick={fetchDeliveries}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#FFFFFF",
                  padding: 8,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Rider Identity & Duty Switch */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #C5A15B 0%, #8C6A18 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                VJ
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{rider.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Bike size={12} color="#C5A15B" />
                  <span>{rider.vehicle}</span>
                </div>
              </div>
            </div>

            {/* Duty Status Switch */}
            <button
              type="button"
              onClick={handleToggleDuty}
              disabled={isUpdatingDuty}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                border: "none",
                background: dutyStatus === "AVAILABLE" ? "#059669" : "#4B5563",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: dutyStatus === "AVAILABLE" ? "0 0 10px rgba(5, 150, 105, 0.5)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Power size={13} />
              <span>{dutyStatus === "AVAILABLE" ? "ON DUTY" : "OFFLINE"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Deliveries Queue */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
        {/* Section Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111412", margin: 0 }}>
            Active Run Queue ({shipments.filter((s) => s.status !== "delivered").length})
          </h2>
          <span style={{ fontSize: "12px", color: "#6B7280" }}>
            Zone: <strong>Bidar Central</strong>
          </span>
        </div>

        {/* Deliveries List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {shipments.map((shipment) => {
            const isDelivered = shipment.status === "delivered";
            const isOutForDelivery = shipment.status === "out_for_delivery";
            const isPickedUp = shipment.status === "picked_up";
            const isAssigned = shipment.status === "assigned";
            const isPaid = shipment.payment_status === "captured";

            return (
              <div
                key={shipment.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: isDelivered ? "1px solid #E5E7EB" : "1.5px solid #0A2540",
                  boxShadow: isDelivered ? "none" : "0 4px 16px rgba(0,0,0,0.06)",
                  padding: "16px",
                  opacity: isDelivered ? 0.75 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header: Order # & Status Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#C5A15B", letterSpacing: "0.05em" }}>
                      BAGODI LUXURY COURIER
                    </span>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#111412" }}>
                      {shipment.order_number}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 20,
                      textTransform: "uppercase",
                      background: isDelivered
                        ? "#ECFDF5"
                        : isOutForDelivery
                        ? "#FEF3C7"
                        : isPickedUp
                        ? "#EFF6FF"
                        : "#F3F4F6",
                      color: isDelivered
                        ? "#059669"
                        : isOutForDelivery
                        ? "#D97706"
                        : isPickedUp
                        ? "#2563EB"
                        : "#4B5563",
                    }}
                  >
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Items Description */}
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Package size={18} color="#64748B" />
                  <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                    {shipment.item_summary}
                  </span>
                </div>

                {/* Pickup & Destination Addresses */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {/* Store Pickup */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#EFF6FF",
                        color: "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Building size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase" }}>
                        Pickup Boutique
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#1E293B" }}>
                        {shipment.store_name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        {shipment.store_address}
                      </div>
                    </div>
                  </div>

                  {/* Destination Customer Address */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#FEF2F2",
                        color: "#DC2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <MapPin size={13} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#DC2626", textTransform: "uppercase" }}>
                        Customer Doorstep
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#111412" }}>
                        {shipment.recipient_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#4B5563", marginTop: 1 }}>
                        {shipment.destination_address}
                      </div>
                    </div>

                    {/* Quick Call Button */}
                    <a
                      href={`tel:${shipment.recipient_phone}`}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#ECFDF5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        flexShrink: 0,
                      }}
                      title="Call Customer"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>

                {/* Amount Payable HUD */}
                <div
                  style={{
                    background: isPaid ? "#ECFDF5" : "#FEF3C7",
                    border: `1px solid ${isPaid ? "#A7F3D0" : "#FDE68A"}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isPaid ? "#065F46" : "#92400E", textTransform: "uppercase" }}>
                      {isPaid ? "Payment Verified" : "Doorstep Collection Due"}
                    </span>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: isPaid ? "#065F46" : "#92400E" }}>
                      {formatINR(shipment.amount_payable)}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 16,
                      background: isPaid ? "#059669" : "#D97706",
                      color: "#FFFFFF",
                    }}
                  >
                    {isPaid ? "Captured" : "COD / UPI"}
                  </span>
                </div>

                {/* Action Stepper Buttons */}
                {!isDelivered && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Navigation Link */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        shipment.destination_address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#334155",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        textDecoration: "none",
                      }}
                    >
                      <Navigation size={15} color="#0284C7" />
                      <span>Start Google Maps Navigation</span>
                    </a>

                    {/* Step 1: Pickup Package */}
                    {isAssigned && (
                      <button
                        type="button"
                        onClick={() => handlePickupPackage(shipment.id)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          background: "#0A2540",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Package size={16} />
                        <span>Confirm Store Package Pickup</span>
                      </button>
                    )}

                    {/* Step 2: Mark Out for Delivery */}
                    {isPickedUp && (
                      <button
                        type="button"
                        onClick={() => handleOutForDelivery(shipment.id)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          background: "#2563EB",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Navigation size={16} />
                        <span>Start Ride • Out for Delivery</span>
                      </button>
                    )}

                    {/* Step 3: Collect Payment (if unpaid) */}
                    {isOutForDelivery && !isPaid && (
                      <button
                        type="button"
                        onClick={() => setSelectedShipmentForPayment(shipment)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          background: "#D97706",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
                        }}
                      >
                        <QrCode size={16} />
                        <span>Collect Payment (Cash / UPI QR)</span>
                      </button>
                    )}

                    {/* Step 4: Confirm Handover OTP (once paid or prepaid) */}
                    {isOutForDelivery && isPaid && (
                      <button
                        type="button"
                        onClick={() => setSelectedShipmentForOtp(shipment)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          background: "#059669",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                        }}
                      >
                        <KeyRound size={16} />
                        <span>Verify Customer 6-Digit OTP Handover</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Delivered Status Card */}
                {isDelivered && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: "#059669",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      padding: "8px 0",
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Delivered & Handover Confirmed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Collection Modal */}
      {selectedShipmentForPayment && (
        <PaymentCollectionModal
          isOpen={Boolean(selectedShipmentForPayment)}
          onClose={() => setSelectedShipmentForPayment(null)}
          shipmentId={selectedShipmentForPayment.id}
          orderNumber={selectedShipmentForPayment.order_number}
          amountPayable={selectedShipmentForPayment.amount_payable}
          isPaid={selectedShipmentForPayment.payment_status === "captured"}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Delivery OTP Handover Modal */}
      {selectedShipmentForOtp && (
        <DeliveryOtpModal
          isOpen={Boolean(selectedShipmentForOtp)}
          onClose={() => setSelectedShipmentForOtp(null)}
          shipmentId={selectedShipmentForOtp.id}
          orderNumber={selectedShipmentForOtp.order_number}
          customerName={selectedShipmentForOtp.recipient_name}
          onDeliverySuccess={handleHandoverSuccess}
        />
      )}

      {/* Daily Summary Modal */}
      <DailySummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        agentName={rider.name}
        agentCode={rider.code}
        completedCount={completedShipments.length}
        totalCashCollected={totalCash}
        totalUpiCollected={totalUpi}
      />
    </div>
  );
};

