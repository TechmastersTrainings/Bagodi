/**
 * Cart & Server-Authoritative Pricing Types
 */

export interface CartVariantSummary {
  id: string;
  sku: string;
  size: string;
  colorName?: string;
  mrp?: number;
  sellingPrice?: number;
  availableStock?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variant: CartVariantSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface CartPricing {
  subtotal: number;
  discountTotal: number;
  deliveryCharge: number;
  taxTotal?: number;
  finalTotal: number;
}

export interface CartResponse {
  id: string;
  userId?: string;
  itemCount: number;
  items: CartItem[];
  pricing: CartPricing;
  couponCode?: string | null;
  isCouponApplied?: boolean;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  discountAmount: number;
  couponCode: string;
  updatedPricing: CartPricing;
}
