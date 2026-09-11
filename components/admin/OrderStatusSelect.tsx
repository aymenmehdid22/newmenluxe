"use client";

import { useState } from "react";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

export default function OrderStatusSelect({
  id,
  initial,
}: {
  id: string;
  initial: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initial);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function update(next: OrderStatus) {
    setSaving(true);
    setFailed(false);
    try {
      const res = await fetch("/api/admin/orders/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setStatus(next);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => update(e.target.value as OrderStatus)}
        disabled={saving}
        className="input mt-0 max-w-[180px]"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-muted">Enregistrement…</span>}
      {failed && <span className="text-xs font-semibold text-red-600">Échec de la mise à jour</span>}
    </div>
  );
}
