import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order, OrderStatus, PaymentStatus, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./AdminOrdersPage.module.css";
import { OrderDetailModal } from "./OrderDetailModal";
import { PackingSlipModal } from "./PackingSlipModal";
import {
  Package,
  Truck,
  Clock,
  Printer,
  Eye,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

export const AdminOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  // Modal State
  const [activeDetailOrder, setActiveDetailOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeSlipOrder, setActiveSlipOrder] = useState<Order | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Fetch Orders Query with query params
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["admin-orders-list", page, statusFilter, paymentFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (paymentFilter !== "ALL") params.paymentStatus = paymentFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<Order>>("/orders", { params });
    },
    retry: 1,
  });

  const orders = data?.items || [];

  // Metrics computation from real loaded batch / aggregate
  const metrics = useMemo(() => {
    const totalOrders = data?.total || 0;
    const pendingDispatch = orders.filter(
      (o) => o.status === "CONFIRMED" || o.status === "PACKED"
    ).length;
    const inTransit = orders.filter((o) => o.status === "SHIPPED").length;
    const totalGrossValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return {
      totalOrders,
      pendingDispatch,
      inTransit,
      totalGrossValue,
    };
  }, [orders, data?.total]);

  const handleOpenDetail = (order: Order) => {
    setActiveDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleOpenSlip = (order: Order) => {
    setActiveSlipOrder(order);
    setIsSlipOpen(true);
  };

  // Helper for Order Status Badge
  const getFulfillmentBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <StatusBadge variant="success" label="Delivered" />;
      case "SHIPPED":
        return <StatusBadge variant="info" label="In-Transit" />;
      case "PACKED":
        return <StatusBadge variant="warning" label="Packed" />;
      case "CONFIRMED":
        return <StatusBadge variant="neutral" label="Confirmed" />;
      case "CANCELLED":
        return <StatusBadge variant="danger" label="Cancelled" />;
      default:
        return <StatusBadge variant="neutral" label={status} />;
    }
  };

  // Helper for Payment Status Badge
  const getPaymentBadge = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "COLLECTED":
        return <StatusBadge variant="success" label="Collected" />;
      case "REFUNDED":
        return <StatusBadge variant="neutral" label="Refunded" />;
      case "FAILED":
        return <StatusBadge variant="danger" label="Failed" />;
      case "PENDING":
      default:
        return <StatusBadge variant="warning" label="Pending" />;
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: "Order Reference",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {row.orderNumber}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            {row.items?.length || 0} item{row.items?.length === 1 ? "" : "s"}
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: "#FFFFFF" }}>{row.customerName}</div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            {row.shippingAddress?.phone || row.shippingAddress?.city || "Retail Client"}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Order Date",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "var(--color-muted-grey)" }}>
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {getPaymentBadge(row.paymentStatus)}
          <span style={{ fontSize: "10px", color: "var(--color-muted-grey)" }}>
            {row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Fulfillment Status",
      render: (row) => getFulfillmentBadge(row.status),
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      render: (row) => (
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-champagne-gold)" }}>
          {formatINR(row.grandTotal)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.iconActionBtn}
            title="Inspect Order Details & Fulfillment"
            onClick={() => handleOpenDetail(row)}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className={styles.iconActionBtn}
            title="Print Store Packing Slip & Tax Invoice"
            onClick={() => handleOpenSlip(row)}
          >
            <Printer size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageRoot}>
      {/* 1. Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Order Administration & Fulfillment</h1>
          <p className={styles.pageSubtitle}>
            Live order queue for Bagodi Shopping Mall, Bidar — Process packing, tracking & dispatch.
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
        </div>
      </div>

      {/* 2. Quick Metrics Row (Aurélien Luxe Operations Style) */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Total Orders</span>
            <ShoppingBag size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalOrders}</div>
          <div className={styles.metricSubtext}>Across all retail channels</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Pending Dispatch</span>
            <Package size={14} color="var(--status-warning)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-warning)" }}>
            {metrics.pendingDispatch}
          </div>
          <div className={styles.metricSubtext}>Awaiting packing & label generation</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>In Transit</span>
            <Truck size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.inTransit}</div>
          <div className={styles.metricSubtext}>Dispatched via courier partners</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Queue Value</span>
            <Clock size={14} color="var(--color-light-champagne)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--color-champagne-gold)" }}>
            {formatINR(metrics.totalGrossValue)}
          </div>
          <div className={styles.metricSubtext}>Gross volume loaded</div>
        </div>
      </div>

      {/* 3. Operational Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search by order # (e.g. ORD-2026), customer name, or phone..."
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
            <Filter size={12} /> Fulfillment:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            Payment:
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Payments</option>
            <option value="COLLECTED">Collected</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* 4. Real Orders Table */}
      {error ? (
        <ApiErrorCard
          message="Failed to load merchant orders from the backend API."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Orders Found in Queue"
          emptyDescription="Customer orders matching the active filters will appear in this fulfillment queue."
        />
      )}

      {/* 5. Order Detail & Fulfillment Transition Modal */}
      <OrderDetailModal
        order={activeDetailOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveDetailOrder(null);
        }}
        onOpenPackingSlip={(order) => {
          setIsDetailOpen(false);
          setActiveSlipOrder(order);
          setIsSlipOpen(true);
        }}
      />

      {/* 6. Printable Retail Packing Slip & Invoice Modal */}
      <PackingSlipModal
        order={activeSlipOrder}
        isOpen={isSlipOpen}
        onClose={() => {
          setIsSlipOpen(false);
          setActiveSlipOrder(null);
        }}
      />
    </div>
  );
};
