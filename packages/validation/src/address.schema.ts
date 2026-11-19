/**
 * Shipping and Billing Address Validation Schema
 */

import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full recipient name is required"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  addressLine1: z.string().min(5, "Flat, house no., building or street is required"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, "City / District is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.input<typeof addressSchema>;

