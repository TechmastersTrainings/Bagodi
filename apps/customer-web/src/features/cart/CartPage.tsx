import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { CartResponse } from "@bagodi/shared-types";
import { Button, EmptyState, ApiErrorCard, SkeletonLine, PerspectiveCard3D } from "@bagodi/shared-components";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, ShieldCheck, AlertCircle } from "lucide-react";
import { formatINR } from "@bagodi/utilities";
import styles from "./CartPage.module.css";

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: cart, isLoading, error, refetch } = useQuery<CartResponse>({
    queryKey: ["customer-cart"],
    queryFn: () => defaultApiClient.get<CartResponse>("/cart"),
    retry: 1,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      defaultApiClient.patch<CartResponse>(`/cart/items/${itemId}`, { quantity }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["customer-cart"], updatedCart);
    },
    onError: () => {
      refetch();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => defaultApiClient.delete<CartResponse>(`/cart/items/${itemId}`),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["customer-cart"], updatedCart);
    },
    onError: () => {
      refetch();
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: (couponCode: string) =>
      defaultApiClient.post<CartResponse>("/cart/apply-coupon", { couponCode }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["customer-cart"], updatedCart);
      setCouponInput("");
      setCouponError(null);
    },
    onError: (err: any) => {
      setCouponError(err.message || "Invalid or expired coupon code");
    },
  });

  const removeCouponMutation = useMutation({
    mutationFn: () => defaultApiClient.delete<CartResponse>("/cart/coupon"),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["customer-cart"], updatedCart);
      setCouponError(null);
    },
    onError: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className={styles.cartContainer}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <SkeletonLine height="36px" width="220px" />
        </div>
        <div className={styles.cartGrid}>
          <div className={styles.itemsList}>
            <SkeletonLine height="140px" width="100%" />
            <SkeletonLine height="140px" width="100%" />
          </div>
          <div>
            <SkeletonLine height="320px" width="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cartContainer}>
        <ApiErrorCard
          title="Shopping Bag Offline"
          message="Could not load your shopping bag. Please check your network connection."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <EmptyState
          title="Your Shopping Bag is Empty"
          description="You haven't selected any garments yet. Explore our curated ready-made fashion collection from Bidar."
          icon={<ShoppingBag size={42} />}
          action={
            <Link to="/catalogue">
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                Explore Collection
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <header className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Shopping Bag</h1>
        <span className={styles.cartCount}>
          ({cart.itemCount} {cart.itemCount === 1 ? "garment" : "garments"})
        </span>
      </header>

      <div className={styles.cartGrid}>
        {/* Items List */}
        <div className={styles.itemsList}>
          {cart.items.map((item) => (
            <div key={item.id} className={styles.cartItemCard}>
              <div className={styles.itemImageWrapper}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                ) : (
                  <ShoppingBag size={32} color="var(--text-tertiary)" />
                )}
              </div>

              <div className={styles.itemDetails}>
                <div>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.productName}</h3>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItemMutation.mutate(item.id)}
                      disabled={removeItemMutation.isPending}
                      aria-label="Remove item from bag"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.itemMeta}>
                    <span className={styles.metaChip}>Size: {item.variant.size}</span>
                    {item.variant.colorName && (
                      <span className={styles.metaChip}>Color: {item.variant.colorName}</span>
                    )}
                    <span className={styles.metaChip}>SKU: {item.variant.sku}</span>
                  </div>

                  {item.variant.availableStock !== undefined && item.variant.availableStock <= 3 && (
                    <div className={styles.stockWarning}>
                      <AlertCircle size={12} />
                      Only {item.variant.availableStock} left in stock - order soon
                    </div>
                  )}
                </div>

                <div className={styles.itemFooter}>
                  {/* Quantity Stepper */}
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.qtyButton}
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                        } else {
                          removeItemMutation.mutate(item.id);
                        }
                      }}
                      disabled={updateQuantityMutation.isPending}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyButton}
                      onClick={() => {
                        updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 });
                      }}
                      disabled={
                        updateQuantityMutation.isPending ||
                        (item.variant.availableStock !== undefined && item.quantity >= item.variant.availableStock)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price Column */}
                  <div className={styles.priceColumn}>
                    <div className={styles.itemTotal}>{formatINR(item.totalPrice)}</div>
                    {item.quantity > 1 && (
                      <div className={styles.itemUnit}>({formatINR(item.unitPrice)} each)</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Server-Authoritative Order Summary */}
        <PerspectiveCard3D maxTiltDeg={4}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Promo Code Box */}
            <div className={styles.couponBox}>
              {cart.couponCode ? (
                <div className={styles.appliedCouponTag}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Tag size={14} />
                    <span>Coupon <strong>{cart.couponCode}</strong> Applied</span>
                  </div>
                  <button
                    className={styles.removeCouponBtn}
                    onClick={() => removeCouponMutation.mutate()}
                    disabled={removeCouponMutation.isPending}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (couponInput.trim()) {
                        applyCouponMutation.mutate(couponInput.trim());
                      }
                    }}
                    className={styles.couponInputGroup}
                  >
                    <input
                      type="text"
                      className={styles.couponInput}
                      placeholder="Enter Promo Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      isLoading={applyCouponMutation.isPending}
                    >
                      Apply
                    </Button>
                  </form>
                  {couponError && (
                    <p style={{ color: "var(--status-danger)", fontSize: "var(--text-xs)", marginTop: "var(--space-2)" }}>
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className={styles.breakdownRow}>
              <span>Bag Subtotal</span>
              <span>{formatINR(cart.pricing.subtotal)}</span>
            </div>

            {cart.pricing.discountTotal > 0 && (
              <div className={styles.breakdownRow} style={{ color: "var(--status-success)" }}>
                <span>Discount Savings</span>
                <span>-{formatINR(cart.pricing.discountTotal)}</span>
              </div>
            )}

            <div className={styles.breakdownRow}>
              <span>Delivery Charge</span>
              <span>
                {cart.pricing.deliveryCharge === 0 ? (
                  <span style={{ color: "var(--status-success)", fontWeight: "bold" }}>FREE</span>
                ) : (
                  formatINR(cart.pricing.deliveryCharge)
                )}
              </span>
            </div>

            <div className={styles.breakdownTotal}>
              <span>Payable Total</span>
              <span style={{ color: "var(--accent-primary)" }}>
                {formatINR(cart.pricing.finalTotal)}
              </span>
            </div>

            <div className={styles.taxNotice}>
              Inclusive of all applicable GST taxes
            </div>

            <Link to="/checkout" style={{ textDecoration: "none" }}>
              <Button size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                Proceed to Checkout
              </Button>
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "var(--space-4)", fontSize: "var(--text-2xs)", color: "var(--text-tertiary)" }}>
              <ShieldCheck size={14} color="var(--status-success)" />
              100% Authentic Fashion • Secure SSL Encryption
            </div>
          </div>
        </PerspectiveCard3D>
      </div>
    </div>
  );
};
