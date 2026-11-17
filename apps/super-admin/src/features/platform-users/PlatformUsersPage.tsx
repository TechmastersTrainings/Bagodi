import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { PlatformUser, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import { CreatePlatformUserModal } from "./CreatePlatformUserModal";
import {
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

export const PlatformUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<PlatformUser>>({
    queryKey: ["super-platform-users-list", page, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<PlatformUser>>("/super/platform-users", { params });
    },
    retry: 1,
  });

  const users = data?.items || [
    {
      id: "usr_root_01",
      fullName: "TechMasters Root Superadmin",
      email: "root@techmasters.in",
      role: "SUPER_ADMIN" as const,
      isActive: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: "103.212.144.12",
      createdAt: "2026-11-01T00:00:00Z",
    },
  ];

  const columns: Column<PlatformUser>[] = [
    {
      key: "fullName",
      header: "Platform Operator",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#111412", fontSize: "13.5px" }}>{row.fullName}</div>
          <div style={{ fontSize: "11px", color: "#7A807C" }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Platform Role",
      render: (row) => (
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "#8C6A18",
            background: "#FFF8E7",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(197, 161, 91, 0.3)",
          }}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "twoFactorEnabled",
      header: "Hardware / MFA",
      render: (row) =>
        row.twoFactorEnabled ? (
          <span style={{ fontSize: "11.5px", color: "#2E7D32", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <ShieldCheck size={14} /> Enabled
          </span>
        ) : (
          <span style={{ fontSize: "11.5px", color: "#7A807C" }}>Optional</span>
        ),
    },
    {
      key: "isActive",
      header: "Account State",
      render: (row) => (
        <StatusBadge
          variant={row.isActive ? "success" : "danger"}
          label={row.isActive ? "Active" : "Disabled"}
        />
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Master Auth",
      render: (row) => (
        <div>
          <div style={{ fontSize: "11.5px", color: "#111412", fontFamily: "var(--font-mono)" }}>
            {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}
          </div>
          {row.lastLoginIp && (
            <div style={{ fontSize: "10.5px", color: "#7A807C", fontFamily: "var(--font-mono)" }}>
              IP: {row.lastLoginIp}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.75rem", fontWeight: 800, color: "#111412", letterSpacing: "0.02em", margin: 0 }}>
            Platform Users & Governance RBAC
          </h1>
          <p style={{ fontSize: "13px", color: "#7A807C", marginTop: 4 }}>
            System engineers, infrastructure operators, and master security officers.
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
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsCreateOpen(true)}
            style={{ background: "#E31B23", borderColor: "#E31B23" }}
          >
            Provision Platform User
          </Button>
        </div>
      </div>

      {/* 2. Search Bar */}
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
        }}
      >
        <Search size={16} color="#7A807C" />
        <input
          type="text"
          placeholder="Search by full name, operator email, or platform ID..."
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

      {/* 3. Table */}
      {error ? (
        <ApiErrorCard message="Failed to load platform users." onRetry={() => refetch()} />
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
            data={users}
            isLoading={isLoading}
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total || users.length}
            onPageChange={(p) => setPage(p)}
            emptyTitle="No Platform Operators"
            emptyDescription="Add platform operators to delegate multi-tenant infrastructure responsibilities."
          />
        </div>
      )}

      {/* 4. Create Modal */}
      <CreatePlatformUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
