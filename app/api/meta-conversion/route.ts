import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendMetaConversion } from "@/lib/meta-server";

export const dynamic = "force-dynamic";

const schema = z.object({
  eventName: z.enum(["PageView", "ViewContent", "InitiateCheckout", "Lead"]),
  data: z.record(z.union([z.string(), z.number()])).optional(),
});

// Server-side Conversions API proxy — keeps META_ACCESS_TOKEN server-side.
// Analytics failure must never break anything: always returns success.
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit("meta:" + ip, 60, 60_000)) {
      return NextResponse.json({ success: true });
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { eventName, data } = parsed.data;
    await sendMetaConversion({
      eventName,
      value: typeof data?.value === "number" ? data.value : undefined,
      currency: typeof data?.currency === "string" ? data.currency : undefined,
      contentName: typeof data?.content_name === "string" ? data.content_name : undefined,
      contentIds: typeof data?.content_ids === "string" ? [data.content_ids] : undefined,
    });
  } catch (e) {
    console.error("Meta conversion proxy error:", e);
  }
  return NextResponse.json({ success: true });
}
