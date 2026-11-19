/**
 * Return & Exchange Processing Types
 */

export type ReturnStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PICKUP_SCHEDULED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "INSPECTED_PASSED"
  | "INSPECTED_FAILED"
  | "REFUND_INITIATED"
  | "COMPLETED";

export interface ReturnRequestItem {
  orderItemId: string;
  variantId: string;
  sku?: string;
  productName?: string;
  size?: string;
  quantity: number;
  reason: string;
  unitPrice?: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  isExchange: boolean;
  exchangeVariantId?: string;
  exchangeVariantSku?: string;
  reason: string;
  conditionNotes?: string;
  status: ReturnStatus;
  items: ReturnRequestItem[];
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectReturnPayload {
  conditionStatus: "PASSED" | "FAILED";
  inspectionNotes: string;
  resolutionAction: "APPROVE_REFUND" | "DISPATCH_EXCHANGE" | "REJECT_RETURN";
  replacementVariantId?: string;
}
