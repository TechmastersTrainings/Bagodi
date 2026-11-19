/**
 * TechMasters Platform Governance Validation Schemas
 */

import { z } from "zod";

export const merchantOnboardSchema = z.object({
  name: z.string().min(2, "Merchant display name is required"),
  slug: z
    .string()
    .min(3, "Slug is required (e.g. bagodi-bidar)")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  legalEntityName: z.string().min(3, "Registered legal entity name is required"),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid Indian GSTIN format")
    .optional()
    .or(z.literal("")),
  contactEmail: z.string().email("Valid corporate contact email is required"),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  domain: z.string().optional(),
  plan: z.enum(["ENTERPRISE", "GROWTH", "BOUTIQUE"]).default("ENTERPRISE"),
  primaryStore: z.object({
    name: z.string().min(2, "Store name is required (e.g. Bidar Flagship)"),
    code: z.string().min(2, "Store code is required (e.g. BIDAR-01)"),
    addressLine1: z.string().min(5, "Store street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  }),
  adminUser: z.object({
    fullName: z.string().min(2, "Admin full name is required"),
    email: z.string().email("Admin email is required"),
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Admin 10-digit mobile is required"),
    password: z.string().min(8, "Temporary password must be at least 8 characters").optional(),
  }),
});

export const platformUserCreateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid TechMasters corporate email is required"),
  role: z.enum(["SUPER_ADMIN", "SECURITY_AUDITOR", "PLATFORM_OPERATIONS"]),
  tempPassword: z.string().min(8, "Initial password must be at least 8 characters").optional(),
});

export const systemConfigSchema = z.object({
  maintenanceMode: z.boolean(),
  allowedOriginUrls: z.string(),
  sessionTimeoutMinutes: z.number().int().min(5).max(1440),
  webhookSecret: z.string().min(16),
  maxUploadSizeMb: z.number().int().positive(),
});

export type MerchantOnboardFormData = z.input<typeof merchantOnboardSchema>;
export type PlatformUserCreateFormData = z.input<typeof platformUserCreateSchema>;
export type SystemConfigFormData = z.input<typeof systemConfigSchema>;

