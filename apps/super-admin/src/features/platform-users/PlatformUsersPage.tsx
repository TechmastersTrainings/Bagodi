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
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "13px" }}>{row.fullName}</div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Platform Role",
      render: (row) => (
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-champagne-gold)" }}>
          {row.role}
        </span>
      ),
    },
    {
      key: "twoFactorEnabled",
      header: "Hardware / MFA",
      render: (row) => (
        row.twoFactorEnabled ? (
          <StatusBadge variant="success" label="MFA Enforced" />
        ) : (
          <StatusBadge variant="warning" label="Password Only" />
        )
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Session Access",
      render: (row) => (
        <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
          <div>{row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}</div>
          {row.lastLoginIp && <div style={{ fontFamily: "var(--font-mono)", color: "#999" }}>IP: {row.lastLoginIp}</div>}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        row.isActive ? (
          <StatusBadge variant="success" label="Active" />
        ) : (
          <StatusBadge variant="danger" label="Revoked" />
        )
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", margin: 0 }}>
            PLATFORM GOVERNANCE OPERATORS & RBAC
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 4 }}>
            Privileged super administrators, security auditors, and operations personnel.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Authorize Operator
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted-grey)" }} />
          <input
            type="text"
            placeholder="Search operators by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              background: "#161917",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px 8px 34px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {error ? (
        <ApiErrorCard message="Failed to load platform users." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || users.length}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Platform Users"
          emptyDescription="Issue platform administrator privileges to authorized personnel."
        />
      )}

      <CreatePlatformUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
