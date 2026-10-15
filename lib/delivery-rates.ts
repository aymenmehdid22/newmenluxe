import { getServiceSupabase } from "@/lib/supabase";
import type { DeliveryRate } from "@/lib/delivery";

const COLUMNS = "wilaya_code, home_price, stopdesk_price";

// Server-only. Returns null on failure so callers can show an explicit error
// state instead of silently using wrong prices.
export async function getDeliveryRates(): Promise<DeliveryRate[] | null> {
  try {
    const { data, error } = await getServiceSupabase()
      .from("delivery_rates")
      .select(COLUMNS)
      .order("wilaya_code");
    if (error || !data) {
      console.error("delivery_rates fetch failed:", error);
      return null;
    }
    return data as DeliveryRate[];
  } catch (e) {
    console.error("delivery_rates fetch failed:", e);
    return null;
  }
}

export async function getDeliveryRate(wilayaCode: string): Promise<DeliveryRate | null> {
  const { data, error } = await getServiceSupabase()
    .from("delivery_rates")
    .select(COLUMNS)
    .eq("wilaya_code", wilayaCode)
    .maybeSingle();
  if (error) throw error;
  return (data as DeliveryRate | null) ?? null;
}
