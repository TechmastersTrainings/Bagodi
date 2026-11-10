/**
 * Delivery Logistics & Courier Types
 * Real API contracts for Bagodi Retail fulfillment fleet
 */

export type ShipmentStatus =
  | "MANIFESTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RTO";

export interface CourierPartner {
  id: string;
  name: string;
  code: "BLUEDART" | "DELHIVERY" | "DTDC" | "SHADOWFAX" | "BAGODI_INHOUSE";
  isActive: boolean;
  trackingUrlTemplate?: string;
  contactNumber?: string;
  serviceType: "STANDARD_SURFACE" | "AIR_EXPRESS" | "LOCAL_HYPERLOCAL";
}

export interface TrackingMilestone {
  timestamp: string;
  location: string;
  status: ShipmentStatus;
  activityDescription: string;
}

export interface DeliveryShipment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  destinationCity: string;
  destinationPincode: string;
  courierPartnerId: string;
  courierPartnerName: string;
  trackingNumber: string;
  shippingLabelUrl?: string;
  status: ShipmentStatus;
  estimatedDeliveryDate?: string;
  milestones: TrackingMilestone[];
  weightGrams?: number;
  codAmount?: number;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentPayload {
  orderId: string;
  courierPartnerId: string;
  trackingNumber: string;
  weightGrams: number;
  packageDimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  pickupSlot?: string;
  specialInstructions?: string;
}

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
  location: string;
  activityDescription: string;
}

export interface CourierManifest {
  manifestId: string;
  manifestNumber: string;
  courierPartnerName: string;
  handoverDate: string;
  totalShipments: number;
  totalWeightKg: number;
  status: "OPEN" | "DISPATCHED" | "ACKNOWLEDGED";
  shipments: {
    orderNumber: string;
    trackingNumber: string;
    customerName: string;
    destinationPincode: string;
    codAmount?: number;
  }[];
}
