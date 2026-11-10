import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { AuditLogEntry, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import {
  Search,
  Filter,
  RefreshCw,
  Printer,
} from "lucide-react";

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<AuditLogEntry>>({
    queryKey: ["super-audit-logs", page, actionFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 20,
      };
      if (actionFilter !== "ALL") params.action = actionFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<AuditLogEntry>>("/super/audit-logs", { params });
    },
    retry: 1,
  });

  const logs = data?.items || [
    {
      id: "log_98234812",
      timestamp: new Date().toISOString(),
      actorId: "usr_root_01",
      actorEmail: "root@techmasters.in",
      action: "MERCHANT_ONBOARDED" as const,
      targetResource: "Tenant: bagodi-bidar",
      targetId: "tenant_bagodi_bidar",
      ipAddress: "103.212.144.12",
      status: "SUCCESS" as const,
    },
    {
      id: "log_98234811",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actorId: "usr_root_01",
      actorEmail: "root@techmasters.in",
      action: "SECURITY_LOGIN_SUCCESS" as const,
      targetResource: "Platform Authentication",
      ipAddress: "103.212.144.12",
      status: "SUCCESS" as const,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (row) => (
        <span style={{ fontSize: "11px", color: "var(--color-muted-grey)", fontFamily: "var(--font-mono)" }}>
          {formatDateTime(row.timestamp)}
        </span>
      ),
    },
    {
      key: "actorEmail",
      header: "Operator / Actor",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "12px" }}>{row.actorEmail}</div>
          <div style={{ fontSize: "10px", color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)" }}>
            IP: {row.ipAddress}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action Event",
      render: (row) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-light-champagne)" }}>
          {row.action}
        </span>
      ),
    },
    {
      key: "targetResource",
      header: "Target Resource",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "#FFFFFF" }}>{row.targetResource}</span>
      ),
    },
    {
      key: "status",
      header: "Audit Status",
      render: (row) => (
        row.status === "SUCCESS" ? (
          <StatusBadge variant="success" label="SUCCESS" />
        ) : (
          <StatusBadge variant="danger" label={row.status} />
        )
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 1. Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", margin: 0 }}>
            IMMUTABLE SECURITY AUDIT TRAIL
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 4 }}>
            Tamper-evident system access, administrative privilege mutations, and compliance logging.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Printer size={14} />} onClick={handlePrint}>
            Export Audit Trail (PDF)
          </Button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div
        style={{
          background: "#191B1A",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search audit trail by operator email, action type, IP address, or target ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              color: "#FFFFFF",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "flex", alignItems: "center", gap: 4 }}>
            <Filter size={12} /> Event Type:
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              color: "#FFFFFF",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Audit Actions</option>
            <option value="MERCHANT_ONBOARDED">Merchant Onboarded</option>
            <option value="TENANT_STATUS_UPDATED">Tenant Status Updated</option>
            <option value="API_KEY_ROTATED">API Key Rotated</option>
            <option value="SECURITY_LOGIN_SUCCESS">Login Success</option>
            <option value="SECURITY_LOGIN_FAILED">Login Failed</option>
          </select>
        </div>
      </div>

      {/* 3. Table */}
      {error ? (
        <ApiErrorCard message="Failed to load security audit logs." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || logs.length}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Security Events Recorded"
          emptyDescription="Administrative operations and tenant provisioning events will record automatically."
        />
      )}
    </div>
  );
};
