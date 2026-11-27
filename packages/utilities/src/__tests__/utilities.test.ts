import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatINR,
  isValidRedirectUrl,
  maskSensitiveData,
  sanitizeHtml,
} from "../index";

describe("Bagodi Frontend Utilities", () => {
  it("formats Indian rupee amounts consistently", () => {
    expect(formatINR(2240)).toContain("2,240.00");
    expect(formatINR("1499.5")).toContain("1,499.50");
    expect(formatINR("not-a-number")).toBe("₹0.00");
  });

  it("handles missing or valid dates", () => {
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("2026-11-26T10:30:00Z")).toContain("2026");
  });

  it("escapes XSS payloads safely", () => {
    const escaped = sanitizeHtml('<script>alert("xss")</script>');
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
  });

  it("blocks open-redirect external URLs while allowing safe relative and whitelisted URLs", () => {
    expect(isValidRedirectUrl("/account/orders")).toBe(true);
    expect(isValidRedirectUrl("//evil.example.com")).toBe(false);
    expect(isValidRedirectUrl("https://evil.example.com/phish")).toBe(false);
    expect(isValidRedirectUrl("https://bagodi.in/checkout", ["https://bagodi.in"])).toBe(true);
  });

  it("masks phone numbers and emails cleanly", () => {
    expect(maskSensitiveData("9876543210", "phone")).toBe("+91 ******3210");
    expect(maskSensitiveData("customer@bagodi.in", "email")).toBe("cu***r@bagodi.in");
  });
});

