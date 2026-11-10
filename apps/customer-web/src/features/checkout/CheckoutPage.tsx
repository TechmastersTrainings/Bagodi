import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultApiClient } from "@bagodi/api-client";
import { Address, CartResponse, CreateOrderResponse, CreateOrderPayload, ValidateCouponResponse } from "@bagodi/shared-types";
import { addressSchema, AddressFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard, SkeletonLine, PerspectiveCard3D } from "@bagodi/shared-components";
import { MapPin, Truck, CreditCard, Plus, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Tag, X } from "lucide-react";
import { formatINR } from "@bagodi/utilities";
import styles from "./CheckoutPage.module.css";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // Selected State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [deliverySpeed, setDeliverySpeed] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Promotional Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) =>
      defaultApiClient.post<ValidateCouponResponse>("/promotions/validate-coupon", {
        code,
        cartTotal: cart?.pricing?.subtotal || 0,
      }),
    onSuccess: (res) => {
      if (res.isValid) {
        setAppliedCoupon({ code: res.code, discountAmount: res.discountAmount, message: res.message });
        setCouponError(null);
      } else {
        setCouponError(res.message || "Invalid coupon code");
      }
    },
    onError: (err: any) => {
      setCouponError(err?.response?.data?.message || err?.message || "Failed to validate coupon");
    },
  });

  // Load Active Cart
  const { data: cart, isLoading: isCartLoading } = useQuery<CartResponse>({
    queryKey: ["customer-cart"],
    queryFn: () => defaultApiClient.get<CartResponse>("/cart"),
  });

  // Load Saved Addresses
  const {
    data: savedAddresses = [],
    isLoading: isAddressesLoading,
    refetch: refetchAddresses,
  } = useQuery<Address[]>({
    queryKey: ["customer-addresses"],
    queryFn: () => defaultApiClient.get<Address[]>("/customer/addresses"),
  });

  // React Hook Form for New Address
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetAddressForm,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "Karnataka",
      postalCode: "",
      country: "India",
      isDefault: false,
    },
  });

  // Save New Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      defaultApiClient.post<Address>("/customer/addresses", data),
    onSuccess: (newAddress) => {
      refetchAddresses();
      setSelectedAddressId(newAddress.id);
      setIsAddingNewAddress(false);
      resetAddressForm();
    },
    onError: (err: any) => {
      setCheckoutError(err.message || "Failed to save address");
    },
  });

  // Load Razorpay Script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Authoritative Order Placement Mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      return await defaultApiClient.post<CreateOrderResponse>("/orders", payload);
    },
    onSuccess: async (res) => {
      if (paymentMethod === "RAZORPAY" && res.razorpay) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setCheckoutError("Razorpay SDK failed to load. Please check your network connection.");
          return;
        }

        const options = {
          key: res.razorpay.keyId,
          amount: res.razorpay.amount,
          currency: res.razorpay.currency,
          name: "Bagodi",
          description: `Order #${res.order.orderNumber} - Bidar Flagship Store`,
          order_id: res.razorpay.razorpayOrderId,
          handler: async (response: any) => {
            try {
              // Verify payment on backend
              await defaultApiClient.post(`/orders/${res.order.id}/verify-payment`, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              navigate(`/order-success/${res.order.id}`);
            } catch {
              navigate(`/order-success/${res.order.id}?status=verification_pending`);
            }
          },
          prefill: {
            name: res.order.customerName || "",
            contact: res.order.customerPhone || "",
            email: res.order.customerEmail || "",
          },
          theme: {
            color: "#d4af37", // Bagodi Gold
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct COD or Standard Order Creation
        navigate(`/order-success/${res.order.id}`);
      }
    },
    onError: (err: any) => {
      setCheckoutError(err.message || "Failed to place order. Please review your details and retry.");
    },
  });

  // Handle Order Submission
  const handleProceedOrder = () => {
    setCheckoutError(null);
    if (!selectedAddressId && savedAddresses.length > 0) {
      setCheckoutError("Please select a delivery address to proceed.");
      return;
    }

    const payload: CreateOrderPayload = {
      shippingAddressId: selectedAddressId || undefined,
      paymentMethod,
      deliverySpeed,
      couponCode: appliedCoupon?.code,
    };

    placeOrderMutation.mutate(payload);
  };

  // Set default address when loaded
  React.useEffect(() => {
    if (!selectedAddressId && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [savedAddresses, selectedAddressId]);

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className={styles.checkoutContainer}>
        <SkeletonLine height="40px" width="300px" />
        <div style={{ marginTop: "var(--space-6)" }}>
          <SkeletonLine height="240px" width="100%" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.checkoutContainer}>
        <ApiErrorCard
          title="No Items to Checkout"
          message="Your shopping bag is empty. Please add garments before checking out."
          onRetry={() => navigate("/catalogue")}
          actionText="Browse Catalogue"
        />
      </div>
    );
  }

  // Calculate express delivery charge add-on & coupon discount
  const expressDeliveryAddOn = deliverySpeed === "EXPRESS" ? 150 : 0;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalCalculatedPayable = Math.max(
    0,
    (cart.pricing.finalTotal || 0) + expressDeliveryAddOn - couponDiscountAmount
  );

  return (
    <div className={styles.checkoutContainer}>
      <header className={styles.checkoutHeader}>
        <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>
          <ArrowLeft size={14} /> Return to Shopping Bag
        </Link>
        <h1 className={styles.checkoutTitle}>Checkout</h1>
        <p className={styles.checkoutSubtitle}>Review your shipping address, delivery speed, and payment method.</p>
      </header>

      {checkoutError && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <ApiErrorCard message={checkoutError} onRetry={() => setCheckoutError(null)} />
        </div>
      )}

      <div className={styles.checkoutGrid}>
        {/* Left Column: Multi-Step Fulfillment Options */}
        <div>
          {/* Step 1: Delivery Address */}
          <section className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>1</div>
              <MapPin size={20} color="var(--accent-primary)" />
              <h2 className={styles.stepTitle}>Delivery Address</h2>
            </div>

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 && !isAddingNewAddress && (
              <div className={styles.addressGrid}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      className={`${styles.addressCard} ${isSelected ? styles.addressCardSelected : ""}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className={styles.addressHeader}>
                        <span className={styles.recipientName}>{addr.fullName}</span>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>
                      <div className={styles.addressBody}>
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        {addr.landmark && `, near ${addr.landmark}`}
                        <br />
                        {addr.city}, {addr.state} - <strong>{addr.pincode || addr.postalCode}</strong>
                      </div>
                      <div className={styles.addressPhone}>Phone: {addr.phone || addr.phoneNumber}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Address Button / Form */}
            {!isAddingNewAddress ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsAddingNewAddress(true)}
              >
                Add New Delivery Address
              </Button>
            ) : (
              <form
                onSubmit={handleSubmit((data) => addAddressMutation.mutate(data))}
                style={{ background: "var(--bg-secondary)", padding: "var(--space-5)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)" }}
              >
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>
                  Enter New Address
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <TextInput
                    label="Full Recipient Name"
                    placeholder="e.g. Ramesh Patil"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                    isRequired
                  />
                  <TextInput
                    label="10-digit Phone Number"
                    placeholder="9876543210"
                    {...register("phoneNumber")}
                    error={errors.phoneNumber?.message}
                    isRequired
                  />
                </div>
                <div style={{ marginTop: "var(--space-4)" }}>
                  <TextInput
                    label="Street, House No, Flat"
                    placeholder="Shop #4, Near Shivaji Chowk"
                    {...register("addressLine1")}
                    error={errors.addressLine1?.message}
                    isRequired
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
                  <TextInput
                    label="City / District"
                    placeholder="Bidar"
                    {...register("city")}
                    error={errors.city?.message}
                    isRequired
                  />
                  <TextInput
                    label="State"
                    placeholder="Karnataka"
                    {...register("state")}
                    error={errors.state?.message}
                    isRequired
                  />
                  <TextInput
                    label="6-Digit PIN Code"
                    placeholder="585401"
                    {...register("postalCode")}
                    error={errors.postalCode?.message}
                    isRequired
                  />
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
                  <Button type="submit" size="sm" isLoading={isSubmitting || addAddressMutation.isPending}>
                    Save & Use Address
                  </Button>
                  {savedAddresses.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingNewAddress(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Delivery Speed */}
          <section className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>2</div>
              <Truck size={20} color="var(--accent-primary)" />
              <h2 className={styles.stepTitle}>Delivery Speed</h2>
            </div>
            <div className={styles.optionRadioGroup}>
              <div
                className={`${styles.optionCard} ${deliverySpeed === "STANDARD" ? styles.optionCardSelected : ""}`}
                onClick={() => setDeliverySpeed("STANDARD")}
              >
                <CheckCircle2
                  size={20}
                  color={deliverySpeed === "STANDARD" ? "var(--accent-primary)" : "var(--text-tertiary)"}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    <span>Standard Store Dispatch (3 - 5 Days)</span>
                    <span style={{ color: "var(--status-success)" }}>FREE</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Directly packaged and dispatched from our Bidar Flagship Boutique.
                  </p>
                </div>
              </div>

              <div
                className={`${styles.optionCard} ${deliverySpeed === "EXPRESS" ? styles.optionCardSelected : ""}`}
                onClick={() => setDeliverySpeed("EXPRESS")}
              >
                <CheckCircle2
                  size={20}
                  color={deliverySpeed === "EXPRESS" ? "var(--accent-primary)" : "var(--text-tertiary)"}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    <span>Express Priority Courier (1 - 2 Days)</span>
                    <span>₹150</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Expedited courier handling for festive and urgent requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>3</div>
              <CreditCard size={20} color="var(--accent-primary)" />
              <h2 className={styles.stepTitle}>Payment Method</h2>
            </div>
            <div className={styles.optionRadioGroup}>
              <div
                className={`${styles.optionCard} ${paymentMethod === "RAZORPAY" ? styles.optionCardSelected : ""}`}
                onClick={() => setPaymentMethod("RAZORPAY")}
              >
                <CheckCircle2
                  size={20}
                  color={paymentMethod === "RAZORPAY" ? "var(--accent-primary)" : "var(--text-tertiary)"}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    <span>Online Payment (Razorpay)</span>
                    <span style={{ fontSize: "var(--text-2xs)", color: "var(--accent-primary)" }}>Instant & Secure</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Pay via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking.
                  </p>
                </div>
              </div>

              <div
                className={`${styles.optionCard} ${paymentMethod === "COD" ? styles.optionCardSelected : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <CheckCircle2
                  size={20}
                  color={paymentMethod === "COD" ? "var(--accent-primary)" : "var(--text-tertiary)"}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Pay cash upon physical delivery. Available for eligible PIN codes across India.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary Preview */}
        <PerspectiveCard3D maxTiltDeg={4}>
          <div className={styles.checkoutSummary}>
            <h3 className={styles.summaryHeader}>Order Summary</h3>

            {/* Garments Preview */}
            <div className={styles.itemPreviewList}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.itemPreviewRow}>
                  <span className={styles.itemPreviewName}>
                    {item.productName} ({item.variant.size}) × {item.quantity}
                  </span>
                  <span>{formatINR(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Privilege Coupon Input */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-3) 0" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6, marginBottom: "var(--space-2)" }}>
                <Tag size={13} /> Privilege Coupon
              </div>

              {appliedCoupon ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(60, 119, 87, 0.12)", border: "1px solid var(--status-success)", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--status-success)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      {appliedCoupon.code}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {appliedCoupon.message || `Saved ${formatINR(appliedCoupon.discountAmount)}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    style={{ background: "none", border: "none", color: "var(--status-danger)", cursor: "pointer", padding: 4 }}
                    title="Remove coupon"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. BAGODI10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      outline: "none",
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      if (couponInput.trim()) {
                        validateCouponMutation.mutate(couponInput.trim());
                      }
                    }}
                    isLoading={validateCouponMutation.isPending}
                  >
                    Apply
                  </Button>
                </div>
              )}

              {couponError && (
                <div style={{ color: "var(--status-danger)", fontSize: "11px", marginTop: "4px" }}>
                  {couponError}
                </div>
              )}
            </div>

            {/* Authoritative Server Totals */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span>{formatINR(cart.pricing.subtotal)}</span>
              </div>

              {cart.pricing.discountTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--status-success)" }}>
                  <span>Discount</span>
                  <span>-{formatINR(cart.pricing.discountTotal)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--status-success)", fontWeight: 600 }}>
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatINR(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                <span>Delivery ({deliverySpeed === "EXPRESS" ? "Express" : "Standard"})</span>
                <span>
                  {deliverySpeed === "EXPRESS"
                    ? formatINR(150)
                    : cart.pricing.deliveryCharge === 0
                    ? "FREE"
                    : formatINR(cart.pricing.deliveryCharge)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)", marginTop: "var(--space-3)", fontSize: "var(--text-xl)", fontWeight: "bold", color: "var(--text-primary)" }}>
                <span>Total Payable</span>
                <span style={{ color: "var(--accent-primary)" }}>
                  {formatINR(finalCalculatedPayable)}
                </span>
              </div>
              <p style={{ fontSize: "var(--text-2xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)", textAlign: "right" }}>
                All taxes included
              </p>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <Button
                size="lg"
                fullWidth
                onClick={handleProceedOrder}
                isLoading={placeOrderMutation.isPending}
                rightIcon={<ArrowRight size={18} />}
              >
                {paymentMethod === "RAZORPAY" ? "Proceed to Razorpay" : "Confirm & Place Order"}
              </Button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "var(--space-4)", fontSize: "var(--text-2xs)", color: "var(--text-tertiary)" }}>
              <ShieldCheck size={14} color="var(--status-success)" />
              Safe & Encrypted 256-bit Checkout
            </div>
          </div>
        </PerspectiveCard3D>
      </div>
    </div>
  );
};
