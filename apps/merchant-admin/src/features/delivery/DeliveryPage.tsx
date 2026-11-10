import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { DeliveryShipment, ShipmentStatus, PaginatedResponse } from "@bagodi/shared-types";
import { DataTable, Column, StatusBadge, ApiErrorCard, Button } from "@bagodi/shared-components";
import { formatDateTime } from "@bagodi/utilities";
import styles from "./DeliveryPage.module.css";
import { ShipmentDetailModal } from "./ShipmentDetailModal";
import { CreateShipmentModal } from "./CreateShipmentModal";
import { ManifestModal } from "./ManifestModal";
import {
  Truck,
  Package,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Eye,
  Send,
  Navigation,
} from "lucide-react";

export const DeliveryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [partnerFilter, setPartnerFilter] = useState<string>("ALL");

  // Modals
  const [selectedShipment, setSelectedShipment] = useState<DeliveryShipment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Real backend query for shipments
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<DeliveryShipment>>({
    queryKey: ["admin-shipments-list", page, statusFilter, partnerFilter, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (partnerFilter !== "ALL") params.courierPartnerId = partnerFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      return defaultApiClient.get<PaginatedResponse<DeliveryShipment>>("/delivery/shipments", { params });
    },
    retry: 1,
  });

  const shipments = data?.items || [];

  // Metrics summary
  const metrics = useMemo(() => {
    const totalShipments = data?.total || 0;
    const pendingPickup = shipments.filter((s) => s.status === "MANIFESTED").length;
    const outForDelivery = shipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
    const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

    return {
      totalShipments,
      pendingPickup,
      outForDelivery,
      deliveredCount,
    };
  }, [shipments, data?.total]);

  const handleOpenDetail = (shipment: DeliveryShipment) => {
    setSelectedShipment(shipment);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case "DELIVERED":
        return <StatusBadge variant="success" label="Delivered" />;
      case "OUT_FOR_DELIVERY":
        return <StatusBadge variant="info" label="Out for Delivery" />;
      case "IN_TRANSIT":
        return <StatusBadge variant="warning" label="In-Transit Hub" />;
      case "PICKED_UP":
        return <StatusBadge variant="warning" label="Picked Up by Partner" />;
      case "MANIFESTED":
        return <StatusBadge variant="neutral" label="Manifested" />;
      case "RTO":
        return <StatusBadge variant="danger" label="Returned to Origin" />;
      default:
        return <StatusBadge variant="neutral" label={status} />;
    }
  };

  const columns: Column<DeliveryShipment>[] = [
    {
      key: "trackingNumber",
      header: "AWB / Tracking & Order",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {row.trackingNumber}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-champagne-gold)", marginTop: "2px" }}>
            Order #{row.orderNumber}
          </div>
        </div>
      ),
    },
    {
      key: "courierPartnerName",
      header: "Courier Partner",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Truck size={14} color="var(--color-champagne-gold)" />
          <span style={{ fontWeight: 500, color: "#FFFFFF", fontSize: "12px" }}>
            {row.courierPartnerName}
          </span>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Recipient & Destination",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: "#FFFFFF" }}>{row.customerName}</div>
          <div style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            {row.destinationCity} • PIN {row.destinationPincode}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Shipment Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "createdAt",
      header: "Manifested Date",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "var(--color-muted-grey)" }}>
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Tracking Actions",
      render: (row) => (
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.iconActionBtn}
            onClick={() => handleOpenDetail(row)}
            title="Inspect Live Checkpoint Scans"
          >
            <Eye size={15} />
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
          <h1 className={styles.pageTitle}>Delivery Logistics & Courier Fleet</h1>
          <p className={styles.pageSubtitle}>
            Real-time package dispatch, multi-carrier courier tracking, and handover manifests for Bagodi Retail.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={() => setIsManifestOpen(true)}
            disabled={shipments.length === 0}
          >
            Daily Handover Manifest
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Book Shipment Dispatch
          </Button>
        </div>
      </div>

      {/* 2. Operations Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Active Shipments</span>
            <Truck size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.totalShipments}</div>
          <div className={styles.metricSubtext}>Total active in transit network</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Pending Mall Handover</span>
            <Package size={14} color="var(--status-warning)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-warning)" }}>
            {metrics.pendingPickup}
          </div>
          <div className={styles.metricSubtext}>Awaiting driver physical collection</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Out for Delivery</span>
            <Navigation size={14} color="var(--color-champagne-gold)" />
          </div>
          <div className={styles.metricValue}>{metrics.outForDelivery}</div>
          <div className={styles.metricSubtext}>On route to customer doorstep</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>
            <span>Delivered</span>
            <CheckCircle2 size={14} color="var(--status-success)" />
          </div>
          <div className={styles.metricValue} style={{ color: "var(--status-success)" }}>
            {metrics.deliveredCount}
          </div>
          <div className={styles.metricSubtext}>Successfully fulfilled</div>
        </div>
      </div>

      {/* 3. Operational Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--color-muted-grey)" />
          <input
            type="text"
            placeholder="Search by AWB tracking #, order #, customer name, or pincode..."
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
            <option value="ALL">All Delivery Statuses</option>
            <option value="MANIFESTED">Manifested (Ready)</option>
            <option value="PICKED_UP">Picked Up by Courier</option>
            <option value="IN_TRANSIT">In-Transit Hub</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="RTO">Returned to Origin</option>
          </select>

          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)" }}>
            Carrier:
          </label>
          <select
            value={partnerFilter}
            onChange={(e) => {
              setPartnerFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Courier Partners</option>
            <option value="cp_bluedart">Blue Dart Express</option>
            <option value="cp_delhivery">Delhivery</option>
            <option value="cp_dtdc">DTDC</option>
            <option value="cp_inhouse">Bagodi Bidar Hyperlocal</option>
          </select>
        </div>
      </div>

      {/* 4. Real Shipments Table */}
      {error ? (
        <ApiErrorCard
          message="Failed to load shipments from the logistics backend."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={shipments}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          emptyTitle="No Active Shipments"
          emptyDescription="Orders marked as PACKED will be ready to book courier dispatches and print labels here."
        />
      )}

      {/* 5. Live Tracking Checkpoint Modal */}
      <ShipmentDetailModal
        shipment={selectedShipment}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedShipment(null);
        }}
      />

      {/* 6. Book Shipment Modal */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* 7. Printable Handover Manifest Modal */}
      <ManifestModal
        shipments={shipments}
        courierName={partnerFilter !== "ALL" ? partnerFilter : "All Handover Partners"}
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />
    </div>
  );
};
