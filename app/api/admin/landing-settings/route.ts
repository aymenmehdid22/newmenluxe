import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/require-admin";
import { getServiceSupabase } from "@/lib/supabase";
import { getProductById } from "@/data/products";
import { LANDING_BUCKET, getLandingSettings } from "@/lib/landing-settings";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1).max(100),
  enabled: z.boolean().optional(),
  image: z
    .object({
      path: z.string().min(3).max(300),
      width: z.number().int().min(1).max(20000),
      height: z.number().int().min(1).max(60000),
    })
    .optional(),
});

// Updates the enable/disable switch and/or registers a freshly uploaded image.
export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const { productId, enabled, image } = parsed.data;
  if (!getProductById(productId)) return NextResponse.json({ error: "Produit introuvable." }, { status: 400 });

  const supabase = getServiceSupabase();
  const current = await getLandingSettings(productId);
  const patch: Record<string, unknown> = { product_id: productId, updated_at: new Date().toISOString() };

  if (image) {
    // The path must be one we issued for THIS product, and the object must exist.
    const m = image.path.match(/^([^/]+)\/([A-Za-z0-9._-]+)$/);
    if (!m || m[1] !== productId) return NextResponse.json({ error: "Chemin d'image invalide." }, { status: 400 });
    const { data: found, error: listError } = await supabase.storage
      .from(LANDING_BUCKET)
      .list(productId, { search: m[2], limit: 5 });
    if (listError || !found?.some((f) => f.name === m[2])) {
      return NextResponse.json({ error: "Fichier introuvable dans le stockage." }, { status: 400 });
    }
    patch.mobile_image_path = image.path;
    patch.mobile_image_url = supabase.storage.from(LANDING_BUCKET).getPublicUrl(image.path).data.publicUrl;
    patch.mobile_image_width = image.width;
    patch.mobile_image_height = image.height;
  }

  if (enabled !== undefined) {
    const willHaveImage = !!(image || current?.mobile_image_url);
    if (enabled && !willHaveImage) {
      return NextResponse.json({ error: "Ajoutez d'abord une image avant d'activer." }, { status: 400 });
    }
    patch.mobile_image_enabled = enabled;
  }

  const { data: saved, error } = await supabase
    .from("landing_settings")
    .upsert(patch, { onConflict: "product_id" })
    .select("*")
    .single();
  if (error || !saved) {
    console.error("landing_settings upsert failed:", error);
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }

  // Replaced image: remove the old file (best effort, never fails the request).
  if (image && current?.mobile_image_path && current.mobile_image_path !== image.path) {
    const { error: rmError } = await supabase.storage.from(LANDING_BUCKET).remove([current.mobile_image_path]);
    if (rmError) console.error("old landing image cleanup failed:", rmError);
  }

  return NextResponse.json({ success: true, settings: saved });
}
