"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { WILAYAS } from "@/data/wilayas";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function WilayaSelect({
  value,
  onChange,
  disabledCodes,
}: {
  value: string;
  onChange: (code: string, name: string) => void;
  // Wilayas with no delivery price at all: shown but not selectable.
  disabledCodes?: Set<string>;
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const label = (w: (typeof WILAYAS)[number]) => (lang === "ar" ? w.nameAr : w.name);
  const selected = WILAYAS.find((w) => w.code === value);
  const q = query.trim().toLowerCase();
  // Search matches both the French and the Arabic name, whatever the language.
  const filtered = q
    ? WILAYAS.filter(
        (w) => w.name.toLowerCase().includes(q) || w.nameAr.includes(q) || w.code.startsWith(q)
      )
    : WILAYAS;

  return (
    <div ref={ref} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-3.5 py-2.5 text-start text-sm outline-none transition focus:border-foreground"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted" />
          {selected ? selected.code + " — " + label(selected) : t.wilayaPlaceholder}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.wilayaSearch}
            className="w-full border-b border-border px-3.5 py-2.5 text-sm outline-none"
          />
          <ul className="max-h-56 overflow-y-auto" role="listbox">
            {filtered.map((wilaya) => {
              const disabled = disabledCodes?.has(wilaya.code) ?? false;
              return (
                <li key={wilaya.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={wilaya.code === value}
                    aria-disabled={disabled}
                    disabled={disabled}
                    onClick={() => {
                      onChange(wilaya.code, wilaya.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={
                      "flex w-full px-3.5 py-2.5 text-start text-sm hover:bg-background " +
                      (wilaya.code === value ? "font-semibold " : "") +
                      (disabled ? "cursor-not-allowed text-muted opacity-50 hover:bg-transparent" : "")
                    }
                  >
                    <span className="w-8 shrink-0 text-muted">{wilaya.code}</span>
                    <span className="flex-1">{label(wilaya)}</span>
                    {disabled && <span className="text-xs">{t.unavailable}</span>}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3.5 py-3 text-sm text-muted">{t.wilayaNone}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
