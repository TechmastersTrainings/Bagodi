import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { Button, PerspectiveCard3D, SkeletonLine, ApiErrorCard } from "@bagodi/shared-components";
import { CheckCircle2, PackageCheck, ArrowRight, Calendar, MapPin } from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order-success", orderId],
    queryFn: () => defaultApiClient.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 640, margin: "var(--space-12) auto", padding: "0 var(--space-4)" }}>
        <SkeletonLine height="80px" width="100%" />
        <SkeletonLine height="240px" width="100%" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: 640, margin: "var(--space-12) auto", padding: "0 var(--space-4)" }}>
        <ApiErrorCard
          title="Order Details Pending"
          message={`Your order #${orderId} was received. Please check your account order history for real-time updates.`}
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-4)" }}>
          <Link to="/account/orders">
            <Button size="md">View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "var(--space-8) auto", padding: "0 var(--space-4)" }}>
      <PerspectiveCard3D maxTiltDeg={3}>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-2xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--status-success-bg)",
              border: "1px solid var(--status-success-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-4)",
              color: "var(--status-success)",
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", marginBottom: "var(--space-2)" }}>
            Thank You for Shopping at Bagodi
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
            Your order <strong>#{order.orderNumber}</strong> has been successfully placed and forwarded to our Bidar Flagship Store.
          </p>

          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
              textAlign: "left",
              marginBottom: "var(--space-6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={16} /> Placed On
              </span>
              <span style={{ fontWeight: "bold" }}>{formatDateTime(order.createdAt)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={16} /> Delivery Location
              </span>
              <span>
                {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.pincode || order.shippingAddress.postalCode})
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)", fontSize: "var(--text-base)", fontWeight: "bold" }}>
              <span>Amount Paid</span>
              <span style={{ color: "var(--accent-primary)" }}>{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <Link to="/account/orders" style={{ textDecoration: "none" }}>
              <Button size="md" leftIcon={<PackageCheck size={18} />}>
                Track My Order
              </Button>
            </Link>
            <Link to="/catalogue" style={{ textDecoration: "none" }}>
              <Button variant="outline" size="md" rightIcon={<ArrowRight size={18} />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </PerspectiveCard3D>
    </div>
  );
};

