import { z } from "zod";
import { WILAYAS } from "@/data/wilayas";

// Re-exported so existing imports keep working (client code imports from "@/lib/phone" to avoid bundling zod).
export { normalizeAlgerianPhone } from "./phone";

const attributionSchema = z.object({
  fbclid: z.string().max(200).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
});

export const orderSchema = z
  .object({
    productId: z.string().min(1).max(100),
    variantId: z.string().max(100).optional(),
    quantity: z.number().int().min(1).max(10),
    customerName: z.string().min(3).max(100),
    phone: z.string().min(8).max(25),
    wilayaCode: z.string().refine((c) => WILAYAS.some((x) => x.code === c), "Wilaya invalide"),
    wilayaName: z.string().min(1).max(100),
    deliveryType: z.enum(["home", "stopdesk"]),
    // Total the customer saw. Optional safety net: the server recomputes it and
    // rejects the order if rates changed in the meantime.
    expectedTotal: z.number().int().positive().optional(),
    commune: z.string().max(100).optional(),
    address: z.string().max(300).optional(),
    stopdesk: z.string().max(200).optional(),
    website: z.string().optional(), // honeypot — must stay empty
    attribution: attributionSchema.optional(),
  });