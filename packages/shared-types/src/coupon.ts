/**
 * Promotional Coupons & Discount Campaign Types
 */

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minimumOrderValue: number;
  usageLimitTotal?: number;
  usageLimitPerCustomer: number;
  timesUsed: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minimumOrderValue: number;
  usageLimitTotal?: number;
  usageLimitPerCustomer: number;
  validFrom: string;
  validUntil: string;
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  isActive?: boolean;
}

export interface ValidateCouponPayload {
  code: string;
  cartTotal: number;
  categoryIds?: string[];
  brandIds?: string[];
}

export interface ValidateCouponResponse {
  isValid: boolean;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  message: string;
}

