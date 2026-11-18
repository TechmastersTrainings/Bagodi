import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./PaymentsPage.module.css";
import { RefundModal } from "./RefundModal";
import {
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  Building,
} from "lucide-react";

export interface PaymentTransactionRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  gatewayFee: number;
  taxAmount: number;
  netPayout: number;
  currency: string;
  paymentMethod: string;
  status: "CAPTURED" | "SETTLED" | "REFUNDED" | "FAILED" | "PENDING";
  gatewayTransactionId?: string;
  settlementBatchId?: string;
  createdAt: string;
  refundedAmount?: number;
}

export const PaymentsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  // Refund Modal State
  const [selectedTx, setSelectedTx] = useState<PaymentTransactionRecord | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  // Real backend query for Payments & Financial Ledger
  const { data, isLoading, error, refetch, isFetching } = useQuery<
    PaginatedResponse<PaymentTransactionRecord>
  >({
    queryKey: ["admin-payments-list", page, statusFilter, methodFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (methodFilter !== "ALL") params.paymentMethod = methodFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<PaymentTransactionRecord>>(
        "/payments/transactions",
        { params }
      );
    },
    retry: 1,
  });

  const transactions = data?.items || [];

  const [periodFilter, setPeriodFilter] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");

  // Metrics summary dynamically derived from ledger transactions
  const metrics = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    let totalGross = 0;
    let totalSettled = 0;
    let totalRefunded = 0;

    for (const t of transactions) {
      const amt = t.amount || 0;
      totalGross += amt;

      const txTime = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      const ageMs = now - txTime;

      const isPositiveSettlement = t.status === "SETTLED" || t.status === "CAPTURED";

      if (isPositiveSettlement) {
        if (ageMs <= oneDayMs) {
          todayRevenue += amt;
        }
        if (ageMs <= sevenDaysMs) {
          weekRevenue += amt;
        }
        if (ageMs <= thirtyDaysMs) {
          monthRevenue += amt;
        }
      }

      if (t.status === "SETTLED") {
        totalSettled += amt;
      } else if (t.status === "REFUNDED") {
        totalRefunded += amt;
      }
    }

    const totalTransactions = data?.total ?? transactions.length;

    return {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalTransactions,
      totalGross,
      totalSettled,
      totalRefunded,
    };
  }, [transactions, data?.total]);

  const handleOpenRefund = (tx: PaymentTransactionRecord) => {
    setSelectedTx(tx);
    setIsRefundOpen(true);
  };

  const getStatusBadge = (status: PaymentTransactionRecord["status"]) => {
    switch (status) {
      case "SETTLED":
        return <StatusBadge variant="success" label="Settled to Bank" />;
      case "CAPTURED":
        return <StatusBadge variant="info" label="Captured (Escrow)" />;
      case "REFUNDED":
        return <StatusBadge variant="neutral" label="Refunded" />;
      case "FAILED":
        return <StatusBadge variant="danger" label="Failed" />;
      case "PENDING":
      default:
        return <StatusBadge variant="warning" label="Pending Capture" />;
    }
  };

  const columns: Column<PaymentTransactionRecord>[] = [
    {
      key: "id",
      header: "Gateway Transaction / Order",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            {row.gatewayTransactionId || row.id}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-champagne-gold)", marginTop: "2px" }}>
            Order #{row.orderNumber}
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
            {row.customerPhone || "Retail Customer"}
          </div>
        </div>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Rail",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: "var(--color-light-champagne)", fontSize: "12px" }}>
            {row.paymentMethod}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            {formatDateTime(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Settlement Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "amount",
      header: "Gross Amount",
      render: (row) => (
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
          {formatINR(row.amount)}
        </div>
      ),
    },
    {
      key: "netPayout",
      header: "Net Bank Settlement",
      render: (row) => (
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-champagne-gold)" }}>
          {formatINR(row.netPayout || row.amount)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Disbursements",
      render: (row) => (
        <div>
          {row.status === "CAPTURED" || row.status === "SETTLED" ? (
            <button
              type="button"
              className={styles.refundBtn}
              onClick={() => handleOpenRefund(row)}
              title="Issue full or partial refund to customer"
            >
              <RotateCcw size={12} />
              <span>Refund</span>
            </button>
          ) : (
            <span style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
              {row.status === "REFUNDED" ? "Refunded" : "No Action"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageRoot}>
      {/* 1. Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Payments, Gateway & Financial Ledger</h1>
          <p className={styles.pageSubtitle}>
            Razorpay gateway settlements, COD reconciliation & disbursement ledger for Bagodi Mall.
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

      {/* Period Selection Ribbon */}
      <div style={{ display: "flex", gap: 10, margin: "16px 0 20px 0", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPeriodFilter("TODAY")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${periodFilter === "TODAY" ? "#E31B23" : "#E5E1D8"}`,
            background: periodFilter === "TODAY" ? "#E31B23" : "#FFFFFF",
            color: periodFilter === "TODAY" ? "#FFFFFF" : "#111412",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Today's Collections ({formatINR(metrics.todayRevenue)})
        </button>
        <button
          type="button"
          onClick={() => setPeriodFilter("WEEK")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${periodFilter === "WEEK" ? "#C5A15B" : "#E5E1D8"}`,
            background: periodFilter === "WEEK" ? "#FFF9EE" : "#FFFFFF",
            color: periodFilter === "WEEK" ? "#B08A3E" : "#4A4E4B",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          This Week's Collections ({formatINR(metrics.weekRevenue)})
        </button>
        <button
          type="button"
          onClick={() => setPeriodFilter("MONTH")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${periodFilter === "MONTH" ? "#2E7D32" : "#E5E1D8"}`,
            background: periodFilter === "MONTH" ? "#E8F5E9" : "#FFFFFF",
            color: periodFilter === "MONTH" ? "#1B5E20" : "#4A4E4B",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          This Month's Gross Revenue ({formatINR(metrics.monthRevenue)})
        </button>
        <button
          type="button"
          onClick={() => setPeriodFilter("ALL")}
          style={{
            padding: "8px 18px",
            borderRadius: 20,
            border: `1.5px solid ${periodFilter === "ALL" ? "#111412" : "#E5E1D8"}`,
            background: periodFilter === "ALL" ? "#111412" : "#FFFFFF",
            color: periodFilter === "ALL" ? "#FFFFFF" : "#7A807C",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Recorded Ledger
        </button>
      </div>

      {/* 2. Operations Metrics Grid (Aurélien Luxe Financial Style) */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Today's Revenue</span>
            <DollarSign size={14} color="#E31B23" />
          </div>
          <div className={styles.metricValue} style={{ color: "#E31B23" }}>
            {formatINR(metrics.todayRevenue)}
          </div>
          <div className={styles.metricSubtext}>Live receipts captured today</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>This Week's Revenue</span>
            <Building size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--color-champagne-gold)" }}>
            {formatINR(metrics.weekRevenue)}
          </div>
          <div className={styles.metricSubtext}>Rolling 7-day store volume</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>This Month's Revenue</span>
            <DollarSign size={14} color="var(--status-success)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
            {formatINR(metrics.monthRevenue)}
          </div>
          <div className={styles.metricSubtext}>Month-to-date retail billing</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Net Bank Settled</span>
            <Building size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{formatINR(metrics.totalSettled)}</div>
          <div className={styles.metricSubtext}>Disbursed to Bagodi current account</div>
        </div>
      </div>

      {/* 3. Operational Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search by transaction ID (e.g. pay_...), order #, or customer..."
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
            <option value="ALL">All Settlement Statuses</option>
            <option value="SETTLED">Settled to Bank</option>
            <option value="CAPTURED">Captured (Escrow)</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>

          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            Method:
          </label>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Methods</option>
            <option value="RAZORPAY">Razorpay (All)</option>
            <option value="UPI">UPI / QR</option>
            <option value="CREDIT_CARD">Credit / Debit Cards</option>
            <option value="NETBANKING">Netbanking</option>
            <option value="COD">Cash On Delivery</option>
          </select>
        </div>
      </div>

      {/* 4. Real Payments Table */}
      {error ? (
        <ApiErrorCard
          message="Failed to load payment transaction records from the backend API."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Payment Transactions"
          emptyDescription="Customer payments processed via Razorpay or Cash On Delivery will appear in this ledger."
        />
      )}

      {/* 5. Authorize Refund Modal */}
      <RefundModal
        transaction={selectedTx}
        isOpen={isRefundOpen}
        onClose={() => {
          setIsRefundOpen(false);
          setSelectedTx(null);
        }}
      />
    </div>
  );
};
