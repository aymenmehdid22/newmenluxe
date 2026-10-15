import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { isAdminRequest } from "@/lib/require-admin";
import { getServiceSupabase } from "@/lib/supabase";
import { getProductById } from "@/data/products";
import { LANDING_BUCKET } from "@/lib/landing-settings";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's file_size_limit
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const schema = z.object({
  productId: z.string().min(1).max(100),
  contentType: z.string(),
  size: z.number().int().positive(),
});

// Step 1 of the upload: hands the authenticated admin a one-time signed upload
// URL, so the file goes straight from the browser to Supabase Storage
// (no serverless body-size limit, no service key exposed).
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const { productId, contentType, size } = parsed.data;

  if (!getProductById(productId)) return NextResponse.json({ error: "Produit introuvable." }, { status: 400 });
  const ext = EXT[contentType];
  if (!ext) return NextResponse.json({ error: "Format non supporté (JPG, PNG ou WebP)." }, { status: 400 });
  if (size > MAX_BYTES) return NextResponse.json({ error: "Image trop lourde (10 Mo maximum)." }, { status: 400 });

  const path = productId + "/" + Date.now() + "-" + randomBytes(4).toString("hex") + "." + ext;
  const { data, error } = await getServiceSupabase().storage.from(LANDING_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("createSignedUploadUrl failed:", error);
    return NextResponse.json({ error: "Impossible de préparer l'envoi." }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
