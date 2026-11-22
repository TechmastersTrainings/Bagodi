import React, { useState } from "react";
import { useAuth } from "@bagodi/authentication";
import { defaultApiClient } from "@bagodi/api-client";
import { Truck, ShieldCheck, Lock, Phone, ArrowRight, AlertCircle } from "lucide-react";

export interface AgentLoginPageProps {
  onLoginSuccess?: () => void;
}

export const AgentLoginPage: React.FC<AgentLoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await defaultApiClient.post<{ tokens: any; user: any }>(
        "/auth/login",
        {
          email: identifier.includes("@") ? identifier : undefined,
          phone: !identifier.includes("@") ? identifier : undefined,
          password,
        },
        { skipAuth: true }
      );
      login(response.tokens, response.user);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid delivery agent credentials. Verify phone/ID and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 16px",
        background: "linear-gradient(180deg, #0A2540 0%, #061727 100%)",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          borderRadius: 20,
          padding: "32px 24px",
          color: "#111412",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0A2540 0%, #163B60 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 14px rgba(10,37,64,0.3)",
            }}
          >
            <Truck size={28} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#C5A15B",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            BAGODI LOGISTICS
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 800,
              margin: "4px 0 0",
              color: "#0A2540",
            }}
          >
            Delivery Partner Terminal
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748B", margin: "6px 0 0" }}>
            Real-time order pickup, doorstep navigation & UPI collection.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#DC2626",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#64748B",
                display: "block",
                marginBottom: 6,
              }}
            >
              Registered Phone or Agent Email
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="e.g. delivery1@bagodi.in or +919845011221"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  padding: "0 14px 0 40px",
                  fontSize: "13.5px",
                  color: "#0A2540",
                  background: "#F8FAFC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Phone
                size={16}
                color="#94A3B8"
                style={{ position: "absolute", left: 14, top: 14, pointerEvents: "none" }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#64748B",
                display: "block",
                marginBottom: 6,
              }}
            >
              Agent Security PIN / Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                placeholder="Enter password or 6-digit PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  padding: "0 14px 0 40px",
                  fontSize: "13.5px",
                  color: "#0A2540",
                  background: "#F8FAFC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Lock
                size={16}
                color="#94A3B8"
                style={{ position: "absolute", left: 14, top: 14, pointerEvents: "none" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 46,
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #0A2540 0%, #163B60 100%)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(10,37,64,0.25)",
              marginTop: 6,
            }}
          >
            <span>{isLoading ? "Authenticating..." : "Start On-Duty Shift"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            padding: "12px",
            background: "#F8FAFC",
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: "11.5px",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ShieldCheck size={16} color="#059669" />
          <span>Active Flagship Fleet • Assigned Store: Bidar Mall</span>
        </div>
      </div>
    </div>
  );
};

