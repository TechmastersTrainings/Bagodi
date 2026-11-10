/**
 * Authentication Form Validation Schemas
 * Pure Zod schemas for Customer, Merchant Admin, and Super Admin flows
 */

import { z } from "zod";

/* Helper for Indian mobile number (10 digits starting with 6-9) or valid email */
export const phoneOrEmailValidator = z
  .string()
  .min(1, "Phone number or email is required")
  .refine((val) => {
    const clean = val.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const sanitizedPhone = clean.replace(/[\s\-+]/g, "").slice(-10);
    return emailRegex.test(clean) || phoneRegex.test(sanitizedPhone);
  }, "Enter a valid 10-digit mobile number or email address");

/* Customer Send OTP */
export const sendOtpSchema = z.object({
  phoneOrEmail: phoneOrEmailValidator,
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]).default("SMS"),
});

/* Customer Verify OTP */
export const verifyOtpSchema = z.object({
  referenceId: z.string().min(1, "Reference ID missing"),
  phoneOrEmail: z.string().min(1, "Identifier is required"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain digits only"),
});

/* Customer Password Login */
export const customerPasswordLoginSchema = z.object({
  emailOrPhone: phoneOrEmailValidator,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* Customer Registration */
export const customerRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one digit"),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Bagodi Store terms" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/* Merchant Staff & Store Login */
export const merchantLoginSchema = z.object({
  email: z.string().email("Enter your official staff email address"),
  password: z.string().min(6, "Password is required"),
  storeId: z.string().optional(),
});

/* Super Admin Platform Login */
export const superAdminLoginSchema = z.object({
  email: z.string().email("Enter platform super admin email"),
  password: z.string().min(8, "Master platform password required"),
  securityKey: z.string().optional(),
});

export type SendOtpFormData = z.input<typeof sendOtpSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type CustomerPasswordLoginFormData = z.infer<typeof customerPasswordLoginSchema>;
export type CustomerRegisterFormData = z.infer<typeof customerRegisterSchema>;
export type MerchantLoginFormData = z.infer<typeof merchantLoginSchema>;
export type SuperAdminLoginFormData = z.infer<typeof superAdminLoginSchema>;
