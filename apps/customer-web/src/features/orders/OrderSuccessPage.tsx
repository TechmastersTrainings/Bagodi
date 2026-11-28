import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order } from "@bagodi/shared-types";
import { Button, SkeletonLine, ApiErrorCard } from "@bagodi/shared-components";
import {
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Receipt,
  Truck,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./OrderSuccessPage.module.css";

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order-success", orderId],
    queryFn: () => defaultApiClient.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <SkeletonLine height="80px" width="100%" />
        <div style={{ marginTop: "var(--space-6)" }}>
          <SkeletonLine height="340px" width="100%" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.pageContainer}>
        <ApiErrorCard
          title="Order Placed Successfully"
          message={`Your order #${orderId} was confirmed! Please check your account order history for real-time tracking updates.`}
        />
        <div className={styles.actionsRow} style={{ marginTop: "var(--space-6)" }}>
          <Link to="/account/orders" style={{ textDecoration: "none" }}>
            <Button size="md" className={styles.primaryTrackBtn}>View My Orders</Button>
          </Link>
          <Link to="/catalogue" style={{ textDecoration: "none" }}>
            <Button variant="outline" size="md" className={styles.secondaryShopBtn}>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || (order as any).order_number || orderId;
  const createdAt = order.createdAt || (order as any).created_at || new Date().toISOString();
  const grandTotal = order.grandTotal ?? (order as any).total_amount ?? 0;
  const shippingFee = (order as any).shipping_fee ?? order.deliveryCharge ?? 0;
  const subtotal = (order as any).subtotal ?? grandTotal;
  const pMethod = (order as any).payment_method || order.paymentMethod || "COD";
  const pMethodDisplay = pMethod.toUpperCase() === "COD" ? "Cash on Delivery" : "Instant UPI / Online";
  const orderStatus = String(order.status || "CONFIRMED").toUpperCase();
  const isPendingPayment = orderStatus === "PENDING_PAYMENT";

  const shippingAddr: any = order.shippingAddress || (order as any).shipping_address;
  const recipientName = shippingAddr?.full_name || shippingAddr?.fullName || (order as any).customer_name || "Valued Customer";
  const recipientPhone = shippingAddr?.phone || (order as any).customer_phone || "";
  const addressLine1 = shippingAddr?.address_line1 || shippingAddr?.addressLine1 || "";
  const addressLine2 = shippingAddr?.address_line2 || shippingAddr?.addressLine2 || "";
  const city = shippingAddr?.city || "";
  const state = shippingAddr?.state || "";
  const pincode = shippingAddr?.pincode || shippingAddr?.postalCode || shippingAddr?.postal_code || "";

  const locationParts = [city, state].filter(Boolean);
  const locationText = locationParts.length > 0
    ? locationParts.join(", ") + (pincode ? ` (${pincode})` : "")
    : "Bidar Flagship Boutique Delivery";

  const items: any[] = order.items || [];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.successCard}>
          {/* Top Atelier Seal */}
          <div className={styles.sealContainer}>
            <div className={styles.sealRing}>
              <CheckCircle2 size={40} />
            </div>
            <div className={styles.atelierBadge}>
              <Sparkles size={13} />
              {isPendingPayment ? "ORDER CREATED — AWAITING PAYMENT" : "BAGODI ATELIER CONFIRMED"}
            </div>
          </div>

          <h1 className={styles.mainTitle}>
            {isPendingPayment ? "Complete Your Order Payment" : "Thank You for Shopping at Bagodi"}
          </h1>
          <p className={styles.subtitle}>
            {isPendingPayment
              ? "Your items are reserved for 15 minutes. Please complete online payment verification from My Orders to confirm dispatch from our "
              : "Your luxury order has been registered and forwarded to our master tailors and artisans at the "}
            <strong>Bidar Flagship Store</strong>.
          </p>

          {/* Monospace Order Reference */}
          <div className={styles.orderRefRow}>
            <span className={styles.orderRefLabel}>Docket Ref:</span>
            <span className={styles.orderRefValue}>#{orderNumber}</span>
          </div>

          {/* Stepper Progress Bar */}
          <div className={styles.stepperContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepDotActive}>✓</div>
              <span className={`${styles.stepText} ${styles.stepTextActive}`}>Placed</span>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepDotInProgress}>●</div>
              <span className={`${styles.stepText} ${styles.stepTextActive}`}>Boutique Prep</span>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepDotPending}>○</div>
              <span className={styles.stepText}>Inspected</span>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepDotPending}>○</div>
              <span className={styles.stepText}>Delivered</span>
            </div>
          </div>

          {/* Atelier Receipt Card */}
          <div className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <div className={styles.receiptTitle}>
                <Receipt size={18} color="#d4af37" />
                Atelier Order Summary
              </div>
              <div className={styles.receiptDate}>
                <Calendar size={13} style={{ display: "inline", marginRight: 4 }} />
                {formatDateTime(createdAt)}
              </div>
            </div>

            {/* Items Preview */}
            {items.length > 0 && (
              <div className={styles.itemsSection}>
                {items.map((item, idx) => {
                  const pName = item.productName || item.product_name || "Luxury Apparel";
                  const vName = item.variantName || item.variant_name || item.size || "Standard";
                  const qty = item.quantity || 1;
                  const itemTotal = item.totalPrice ?? item.total_price ?? (item.unitPrice * qty);

                  return (
                    <div key={item.id || idx} className={styles.itemRow}>
                      <div className={styles.itemName}>
                        <ShoppingBag size={14} color="#C49A4B" />
                        <span>
                          {pName} <span className={styles.itemVariant}>({vName}) × {qty}</span>
                        </span>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatINR(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Two-Column Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>
                  <MapPin size={13} color="#C49A4B" />
                  Delivery Destination
                </div>
                <div className={styles.detailValue}>
                  <strong>{recipientName}</strong>
                  {recipientPhone && ` • ${recipientPhone}`}
                  <br />
                  {addressLine1}
                  {addressLine2 && `, ${addressLine2}`}
                  <br />
                  {locationText}
                </div>
              </div>

              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>
                  <CreditCard size={13} color="#d4af37" />
                  Payment & Delivery Mode
                </div>
                <div className={styles.detailValue}>
                  <strong>{pMethodDisplay}</strong>
                  <br />
                  <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                    Standard Boutique Dispatch (3 - 5 Days)
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <div className={styles.pricingRow}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className={styles.pricingRow}>
                <span>Delivery Charges</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  {Number(shippingFee) === 0 ? "FREE (Insured Boutique Dispatch)" : formatINR(shippingFee)}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span>Total Payable</span>
                <span className={styles.totalAmount}>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Concierge Reassurance Notice */}
          <div className={styles.conciergeNotice}>
            <Truck size={20} color="#d4af37" style={{ flexShrink: 0 }} />
            <div className={styles.conciergeNoticeText}>
              <strong>Dispatched from Flagship Boutique:</strong> Near Shivaji Chowk, Main Commercial Road, Bidar - 585401. Hand-pressed, certified authentic, and quality checked.
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionsRow}>
            <Link to="/account/orders" style={{ textDecoration: "none" }}>
              <Button size="lg" className={styles.primaryTrackBtn} leftIcon={<PackageCheck size={18} />}>
                Track My Order
              </Button>
            </Link>
            <Link to="/catalogue" style={{ textDecoration: "none" }}>
              <Button variant="outline" size="lg" className={styles.secondaryShopBtn} rightIcon={<ArrowRight size={18} />}>
                Continue Exploring Collections
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
