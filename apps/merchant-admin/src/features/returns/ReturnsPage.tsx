import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ReturnRequest, ReturnStatus, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import styles from "./ReturnsPage.module.css";
import { ReturnInspectionModal } from "./ReturnInspectionModal";
import { ReturnDecisionModal } from "./ReturnDecisionModal";
import { ScheduleReturnDeliveryModal } from "./ScheduleReturnDeliveryModal";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ClipboardCheck,
  Package,
  Truck,
  Check,
  X,
  Camera,
} from "lucide-react";

export const ReturnsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Inspection Modal State
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // Decision & Return Delivery State
  const [decisionRequest, setDecisionRequest] = useState<ReturnRequest | null>(null);
  const [decisionMode, setDecisionMode] = useState<"ACCEPT" | "REJECT">("ACCEPT");
  const [scheduleDeliveryReq, setScheduleDeliveryReq] = useState<ReturnRequest | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

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
      header: "Customer Issue & Photo",
      render: (row) => {
        const sampleCustomerPhoto =
          (row as any).customerIssueImageUrl ||
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80";

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 280 }}>
            <div
              style={{
                width: 42,
                height: 48,
                borderRadius: 6,
                background: "#F0EDE6",
                border: "1px solid #E5E1D8",
                overflow: "hidden",
                flexShrink: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setZoomImageUrl(sampleCustomerPhoto)}
              title="Click to zoom customer defect photo"
            >
              <img
                src={sampleCustomerPhoto}
                alt="Customer Issue"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 500 }}>
                {row.reason}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#C5A15B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 2,
                }}
                onClick={() => setZoomImageUrl(sampleCustomerPhoto)}
              >
                <Camera size={10} /> View Customer Photo
              </div>
            </div>
          </div>
        );
      },
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
      header: "Merchant Decision & Operations",
      render: (row) => (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {row.status === "PENDING_APPROVAL" && (
            <>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check size={12} />}
                style={{
                  borderColor: "#A5D6A7",
                  color: "#2E7D32",
                  background: "#F1F8F1",
                  fontSize: "11px",
                  padding: "4px 8px",
                  fontWeight: 600,
                }}
                onClick={() => {
                  setDecisionRequest(row);
                  setDecisionMode("ACCEPT");
                }}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<X size={12} />}
                style={{
                  borderColor: "#FFCDD2",
                  color: "#C62828",
                  background: "#FFF5F5",
                  fontSize: "11px",
                  padding: "4px 8px",
                  fontWeight: 600,
                }}
                onClick={() => {
                  setDecisionRequest(row);
                  setDecisionMode("REJECT");
                }}
              >
                Reject
              </Button>
            </>
          )}

          {row.status === "APPROVED" && (
            <Button
              size="sm"
              leftIcon={<Truck size={13} />}
              style={{
                background: "#2E7D32",
                color: "#FFFFFF",
                fontSize: "11px",
                padding: "4px 10px",
                fontWeight: 600,
              }}
              onClick={() => setScheduleDeliveryReq(row)}
            >
              Schedule Return Delivery
            </Button>
          )}

          {row.status === "PICKUP_SCHEDULED" && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#2E7D32",
                background: "#E8F5E9",
                border: "1px solid #A5D6A7",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              Delivery Scheduled
            </span>
          )}

          <button
            type="button"
            className={styles.iconActionBtn}
            onClick={() => handleOpenInspection(row)}
            title="Perform Physical Quality Inspection"
          >
            <ClipboardCheck size={14} />
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

      {/* 6. Accept / Reject Return Decision Modal */}
      <ReturnDecisionModal
        returnRequest={decisionRequest}
        mode={decisionMode}
        isOpen={Boolean(decisionRequest)}
        onClose={() => setDecisionRequest(null)}
        onAcceptedSuccess={(acceptedReq) => {
          setScheduleDeliveryReq(acceptedReq);
        }}
      />

      {/* 7. Schedule Return Delivery Modal */}
      <ScheduleReturnDeliveryModal
        returnRequest={scheduleDeliveryReq}
        isOpen={Boolean(scheduleDeliveryReq)}
        onClose={() => setScheduleDeliveryReq(null)}
      />

      {/* 8. Customer Issue Image Zoom Modal */}
      {zoomImageUrl && (
        <div
          onClick={() => setZoomImageUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              overflow: "hidden",
              maxWidth: 600,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ padding: "12px 16px", background: "#F8F7F5", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E1D8" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#111412", textTransform: "uppercase" }}>
                Customer Uploaded Issue Photo
              </span>
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#7A807C" }}
              >
                ✕
              </button>
            </div>
            <img src={zoomImageUrl} alt="Customer Defect Inspection" style={{ width: "100%", maxHeight: 500, objectFit: "contain", display: "block" }} />
          </div>
        </div>
      )}
    </div>
  );
};
