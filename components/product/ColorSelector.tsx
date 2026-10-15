"use client";

import type { ProductVariant } from "@/types/product";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function ColorSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const nameOf = (v: ProductVariant) => t.colors[v.id] ?? v.name;
  const selected = variants.find((v) => v.id === selectedId);
  return (
    <div>
      <p className="label">
        {t.color}
        {selected && (
          <span className="ms-1 font-normal normal-case text-muted">— {nameOf(selected)}</span>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.id === selectedId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => v.available && onSelect(v.id)}
              disabled={!v.available}
              aria-pressed={active}
              className={
                "flex items-center gap-2 rounded-full border bg-white py-1.5 ps-1.5 pe-3 text-sm transition " +
                (active
                  ? "border-foreground font-semibold"
                  : "border-border text-muted hover:border-[#bbbbbb]") +
                (!v.available ? " cursor-not-allowed opacity-40" : "")
              }
            >
              {v.color && (
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: v.color }}
                />
              )}
              {nameOf(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
