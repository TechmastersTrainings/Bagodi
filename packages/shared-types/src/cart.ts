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
  productId?: string;
  productName?: string;
  product_name?: string;
  variantId?: string;
  variant_id?: string;
  variantName?: string;
  variant_name?: string;
  variant?: CartVariantSummary;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
  totalPrice?: number;
  total_price?: number;
  imageUrl?: string;
  image_url?: string;
  sku?: string;
  available_qty?: number;
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
  customer_id?: string | null;
  tenant_id?: string;
  session_id?: string | null;
  itemCount?: number;
  total_items?: number;
  items: CartItem[];
  pricing?: CartPricing;
  subtotal?: number;
  discount_amount?: number;
  total_amount?: number;
  couponCode?: string | null;
  coupon_code?: string | null;
  isCouponApplied?: boolean;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  discountAmount: number;
  couponCode: string;
  updatedPricing: CartPricing;
}
