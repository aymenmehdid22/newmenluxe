import { createClient } from "@/lib/supabase-server";

// Same auth check the existing admin API uses, shared by the new routes.
export async function isAdminRequest(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}
