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
          <div style={{ fontWeight: 700, color: "#111412", fontSize: "14px" }}>{row.name}</div>
          <div style={{ fontSize: "11px", color: "#7A807C", marginTop: "2px" }}>
            Entity: {row.legalEntityName}
          </div>
          {row.gstin && (
            <div style={{ fontSize: "10.5px", color: "#8C6A18", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
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
          <div style={{ fontFamily: "var(--font-mono)", color: "#E31B23", fontWeight: 600, fontSize: "13px" }}>
            {row.slug}.bagodi.in
          </div>
          <div style={{ fontSize: "10px", color: "#7A807C", fontFamily: "var(--font-mono)" }}>
            Key: {row.apiKeyPrefix}
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Subscription Plan",
      render: (row) => (
        <span
          style={{
            fontSize: "10.5px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "#8C6A18",
            background: "#FFF8E7",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(197, 161, 91, 0.3)",
          }}
        >
          {row.plan}
        </span>
      ),
    },
    {
      key: "storeCount",
      header: "Outlets & SKUs",
      render: (row) => (
        <div style={{ fontSize: "12px", color: "#111412" }}>
          <div><strong>{row.storeCount}</strong> Physical Store</div>
          <div style={{ fontSize: "11px", color: "#7A807C" }}>{row.totalProductsCount} Live SKUs</div>
        </div>
      ),
    },
    {
      key: "grossSalesVolume",
      header: "Lifetime GMV",
      render: (row) => (
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#111412" }}>
          {formatINR(row.grossSalesVolume)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
          {row.status === "ACTIVE" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleTenantMutation.mutate({ id: row.id, status: "SUSPENDED" })}
              isLoading={toggleTenantMutation.isPending}
              style={{ fontSize: "11px", borderColor: "#FFA39E", color: "#CF1322" }}
            >
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleTenantMutation.mutate({ id: row.id, status: "ACTIVE" })}
              isLoading={toggleTenantMutation.isPending}
              style={{ fontSize: "11px", borderColor: "#B7EB8F", color: "#389E0D" }}
            >
              Activate
            </Button>
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
            Commercial Tenants
          </h1>
          <p style={{ fontSize: "13px", color: "#7A807C", marginTop: 4 }}>
            Multi-tenant brand segregation, retail merchant stores, and commercial subscription quotas.
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
            onClick={() => setIsOnboardOpen(true)}
            style={{ background: "#E31B23", borderColor: "#E31B23" }}
          >
            Onboard Merchant Tenant
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
            placeholder="Search by merchant name, slug, legal entity, or GSTIN..."
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
            <Filter size={13} /> Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
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
            data={merchants}
            isLoading={isLoading}
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total || merchants.length}
            onPageChange={(p) => setPage(p)}
            emptyTitle="No Merchants Found"
            emptyDescription="Provision commercial retail tenants to grant storefront and back-office management access."
          />
        </div>
      )}

      {/* 4. Onboard Modal */}
      <OnboardMerchantModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
      />
    </div>
  );
};
