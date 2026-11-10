/**
 * TechMasters Multi-Tenant Platform Governance Types
 */

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "ONBOARDING" | "MAINTENANCE";
export type TenantPlan = "ENTERPRISE" | "GROWTH" | "BOUTIQUE";

export interface MerchantTenant {
  id: string;
  slug: string;
  name: string;
  legalEntityName: string;
  gstin?: string;
  contactEmail: string;
  contactPhone: string;
  domain?: string;
  plan: TenantPlan;
  status: TenantStatus;
  storeCount: number;
  totalProductsCount: number;
  totalOrdersCount: number;
  grossSalesVolume: number;
  apiKeyPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardMerchantPayload {
  name: string;
  slug: string;
  legalEntityName: string;
  gstin?: string;
  contactEmail: string;
  contactPhone: string;
  domain?: string;
  plan: TenantPlan;
  primaryStore: {
    name: string;
    code: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  adminUser: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
  };
}

export type PlatformRole = "SUPER_ADMIN" | "SECURITY_AUDITOR" | "PLATFORM_OPERATIONS";

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export interface CreatePlatformUserPayload {
  fullName: string;
  email: string;
  role: PlatformRole;
  tempPassword?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  action:
    | "MERCHANT_ONBOARDED"
    | "TENANT_STATUS_UPDATED"
    | "API_KEY_ROTATED"
    | "PLATFORM_USER_CREATED"
    | "SETTINGS_CHANGED"
    | "SECURITY_LOGIN_SUCCESS"
    | "SECURITY_LOGIN_FAILED"
    | "CACHE_PURGED";
  targetResource: string;
  targetId?: string;
  ipAddress: string;
  userAgent?: string;
  status: "SUCCESS" | "DENIED" | "ERROR";
  details?: Record<string, any>;
}

export interface SystemServiceHealth {
  serviceName: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  uptimePercentage: number;
  lastPingAt: string;
}

export interface PlatformGovernanceSummary {
  totalMerchants: number;
  activeMerchants: number;
  suspendedMerchants: number;
  activeTenants: number;
  totalStores: number;
  platformLifetimeGmv: number;
  totalEndUsers: number;
  overallHealth: "HEALTHY" | "DEGRADED" | "DOWN";
  services: SystemServiceHealth[];
  recentAuditLogs: AuditLogEntry[];
}

