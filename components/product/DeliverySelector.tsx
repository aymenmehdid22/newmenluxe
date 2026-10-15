"use client";

import { Home, Lock, Package } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { formatDZD } from "@/lib/format";
import type { DeliveryType } from "@/lib/delivery";

export default function DeliverySelector({
  value,
  onChange,
  prices,
}: {
  value: DeliveryType;
  onChange: (v: DeliveryType) => void;
  // Price per method for the selected wilaya. `null` = method unavailable.
  // Omit entirely while no wilaya is selected yet.
  prices?: Record<DeliveryType, number | null>;
}) {
  const { t, lang } = useI18n();
  const options = [
    { value: "home" as const, icon: Home, title: t.home.title, sub: t.home.sub },
    { value: "stopdesk" as const, icon: Package, title: t.stopdesk.title, sub: t.stopdesk.sub },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        const price = prices?.[opt.value];
        const unavailable = prices !== undefined && price === null;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={unavailable}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={
              "rounded-xl border-2 bg-white p-4 text-start transition " +
              (active && !unavailable ? "border-foreground" : "border-border hover:border-[#bbbbbb]") +
              (unavailable ? " cursor-not-allowed opacity-50 hover:border-border" : "")
            }
          >
            <div className="flex items-center justify-between">
              <Icon className={"h-5 w-5 " + (active && !unavailable ? "text-foreground" : "text-muted")} />
              {unavailable && <Lock className="h-4 w-4 text-muted" aria-hidden="true" />}
            </div>
            <p className="mt-2 text-sm font-bold">{opt.title}</p>
            <p className="text-xs text-muted">{opt.sub}</p>
            {prices !== undefined && !unavailable && (
              <p className="mt-1.5 text-sm font-extrabold">{formatDZD(price as number, lang)}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
