import { describe, it, expect } from "vitest";
import {
  addToCartSchema,
  updateCartItemQuantitySchema,
  applyCouponSchema,
  addressSchema,
  checkoutOrderSchema,
} from "../index";

describe("Cart and Checkout Schema Suite", () => {
  describe("addToCartSchema", () => {
    it("accepts valid UUID variant and quantity", () => {
      const valid = {
        variantId: "123e4567-e89b-12d3-a456-426614174000",
        quantity: 2,
      };
      const result = addToCartSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID variant", () => {
      const invalid = {
        variantId: "not-a-uuid",
        quantity: 1,
      };
      const result = addToCartSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects non-positive quantity", () => {
      const invalid = {
        variantId: "123e4567-e89b-12d3-a456-426614174000",
        quantity: 0,
      };
      const result = addToCartSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("applyCouponSchema", () => {
    it("accepts valid uppercase coupon codes", () => {
      expect(applyCouponSchema.safeParse({ couponCode: "BAGODI10" }).success).toBe(true);
      expect(applyCouponSchema.safeParse({ couponCode: "FESTIVE_2026" }).success).toBe(true);
    });

    it("rejects short or invalid coupon codes", () => {
      expect(applyCouponSchema.safeParse({ couponCode: "AB" }).success).toBe(false);
      expect(applyCouponSchema.safeParse({ couponCode: "INVALID CODE!" }).success).toBe(false);
    });
  });

  describe("addressSchema", () => {
    it("validates valid Indian address with 6-digit PIN and 10-digit phone", () => {
      const valid = {
        fullName: "Shivkumar Patil",
        phoneNumber: "9876543210",
        addressLine1: "Shop #12, Shivaji Chowk, Main Market",
        city: "Bidar",
        state: "Karnataka",
        postalCode: "585401",
        country: "India",
        isDefault: true,
      };
      const result = addressSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid 5-digit PIN code", () => {
      const invalid = {
        fullName: "Shivkumar Patil",
        phoneNumber: "9876543210",
        addressLine1: "Main Road",
        city: "Bidar",
        state: "Karnataka",
        postalCode: "58540", // 5 digits
      };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects phone numbers with invalid prefix", () => {
      const invalid = {
        fullName: "Shivkumar Patil",
        phoneNumber: "1234567890", // doesn't start with 6-9
        addressLine1: "Main Road",
        city: "Bidar",
        state: "Karnataka",
        postalCode: "585401",
      };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("checkoutOrderSchema", () => {
    it("validates complete order with saved address ID and payment method", () => {
      const valid = {
        shippingAddressId: "123e4567-e89b-12d3-a456-426614174000",
        deliverySpeed: "STANDARD",
        paymentMethod: "RAZORPAY",
      };
      const result = checkoutOrderSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("requires either saved address ID or new address details", () => {
      const invalid = {
        deliverySpeed: "STANDARD",
        paymentMethod: "COD",
      };
      const result = checkoutOrderSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

