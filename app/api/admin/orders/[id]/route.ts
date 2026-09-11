import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["new", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { error } = await getServiceSupabase()
    .from("orders")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    console.error("Status update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
