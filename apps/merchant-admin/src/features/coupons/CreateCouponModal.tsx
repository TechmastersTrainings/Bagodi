import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Coupon, CreateCouponPayload, DiscountType } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { Tag, AlertTriangle } from "lucide-react";

export interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(1500);
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(2999);
  const [usageLimitTotal, setUsageLimitTotal] = useState<number>(500);
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState<number>(1);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const couponMutation = useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      defaultApiClient.post<Coupon>("/promotions/coupons", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to create promotional coupon."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3) {
      setFormError("Coupon code must be at least 3 characters.");
      return;
    }

    if (discountValue <= 0) {
      setFormError("Discount value must be greater than zero.");
      return;
    }

    if (discountType === "PERCENTAGE" && discountValue > 90) {
      setFormError("Percentage discount cannot exceed 90%.");
      return;
    }

    const payload: CreateCouponPayload = {
      code: cleanCode,
      description: description.trim() || undefined,
      discountType,
      discountValue,
      maxDiscountAmount: discountType === "PERCENTAGE" ? maxDiscountAmount : undefined,
      minimumOrderValue,
      usageLimitTotal: usageLimitTotal || undefined,
      usageLimitPerCustomer,
      validFrom,
      validUntil,
      isActive,
    };

    couponMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Luxury Promotion & Coupon" maxWidth="640px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Code & Description */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Promo Code *
            </label>
            <input
              type="text"
              placeholder="e.g. FESTIVE2026, RAYMOND15"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                color: "var(--color-champagne-gold)",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Discount Type *
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
            >
              <option value="PERCENTAGE">Percentage Discount (%)</option>
              <option value="FIXED_AMOUNT">Flat Amount (INR ₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Campaign Headline / Description
          </label>
          <input
            type="text"
            placeholder="e.g. 10% privilege discount on pure silk sarees & festive wear"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              background: "#121413",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Discount Value, Cap, and MOV */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              {discountType === "PERCENTAGE" ? "Discount (%) *" : "Flat Value (₹) *"}
            </label>
            <input
              type="number"
              min="1"
              max={discountType === "PERCENTAGE" ? 90 : 50000}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Max Cap (₹)
            </label>
            <input
              type="number"
              min="0"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(parseFloat(e.target.value) || 0)}
              disabled={discountType === "FIXED_AMOUNT"}
              style={{
                width: "100%",
                background: discountType === "FIXED_AMOUNT" ? "#1a1a1a" : "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: discountType === "FIXED_AMOUNT" ? "#666" : "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Min Order Value (₹)
            </label>
            <input
              type="number"
              min="0"
              value={minimumOrderValue}
              onChange={(e) => setMinimumOrderValue(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Validity Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Valid From *
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Valid Until *
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
              required
            />
          </div>
        </div>

        {/* Usage Limits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Total Budget / Redemptions
            </label>
            <input
              type="number"
              min="1"
              value={usageLimitTotal}
              onChange={(e) => setUsageLimitTotal(parseInt(e.target.value) || 0)}
              placeholder="Unlimited"
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Per Customer Limit
            </label>
            <input
              type="number"
              min="1"
              value={usageLimitPerCustomer}
              onChange={(e) => setUsageLimitPerCustomer(parseInt(e.target.value) || 1)}
              style={{
                width: "100%",
                background: "#121413",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                color: "#FFFFFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Active Toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#FFFFFF", fontSize: "13px", marginTop: "4px" }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ accentColor: "var(--color-champagne-gold)", width: 16, height: 16 }}
          />
          <span>Publish immediately & make coupon active for checkout</span>
        </label>

        {/* Error Notification */}
        {formError && (
          <div style={{ color: "#FF8F8F", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {formError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={couponMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={couponMutation.isPending} leftIcon={<Tag size={14} />}>
            Create Promotional Coupon
          </Button>
        </div>
      </form>
    </Modal>
  );
};
