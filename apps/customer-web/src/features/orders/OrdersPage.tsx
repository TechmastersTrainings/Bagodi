import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { EmptyState, ApiErrorCard, SkeletonLine, StatusBadge, Button } from "@bagodi/shared-components";
import { Package, Clock, Truck, KeyRound } from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import { CustomerDeliveryTrackingModal } from "./CustomerDeliveryTrackingModal";
import { AccountNavTabs } from "../account/AccountNavTabs";

export const OrdersPage: React.FC = () => {
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 var(--space-4)" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>
        Order History
      </h1>
      <AccountNavTabs />
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

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{order.items?.length || 0} items</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: "bold", fontSize: "var(--text-base)" }}>{formatINR(order.grandTotal)}</span>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<KeyRound size={14} color="#C5A15B" />}
                onClick={() => setSelectedOrderForTracking(order)}
              >
                Track & Delivery OTP
              </Button>
            </div>
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

      {/* Customer Live Delivery Tracking & Handover OTP Modal */}
      {selectedOrderForTracking && (
        <CustomerDeliveryTrackingModal
          isOpen={Boolean(selectedOrderForTracking)}
          onClose={() => setSelectedOrderForTracking(null)}
          orderId={selectedOrderForTracking.id}
          orderNumber={selectedOrderForTracking.orderNumber}
        />
      )}
    </div>
  );
};

