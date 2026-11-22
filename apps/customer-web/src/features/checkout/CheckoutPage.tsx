import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultApiClient } from "@bagodi/api-client";
import { Address, CartResponse, CreateOrderResponse, CreateOrderPayload, ValidateCouponResponse } from "@bagodi/shared-types";
import { addressSchema, AddressFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard, SkeletonLine } from "@bagodi/shared-components";
import { useAuth } from "@bagodi/authentication";
import {
  MapPin,
  Truck,
  CreditCard,
  Plus,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Tag,
  X,
  Sparkles,
  Lock,
  RotateCcw,
} from "lucide-react";
import { formatINR } from "@bagodi/utilities";
import styles from "./CheckoutPage.module.css";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    setValue,
    formState: { errors, isSubmitting },
    reset: resetAddressForm,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.fullName || (user as any)?.display_name || "",
      phoneNumber: (user?.phone || (user as any)?.phone_e164 || "").replace(/^\+91/, ""),
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

  // Pre-fill contact details from authenticated user session
  useEffect(() => {
    if (user) {
      const name = user.fullName || (user as any)?.display_name || "";
      const rawPhone = user.phone || (user as any)?.phone_e164 || "";
      const phone = rawPhone.replace(/^\+91/, "").trim();
      if (name) setValue("fullName", name);
      if (phone) setValue("phoneNumber", phone);
    }
  }, [user, setValue]);

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
      navigate(`/order-success/${res.order.id}`);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to place order. Please review your details and retry.";
      setCheckoutError(msg);
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
  useEffect(() => {
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
        <SkeletonLine height="32px" width="220px" />
        <div style={{ marginTop: "16px" }}>
          <SkeletonLine height="200px" width="100%" />
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
      {/* Compact Streamlined Atelier Header */}
      <header className={styles.checkoutHeader}>
        <div className={styles.headerTopRow}>
          <Link to="/cart" className={styles.backLink}>
            <ArrowLeft size={13} />
            <span>Return to Bag</span>
          </Link>
          <div className={styles.atelierBadge}>
            <Sparkles size={11} color="#C5A15B" />
            <span>Bagodi Flagship Checkout</span>
          </div>
        </div>

        <div className={styles.headerMainRow}>
          <div>
            <h1 className={styles.checkoutTitle}>Checkout & Order Review</h1>
            <p className={styles.checkoutSubtitle}>
              Confirm delivery address, speed, and payment method for Flagship dispatch.
            </p>
          </div>

          {user && (
            <div className={styles.userBadgeCompact}>
              <CheckCircle2 size={13} className={styles.userBadgeCheck} />
              <span className={styles.userBadgeDetails}>
                {user.fullName || (user as any)?.display_name || "Client"} • {user.phone || (user as any)?.phone_e164 || user.email || ""}
              </span>
              <span className={styles.userBadgeStatus}>Logged In</span>
            </div>
          )}
        </div>
      </header>

      {checkoutError && (
        <div style={{ marginBottom: "14px" }}>
          <ApiErrorCard
            title="Order Processing Notice"
            message={checkoutError}
            actionText="Retry Order"
            onRetry={() => {
              setCheckoutError(null);
              handleProceedOrder();
            }}
          />
        </div>
      )}

      {/* 2-Column High-Density Luxury Checkout Grid */}
      <div className={styles.checkoutGrid}>
        {/* Left Column: Compact Steps */}
        <div className={styles.stepsColumn}>
          {/* Step 1: Delivery Address */}
          <section className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHeaderTitleGroup}>
                <span className={styles.stepNumber}>1</span>
                <MapPin size={16} className={styles.stepIcon} />
                <h2 className={styles.stepTitle}>Delivery Address</h2>
              </div>
              {!isAddingNewAddress && (
                <button
                  type="button"
                  className={styles.addAddressHeaderBtn}
                  onClick={() => setIsAddingNewAddress(true)}
                >
                  <Plus size={13} />
                  <span className={styles.addBtnTextDesktop}>Add New Address</span>
                  <span className={styles.addBtnTextMobile}>Add Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses Compact Grid */}
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
                      <div className={styles.addressCardRadioRow}>
                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ""}`}>
                          {isSelected && <div className={styles.radioDot} />}
                        </div>
                        <div className={styles.addressCardHeader}>
                          <span className={styles.recipientName}>{displayName}</span>
                          {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                        </div>
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

            {/* Inline New Address Form */}
            {isAddingNewAddress && (
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
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>

                <div className={styles.formGrid2}>
                  <TextInput
                    label="Full Name"
                    placeholder="e.g. Sachin Anil"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                    isRequired
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="10-digit mobile"
                    {...register("phoneNumber")}
                    error={errors.phoneNumber?.message}
                    isRequired
                  />
                </div>

                <div className={styles.formGrid1}>
                  <TextInput
                    label="Street Address / House / Flat"
                    placeholder="House / Flat / Street Name"
                    {...register("addressLine1")}
                    error={errors.addressLine1?.message}
                    isRequired
                  />
                </div>

                <div className={styles.formGrid3}>
                  <TextInput
                    label="City"
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
                    label="PIN Code"
                    placeholder="585401"
                    {...register("postalCode")}
                    error={errors.postalCode?.message}
                    isRequired
                  />
                </div>

                <div className={styles.formActions}>
                  <Button type="submit" size="sm" isLoading={isSubmitting || addAddressMutation.isPending}>
                    Save & Deliver Here
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
              <div className={styles.stepHeaderTitleGroup}>
                <span className={styles.stepNumber}>2</span>
                <Truck size={16} className={styles.stepIcon} />
                <h2 className={styles.stepTitle}>Delivery Speed</h2>
              </div>
            </div>

            <div className={styles.twoColOptionsGrid}>
              <div
                className={`${styles.compactOptionCard} ${deliverySpeed === "STANDARD" ? styles.optionCardSelected : ""}`}
                onClick={() => setDeliverySpeed("STANDARD")}
              >
                <div className={`${styles.radioCircle} ${deliverySpeed === "STANDARD" ? styles.radioCircleSelected : ""}`}>
                  {deliverySpeed === "STANDARD" && <div className={styles.radioDot} />}
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTopRow}>
                    <span className={styles.optionName}>Standard Dispatch (3-5 Days)</span>
                    <span className={styles.freeBadge}>FREE</span>
                  </div>
                  <span className={styles.optionNote}>Bidar Flagship boutique insured packaging</span>
                </div>
              </div>

              <div
                className={`${styles.compactOptionCard} ${deliverySpeed === "EXPRESS" ? styles.optionCardSelected : ""}`}
                onClick={() => setDeliverySpeed("EXPRESS")}
              >
                <div className={`${styles.radioCircle} ${deliverySpeed === "EXPRESS" ? styles.radioCircleSelected : ""}`}>
                  {deliverySpeed === "EXPRESS" && <div className={styles.radioDot} />}
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTopRow}>
                    <span className={styles.optionName}>Express Priority (1-2 Days)</span>
                    <span className={styles.priceAddonBadge}>+₹150</span>
                  </div>
                  <span className={styles.optionNote}>Priority air-courier handling</span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHeaderTitleGroup}>
                <span className={styles.stepNumber}>3</span>
                <CreditCard size={16} className={styles.stepIcon} />
                <h2 className={styles.stepTitle}>Payment Method</h2>
              </div>
            </div>

            <div className={styles.twoColOptionsGrid}>
              {/* Option 1: UPI & Online */}
              <div
                className={`${styles.compactOptionCard} ${paymentMethod === "UPI" ? styles.optionCardSelected : ""}`}
                onClick={() => setPaymentMethod("UPI")}
              >
                <div className={`${styles.radioCircle} ${paymentMethod === "UPI" ? styles.radioCircleSelected : ""}`}>
                  {paymentMethod === "UPI" && <div className={styles.radioDot} />}
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTopRow}>
                    <span className={styles.optionName}>Instant UPI & Cards</span>
                    <span className={styles.fastBadge}>Fast & Verified</span>
                  </div>
                  <span className={styles.optionNote}>GPay, PhonePe, Paytm, BHIM, Cards</span>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                className={`${styles.compactOptionCard} ${paymentMethod === "COD" ? styles.optionCardSelected : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <div className={`${styles.radioCircle} ${paymentMethod === "COD" ? styles.radioCircleSelected : ""}`}>
                  {paymentMethod === "COD" && <div className={styles.radioDot} />}
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTopRow}>
                    <span className={styles.optionName}>Cash on Delivery (COD)</span>
                    <span className={styles.zeroAdvanceBadge}>Zero Advance</span>
                  </div>
                  <span className={styles.optionNote}>Pay at doorstep upon delivery</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Compact Luxury Order Summary */}
        <div className={styles.summaryColumn}>
          <div className={styles.checkoutSummary}>
            <div className={styles.summaryHeader}>
              <span className={styles.summaryTitle}>Order Summary</span>
              <span className={styles.itemCountBadge}>
                {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Garments Preview List */}
            <div className={styles.itemPreviewList}>
              {cart.items.map((item: any) => {
                const size = item.variant?.size || item.variantName || item.variant_name || "Standard";
                const productName = item.productName || item.product_name || "Luxury Garment";
                const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
                const totalPrice = item.totalPrice ?? item.total_price ?? (unitPrice * item.quantity);

                return (
                  <div key={item.id} className={styles.itemPreviewRow}>
                    <div className={styles.itemPreviewInfo}>
                      <span className={styles.itemPreviewName}>{productName}</span>
                      <span className={styles.itemPreviewMeta}>Size: {size} • Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPreviewPrice}>{formatINR(totalPrice)}</span>
                  </div>
                );
              })}
            </div>

            {/* Privilege Coupon */}
            <div className={styles.couponSection}>
              <div className={styles.couponHeading}>
                <Tag size={12} />
                <span>Privilege Coupon</span>
              </div>

              {appliedCoupon ? (
                <div className={styles.couponAppliedCard}>
                  <div>
                    <span className={styles.appliedCode}>{appliedCoupon.code}</span>
                    <span className={styles.appliedMsg}>
                      {appliedCoupon.message || `Saved ${formatINR(appliedCoupon.discountAmount)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className={styles.removeCouponBtn}
                    title="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className={styles.couponInputGroup}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className={styles.couponInputField}
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
                    className={styles.applyCouponBtn}
                  >
                    Apply
                  </Button>
                </div>
              )}

              {couponError && (
                <div className={styles.couponErrorText}>
                  {couponError}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className={styles.priceBreakdownSection}>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>{formatINR(baseSubtotal)}</span>
              </div>

              {baseDiscount > 0 && (
                <div className={`${styles.priceRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>-{formatINR(baseDiscount)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className={`${styles.priceRow} ${styles.discountRow}`}>
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatINR(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div className={styles.priceRow}>
                <span>Delivery ({deliverySpeed === "EXPRESS" ? "Express" : "Standard"})</span>
                <span>
                  {deliverySpeed === "EXPRESS"
                    ? formatINR(150)
                    : baseDelivery === 0
                    ? "FREE"
                    : formatINR(baseDelivery)}
                </span>
              </div>

              <div className={styles.totalPayableRow}>
                <div>
                  <span className={styles.totalPayableLabel}>Total Payable</span>
                  <span className={styles.taxSubtext}>All taxes included</span>
                </div>
                <span className={styles.totalPayableAmount}>
                  {formatINR(finalCalculatedPayable)}
                </span>
              </div>
            </div>

            {/* Proceed CTA Button */}
            <div className={styles.ctaButtonWrapper}>
              <button
                type="button"
                className={styles.proceedBtn}
                onClick={handleProceedOrder}
                disabled={placeOrderMutation.isPending}
              >
                <Lock size={15} />
                <span>
                  {paymentMethod === "UPI" ? "Proceed to Pay" : "Confirm & Place Order"} • {formatINR(finalCalculatedPayable)}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Compact Trust Assurance Strip */}
            <div className={styles.securityTrustRow}>
              <div className={styles.trustItem}>
                <ShieldCheck size={13} color="#16a34a" />
                <span>Silk Mark Certified Handpicked Luxury</span>
              </div>
              <div className={styles.trustItem}>
                <Truck size={13} color="#C5A15B" />
                <span>Insured Bidar Flagship Dispatch</span>
              </div>
              <div className={styles.trustItem}>
                <RotateCcw size={13} color="#E31B23" />
                <span>7-Day Easy Exchange Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
