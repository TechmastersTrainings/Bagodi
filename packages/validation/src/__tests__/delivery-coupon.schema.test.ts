import { describe, expect, it } from "vitest";
import {
  createShipmentSchema,
  updateShipmentStatusSchema,
} from "../delivery.schema";
import {
  couponCreateSchema,
  validateCouponSchema,
} from "../coupon.schema";

describe("Phase 7: Delivery Logistics Validation Schemas", () => {
  const validOrderId = "123e4567-e89b-12d3-a456-426614174000";

  it("should accept valid courier shipment payload", () => {
    const valid = createShipmentSchema.safeParse({
      orderId: validOrderId,
      courierPartnerId: "cp_bluedart",
      trackingNumber: "BD84729103IN",
      weightGrams: 850,
      lengthCm: 35,
      widthCm: 25,
      heightCm: 10,
      specialInstructions: "Handover to driver with sealed Bagodi security tape",
    });
    expect(valid.success).toBe(true);
  });

  it("should reject non-positive weight or short tracking number", () => {
    const invalid = createShipmentSchema.safeParse({
      orderId: validOrderId,
      courierPartnerId: "cp_bluedart",
      trackingNumber: "BD", // too short
      weightGrams: 0, // non-positive
    });
    expect(invalid.success).toBe(false);
  });

  it("should validate shipment status checkpoint update", () => {
    const valid = updateShipmentStatusSchema.safeParse({
      status: "IN_TRANSIT",
      location: "Bidar Sorting Hub",
      activityDescription: "Package processed and bagged for outbound transit",
    });
    expect(valid.success).toBe(true);

    const invalid = updateShipmentStatusSchema.safeParse({
      status: "INVALID_STATUS" as any,
      location: "B",
      activityDescription: "No",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("Phase 7: Promotional Coupon Validation Schemas", () => {
  it("should accept valid percentage coupon under 90%", () => {
    const valid = couponCreateSchema.safeParse({
      code: "FESTIVE2026",
      description: "15% discount on all festive sarees and bridal wear",
      discountType: "PERCENTAGE",
      discountValue: 15,
      maxDiscountAmount: 2000,
      minimumOrderValue: 4999,
      validFrom: "2026-11-01",
      validUntil: "2026-11-30",
      isActive: true,
    });
    expect(valid.success).toBe(true);
  });

  it("should reject percentage discount exceeding 90%", () => {
    const invalid = couponCreateSchema.safeParse({
      code: "TOOGOOD",
      discountType: "PERCENTAGE",
      discountValue: 95, // Exceeds 90%
      minimumOrderValue: 1000,
      validFrom: "2026-11-01",
      validUntil: "2026-11-30",
    });
    expect(invalid.success).toBe(false);
  });

  it("should accept flat fixed amount coupon", () => {
    const valid = couponCreateSchema.safeParse({
      code: "RAYMOND500",
      description: "Flat ₹500 off on Raymond bespoke suiting fabrics",
      discountType: "FIXED_AMOUNT",
      discountValue: 500,
      minimumOrderValue: 3500,
      validFrom: "2026-11-01",
      validUntil: "2026-12-31",
    });
    expect(valid.success).toBe(true);
  });

  it("should validate coupon application payload", () => {
    const valid = validateCouponSchema.safeParse({
      code: "BAGODI10",
      cartTotal: 5999,
    });
    expect(valid.success).toBe(true);

    const invalid = validateCouponSchema.safeParse({
      code: "",
      cartTotal: -100,
    });
    expect(invalid.success).toBe(false);
  });
});

