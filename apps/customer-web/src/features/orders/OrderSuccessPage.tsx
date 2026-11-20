import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { PerspectiveCard3D, SkeletonLine, ApiErrorCard } from "@bagodi/shared-components";
import {
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  PhoneCall,
  Clock,
} from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./OrderSuccessPage.module.css";

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [copied, setCopied] = useState<boolean>(false);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order-success", orderId],
    queryFn: () => defaultApiClient.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
  });

  const handleCopyOrderId = (idToCopy: string) => {
    navigator.clipboard?.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className={styles.successContainer}>
        <SkeletonLine height="80px" width="100%" />
        <div style={{ marginTop: "var(--space-6)" }}>
          <SkeletonLine height="240px" width="100%" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.successContainer}>
        <ApiErrorCard
          title="Order Placed Successfully"
          message={`Your order #${orderId} was confirmed! Please check your account order history for real-time tracking updates.`}
        />
        <div className={styles.actionRow} style={{ marginTop: "var(--space-6)" }}>
          <Link to="/account/orders" style={{ textDecoration: "none" }}>
            <button type="button" className={styles.trackBtn}>
              <PackageCheck size={18} /> View My Orders
            </button>
          </Link>
          <Link to="/catalogue" style={{ textDecoration: "none" }}>
            <button type="button" className={styles.shopBtn}>
              Continue Shopping <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || (order as any).order_number || orderId;
  const createdAt = order.createdAt || (order as any).created_at || new Date().toISOString();
  const grandTotal = order.grandTotal ?? (order as any).total_amount ?? 0;
  const paymentMethod = (order.paymentMethod || (order as any).payment_method || "COD").toUpperCase();
  const shippingAddr: any = order.shippingAddress || (order as any).shipping_address;

  const recipientName = shippingAddr?.fullName || shippingAddr?.full_name || order.customerName || (order as any).customer_name || "Valued Customer";
  const recipientPhone = shippingAddr?.phone || shippingAddr?.phoneNumber || order.customerPhone || (order as any).customer_phone || "";
  const addressLine1 = shippingAddr?.addressLine1 || shippingAddr?.address_line1 || "";
  const city = shippingAddr?.city || "";
  const state = shippingAddr?.state || "";
  const pincode = shippingAddr?.pincode || shippingAddr?.postalCode || shippingAddr?.postal_code || "";
  const locationParts = [city, state].filter(Boolean);
  const locationText = locationParts.length > 0
    ? `${locationParts.join(", ")} - ${pincode}`
    : "Bidar Flagship Boutique Delivery";

  const items = order.items || (order as any).order_items || [];

  return (
    <div className={styles.successContainer}>
      <PerspectiveCard3D maxTiltDeg={2}>
        <div className={styles.successCard}>
          <div className={styles.topDecorativeBar} />

          {/* Luxury Animated Seal */}
          <div className={styles.sealWrapper}>
            <div className={styles.sealRing} />
            <div className={styles.sealCenter}>
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
          </div>

          <div className={styles.atelierBadge}>
            <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Bagodi Luxury Atelier
          </div>

          <h1 className={styles.orderHeading}>Thank You for Shopping at Bagodi</h1>
          <p className={styles.orderSubtext}>
            Your garment order has been successfully confirmed and forwarded to our Bidar Flagship Store for bespoke packaging.
          </p>

          {/* Order ID Pill with Copy */}
          <div className={styles.orderNumberBadge}>
            <span>Order #{orderNumber}</span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => handleCopyOrderId(orderNumber)}
              title="Copy Order ID"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
            {copied && <span style={{ color: "#10b981", fontSize: "11px", fontWeight: 600 }}>Copied!</span>}
          </div>

          {/* Two-Column Details Grid */}
          <div className={styles.detailsGrid}>
            {/* Card 1: Fulfillment & Destination */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>
                <Truck size={14} color="var(--accent-primary)" />
                Fulfillment & Destination
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Calendar size={14} /> Placed On
                </span>
                <span className={styles.infoValue}>{formatDateTime(createdAt)}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Clock size={14} /> Estimated Delivery
                </span>
                <span className={styles.infoValue} style={{ color: "var(--status-success)" }}>
                  3 – 5 Business Days
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <MapPin size={14} /> Delivery Address
                </span>
                <span className={styles.infoValue}>
                  {recipientName}
                  {addressLine1 ? <><br /><span style={{ fontWeight: 400, color: "var(--text-secondary)", fontSize: "11px" }}>{addressLine1}</span></> : null}
                  <br />
                  <span style={{ fontWeight: 500 }}>{locationText}</span>
                  {recipientPhone ? <><br /><span style={{ fontWeight: 400, color: "var(--text-tertiary)", fontSize: "11px" }}>Ph: {recipientPhone}</span></> : null}
                </span>
              </div>
            </div>

            {/* Card 2: Payment & Financial Summary */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>
                <CreditCard size={14} color="var(--accent-primary)" />
                Payment & Billing
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment Mode</span>
                <span className={styles.infoValue}>
                  {paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Paid Online via UPI / Card"}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Delivery Charge</span>
                <span className={styles.infoValue} style={{ color: "var(--status-success)" }}>
                  FREE
                </span>
              </div>

              <div className={styles.infoRow} style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <span className={styles.infoLabel} style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>
                  Total Amount
                </span>
                <span className={styles.infoValue} style={{ color: "var(--accent-primary)", fontSize: "var(--text-lg)", fontWeight: 700 }}>
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Garments Preview List if available */}
          {items.length > 0 && (
            <div className={styles.itemsCard}>
              <div className={styles.infoCardTitle}>
                <ShoppingBag size={14} color="var(--accent-primary)" />
                Garments in this Order ({items.length})
              </div>
              <div className={styles.itemsList}>
                {items.map((item: any, idx: number) => {
                  const pName = item.productName || item.product_name || "Luxury Garment";
                  const vName = item.variantName || item.variant_name || item.size || "Standard";
                  const qty = item.quantity || 1;
                  const price = item.totalPrice ?? item.total_price ?? item.unitPrice ?? item.unit_price ?? 0;

                  return (
                    <div key={item.id || idx} className={styles.itemRow}>
                      <div className={styles.itemNameCol}>
                        <span className={styles.itemTitle}>{pName}</span>
                        <span className={styles.itemVariant}>Size: {vName} • Qty: {qty}</span>
                      </div>
                      <span className={styles.itemPriceCol}>{formatINR(price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Store Concierge Notice */}
          <div className={styles.conciergeCard}>
            <PhoneCall size={20} color="var(--color-champagne-gold, #d4af37)" style={{ flexShrink: 0 }} />
            <div className={styles.conciergeText}>
              <strong>Direct Store Concierge:</strong> Bagodi Flagship Shopping Mall, Near Shivaji Chowk, Bidar.
              Need sizing assistance or order customization? Call our store desk at <strong>+91 9880768222</strong>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            <Link to="/account/orders" style={{ textDecoration: "none" }}>
              <button type="button" className={styles.trackBtn}>
                <PackageCheck size={18} />
                <span>Track My Order</span>
              </button>
            </Link>
            <Link to="/catalogue" style={{ textDecoration: "none" }}>
              <button type="button" className={styles.shopBtn}>
                <span>Continue Shopping</span>
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </PerspectiveCard3D>
    </div>
  );
};
