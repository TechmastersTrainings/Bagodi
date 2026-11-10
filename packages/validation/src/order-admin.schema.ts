/**
 * Merchant Order Administration, Payment & Return Processing Validation Schemas
 */

import { z } from "zod";

export const orderStatusTransitionSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  trackingNumber: z.string().trim().optional(),
  courierPartner: z.string().trim().optional(),
  cancellationReason: z.string().trim().max(300).optional(),
}).refine(
  (data) => {
    if (data.status === "SHIPPED") {
      return !!data.trackingNumber && !!data.courierPartner;
    }
    return true;
  },
  {
    message: "Tracking number and courier partner are required when marking order as SHIPPED",
    path: ["trackingNumber"],
  }
).refine(
  (data) => {
    if (data.status === "CANCELLED") {
      return !!data.cancellationReason && data.cancellationReason.length >= 5;
    }
    return true;
  },
  {
    message: "Please specify a detailed reason for cancellation (min 5 chars)",
    path: ["cancellationReason"],
  }
);

export const refundProcessSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  amount: z.number().positive("Refund amount must be greater than zero"),
  reason: z.string().min(5, "Refund reason is required (min 5 characters)"),
  refundMethod: z.enum(["ORIGINAL_SOURCE", "STORE_CREDIT"]).default("ORIGINAL_SOURCE"),
});

export const returnInspectionSchema = z.object({
  returnRequestId: z.string().uuid("Invalid return request ID"),
  conditionStatus: z.enum(["PASSED", "FAILED"]),
  inspectionNotes: z.string().min(5, "Inspection notes are required"),
  resolutionAction: z.enum(["APPROVE_REFUND", "DISPATCH_EXCHANGE", "REJECT_RETURN"]),
  replacementVariantId: z.string().uuid().optional(),
}).refine(
  (data) => {
    if (data.resolutionAction === "DISPATCH_EXCHANGE") {
      return !!data.replacementVariantId;
    }
    return true;
  },
  {
    message: "A replacement variant must be selected when dispatching an exchange",
    path: ["replacementVariantId"],
  }
);

export type OrderStatusTransitionInput = z.infer<typeof orderStatusTransitionSchema>;
export type RefundProcessInput = z.infer<typeof refundProcessSchema>;
export type ReturnInspectionInput = z.infer<typeof returnInspectionSchema>;

