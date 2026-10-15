// Pure delivery/total helpers — shared by the client (instant UI feedback)
// and the server (re-validation before saving). No server-only imports here.

export type DeliveryType = "home" | "stopdesk";

// Shape of a row of public.delivery_rates. A null price means the delivery
// method is not available for that wilaya.
export type DeliveryRate = {
  wilaya_code: string;
  home_price: number | null;
  stopdesk_price: number | null;
};

export function getDeliveryPrice(
  rate: DeliveryRate | undefined,
  type: DeliveryType
): number | null {
  if (!rate) return null;
  const price = type === "home" ? rate.home_price : rate.stopdesk_price;
  return typeof price === "number" && Number.isFinite(price) && price >= 0 ? price : null;
}

export function isWilayaDeliverable(rate: DeliveryRate | undefined): boolean {
  return getDeliveryPrice(rate, "home") !== null || getDeliveryPrice(rate, "stopdesk") !== null;
}

export type OrderTotals = { subtotal: number; deliveryPrice: number; total: number };

// Returns null whenever the delivery price is unknown, so an incomplete
// selection can never produce a (wrong) total.
export function computeOrderTotals(
  unitPrice: number,
  quantity: number,
  deliveryPrice: number | null
): OrderTotals | null {
  if (deliveryPrice === null) return null;
  const subtotal = unitPrice * quantity;
  return { subtotal, deliveryPrice, total: subtotal + deliveryPrice };
}
