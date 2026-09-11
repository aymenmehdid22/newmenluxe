// Attribution persistence: capture once on first landing (with fbclid / UTMs),
// keep it until the order is submitted.
const KEY = "cod_attribution";

export type Attribution = {
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return; // first touch wins
    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {
      fbclid: params.get("fbclid") ?? undefined,
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
    };
    if (data.fbclid || data.utm_source) {
      localStorage.setItem(KEY, JSON.stringify(data));
    }
  } catch {
    // storage unavailable — attribution is best-effort
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}
