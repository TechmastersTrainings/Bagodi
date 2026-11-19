/**
 * Checkout & Order Placement Validation Schemas
 */

import { z } from "zod";
import { addressSchema } from "./address.schema";

export const checkoutDeliveryMethodSchema = z.enum(["STANDARD", "EXPRESS"]);

export const checkoutPaymentMethodSchema = z.enum(["RAZORPAY", "COD", "UPI", "CARD", "NETBANKING"]);

export const checkoutOrderSchema = z.object({
  shippingAddressId: z.string().uuid("Please select a valid delivery address").optional(),
  newShippingAddress: addressSchema.optional(),
  deliverySpeed: checkoutDeliveryMethodSchema.default("STANDARD"),
  paymentMethod: checkoutPaymentMethodSchema,
  customerNotes: z.string().max(250, "Notes cannot exceed 250 characters").optional(),
}).refine(
  (data) => data.shippingAddressId || data.newShippingAddress,
  {
    message: "A delivery address is required to proceed with checkout",
    path: ["shippingAddressId"],
  }
);

export type CheckoutDeliveryMethod = z.infer<typeof checkoutDeliveryMethodSchema>;
export type CheckoutPaymentMethod = z.infer<typeof checkoutPaymentMethodSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

