/**
 * Order & Fulfillment Types
 */

import { Address } from "./common";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "COLLECTED" | "REFUNDED" | "FAILED";

export interface OrderTrackingEvent {
  title: string;
  timestamp: string;
  description?: string;
  location?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  size: string;
  colorName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface RazorpayOrderDetails {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "RAZORPAY" | "COD" | "UPI" | "CARD" | "NETBANKING";
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discountTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  trackingNumber?: string;
  courierPartner?: string;
  trackingEvents?: OrderTrackingEvent[];
  razorpay?: RazorpayOrderDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  shippingAddressId?: string;
  newShippingAddress?: Omit<Address, "id">;
  paymentMethod: "RAZORPAY" | "COD" | "UPI" | "CARD" | "NETBANKING";
  deliverySpeed?: "STANDARD" | "EXPRESS";
  customerNotes?: string;
  couponCode?: string;
}

export interface CreateOrderResponse {
  order: Order;
  razorpay?: RazorpayOrderDetails;
  paymentRedirectUrl?: string;
}

export interface OrderFilterParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | "ALL";
  paymentStatus?: PaymentStatus | "ALL";
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  trackingNumber?: string;
  courierPartner?: string;
  cancellationReason?: string;
}

export interface RefundPayload {
  orderId: string;
  amount: number;
  reason: string;
  refundMethod: "ORIGINAL_SOURCE" | "STORE_CREDIT";
}

export interface RefundResponse {
  refundId: string;
  orderId: string;
  amount: number;
  status: "INITIATED" | "PROCESSED" | "FAILED";
  gatewayReference?: string;
  createdAt: string;
}
