import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultApiClient } from "@bagodi/api-client";
import { Address, CartResponse, CreateOrderResponse, CreateOrderPayload, ValidateCouponResponse } from "@bagodi/shared-types";
import { addressSchema, AddressFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard, SkeletonLine } from "@bagodi/shared-components";
import { MapPin, Truck, CreditCard, Plus, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Tag, X, Sparkles, Smartphone, Lock } from "lucide-react";
import { formatINR } from "@bagodi/utilities";
import styles from "./CheckoutPage.module.css";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // Selected State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [deliverySpeed, setDeliverySpeed] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Promotional Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) =>
      defaultApiClient.post<ValidateCouponResponse>("/promotions/validate-coupon", {
        code,
        cartTotal: (cart as any)?.pricing?.subtotal ?? (cart as any)?.subtotal ?? 0,
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
      defaultApiClient.post<Address>("/customer/addresses", {
        ...data,
        full_name: data.fullName,
        phone: data.phoneNumber,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        postal_code: data.postalCode,
        is_default: data.isDefault,
      }),
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

  // Authoritative Order Placement Mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      return await defaultApiClient.post<CreateOrderResponse>("/orders", payload);
    },
    onSuccess: (res) => {
      // Seamless direct navigation to Order Success screen
      navigate(`/order-success/${res.order.id}`);
    },
    onError: (err: any) => {
      setCheckoutError(err.message || "Failed to place order. Please review your details and retry.");
    },
  });

  // Handle Order Submission
  const handleProceedOrder = async () => {
    setCheckoutError(null);

    // 1. If an address is selected, proceed directly
    if (selectedAddressId) {
      const payload: CreateOrderPayload = {
        shippingAddressId: selectedAddressId,
        paymentMethod: paymentMethod as any,
        deliverySpeed,
        couponCode: appliedCoupon?.code,
      };
      placeOrderMutation.mutate(payload);
      return;
    }

    // 2. If saved addresses exist but none is selected, prompt selection
    if (savedAddresses.length > 0 && !isAddingNewAddress) {
      setCheckoutError("Please select a delivery address to proceed.");
      return;
    }

    // 3. If adding a new address or no saved address exists, validate & submit address form
    await handleSubmit(async (formData: AddressFormData) => {
      try {
        const saved = await addAddressMutation.mutateAsync({
          ...formData,
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
          postal_code: formData.postalCode,
          is_default: formData.isDefault,
        } as any);

        setSelectedAddressId(saved.id);

        const payload: CreateOrderPayload = {
          shippingAddressId: saved.id,
          newShippingAddress: formData,
          paymentMethod: paymentMethod as any,
          deliverySpeed,
          couponCode: appliedCoupon?.code,
        };

        placeOrderMutation.mutate(payload);
      } catch (err: any) {
        setCheckoutError(err.message || "Please complete all required delivery address fields.");
      }
    })();
  };

  // Set default address when loaded, or open address form if no address exists
  React.useEffect(() => {
    if (!isAddressesLoading) {
      if (savedAddresses.length > 0) {
        if (!selectedAddressId) {
          const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } else {
        setIsAddingNewAddress(true);
      }
    }
  }, [savedAddresses, selectedAddressId, isAddressesLoading]);

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
  const baseSubtotal = Number((cart as any)?.pricing?.subtotal ?? (cart as any)?.subtotal ?? 0);
  const baseDiscount = Number((cart as any)?.pricing?.discountTotal ?? (cart as any)?.discount_amount ?? 0);
  const baseDelivery = Number((cart as any)?.pricing?.deliveryCharge ?? 0);
  const baseFinal = Number((cart as any)?.pricing?.finalTotal ?? (cart as any)?.total_amount ?? (baseSubtotal - baseDiscount + baseDelivery));
  const finalCalculatedPayable = Math.max(
    0,
    baseFinal + expressDeliveryAddOn - couponDiscountAmount
  );

  return (
    <div className={styles.checkoutContainer}>
      <header className={styles.checkoutHeader}>
        <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>
          <ArrowLeft size={14} /> Return to Shopping Bag
        </Link>
        <div className={styles.atelierBadge}>
          <Sparkles size={12} color="#D4AF37" />
          <span>Bagodi Flagship Atelier Checkout</span>
        </div>
        <h1 className={styles.checkoutTitle}>Checkout & Order Review</h1>
        <p className={styles.checkoutSubtitle}>Review your shipping address, delivery speed, and payment method for Bidar Flagship dispatch.</p>
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
                  const displayName = addr.fullName || (addr as any).full_name || "Valued Customer";
                  const displayPhone = addr.phone || addr.phoneNumber || (addr as any).phone_number || "";
                  const displayLine1 = addr.addressLine1 || (addr as any).address_line1 || "";
                  const displayLine2 = addr.addressLine2 || (addr as any).address_line2 || "";
                  const displayPin = addr.pincode || addr.postalCode || (addr as any).postal_code || "";

                  return (
                    <div
                      key={addr.id}
                      className={`${styles.addressCard} ${isSelected ? styles.addressCardSelected : ""}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className={styles.addressHeader}>
                        <span className={styles.recipientName}>{displayName}</span>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>
                      <div className={styles.addressBody}>
                        {displayLine1}
                        {displayLine2 && `, ${displayLine2}`}
                        {addr.landmark && `, near ${addr.landmark}`}
                        <br />
                        {addr.city}, {addr.state} - <strong>{displayPin}</strong>
                      </div>
                      <div className={styles.addressPhone}>Phone: {displayPhone}</div>
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
                onSubmit={handleSubmit(async (data) => {
                  try {
                    const saved = await addAddressMutation.mutateAsync({
                      ...data,
                      full_name: data.fullName,
                      phone: data.phoneNumber,
                      address_line1: data.addressLine1,
                      address_line2: data.addressLine2,
                      postal_code: data.postalCode,
                      is_default: data.isDefault,
                    } as any);
                    setSelectedAddressId(saved.id);
                    setIsAddingNewAddress(false);
                  } catch (err: any) {
                    setCheckoutError(err.message || "Failed to save address");
                  }
                })}
                className={styles.addressFormContainer}
              >
                <div className={styles.formHeaderRow}>
                  <h3 className={styles.formTitle}>
                    {savedAddresses.length === 0 ? "Enter Delivery Address" : "Add New Delivery Address"}
                  </h3>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className={styles.formCancelBtn}
                      onClick={() => setIsAddingNewAddress(false)}
                    >
                      <X size={15} /> Cancel
                    </button>
                  )}
                </div>

                <div className={styles.formRow2}>
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

                <div className={styles.formRow1}>
                  <TextInput
                    label="Street, House No, Flat, Locality"
                    placeholder="Shop #4, Near Shivaji Chowk"
                    {...register("addressLine1")}
                    error={errors.addressLine1?.message}
                    isRequired
                  />
                </div>

                <div className={styles.formRow3}>
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

                <div className={styles.formActions}>
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
              {/* Option 1: Instant UPI & Online Payment */}
              <div
                className={`${styles.optionCard} ${paymentMethod === "UPI" ? styles.optionCardSelected : ""}`}
                onClick={() => setPaymentMethod("UPI")}
              >
                <CheckCircle2
                  size={20}
                  color={paymentMethod === "UPI" ? "var(--accent-primary)" : "var(--text-tertiary)"}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Smartphone size={16} color="var(--accent-primary)" />
                      Instant UPI & Online Payment
                    </span>
                    <span className={styles.fastBadge}>Fast & Verified</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Pay instantly with Google Pay, PhonePe, Paytm, BHIM UPI, or NetBanking.
                  </p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
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
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Truck size={16} color="var(--accent-primary)" />
                      Cash on Delivery (COD)
                    </span>
                    <span className={styles.zeroAdvanceBadge}>Zero Advance</span>
                  </div>
                  <p className={styles.optionDescription}>
                    Pay cash or UPI upon physical doorstep delivery. Available for eligible PIN codes across India.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary Preview - 100% Rock Solid Flat Container */}
        <div className={styles.checkoutSummary}>
          <div className={styles.summaryHeader}>
            <span>Order Summary</span>
            <span className={styles.itemCountBadge}>
              {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

            {/* Garments Preview */}
            <div className={styles.itemPreviewList}>
              {cart.items.map((item: any) => {
                const size = item.variant?.size || item.variantName || item.variant_name || "Standard";
                const productName = item.productName || item.product_name || "Luxury Garment";
                const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
                const totalPrice = item.totalPrice ?? item.total_price ?? (unitPrice * item.quantity);

                return (
                  <div key={item.id} className={styles.itemPreviewRow}>
                    <span className={styles.itemPreviewName}>
                      {productName} ({size}) × {item.quantity}
                    </span>
                    <span>{formatINR(totalPrice)}</span>
                  </div>
                );
              })}
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
                <span>{formatINR(baseSubtotal)}</span>
              </div>

              {baseDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--status-success)" }}>
                  <span>Discount</span>
                  <span>-{formatINR(baseDiscount)}</span>
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
                    : baseDelivery === 0
                    ? "FREE"
                    : formatINR(baseDelivery)}
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

            {/* Main Action Button - Position Stable & High Precision Click */}
            <div style={{ marginTop: "var(--space-6)" }}>
              <button
                type="button"
                className={styles.proceedBtn}
                onClick={handleProceedOrder}
                disabled={placeOrderMutation.isPending}
              >
                <Lock size={16} />
                <span>
                  {paymentMethod === "UPI" ? "Proceed to Pay" : "Confirm & Place Order"} • {formatINR(finalCalculatedPayable)}
                </span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Reassurance Badges */}
            <div className={styles.securityTrustRow}>
              <div className={styles.trustItem}>
                <ShieldCheck size={14} color="var(--status-success)" />
                <span>100% Authentic Handloom • Silk Mark Certified</span>
              </div>
              <div className={styles.trustItem}>
                <Truck size={14} color="#d4af37" />
                <span>Direct Insured Dispatch from Bidar Flagship Boutique</span>
              </div>
              <div className={styles.trustItem}>
                <Sparkles size={14} color="#e31b23" />
                <span>Easy 7-Day In-Store & Courier Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
