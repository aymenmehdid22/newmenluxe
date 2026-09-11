import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { formatDZD, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.status && ORDER_STATUSES.some((s) => s.value === searchParams.status)) {
    query = query.eq("status", searchParams.status as OrderStatus);
  }
  if (searchParams.q) {
    const q = searchParams.q.replace(/[%,()]/g, "").trim();
    if (q) {
      query = query.or(
        "customer_name.ilike.%" + q + "%,phone.ilike.%" + q + "%,order_number.ilike.%" + q + "%"
      );
    }
  }

  const { data: orders } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold tracking-tight">Commandes</h1>

      <form method="GET" className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Rechercher (nom, téléphone, N°)…"
          className="input mt-0 max-w-xs"
        />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input mt-0 max-w-[180px]">
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary !py-2.5">
          Filtrer
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Couleur</th>
              <th className="px-4 py-3">Wilaya</th>
              <th className="px-4 py-3">Livraison</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-semibold">
                  <Link href={"/admin/orders/" + o.id} className="hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="whitespace-nowrap px-4 py-3" dir="ltr">{o.phone}</td>
                <td className="px-4 py-3">{o.product_name}</td>
                <td className="px-4 py-3">{o.variant_name ?? "—"}</td>
                <td className="px-4 py-3">{o.wilaya_code} {o.wilaya_name}</td>
                <td className="px-4 py-3">{o.delivery_type === "home" ? "Domicile" : "Stopdesk"}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatDZD(o.total_price)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted">
                  Aucune commande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
