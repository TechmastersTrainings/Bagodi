import { describe, it } from "node:test";
import assert from "node:assert";
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
    assert.strictEqual(result.success, true);
  });

  it("should enforce courier partner and tracking number when marking SHIPPED", () => {
    const invalid = orderStatusTransitionSchema.safeParse({
      status: "SHIPPED",
    });
    assert.strictEqual(invalid.success, false);

    const valid = orderStatusTransitionSchema.safeParse({
      status: "SHIPPED",
      courierPartner: "BlueDart Express",
      trackingNumber: "BD982348234IN",
    });
    assert.strictEqual(valid.success, true);
  });

  it("should enforce cancellation reason when marking CANCELLED", () => {
    const invalid = orderStatusTransitionSchema.safeParse({
      status: "CANCELLED",
    });
    assert.strictEqual(invalid.success, false);

    const valid = orderStatusTransitionSchema.safeParse({
      status: "CANCELLED",
      cancellationReason: "Customer requested cancellation prior to packing",
    });
    assert.strictEqual(valid.success, true);
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
    assert.strictEqual(result.success, true);
  });

  it("should reject non-positive amounts and short reasons", () => {
    const invalidAmount = refundProcessSchema.safeParse({
      orderId: validUuid,
      amount: -100,
      reason: "Invalid",
    });
    assert.strictEqual(invalidAmount.success, false);

    const shortReason = refundProcessSchema.safeParse({
      orderId: validUuid,
      amount: 500,
      reason: "No",
    });
    assert.strictEqual(shortReason.success, false);
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
    assert.strictEqual(result.success, true);
  });

  it("should require replacementVariantId when DISPATCH_EXCHANGE is selected", () => {
    const missingReplacement = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "PASSED",
      inspectionNotes: "Tags intact, approving exchange to larger size",
      resolutionAction: "DISPATCH_EXCHANGE",
    });
    assert.strictEqual(missingReplacement.success, false);

    const withReplacement = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "PASSED",
      inspectionNotes: "Tags intact, approving exchange to larger size",
      resolutionAction: "DISPATCH_EXCHANGE",
      replacementVariantId: validVariantId,
    });
    assert.strictEqual(withReplacement.success, true);
  });

  it("should accept REJECT_RETURN with detailed inspection notes", () => {
    const result = returnInspectionSchema.safeParse({
      returnRequestId: validReturnId,
      conditionStatus: "FAILED",
      inspectionNotes: "Garment has fragrance odor and security tags were detached",
      resolutionAction: "REJECT_RETURN",
    });
    assert.strictEqual(result.success, true);
  });
});
