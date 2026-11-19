/**
 * Authentication and Authorization Types
 * Matching FastAPI /api/v1/auth OpenAPI Specifications
 */

export type UserRole =
  | "CUSTOMER"
  | "MERCHANT_ADMIN"
  | "STORE_MANAGER"
  | "INVENTORY_STAFF"
  | "DELIVERY_STAFF"
  | "SUPER_ADMIN"
  | "PLATFORM_SUPPORT";

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface StoreContext {
  id: string;
  name: string;
  code: string;
  city: string;
  isFlagship: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  merchantId?: string;
  storeId?: string;
  activeStore?: StoreContext;
  availableStores?: StoreContext[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface AuthSessionResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/* Customer OTP Authentication */
export interface SendOtpPayload {
  phoneOrEmail: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
}

export interface SendOtpResponse {
  referenceId: string;
  expiresInSeconds: number;
  maskedDestination: string;
}

export interface VerifyOtpPayload {
  referenceId: string;
  phoneOrEmail: string;
  otp: string;
}

/* Password Authentication */
export interface PasswordLoginPayload {
  emailOrPhone: string;
  password: string;
  storeId?: string;
}

/* Customer Registration */
export interface CustomerRegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  acceptTerms: boolean;
}

/* Super Admin Login */
export interface SuperAdminLoginPayload {
  email: string;
  password: string;
  securityKey?: string;
}

