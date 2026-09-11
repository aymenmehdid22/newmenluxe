import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { formatDZD, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">{order.order_number}</h1>
          <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="card divide-y divide-border p-5">
        <h2 className="pb-2 text-sm font-semibold uppercase tracking-wide">Client</h2>
        <Row label="Nom" value={order.customer_name} />
        <Row label="Téléphone" value={<span dir="ltr">{order.phone}</span>} />
        <Row label="Wilaya" value={order.wilaya_code + " — " + order.wilaya_name} />
        <Row
          label="Livraison"
          value={order.delivery_type === "home" ? "À domicile" : "Stopdesk"}
        />
        {order.delivery_type === "home" ? (
          <>
            <Row label="Commune" value={order.commune} />
            <Row label="Adresse" value={order.address} />
          </>
        ) : (
          <Row label="Stopdesk" value={order.stopdesk} />
        )}
      </div>

      <div className="card divide-y divide-border p-5">
        <h2 className="pb-2 text-sm font-semibold uppercase tracking-wide">Produit</h2>
        <Row label="Produit" value={order.product_name} />
        <Row label="Couleur" value={order.variant_name} />
        <Row label="Quantité" value={String(order.quantity)} />
        <Row label="Prix unitaire" value={formatDZD(order.unit_price)} />
        <Row label="Total" value={<span className="font-extrabold">{formatDZD(order.total_price)}</span>} />
      </div>

      <div className="card divide-y divide-border p-5">
        <h2 className="pb-2 text-sm font-semibold uppercase tracking-wide">Attribution</h2>
        <Row label="Source" value={order.utm_source} />
        <Row label="Campagne" value={order.utm_campaign} />
        <Row label="fbclid" value={order.fbclid ? "présent" : null} />
        <Row label="Google Sheets" value={order.google_sheet_synced ? "Synchronisé" : "Non synchronisé"} />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Statut</h2>
        <OrderStatusSelect id={order.id} initial={order.status} />
      </div>
    </div>
  );
}
