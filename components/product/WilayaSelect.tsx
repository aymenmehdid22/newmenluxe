"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { WILAYAS } from "@/data/wilayas";

export default function WilayaSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string, name: string) => void;
}) {
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

  const selected = WILAYAS.find((w) => w.code === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? WILAYAS.filter((w) => w.name.toLowerCase().includes(q) || w.code.startsWith(q))
    : WILAYAS;

  return (
    <div ref={ref} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-3.5 py-2.5 text-left text-sm outline-none transition focus:border-foreground"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted" />
          {selected ? selected.code + " — " + selected.name : "Sélectionner votre wilaya"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ex : Oran)…"
            className="w-full border-b border-border px-3.5 py-2.5 text-sm outline-none"
          />
          <ul className="max-h-56 overflow-y-auto" role="listbox">
            {filtered.map((wilaya) => (
              <li key={wilaya.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={wilaya.code === value}
                  onClick={() => {
                    onChange(wilaya.code, wilaya.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={
                    "flex w-full px-3.5 py-2.5 text-left text-sm hover:bg-background " +
                    (wilaya.code === value ? "font-semibold" : "")
                  }
                >
                  <span className="w-8 text-muted">{wilaya.code}</span>
                  {wilaya.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3.5 py-3 text-sm text-muted">Aucune wilaya trouvée.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
