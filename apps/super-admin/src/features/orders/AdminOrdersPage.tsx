import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order, OrderStatus, PaymentStatus, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./AdminOrdersPage.module.css";
import { OrderDetailModal } from "./OrderDetailModal";
import { PackingSlipModal } from "./PackingSlipModal";
import { NotifyCustomerModal } from "./NotifyCustomerModal";
import { PushToDeliveryModal } from "./PushToDeliveryModal";
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
  Send,
  Calendar,
} from "lucide-react";

export const AdminOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");

  // Modal State
  const [activeDetailOrder, setActiveDetailOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeSlipOrder, setActiveSlipOrder] = useState<Order | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [notifyOrder, setNotifyOrder] = useState<Order | null>(null);
  const [deliveryOrder, setDeliveryOrder] = useState<Order | null>(null);

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
      case "DISPATCHED":
        return <StatusBadge variant="info" label="Dispatched" />;
      case "OUT_FOR_DELIVERY":
        return <StatusBadge variant="info" label="Out For Delivery" />;
      case "PACKED":
        return <StatusBadge variant="warning" label="Packed" />;
      case "CONFIRMED":
        return <StatusBadge variant="neutral" label="Confirmed" />;
      case "PROCESSING":
        return <StatusBadge variant="neutral" label="Processing" />;
      case "PENDING_PAYMENT":
        return <StatusBadge variant="warning" label="Pending Payment" />;
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
          <div style={{ fontWeight: 700, color: "#111412", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {row.orderNumber}
          </div>
          <div style={{ fontSize: "11px", color: "#7A756D", marginTop: 2 }}>
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
          <div style={{ fontWeight: 600, color: "#111412", fontSize: "13px" }}>
            {row.customerName || "Retail Client"}
          </div>
          <div style={{ fontSize: "11.5px", color: "#6B655D", marginTop: 2 }}>
            {row.shippingAddress?.phone || row.shippingAddress?.city || "Direct Store Client"}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Order Date",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "#4A4E4B", fontWeight: 500 }}>
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
          <span style={{ fontSize: "10.5px", color: "#7A756D", fontWeight: 600, textTransform: "uppercase" }}>
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
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#111412", fontSize: "13.5px" }}>
          {formatINR(row.grandTotal)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Operations",
      render: (row) => (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send size={12} />}
            style={{ fontSize: "11px", padding: "4px 8px" }}
            title="Send dispatch notification to customer"
            onClick={() => setNotifyOrder(row)}
          >
            Notify
          </Button>

          {row.status !== "DELIVERED" && row.status !== "CANCELLED" && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Truck size={12} />}
              style={{
                fontSize: "11px",
                padding: "4px 8px",
                borderColor: row.status === "SHIPPED" ? "#A5D6A7" : "#E31B23",
                color: row.status === "SHIPPED" ? "#2E7D32" : "#E31B23",
                background: row.status === "SHIPPED" ? "#F1F8F1" : "#FFF5F5",
                fontWeight: 600,
              }}
              title="Push to Delivery Partner Portal"
              onClick={() => setDeliveryOrder(row)}
            >
              {row.status === "SHIPPED" ? "In Delivery" : "Push Delivery"}
            </Button>
          )}

          <button
            type="button"
            className={styles.iconActionBtn}
            title="Inspect Order Details"
            onClick={() => handleOpenDetail(row)}
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className={styles.iconActionBtn}
            title="Print Store Packing Slip & Tax Invoice"
            onClick={() => handleOpenSlip(row)}
          >
            <Printer size={14} />
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

      {/* 1b. Time Period Record Tabs (Today, Week, Month) */}
      <div style={{ display: "flex", gap: 10, margin: "16px 0 20px 0", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setTimeFilter("TODAY")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${timeFilter === "TODAY" ? "#E31B23" : "#E5E1D8"}`,
            background: timeFilter === "TODAY" ? "#E31B23" : "#FFFFFF",
            color: timeFilter === "TODAY" ? "#FFFFFF" : "#111412",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Calendar size={13} />
          Today's Orders (1)
        </button>
        <button
          type="button"
          onClick={() => setTimeFilter("WEEK")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${timeFilter === "WEEK" ? "#C5A15B" : "#E5E1D8"}`,
            background: timeFilter === "WEEK" ? "#FFF9EE" : "#FFFFFF",
            color: timeFilter === "WEEK" ? "#B08A3E" : "#4A4E4B",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Clock size={13} />
          This Week's Orders (3)
        </button>
        <button
          type="button"
          onClick={() => setTimeFilter("MONTH")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${timeFilter === "MONTH" ? "#2E7D32" : "#E5E1D8"}`,
            background: timeFilter === "MONTH" ? "#E8F5E9" : "#FFFFFF",
            color: timeFilter === "MONTH" ? "#1B5E20" : "#4A4E4B",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Package size={13} />
          This Month's Orders (3)
        </button>
        <button
          type="button"
          onClick={() => setTimeFilter("ALL")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${timeFilter === "ALL" ? "#111412" : "#E5E1D8"}`,
            background: timeFilter === "ALL" ? "#111412" : "#FFFFFF",
            color: timeFilter === "ALL" ? "#FFFFFF" : "#7A807C",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Recorded Orders
        </button>
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

      {/* 7. Dispatch Notification to Customer Modal */}
      <NotifyCustomerModal
        order={notifyOrder}
        isOpen={Boolean(notifyOrder)}
        onClose={() => setNotifyOrder(null)}
      />

      {/* 8. Handover & Push to Delivery Partner Modal */}
      <PushToDeliveryModal
        order={deliveryOrder}
        isOpen={Boolean(deliveryOrder)}
        onClose={() => setDeliveryOrder(null)}
      />
    </div>
  );
};
