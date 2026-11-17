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
        <span style={{ fontSize: "11.5px", color: "#7A807C", fontFamily: "var(--font-mono)" }}>
          {formatDateTime(row.timestamp)}
        </span>
      ),
    },
    {
      key: "actorEmail",
      header: "Operator / Actor",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#111412", fontSize: "12.5px" }}>{row.actorEmail}</div>
          <div style={{ fontSize: "10.5px", color: "#8C6A18", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
            IP: {row.ipAddress}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action Event",
      render: (row) => (
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "#111412",
            background: "#F8F7F5",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid #E5E1D8",
          }}
        >
          {row.action}
        </span>
      ),
    },
    {
      key: "targetResource",
      header: "Target Resource",
      render: (row) => (
        <span style={{ fontSize: "12.5px", color: "#111412", fontWeight: 500 }}>{row.targetResource}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.75rem", fontWeight: 800, color: "#111412", letterSpacing: "0.02em", margin: 0 }}>
            Immutable Security Audit Trail
          </h1>
          <p style={{ fontSize: "13px", color: "#7A807C", marginTop: 4 }}>
            Tamper-evident system access, administrative privilege mutations, and compliance logging.
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
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={handlePrint}
            style={{ border: "1px solid #E5E1D8", background: "#FFFFFF", color: "#111412" }}
          >
            Export Audit Trail (PDF)
          </Button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E1D8",
          borderRadius: "16px",
          padding: "16px 20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#7A807C" />
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
              background: "#F8F7F5",
              border: "1px solid #E5E1D8",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "#111412",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "12px", color: "#7A807C", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
            <Filter size={13} /> Event Type:
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: "#F8F7F5",
              border: "1px solid #E5E1D8",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "#111412",
              fontSize: "12.5px",
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
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E1D8",
            borderRadius: "16px",
            padding: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
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
        </div>
      )}
    </div>
  );
};
