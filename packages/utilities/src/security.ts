/**
 * Bagodi Platform Security & Data Sanitization Utilities
 */

/**
 * Escapes HTML entities to prevent XSS injection attacks.
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates whether a redirect URL is safe (internal or explicitly whitelisted domain).
 * Prevents open redirect attacks during authentication callbacks.
 */
export function isValidRedirectUrl(url: string, allowedOrigins: string[] = []): boolean {
  if (!url) return false;

  // Relative paths are safe
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    if (origin === window.location.origin) return true;
    return allowedOrigins.includes(origin);
  } catch {
    return false;
  }
}

/**
 * Masks sensitive identifiers for customer privacy and PCI-DSS compliance.
 */
export function maskSensitiveData(value: string, type: "email" | "phone" | "card" = "email"): string {
  if (!value) return "";

  if (type === "email") {
    const [name, domain] = value.split("@");
    if (!domain) return value;
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***${name.slice(-1)}` : "***";
    return `${maskedName}@${domain}`;
  }

  if (type === "phone") {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length < 4) return "****";
    return `+91 ******${cleaned.slice(-4)}`;
  }

  if (type === "card") {
    const cleaned = value.replace(/\s+/g, "");
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  }

  return value;
}

