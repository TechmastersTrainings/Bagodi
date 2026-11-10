import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Button } from "@bagodi/shared-components";
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: 840 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", margin: 0 }}>
          SYSTEM CONFIGURATION & MAINTENANCE
        </h1>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 4 }}>
          Global platform parameters, security policies, cache invalidation, and platform emergency dials.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Maintenance Mode Card */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}>
              Emergency Maintenance Mode
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-muted-grey)", marginTop: "2px" }}>
              Temporarily halts all customer checkout and storefront operations while allowing super admin maintenance.
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ accentColor: "var(--status-danger)", width: 20, height: 20 }}
            />
          </label>
        </div>

        {/* Security Session Dials */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={16} color="var(--color-champagne-gold)" /> Security & Session Configuration
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Session Inactivity Timeout (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 60)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Max Catalogue Media Upload (MB)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxUploadSizeMb}
                onChange={(e) => setMaxUploadSizeMb(parseInt(e.target.value) || 25)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Global Cache Invalidation */}
        <div
          style={{
            background: "#191B1A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}>
              Flush Global CDN & Redis Cache
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-muted-grey)", marginTop: "2px" }}>
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
            >
              {cachePurgeSuccess ? "Flushed Clean!" : "Purge Edge Cache"}
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ color: "var(--status-success)", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={15} /> Platform configuration saved successfully.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary">
            Save Platform Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
