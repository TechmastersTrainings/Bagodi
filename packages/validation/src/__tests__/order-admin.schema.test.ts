import { describe, expect, it } from "vitest";
import {
  orderStatusTransitionSchema,
  refundProcessSchema,
  returnInspectionSchema,
} from "../order-admin.schema";

describe("Phase 6: Order Status Transition Validation", () => {
  it("should accept valid standard transition to CONFIRMED or PACKED", () => {
    const result = orderStatusTransitionSchema.safeParse({
      status: "PACKED",
    });
    expect(result.success).toBe(true);
  });

  it("should enforce courier partner and tracking number when marking SHIPPED", () => {
    const invalid = orderStatusTransitionSchema.safeParse({
      status: "SHIPPED",
    });
    expect(invalid.success).toBe(false);

    const valid = orderStatusTransitionSchema.safeParse({
      status: "SHIPPED",
      courierPartner: "BlueDart Express",
      trackingNumber: "BD982348234IN",
    });
    expect(valid.success).toBe(true);
  });

  it("should enforce cancellation reason when marking CANCELLED", () => {
    const invalid = orderStatusTransitionSchema.safeParse({
      status: "CANCELLED",
    });
    expect(invalid.success).toBe(false);

    const valid = orderStatusTransitionSchema.safeParse({
      status: "CANCELLED",
      cancellationReason: "Customer requested cancellation prior to packing",
    });
    expect(valid.success).toBe(true);
  });
});

describe("Phase 6: Refund Processing Validation", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("should accept valid refund payload", () => {
    const result = refundProcessSchema.safeParse({
      orderId: validUuid,
      amount: 4500,
      reason: "Garment size exchange unavailable, issuing source refund",
      refundMethod: "ORIGINAL_SOURCE",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-positive amounts and short reasons", () => {
    const invalidAmount = refundProcessSchema.safeParse({
      orderId: validUuid,
      amount: -100,
      reason: "Invalid",
    });
    expect(invalidAmount.success).toBe(false);

    const shortReason = refundProcessSchema.safeParse({
      orderId: validUuid,
      amount: 500,
      reason: "No",
    });
    expect(shortReason.success).toBe(false);
  });
});

describe("Phase 6: Return Inspection Validation", () => {
  const validReturnId = "123e4567-e89b-12d3-a456-426614174000";
  const validVariantId = "223e4567-e89b-12d3-a456-426614174001";

  it("should accept PASSED condition with APPROVE_REFUND", () => {
    const result = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "PASSED",
      inspectionNotes: "Security tags intact, pristine showroom condition verified",
      resolutionAction: "APPROVE_REFUND",
    });
    expect(result.success).toBe(true);
  });

  it("should require replacementVariantId when DISPATCH_EXCHANGE is selected", () => {
    const missingReplacement = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "PASSED",
      inspectionNotes: "Tags intact, approving exchange to larger size",
      resolutionAction: "DISPATCH_EXCHANGE",
    });
    expect(missingReplacement.success).toBe(false);

    const withReplacement = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "PASSED",
      inspectionNotes: "Tags intact, approving exchange to larger size",
      resolutionAction: "DISPATCH_EXCHANGE",
      replacementVariantId: validVariantId,
    });
    expect(withReplacement.success).toBe(true);
  });

  it("should accept REJECT_RETURN with detailed inspection notes", () => {
    const result = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "FAILED",
      inspectionNotes: "Garment has fragrance odor and security tags were detached",
      resolutionAction: "REJECT_RETURN",
    });
    expect(result.success).toBe(true);
  });
});
