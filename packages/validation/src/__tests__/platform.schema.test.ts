import { describe, expect, it } from "vitest";
import {
  merchantOnboardSchema,
  platformUserCreateSchema,
  systemConfigSchema,
} from "../platform.schema";

describe("Phase 8: Platform Governance Validation Schemas", () => {
  it("should accept valid merchant tenant onboarding payload", () => {
    const valid = merchantOnboardSchema.safeParse({
      name: "Bagodi Shopping Mall",
      slug: "bagodi-bidar",
      legalEntityName: "TechMasters Innovations Private Limited",
      gstin: "29AABCB1234F1Z5",
      contactEmail: "legal@bagodi.in",
      contactPhone: "9876543210",
      plan: "ENTERPRISE",
      primaryStore: {
        name: "Bidar Flagship Showroom",
        code: "BIDAR-01",
        addressLine1: "Near Shivaji Chowk, Commercial Hub",
        city: "Bidar",
        state: "Karnataka",
        pincode: "585401",
      },
      adminUser: {
        fullName: "Store Director",
        email: "director@bagodi.in",
        phoneNumber: "9876543210",
        password: "MasterSecurePassword2026!",
      },
    });
    expect(valid.success).toBe(true);
  });

  it("should reject invalid slug format and bad GSTIN", () => {
    const invalid = merchantOnboardSchema.safeParse({
      name: "Bagodi Shopping Mall",
      slug: "BAGODI_INVALID_SLUG!",
      legalEntityName: "TechMasters",
      gstin: "INVALID_GST",
      contactEmail: "bad-email",
      contactPhone: "123",
      primaryStore: {
        name: "",
        code: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "123",
      },
      adminUser: {
        fullName: "",
        email: "bad",
        phoneNumber: "123",
      },
    });
    expect(invalid.success).toBe(false);
  });

  it("should validate platform user creation payload", () => {
    const valid = platformUserCreateSchema.safeParse({
      fullName: "Anand Kulkarni",
      email: "anand@techmasters.in",
      role: "SECURITY_AUDITOR",
    });
    expect(valid.success).toBe(true);

    const invalid = platformUserCreateSchema.safeParse({
      fullName: "A",
      email: "not-an-email",
      role: "UNKNOWN_ROLE" as any,
    });
    expect(invalid.success).toBe(false);
  });

  it("should validate system configuration dials", () => {
    const valid = systemConfigSchema.safeParse({
      maintenanceMode: false,
      allowedOriginUrls: "https://bagodi.in, https://admin.bagodi.in",
      sessionTimeoutMinutes: 60,
      webhookSecret: "super_secret_webhook_key_123456",
      maxUploadSizeMb: 25,
    });
    expect(valid.success).toBe(true);

    const invalidTimeout = systemConfigSchema.safeParse({
      maintenanceMode: false,
      allowedOriginUrls: "https://bagodi.in",
      sessionTimeoutMinutes: 2, // below min 5
      webhookSecret: "short",
      maxUploadSizeMb: -1,
    });
    expect(invalidTimeout.success).toBe(false);
  });
});

