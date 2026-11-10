import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./InventoryPage.module.css";
import { defaultApiClient } from "@bagodi/api-client";
import {
  InventoryItem,
  PaginatedResponse,
  StockStatus,
} from "@bagodi/shared-types";
import {
  DataTable,
  Column,
  StatusBadge,
  Button,
  TextInput,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { BarcodeWorkflowHUD } from "./components/BarcodeWorkflowHUD";
import { StockMovementsTab } from "./components/StockMovementsTab";
import { StockReconciliationTab } from "./components/StockReconciliationTab";
import { PurchaseOrdersTab } from "./components/PurchaseOrdersTab";
import { StockValuationTab } from "./components/StockValuationTab";
import {
  Barcode,
  Boxes,
  History,
  Scale,
  PackagePlus,
  TrendingUp,
  Search,
  RefreshCw,
} from "lucide-react";
import { useDebounce } from "@bagodi/utilities";

type InventoryTab = "LEDGER" | "MOVEMENTS" | "RECONCILIATION" | "PURCHASE_ORDERS" | "VALUATION";

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>("LEDGER");
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState<StockStatus | "ALL">("ALL");

  // Barcode HUD Trigger State
  const [isBarcodeHudOpen, setIsBarcodeHudOpen] = useState<boolean>(false);
  const [initialBarcodeForHud, setInitialBarcodeForHud] = useState<string>("");

  // Query Real Authoritative Stock Ledger Table
  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<InventoryItem>>({
    queryKey: ["inventory-list", page, debouncedSearch, statusFilter],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<InventoryItem>>("/inventory", {
        params: {
          page,
          pageSize: 15,
          search: debouncedSearch || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      }),
    enabled: activeTab === "LEDGER",
  });

  const columns: Column<InventoryItem>[] = [
    {
      key: "productName",
      header: "Garment",
      render: (r) => (
        <div>
          <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{r.productName}</strong>
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>ID: {r.productId}</p>
        </div>
      ),
    },
    {
      key: "variant",
      header: "Size & Color",
      render: (r) => `${r.variant?.size || "-"} / ${r.variant?.colorName || "-"}`,
    },
    {
      key: "sku",
      header: "SKU",
      render: (r) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{r.sku}</span>,
    },
    {
      key: "barcode",
      header: "Barcode",
      render: (r) => (
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", cursor: "pointer", textDecoration: "underline" }}
          onClick={() => {
            setInitialBarcodeForHud(r.barcode);
            setIsBarcodeHudOpen(true);
          }}
          title="Click to scan/adjust this barcode"
        >
          {r.barcode || "-"}
        </span>
      ),
    },
    { key: "storeName", header: "Store" },
    {
      key: "onHandQuantity",
      header: "On Hand",
      render: (r) => <span>{r.onHandQuantity}</span>,
    },
    {
      key: "reservedQuantity",
      header: "Reserved",
      render: (r) => (
        <span style={{ color: r.reservedQuantity > 0 ? "var(--stock-reserved)" : "var(--text-tertiary)" }}>
          {r.reservedQuantity}
        </span>
      ),
    },
    {
      key: "availableQuantity",
      header: "Available to Sell",
      render: (r) => (
        <strong style={{ color: r.availableQuantity > 0 ? "var(--stock-instock)" : "var(--stock-outofstock)" }}>
          {r.availableQuantity}
        </strong>
      ),
    },
    {
      key: "reorderLevel",
      header: "Reorder Lvl",
      render: (r) => <span style={{ color: "var(--text-tertiary)" }}>{r.reorderLevel}</span>,
    },
    {
      key: "stockStatus",
      header: "Stock Status",
      render: (r) => {
        const variantMap = {
          IN_STOCK: "success" as const,
          LOW_STOCK: "warning" as const,
          OUT_OF_STOCK: "danger" as const,
          DISCONTINUED: "neutral" as const,
        };
        return <StatusBadge variant={variantMap[r.stockStatus] || "neutral"} label={r.stockStatus.replace(/_/g, " ")} />;
      },
    },
    {
      key: "actions",
      header: "Operations",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Barcode size={14} />}
          onClick={() => {
            setInitialBarcodeForHud(r.barcode);
            setIsBarcodeHudOpen(true);
          }}
        >
          Barcode Ops
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.inventoryRoot}>
      {/* Top Header */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Multi-Store Inventory Engine</h1>
          <p>Real-time retail ledger, barcode scanning HUD, physical reconciliation, and purchase order receipts</p>
        </div>

        <div className={styles.actionButtonGroup}>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Barcode size={16} />}
            onClick={() => {
              setInitialBarcodeForHud("");
              setIsBarcodeHudOpen(true);
            }}
            style={{
              background: "var(--admin-accent)",
              color: "#ffffff",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.35)",
            }}
          >
            Launch Barcode HUD
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <nav className={styles.subTabsNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "LEDGER" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("LEDGER")}
        >
          <Boxes size={16} /> Stock Ledger (18 Workflows)
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "MOVEMENTS" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("MOVEMENTS")}
        >
          <History size={16} /> Movement History
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "RECONCILIATION" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("RECONCILIATION")}
        >
          <Scale size={16} /> Physical Reconciliation
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "PURCHASE_ORDERS" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("PURCHASE_ORDERS")}
        >
          <PackagePlus size={16} /> Purchase Orders & Receipts
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "VALUATION" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("VALUATION")}
        >
          <TrendingUp size={16} /> Stock Valuation
        </button>
      </nav>

      {/* TAB 1: STOCK LEDGER */}
      {activeTab === "LEDGER" && (
        <div>
          {/* Controls & Status Filter Pills */}
          <div className={styles.filterControlsRow} style={{ marginBottom: "var(--space-4)" }}>
            <div className={styles.searchBox}>
              <TextInput
                placeholder="Search SKU, barcode, garment..."
                leftIcon={<Search size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.statusFilterPills}>
              <button
                type="button"
                className={`${styles.statusFilterBtn} ${statusFilter === "ALL" ? styles.statusFilterBtnActive : ""}`}
                onClick={() => setStatusFilter("ALL")}
              >
                All Stock
              </button>
              <button
                type="button"
                className={`${styles.statusFilterBtn} ${statusFilter === "IN_STOCK" ? styles.statusFilterBtnActive : ""}`}
                onClick={() => setStatusFilter("IN_STOCK")}
              >
                In Stock
              </button>
              <button
                type="button"
                className={`${styles.statusFilterBtn} ${statusFilter === "LOW_STOCK" ? styles.statusFilterBtnActive : ""}`}
                onClick={() => setStatusFilter("LOW_STOCK")}
              >
                Low Stock Alerts
              </button>
              <button
                type="button"
                className={`${styles.statusFilterBtn} ${statusFilter === "OUT_OF_STOCK" ? styles.statusFilterBtnActive : ""}`}
                onClick={() => setStatusFilter("OUT_OF_STOCK")}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {error ? (
            <ApiErrorCard message="Failed to load store inventory from backend." onRetry={() => refetch()} />
          ) : (
            <DataTable
              columns={columns}
              data={data?.items || []}
              isLoading={isLoading}
              page={data?.page || 1}
              totalPages={data?.totalPages || 1}
              totalItems={data?.total || 0}
              onPageChange={(p) => setPage(p)}
              emptyTitle="No Stock Records Match"
              emptyDescription="There are no variant inventory items matching your selected filters."
            />
          )}
        </div>
      )}

      {/* TAB 2: IMMUTABLE MOVEMENT HISTORY */}
      {activeTab === "MOVEMENTS" && <StockMovementsTab />}

      {/* TAB 3: PHYSICAL RECONCILIATION */}
      {activeTab === "RECONCILIATION" && <StockReconciliationTab />}

      {/* TAB 4: PURCHASE ORDERS & RECEIPTS */}
      {activeTab === "PURCHASE_ORDERS" && <PurchaseOrdersTab />}

      {/* TAB 5: FINANCIAL VALUATION */}
      {activeTab === "VALUATION" && <StockValuationTab />}

      {/* Barcode Workflow HUD Modal */}
      <BarcodeWorkflowHUD
        isOpen={isBarcodeHudOpen}
        onClose={() => setIsBarcodeHudOpen(false)}
        initialBarcode={initialBarcodeForHud}
      />
    </div>
  );
};
