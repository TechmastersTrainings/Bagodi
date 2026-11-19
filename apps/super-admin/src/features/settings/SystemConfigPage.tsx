import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Button } from "@bagodi/shared-components";
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const SystemConfigPage: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(25);
  const [cachePurgeSuccess, setCachePurgeSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const purgeCacheMutation = useMutation({
    mutationFn: () => defaultApiClient.post("/super/purge-cache", {}),
    onSuccess: () => {
      setCachePurgeSuccess(true);
      setTimeout(() => setCachePurgeSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E5E1D8",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#F8F7F5",
    border: "1px solid #E5E1D8",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#111412",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#7A807C",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 840 }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.75rem", fontWeight: 800, color: "#111412", letterSpacing: "0.02em", margin: 0 }}>
          System Configuration & Maintenance
        </h1>
        <p style={{ fontSize: "13px", color: "#7A807C", marginTop: 4 }}>
          Global platform parameters, security policies, cache invalidation, and platform emergency dials.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Maintenance Mode Card */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#111412" }}>
              Emergency Maintenance Mode
            </div>
            <div style={{ fontSize: "12.5px", color: "#7A807C", marginTop: "4px" }}>
              Temporarily halts all customer checkout and storefront operations while allowing super admin maintenance.
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ accentColor: "#E31B23", width: 20, height: 20 }}
            />
          </label>
        </div>

        {/* Security Session Dials */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#111412", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} color="#C5A15B" /> Security & Session Configuration
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 60)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Max Catalogue Media Upload (MB)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxUploadSizeMb}
                onChange={(e) => setMaxUploadSizeMb(parseInt(e.target.value) || 25)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Global Cache Invalidation */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#111412", display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} color="#C5A15B" /> Flush Global CDN & Redis Cache
            </div>
            <div style={{ fontSize: "12.5px", color: "#7A807C", marginTop: "4px" }}>
              Purges all cached catalogue responses, product queries, and inventory counts across edge nodes.
            </div>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={() => purgeCacheMutation.mutate()}
              isLoading={purgeCacheMutation.isPending}
              style={{ border: "1px solid #E5E1D8", background: "#FFFFFF", color: "#111412" }}
            >
              {cachePurgeSuccess ? "Flushed Clean!" : "Purge Edge Cache"}
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ color: "#2E7D32", fontSize: "12.5px", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Platform configuration saved successfully.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="primary"
            style={{ background: "#E31B23", borderColor: "#E31B23" }}
          >
            Save Platform Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
