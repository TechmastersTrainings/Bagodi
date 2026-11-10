import React from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { EmptyState, ApiErrorCard, SkeletonLine, StatusBadge } from "@bagodi/shared-components";
import { Package, Clock } from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ["customer-orders"],
    queryFn: () => defaultApiClient.get<Order[]>("/customer/orders"),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SkeletonLine height="32px" width="220px" />
        <SkeletonLine height="140px" width="100%" />
      </div>
    );
  }

  if (error) {
    return <ApiErrorCard message="Failed to load your orders history." onRetry={() => refetch()} />;
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Placed Yet"
        description="When you place orders on the Bagodi online store, your orders and live tracking timeline will appear here."
        icon={<Package size={36} />}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>
        Order History
      </h1>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            padding: "var(--space-6)",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Order #{order.orderNumber}</span>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{formatDateTime(order.createdAt)}</p>
            </div>
            <StatusBadge variant="info" label={order.status.replace(/_/g, " ")} />
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between" }}>
            <span>{order.items?.length || 0} items</span>
            <span style={{ fontWeight: "bold" }}>{formatINR(order.grandTotal)}</span>
          </div>

          {/* Timeline events from actual backend timestamps */}
          {order.trackingEvents && order.trackingEvents.length > 0 && (
            <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--accent-primary)" }}>
                <Clock size={14} /> Status Timeline
              </div>
              {order.trackingEvents.map((event, idx) => (
                <div key={idx} style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                  • {event.title} — {formatDateTime(event.timestamp)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

