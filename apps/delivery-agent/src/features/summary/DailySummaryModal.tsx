import React from "react";
import { formatINR } from "@bagodi/utilities";
import {
  Banknote,
  QrCode,
  CheckCircle2,
  Calendar,
  X,
  TrendingUp,
  PackageCheck,
  Building,
} from "lucide-react";

export interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentCode: string;
  completedCount: number;
  totalCashCollected: number;
  totalUpiCollected: number;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  agentName,
  agentCode,
  completedCount,
  totalCashCollected,
  totalUpiCollected,
}) => {
  if (!isOpen) return null;

  const totalCollected = totalCashCollected + totalUpiCollected;
  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 37, 64, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #E5E1D8",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0A2540",
            padding: "20px",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#C5A15B", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Calendar size={13} />
              <span>{todayFormatted}</span>
            </div>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "17px", fontWeight: 700, color: "#FFFFFF" }}>
              Daily Trip & Collection Summary
            </h3>
            <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.7)" }}>
              {agentName} • {agentCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Key Metric: Trips Completed */}
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 14,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PackageCheck size={22} />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
                  Completed Handorders
                </span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#14532D" }}>
                  {completedCount} Shipments
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#16A34A",
                background: "#FFFFFF",
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid #86EFAC",
              }}
            >
              100% Verified
            </span>
          </div>

          {/* Collection Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {/* Cash to Deposit */}
            <div
              style={{
                background: "#FEF3C7",
                border: "1px solid #FDE68A",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Banknote size={20} color="#D97706" />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#B45309" }}>
                    Physical cash to deposit at boutique
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#92400E" }}>
                {formatINR(totalCashCollected)}
              </div>
            </div>

            {/* UPI Collected */}
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <QrCode size={20} color="#2563EB" />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#1E40AF" }}>
                    Dynamic UPI QR
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#3B82F6" }}>
                    Direct verified bank settlements
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#1E40AF" }}>
                {formatINR(totalUpiCollected)}
              </div>
            </div>

            {/* Total GMV Collected */}
            <div
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TrendingUp size={20} color="#4B5563" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>
                  Total Collected Value
                </span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111412" }}>
                {formatINR(totalCollected)}
              </div>
            </div>
          </div>

          {/* Deposit Instruction Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px dashed #CBD5E1",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <Building size={18} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "11px", color: "#475569", lineHeight: 1.4 }}>
              <strong>Cash Reconciliation Note:</strong> Please hand over <strong>{formatINR(totalCashCollected)}</strong> in physical cash to the Bagodi Flagship Store manager at the end of your shift for vault deposit.
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
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
            }}
          >
            Back to Active Runs
          </button>
        </div>
      </div>
    </div>
  );
};

