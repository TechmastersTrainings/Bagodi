import React, { useState } from "react";
import { Order } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { Send, CheckCircle, MessageSquare, Mail, Phone } from "lucide-react";

export interface NotifyCustomerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyCustomerModal: React.FC<NotifyCustomerModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS" | "EMAIL">("WHATSAPP");
  const [customNote, setCustomNote] = useState<string>(
    "Your luxury garment has passed final artisan inspection and is packed at our flagship store. Delivery is being scheduled."
  );
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!order || !isOpen) return null;

  const customerName = order.customerName || "Valued Client";
  const customerPhone = order.customerPhone || order.shippingAddress?.phone || "+91 98450 00000";
  const customerEmail = order.customerEmail || "client@bagodi.in";

  const handleSend = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Dispatch Notification: Order #${order.orderNumber}`}
      maxWidth="620px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {isSent && (
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
            Notification dispatched to {customerName} via {channel}!
          </div>
        )}

        {/* Customer Info Card */}
        <div
          style={{
            padding: "12px 14px",
            background: "#F8F7F5",
            borderRadius: 8,
            border: "1px solid #E5E1D8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Recipient Customer
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111412" }}>
              {customerName}
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#4A4E4B", textAlign: "right" }}>
            <div>{customerPhone}</div>
            <div style={{ fontSize: "11px", color: "#7A807C" }}>{customerEmail}</div>
          </div>
        </div>

        {/* Notification Channel Picker */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 6 }}>
            Dispatch Channel *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={() => setChannel("WHATSAPP")}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${channel === "WHATSAPP" ? "#2E7D32" : "#E5E1D8"}`,
                background: channel === "WHATSAPP" ? "#E8F5E9" : "#FFFFFF",
                color: channel === "WHATSAPP" ? "#1B5E20" : "#4A4E4B",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <MessageSquare size={14} /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setChannel("SMS")}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${channel === "SMS" ? "#C5A15B" : "#E5E1D8"}`,
                background: channel === "SMS" ? "#FFF9EE" : "#FFFFFF",
                color: channel === "SMS" ? "#B08A3E" : "#4A4E4B",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Phone size={14} /> SMS Text
            </button>
            <button
              type="button"
              onClick={() => setChannel("EMAIL")}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${channel === "EMAIL" ? "#E31B23" : "#E5E1D8"}`,
                background: channel === "EMAIL" ? "#FFF5F5" : "#FFFFFF",
                color: channel === "EMAIL" ? "#E31B23" : "#4A4E4B",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Mail size={14} /> Official Email
            </button>
          </div>
        </div>

        {/* Message Preview */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B", display: "block", marginBottom: 6 }}>
            Notification Message Preview *
          </label>
          <div
            style={{
              padding: "12px 14px",
              background: "#FDFBF7",
              border: "1px dashed #D5CEBF",
              borderRadius: 8,
              fontSize: "12px",
              color: "#111412",
              lineHeight: 1.5,
            }}
          >
            <strong>Namaste {customerName},</strong>
            <p style={{ margin: "6px 0" }}>
              Your Bagodi luxury couture order <strong>#{order.orderNumber}</strong> ({order.items?.[0]?.productName || "garment"}) is <strong>available and packed</strong>.
            </p>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #E5E1D8",
                borderRadius: 4,
                fontFamily: "inherit",
                fontSize: "12px",
                background: "#FFFFFF",
                color: "#4A4E4B",
                marginTop: 4,
              }}
            />
            <p style={{ margin: "6px 0 0 0", color: "#7A807C", fontSize: "11px" }}>
              Our logistics team will dispatch this order shortly with real-time GPS tracking.
            </p>
          </div>
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
            isLoading={isSubmitting}
            onClick={handleSend}
            style={{ background: "#2E7D32", color: "#FFFFFF" }}
          >
            <Send size={13} style={{ marginRight: 6 }} />
            Send Notification to Customer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

