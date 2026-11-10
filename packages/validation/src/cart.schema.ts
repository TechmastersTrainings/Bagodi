/**
 * Cart Item & Coupon Validation Schemas
 */

import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum 10 items per variant"),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum 10 items per variant"),
});

export const applyCouponSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code too long")
    .regex(/^[A-Z0-9_-]+$/i, "Coupon code can only contain alphanumeric characters"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

