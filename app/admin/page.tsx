import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/format";
import { ORDER_STATUSES } from "@/types/order";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("status,total_price,created_at")
    .order("created_at", { ascending: false });

  const rows = orders ?? [];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = rows.filter((o) => new Date(o.created_at) >= startOfToday).length;
  const revenue = rows
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_price, 0);

  const stats = [
    { label: "Total commandes", value: String(rows.length) },
    { label: "Aujourd'hui", value: String(todayCount) },
    { label: "Revenu (hors annulées)", value: formatDZD(revenue) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
            <p className="mt-1 truncate text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#333]">
          Par statut
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ORDER_STATUSES.map((s) => {
            const n = rows.filter((o) => o.status === s.value).length;
            return (
              <Link
                key={s.value}
                href={"/admin/orders?status=" + s.value}
                className="card p-4 transition hover:border-[#bbbbbb]"
              >
                <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{n}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
