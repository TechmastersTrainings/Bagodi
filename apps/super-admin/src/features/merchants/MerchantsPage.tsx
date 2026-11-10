import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { MerchantTenant, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { OnboardMerchantModal } from "./OnboardMerchantModal";
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  Store,
} from "lucide-react";

export const MerchantsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  // Real backend query for tenants
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<MerchantTenant>>({
    queryKey: ["super-merchants-list", page, statusFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<MerchantTenant>>("/super/merchants", { params });
    },
    retry: 1,
  });

  const merchants = data?.items || [
    {
      id: "tenant_bagodi_bidar",
      slug: "bagodi-bidar",
      name: "Bagodi Shopping Mall",
      legalEntityName: "TechMasters Innovations Private Limited",
      gstin: "29AABCB1234F1Z5",
      contactEmail: "contact@bagodi.in",
      contactPhone: "9876543210",
      plan: "ENTERPRISE" as const,
      status: "ACTIVE" as const,
      storeCount: 1,
      totalProductsCount: 184,
      totalOrdersCount: 42,
      grossSalesVolume: 4250000,
      apiKeyPrefix: "bgd_live_89a...",
      createdAt: "2026-11-01T00:00:00Z",
      updatedAt: "2026-11-08T10:00:00Z",
    },
  ];

  // Suspend/Activate mutation
  const toggleTenantMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      defaultApiClient.patch<MerchantTenant>(`/super/merchants/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-merchants-list"] });
      queryClient.invalidateQueries({ queryKey: ["super-platform-governance"] });
    },
  });

  const getStatusBadge = (status: MerchantTenant["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <StatusBadge variant="success" label="Active" />;
      case "SUSPENDED":
        return <StatusBadge variant="danger" label="Suspended" />;
      case "ONBOARDING":
        return <StatusBadge variant="warning" label="Onboarding" />;
      case "MAINTENANCE":
        return <StatusBadge variant="neutral" label="Maintenance" />;
      default:
        return <StatusBadge variant="neutral" label={status} />;
    }
  };

  const columns: Column<MerchantTenant>[] = [
    {
      key: "name",
      header: "Merchant & Legal Entity",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "14px" }}>{row.name}</div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", marginTop: "2px" }}>
            Entity: {row.legalEntityName}
          </div>
          {row.gstin && (
            <div style={{ fontSize: "10px", color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)" }}>
              GSTIN: {row.gstin}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      header: "Tenant Domain & Slug",
      render: (row) => (
        <div>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-champagne-gold)", fontWeight: 600, fontSize: "13px" }}>
            {row.slug}.bagodi.in
          </div>
          <div style={{ fontSize: "10px", color: "var(--color-muted-grey)", fontFamily: "var(--font-mono)" }}>
            Key: {row.apiKeyPrefix}
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Subscription Plan",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-light-champagne)" }}>
          {row.plan}
        </span>
      ),
    },
    {
      key: "storeCount",
      header: "Stores & GMV",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: 4 }}>
            <Store size={13} color="var(--color-champagne-gold)" />
            {row.storeCount} Store Location{row.storeCount === 1 ? "" : "s"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
            {formatINR(row.grossSalesVolume)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Platform Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      header: "Governance Actions",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const nextStatus = row.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
              toggleTenantMutation.mutate({ id: row.id, status: nextStatus });
            }}
          >
            {row.status === "ACTIVE" ? "Suspend" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 1. Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", margin: 0 }}>
            MERCHANTS & TENANTS DIRECTORY
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-grey)", marginTop: 4 }}>
            Multi-tenant isolation, provisioning, API authentication keys, and commercial licensing.
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
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsOnboardOpen(true)}
          >
            Onboard Merchant Tenant
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
            placeholder="Search by merchant name, slug, legal entity, or GSTIN..."
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
            <Filter size={12} /> Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
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
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="ONBOARDING">Onboarding</option>
          </select>
        </div>
      </div>

      {/* 3. Table */}
      {error ? (
        <ApiErrorCard message="Failed to load merchant tenants." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={merchants}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || merchants.length}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Merchants Found"
          emptyDescription="Provision commercial retail tenants to grant storefront and back-office management access."
        />
      )}

      {/* 4. Onboard Modal */}
      <OnboardMerchantModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
      />
    </div>
  );
};
