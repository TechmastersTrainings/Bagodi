/**
 * Delivery Logistics & Courier Dispatch Validation Schemas
 */

import { z } from "zod";

export const createShipmentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  courierPartnerId: z.string().min(1, "Please select a courier partner"),
  trackingNumber: z.string().min(4, "Tracking number must be at least 4 characters").trim(),
  weightGrams: z.number().int().positive("Package weight must be greater than 0 grams"),
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  pickupSlot: z.string().optional(),
  specialInstructions: z.string().max(250).optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    "MANIFESTED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RTO",
  ]),
  location: z.string().min(2, "Location is required (e.g. Bidar Hub)"),
  activityDescription: z.string().min(5, "Activity description is required"),
});

export type CreateShipmentFormData = z.input<typeof createShipmentSchema>;
export type UpdateShipmentStatusFormData = z.input<typeof updateShipmentStatusSchema>;

