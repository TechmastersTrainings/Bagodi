/**
 * Authentication Validation Schemas Test Suite
 */

import {
  sendOtpSchema,
  verifyOtpSchema,
  customerPasswordLoginSchema,
  customerRegisterSchema,
  merchantLoginSchema,
  superAdminLoginSchema,
} from "../auth.schema";

describe("Authentication Validation Schemas", () => {
  describe("sendOtpSchema", () => {
    it("should accept valid 10-digit Indian phone number", () => {
      const res = sendOtpSchema.safeParse({ phoneOrEmail: "9876543210", channel: "SMS" });
      expect(res.success).toBe(true);
    });

    it("should accept valid email address", () => {
      const res = sendOtpSchema.safeParse({ phoneOrEmail: "customer@example.com", channel: "EMAIL" });
      expect(res.success).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      const res = sendOtpSchema.safeParse({ phoneOrEmail: "12345", channel: "SMS" });
      expect(res.success).toBe(false);
    });
  });

  describe("verifyOtpSchema", () => {
    it("should accept valid 6-digit OTP", () => {
      const res = verifyOtpSchema.safeParse({
        referenceId: "ref_123",
        phoneOrEmail: "9876543210",
        otp: "123456",
      });
      expect(res.success).toBe(true);
    });

    it("should reject non-numeric or short OTP", () => {
      const res1 = verifyOtpSchema.safeParse({ referenceId: "ref_123", phoneOrEmail: "9876543210", otp: "1234a5" });
      expect(res1.success).toBe(false);

      const res2 = verifyOtpSchema.safeParse({ referenceId: "ref_123", phoneOrEmail: "9876543210", otp: "1234" });
      expect(res2.success).toBe(false);
    });
  });

  describe("customerRegisterSchema", () => {
    it("should reject mismatched password and confirmPassword", () => {
      const res = customerRegisterSchema.safeParse({
        fullName: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
        acceptTerms: true,
      });
      expect(res.success).toBe(false);
    });

    it("should reject when terms are not accepted", () => {
      const res = customerRegisterSchema.safeParse({
        fullName: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: false,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("merchantLoginSchema", () => {
    it("should validate official staff email and password", () => {
      const res = merchantLoginSchema.safeParse({
        email: "manager@bagodi.in",
        password: "SecurePassword123",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("superAdminLoginSchema", () => {
    it("should validate super admin credentials", () => {
      const res = superAdminLoginSchema.safeParse({
        email: "root@techmasters.in",
        password: "PlatformMasterPassword123",
      });
      expect(res.success).toBe(true);
    });
  });
});

