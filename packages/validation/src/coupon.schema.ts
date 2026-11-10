/**
 * Promotional Coupons & Discount Validation Schemas
 */

import { z } from "zod";

export const couponCreateSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code cannot exceed 20 characters")
      .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores")
      .trim(),
    description: z.string().max(200).optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number().positive("Discount value must be greater than zero"),
    maxDiscountAmount: z.number().positive().optional(),
    minimumOrderValue: z.number().min(0, "Minimum order value cannot be negative").default(0),
    usageLimitTotal: z.number().int().positive().optional(),
    usageLimitPerCustomer: z.number().int().positive().default(1),
    validFrom: z.string().min(1, "Start validity date is required"),
    validUntil: z.string().min(1, "End validity date is required"),
    applicableCategoryIds: z.array(z.string()).optional(),
    applicableBrandIds: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENTAGE" && data.discountValue > 90) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 90%",
      path: ["discountValue"],
    }
  );

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Please enter a coupon code").trim(),
  cartTotal: z.number().positive("Cart total must be positive"),
});

export type CouponCreateFormData = z.input<typeof couponCreateSchema>;
export type ValidateCouponFormData = z.input<typeof validateCouponSchema>;

