import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./PaymentsPage.module.css";
import { RefundModal } from "./RefundModal";
import {
  CreditCard,
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

  // Metrics summary
  const metrics = useMemo(() => {
    const totalTransactions = data?.total || 0;
    const totalGross = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalSettled = transactions
      .filter((t) => t.status === "SETTLED" || t.status === "CAPTURED")
      .reduce((sum, t) => sum + (t.netPayout || t.amount || 0), 0);
    const totalRefunded = transactions
      .filter((t) => t.status === "REFUNDED")
      .reduce((sum, t) => sum + (t.refundedAmount || t.amount || 0), 0);

    return {
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

      {/* 2. Operations Metrics Grid (Aurélien Luxe Financial Style) */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Total Captured</span>
            <DollarSign size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{formatINR(metrics.totalGross)}</div>
          <div className={styles.metricSubtext}>Gross customer payment receipts</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Net Bank Settled</span>
            <Building size={14} color="var(--status-success)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
            {formatINR(metrics.totalSettled)}
          </div>
          <div className={styles.metricSubtext}>Remitted to Bagodi current account</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Refunds Disbursed</span>
            <RotateCcw size={14} color="var(--color-light-champagne)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--color-light-champagne)" }}>
            {formatINR(metrics.totalRefunded)}
          </div>
          <div className={styles.metricSubtext}>Reversals & return credits</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Transactions</span>
            <CreditCard size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalTransactions}</div>
          <div className={styles.metricSubtext}>Processed payment records</div>
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
