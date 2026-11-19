import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { AddInventoryModal } from "./components/AddInventoryModal";
import {
  Barcode,
  Boxes,
  History,
  Scale,
  PackagePlus,
  TrendingUp,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { useDebounce } from "@bagodi/utilities";

type InventoryTab = "LEDGER" | "MOVEMENTS" | "RECONCILIATION" | "PURCHASE_ORDERS" | "VALUATION";

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<InventoryTab>("LEDGER");
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState<StockStatus | "ALL">("ALL");

  // Add Inventory State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Barcode HUD Trigger State
  const [isBarcodeHudOpen, setIsBarcodeHudOpen] = useState<boolean>(false);
  const [initialBarcodeForHud, setInitialBarcodeForHud] = useState<string>("");

  // Push to Catalogue Mutation
  const pushMutation = useMutation({
    mutationFn: (inventoryId: string) =>
      defaultApiClient.post("/inventory/push-to-catalogue", { inventoryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      setNotification(`Item pushed to Product Catalogue staging! It is ready to edit and publish live.`);
      setTimeout(() => setNotification(null), 4000);
    },
  });

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
      width: "220px",
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
      width: "150px",
      render: (r) => `${r.variant?.size || "-"} / ${r.variant?.colorName || "-"}`,
    },
    {
      key: "sku",
      header: "SKU",
      width: "140px",
      render: (r) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{r.sku}</span>,
    },
    {
      key: "barcode",
      header: "Barcode",
      width: "130px",
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
    { key: "storeName", header: "Store", width: "150px" },
    {
      key: "onHandQuantity",
      header: "On Hand",
      width: "85px",
      render: (r) => <span>{r.onHandQuantity}</span>,
    },
    {
      key: "reservedQuantity",
      header: "Reserved",
      width: "85px",
      render: (r) => (
        <span style={{ color: r.reservedQuantity > 0 ? "var(--stock-reserved)" : "var(--text-tertiary)" }}>
          {r.reservedQuantity}
        </span>
      ),
    },
    {
      key: "availableQuantity",
      header: "Available to Sell",
      width: "110px",
      render: (r) => (
        <strong style={{ color: r.availableQuantity > 0 ? "var(--stock-instock)" : "var(--stock-outofstock)" }}>
          {r.availableQuantity}
        </strong>
      ),
    },
    {
      key: "reorderLevel",
      header: "Reorder Lvl",
      width: "90px",
      render: (r) => <span style={{ color: "var(--text-tertiary)" }}>{r.reorderLevel}</span>,
    },
    {
      key: "stockStatus",
      header: "Stock Status",
      width: "125px",
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
      width: "290px",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "275px", whiteSpace: "nowrap" }}>
          {(r as any).isPushedToCatalogue ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              leftIcon={<CheckCircle size={13} color="#2E7D32" />}
              style={{
                borderColor: "#A5D6A7",
                color: "#2E7D32",
                background: "#F1F8F1",
                fontWeight: 600,
                cursor: "default",
                whiteSpace: "nowrap",
              }}
            >
              Pushed to Catalogue
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowUpRight size={13} />}
              style={{
                borderColor: "#C5A15B",
                color: "#9A7528",
                background: "#FDFBF7",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
              isLoading={pushMutation.isPending && pushMutation.variables === r.id}
              onClick={() => pushMutation.mutate(r.id)}
              title="Push this in-store garment to the Product Catalogue staging"
            >
              Push to Catalogue
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Barcode size={13} />}
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              setInitialBarcodeForHud(r.barcode);
              setIsBarcodeHudOpen(true);
            }}
          >
            Barcode
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.inventoryRoot}>
      {/* Top Header */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Multi-Store Inventory Engine</h1>
          <p>Real-time retail ledger, barcode scanning HUD, serial tracking, and catalogue publishing</p>
        </div>

        <div className={styles.actionButtonGroup}>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "#E31B23",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(227, 27, 35, 0.25)",
            }}
          >
            Add In-Store Stock & Serial
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Barcode size={16} />}
            onClick={() => {
              setInitialBarcodeForHud("");
              setIsBarcodeHudOpen(true);
            }}
          >
            Launch Barcode HUD
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Sync Ledger
          </Button>
        </div>
      </div>

      {notification && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "10px 16px",
            background: "#E8F5E9",
            border: "1px solid #A5D6A7",
            borderRadius: 8,
            color: "#1B5E20",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle size={16} />
          {notification}
        </div>
      )}

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
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className={styles.searchBox}>
                <TextInput
                  placeholder="Search SKU, barcode, garment..."
                  leftIcon={<Search size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus size={15} />}
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  background: "#E31B23",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 6px rgba(227, 27, 35, 0.25)",
                }}
              >
                Add to Inventory
              </Button>
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

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Barcode Workflow HUD Modal */}
      <BarcodeWorkflowHUD
        isOpen={isBarcodeHudOpen}
        onClose={() => setIsBarcodeHudOpen(false)}
        initialBarcode={initialBarcodeForHud}
      />
    </div>
  );
};
