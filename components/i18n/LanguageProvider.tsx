"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTIONARIES, DIR, LANG_COOKIE, type Dictionary, type Lang } from "@/lib/i18n";

type Ctx = { lang: Lang; dir: "ltr" | "rtl"; t: Dictionary; setLang: (l: Lang) => void };

const I18nContext = createContext<Ctx | null>(null);

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

// Wraps ONLY the public landing page (the admin keeps its French LTR layout).
// The wrapper div is rendered with the right dir/lang on the server (from the
// cookie), so there is no flash; <html> is kept in sync for scrollbars/forms.
export default function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = DIR[lang];
  }, [lang]);

  // Restore the root defaults when leaving the landing page.
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.lang = "fr";
      root.removeAttribute("dir");
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      document.cookie = LANG_COOKIE + "=" + l + "; path=/; max-age=31536000; samesite=lax";
    } catch {
      /* cookies blocked: language still switches for this visit */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, dir: DIR[lang], t: DICTIONARIES[lang], setLang }),
    [lang, setLang]
  );

  return (
    <I18nContext.Provider value={value}>
      <div dir={DIR[lang]} lang={lang}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}
