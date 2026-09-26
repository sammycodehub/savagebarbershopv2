import type { WhatsAppPayload } from "@/types";
import { formatCurrency } from "./utils";

/**
 * Compiles the structured booking payload into a pre-filled WhatsApp message
 * and returns a wa.me click-to-chat URL targeting the shop's business number.
 *
 * NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER must be in international format
 * with no leading "+" or spaces, e.g. 233551234567
 */
export function buildWhatsAppLink(payload: WhatsAppPayload): string {
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ?? "";

  const message = [
    "New booking — Savage Lifestyle Barber Shop",
    "",
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.phoneNumber}`,
    `Service: ${payload.serviceName}`,
    `Date & Time: ${payload.dateTimeLabel}`,
    `Total: ${formatCurrency(payload.totalPrice)}`,
    `Payment: ${payload.paymentStatus}`,
  ].join("\n");

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${businessNumber}?text=${encoded}`;
}
