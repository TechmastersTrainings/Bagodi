import React, { useState } from "react";
import { defaultApiClient } from "@bagodi/api-client";
import { KeyRound, CheckCircle2, AlertCircle, X, User } from "lucide-react";

export interface DeliveryOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  orderNumber: string;
  customerName: string;
  onDeliverySuccess: () => void;
}

export const DeliveryOtpModal: React.FC<DeliveryOtpModalProps> = ({
  isOpen,
  onClose,
  shipmentId,
  orderNumber,
  customerName,
  onDeliverySuccess,
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [recipientName, setRecipientName] = useState(customerName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    const next = [...otpDigits];
    next[index] = cleaned.slice(-1);
    setOtpDigits(next);

    // Auto-advance to next input box
    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`delivery-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`delivery-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtpDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    document.getElementById(`delivery-otp-${lastFilled}`)?.focus();
  };

  const fullOtp = otpDigits.join("");
  const isComplete = fullOtp.length === 6;

  const handleVerifyDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setErrorMsg("Please enter the complete 6-digit delivery OTP code.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await defaultApiClient.post(`/delivery-staff/shipments/${shipmentId}/deliver`, {
        delivery_otp: fullOtp,
        recipient_name: recipientName || customerName,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onDeliverySuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg =
        (typeof detail === "object" && detail?.message) ||
        (typeof detail === "string" && detail) ||
        err?.message ||
        "Delivery OTP verification failed. Please ask the customer for the valid 6-digit handover OTP.";
      setErrorMsg(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(197, 161, 91, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C5A15B",
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                Confirm Doorstep Handover
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                Order #{orderNumber} • {customerName}
              </p>
            </div>
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
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleVerifyDelivery} style={{ padding: 24 }}>
          {isSuccess ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#059669",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700, color: "#111412" }}>
                Delivery Verified!
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#7A807C" }}>
                Handover authenticated via secure customer OTP. Status updated to Delivered.
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 8px 0" }}>
                  Ask <strong>{customerName}</strong> for the 6-digit delivery OTP displayed on their Bagodi order tracking screen.
                </p>
                <span
                  style={{
                    display: "inline-block",
                    background: "#FEF3C7",
                    color: "#92400E",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 12,
                  }}
                >
                  Authentic Verification Required
                </span>
              </div>

              {/* 6-Digit PIN Boxes */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`delivery-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    style={{
                      width: 44,
                      height: 52,
                      fontSize: 22,
                      fontWeight: 700,
                      textAlign: "center",
                      borderRadius: 10,
                      border: digit ? "2px solid #0A2540" : "1.5px solid #D1D5DB",
                      background: digit ? "#F0FDF4" : "#FFFFFF",
                      color: "#111412",
                      outline: "none",
                      transition: "all 0.15s ease",
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Recipient Name Field */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Package Handed To
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color="#9CA3AF"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Customer or family member name"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: 10,
                      border: "1px solid #D1D5DB",
                      fontSize: "13px",
                      color: "#111412",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#FEE2E2",
                    color: "#991B1B",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: "12px",
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isComplete || isSubmitting}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 12,
                  background: isComplete && !isSubmitting ? "#059669" : "#9CA3AF",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: isComplete && !isSubmitting ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: isComplete ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
                  transition: "background 0.2s ease",
                }}
              >
                <CheckCircle2 size={18} />
                <span>{isSubmitting ? "Verifying Handover..." : "Complete Delivery & Confirm Handover"}</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

