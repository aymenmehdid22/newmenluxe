import { getServiceSupabase } from "@/lib/supabase";
import { LANDING_BUCKET } from "@/lib/landing-bucket";

export { LANDING_BUCKET };

export type LandingSettings = {
  product_id: string;
  mobile_image_enabled: boolean;
  mobile_image_path: string | null;
  mobile_image_url: string | null;
  mobile_image_width: number | null;
  mobile_image_height: number | null;
};

export type MobileLandingImage = { url: string; width: number; height: number };

const COLUMNS =
  "product_id, mobile_image_enabled, mobile_image_path, mobile_image_url, mobile_image_width, mobile_image_height";

// Server-only. Never throws: any failure means "feature off", so the existing
// mobile page stays exactly as it was.
export async function getLandingSettings(productId: string): Promise<LandingSettings | null> {
  try {
    const { data, error } = await getServiceSupabase()
      .from("landing_settings")
      .select(COLUMNS)
      .eq("product_id", productId)
      .maybeSingle();
    if (error) {
      console.error("landing_settings fetch failed:", error);
      return null;
    }
    return (data as LandingSettings | null) ?? null;
  } catch (e) {
    console.error("landing_settings fetch failed:", e);
    return null;
  }
}

// What the public landing page needs: null unless enabled AND an image exists.
export async function getMobileLandingImage(productId: string): Promise<MobileLandingImage | null> {
  const s = await getLandingSettings(productId);
  if (!s || !s.mobile_image_enabled || !s.mobile_image_url) return null;
  if (!s.mobile_image_width || !s.mobile_image_height) return null;
  return { url: s.mobile_image_url, width: s.mobile_image_width, height: s.mobile_image_height };
}
