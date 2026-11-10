import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Coupon, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import styles from "./CouponsPage.module.css";
import { CreateCouponModal } from "./CreateCouponModal";
import {
  Tag,
  Percent,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Plus,
} from "lucide-react";

export const CouponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Real backend query for coupons
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<Coupon>>({
    queryKey: ["admin-coupons-list", page, statusFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.isActive = statusFilter === "ACTIVE";
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<Coupon>>("/promotions/coupons", { params });
    },
    retry: 1,
  });

  const coupons = data?.items || [];

  // Toggle active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      defaultApiClient.patch<Coupon>(`/promotions/coupons/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
  });

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCoupons = data?.total || 0;
    const activeCount = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.timesUsed || 0), 0);

    return {
      totalCoupons,
      activeCount,
      totalRedemptions,
    };
  }, [coupons, data?.total]);

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Coupon Code & Details",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)", fontSize: "14px", letterSpacing: "0.05em" }}>
            {row.code}
          </div>
          {row.description && (
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", marginTop: "2px", maxWidth: 220 }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "discountType",
      header: "Discount Benefit",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "13px" }}>
            {row.discountType === "PERCENTAGE" ? `${row.discountValue}% OFF` : `FLAT ${formatINR(row.discountValue)} OFF`}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            {row.maxDiscountAmount ? `Max cap: ${formatINR(row.maxDiscountAmount)}` : "No discount cap"}
          </div>
        </div>
      ),
    },
    {
      key: "minimumOrderValue",
      header: "Min Order Value (MOV)",
      render: (row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--color-light-champagne)" }}>
          {row.minimumOrderValue === 0 ? "No Minimum" : formatINR(row.minimumOrderValue)}
        </span>
      ),
    },
    {
      key: "timesUsed",
      header: "Redemptions",
      render: (row) => (
        <div style={{ fontSize: "12px" }}>
          <strong>{row.timesUsed || 0}</strong>
          <span style={{ color: "var(--color-muted-grey)", fontSize: "11px" }}>
            {row.usageLimitTotal ? ` / ${row.usageLimitTotal}` : " (Unlimited)"}
          </span>
        </div>
      ),
    },
    {
      key: "validUntil",
      header: "Validity Period",
      render: (row) => (
        <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
          <div>From: {row.validFrom ? row.validFrom.split("T")[0] : "Launch"}</div>
          <div style={{ color: "#FFFFFF", marginTop: "2px" }}>Until: {row.validUntil ? row.validUntil.split("T")[0] : "Open"}</div>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Campaign Status",
      render: (row) => (
        <button
          type="button"
          onClick={() => toggleStatusMutation.mutate({ id: row.id, isActive: !row.isActive })}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          title={row.isActive ? "Click to deactivate coupon" : "Click to activate coupon"}
        >
          {row.isActive ? (
            <StatusBadge variant="success" label="Active" />
          ) : (
            <StatusBadge variant="neutral" label="Inactive" />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.pageRoot}>
      {/* 1. Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Promotional Coupons & Marketing</h1>
          <p className={styles.pageSubtitle}>
            Configure luxury discount vouchers, seasonal campaigns, and privilege codes for Bagodi Mall.
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
            Create Coupon
          </Button>
        </div>
      </div>

      {/* 2. Operations Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Total Coupons</span>
            <Tag size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalCoupons}</div>
          <div className={styles.metricSubtext}>Created across all marketing campaigns</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Active Codes</span>
            <Sparkles size={14} color="var(--status-success)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
            {metrics.activeCount}
          </div>
          <div className={styles.metricSubtext}>Eligible for checkout redemption</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Redemption Volume</span>
            <Percent size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalRedemptions}</div>
          <div className={styles.metricSubtext}>Customer orders placed with promo codes</div>
        </div>
      </div>

      {/* 3. Operational Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search by promo code (e.g. FESTIVE2026) or campaign description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Filter size={12} /> Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Coupons</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 4. Real Coupons Table */}
      {error ? (
        <ApiErrorCard
          message="Failed to load promotional coupons from the marketing service."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={coupons}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Promotional Coupons Found"
          emptyDescription="Create discount codes to offer percentage savings or flat discounts to retail shoppers."
        />
      )}

      {/* 5. Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
