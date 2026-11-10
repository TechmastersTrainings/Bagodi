import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ReturnRequest, ReturnStatus, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import styles from "./ReturnsPage.module.css";
import { ReturnInspectionModal } from "./ReturnInspectionModal";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ClipboardCheck,
  Package,
} from "lucide-react";

export const ReturnsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Inspection Modal State
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // Real backend query for Return Requests
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<ReturnRequest>>({
    queryKey: ["admin-returns-list", page, statusFilter, typeFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.isExchange = typeFilter === "EXCHANGE";
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<ReturnRequest>>("/returns", { params });
    },
    retry: 1,
  });

  const returns = data?.items || [];

  // Metrics summary
  const metrics = useMemo(() => {
    const totalRequests = data?.total || 0;
    const pendingInspection = returns.filter(
      (r) =>
        r.status === "PENDING_APPROVAL" ||
        r.status === "RECEIVED" ||
        r.status === "IN_TRANSIT"
    ).length;
    const completedRefunds = returns.filter(
      (r) => r.status === "REFUND_INITIATED" || r.status === "COMPLETED"
    ).length;
    const totalExchangeItems = returns.filter((r) => r.isExchange).length;

    return {
      totalRequests,
      pendingInspection,
      completedRefunds,
      totalExchangeItems,
    };
  }, [returns, data?.total]);

  const handleOpenInspection = (req: ReturnRequest) => {
    setSelectedRequest(req);
    setIsInspectionOpen(true);
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "COMPLETED":
      case "INSPECTED_PASSED":
        return <StatusBadge variant="success" label="Passed / Completed" />;
      case "REFUND_INITIATED":
        return <StatusBadge variant="info" label="Refund Initiated" />;
      case "RECEIVED":
        return <StatusBadge variant="warning" label="Ready For Inspection" />;
      case "PENDING_APPROVAL":
        return <StatusBadge variant="warning" label="Pending Approval" />;
      case "REJECTED":
      case "INSPECTED_FAILED":
        return <StatusBadge variant="danger" label="Rejected" />;
      case "IN_TRANSIT":
      case "PICKUP_SCHEDULED":
        return <StatusBadge variant="neutral" label="In-Transit Pickup" />;
      default:
        return <StatusBadge variant="neutral" label={status.replace(/_/g, " ")} />;
    }
  };

  const columns: Column<ReturnRequest>[] = [
    {
      key: "orderNumber",
      header: "Order & Request Ref",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {row.orderNumber}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            Req ID: {row.id ? row.id.substring(0, 8) : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "isExchange",
      header: "Request Type",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <RotateCcw size={14} color="var(--color-champagne-gold)" />
          <span style={{ fontWeight: 500, color: "#FFFFFF", fontSize: "12px" }}>
            {row.isExchange ? "Exchange" : "Return & Refund"}
          </span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Customer Reason",
      render: (row) => (
        <div style={{ maxWidth: 220 }}>
          <div style={{ color: "var(--color-light-champagne)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.reason}
          </div>
          {row.conditionNotes && (
            <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", marginTop: "2px" }}>
              Notes: {row.conditionNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Workbench Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "createdAt",
      header: "Date Logged",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "var(--color-muted-grey)" }}>
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Inspection & Actions",
      render: (row) => (
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.iconActionBtn}
            onClick={() => handleOpenInspection(row)}
            title="Perform Physical Quality Inspection"
          >
            <ClipboardCheck size={14} />
            <span>Inspect Garment</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageRoot}>
      {/* 1. Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Returns & Exchanges Workbench</h1>
          <p className={styles.pageSubtitle}>
            Physical garment quality inspection & automated refund/replacement routing for Bagodi Retail.
          </p>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Operations Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Active Requests</span>
            <RotateCcw size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalRequests}</div>
          <div className={styles.metricSubtext}>Total reverse logistics cases</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Pending Inspection</span>
            <Clock size={14} color="var(--status-warning)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-warning)" }}>
            {metrics.pendingInspection}
          </div>
          <div className={styles.metricSubtext}>Awaiting warehouse physical verification</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Exchanges In Flow</span>
            <Package size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalExchangeItems}</div>
          <div className={styles.metricSubtext}>Garment replacement requests</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Resolved Cases</span>
            <CheckCircle2 size={14} color="var(--status-success)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
            {metrics.completedRefunds}
          </div>
          <div className={styles.metricSubtext}>Refunded or replaced</div>
        </div>
      </div>

      {/* 3. Operational Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search by order #, request ID, or garment details..."
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
            <option value="ALL">All Return Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="RECEIVED">Received at Mall</option>
            <option value="INSPECTED_PASSED">Passed Inspection</option>
            <option value="INSPECTED_FAILED">Failed Inspection</option>
            <option value="REFUND_INITIATED">Refund Initiated</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            Type:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Request Types</option>
            <option value="RETURN">Return & Refund</option>
            <option value="EXCHANGE">Size / Product Exchange</option>
          </select>
        </div>
      </div>

      {/* 4. Real Table */}
      {error ? (
        <ApiErrorCard
          message="Failed to load return requests from the backend API."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={returns}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Return Requests Found"
          emptyDescription="Customer return and exchange requests will appear in this workbench for showroom physical verification."
        />
      )}

      {/* 5. Physical Quality Inspection Modal */}
      <ReturnInspectionModal
        returnRequest={selectedRequest}
        isOpen={isInspectionOpen}
        onClose={() => {
          setIsInspectionOpen(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
};
