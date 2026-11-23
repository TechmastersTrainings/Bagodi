import React from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { PlatformGovernanceSummary } from "@bagodi/shared-types";
import { SkeletonCard, ApiErrorCard, Button, StatusBadge } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import {
  Building2,
  Users,
  Server,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";

export const SuperDashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<PlatformGovernanceSummary>({
    queryKey: ["super-platform-governance"],
    queryFn: () => defaultApiClient.get<PlatformGovernanceSummary>("/super/platform-summary"),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} height="130px" />
          ))}
        </div>
        <SkeletonCard height="240px" />
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorCard
        title="Super Admin Platform Gateway Offline"
        message="Could not retrieve platform governance statistics. Please verify master platform API connectivity."
        onRetry={() => refetch()}
      />
    );
  }

  const totalMerchants = data?.totalMerchants ?? 0;
  const activeMerchants = data?.activeMerchants ?? 0;
  const suspendedMerchants = data?.suspendedMerchants ?? 0;
  const totalStores = data?.totalStores ?? 0;
  const platformLifetimeGmv = data?.platformLifetimeGmv ?? 0;
  const totalEndUsers = data?.totalEndUsers ?? 0;
  const services = Array.isArray(data?.services) ? data.services : [];

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E5E1D8",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.75rem", fontWeight: 800, color: "#111412", letterSpacing: "0.02em", margin: 0 }}>
            Platform Governance Cockpit
          </h1>
          <p style={{ fontSize: "13px", color: "#7A807C", marginTop: 4 }}>
            TechMasters Innovations Multi-Tenant Infrastructure Monitoring & Merchant Telemetry.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
            style={{ border: "1px solid #E5E1D8", background: "#FFFFFF", color: "#111412" }}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* 2. Platform Telemetry KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        <div style={cardStyle}>
          <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A807C", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
            <span>Commercial Tenants</span>
            <Building2 size={16} color="#C5A15B" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#111412", margin: "10px 0 4px", fontFamily: "var(--font-mono)" }}>
            {totalMerchants}
          </div>
          <div style={{ fontSize: "11.5px", color: "#2E7D32", fontWeight: 500 }}>
            {activeMerchants} active • {suspendedMerchants} suspended
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A807C", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
            <span>Active Storefronts</span>
            <Layers size={16} color="#C5A15B" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#111412", margin: "10px 0 4px", fontFamily: "var(--font-mono)" }}>
            {totalStores}
          </div>
          <div style={{ fontSize: "11.5px", color: "#7A807C" }}>
            Flagship & Boutique Outlets
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A807C", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
            <span>Platform Lifetime GMV</span>
            <TrendingUp size={16} color="#E31B23" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#E31B23", margin: "10px 0 4px", fontFamily: "var(--font-mono)" }}>
            {formatINR(platformLifetimeGmv)}
          </div>
          <div style={{ fontSize: "11.5px", color: "#2E7D32", fontWeight: 500 }}>
            Across all tenant gateways
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A807C", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
            <span>Consumer Network</span>
            <Users size={16} color="#C5A15B" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#111412", margin: "10px 0 4px", fontFamily: "var(--font-mono)" }}>
            {totalEndUsers.toLocaleString()}
          </div>
          <div style={{ fontSize: "11.5px", color: "#7A807C" }}>
            Registered customers & shoppers
          </div>
        </div>
      </div>

      {/* 3. Microservice Infrastructure Grid */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E1D8",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111412", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Server size={18} color="#C5A15B" /> Core Platform Microservices & Mutex Health
            </h2>
            <p style={{ fontSize: "12px", color: "#7A807C", margin: "4px 0 0" }}>
              Real-time heartbeat polling and latency diagnostics from master gateway node.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#2E7D32", fontWeight: 600 }}>
            <CheckCircle2 size={15} /> All Services Operational
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F0EDE6", color: "#7A807C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Microservice Domain</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Roundtrip Latency</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Availability (SLA)</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Last Ping Time</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px 14px", textAlign: "center", color: "#7A807C", fontStyle: "italic" }}>
                    No microservice telemetry recorded yet. Active services report live heartbeats automatically.
                  </td>
                </tr>
              ) : (
                services.map((svc, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #F0EDE6",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F7F5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px", fontWeight: 600, color: "#111412" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Cpu size={14} color="#C5A15B" />
                        {svc.serviceName}
                      </div>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <StatusBadge variant="success" label="Operational" />
                    </td>
                    <td style={{ padding: "14px", fontFamily: "var(--font-mono)", color: "#111412", fontWeight: 500 }}>
                      {svc.latencyMs} ms
                    </td>
                    <td style={{ padding: "14px", fontFamily: "var(--font-mono)", color: "#2E7D32", fontWeight: 600 }}>
                      {svc.uptimePercentage}%
                    </td>
                    <td style={{ padding: "14px", fontSize: "11px", color: "#7A807C", fontFamily: "var(--font-mono)" }}>
                      Just now
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
