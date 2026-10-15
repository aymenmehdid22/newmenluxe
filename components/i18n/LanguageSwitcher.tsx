"use client";

import { useI18n } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.langLabel}
      className="inline-flex rounded-full border border-border bg-white p-0.5 text-xs font-semibold"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.value}
          onClick={() => setLang(o.value)}
          aria-pressed={lang === o.value}
          className={
            "rounded-full px-3 py-1.5 transition " +
            (lang === o.value ? "bg-foreground text-white" : "text-muted hover:text-black")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
