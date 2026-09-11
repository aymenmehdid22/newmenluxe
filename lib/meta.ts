// Client-side Meta Pixel tracking abstractions.
// UI components never touch fbq directly — they call these functions.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export type MetaEventData = Record<string, string | number | string[] | undefined>;

function hasFbq(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackPageView(): void {
  if (hasFbq()) window.fbq!("track", "PageView");
}

export function trackViewContent(data: MetaEventData): void {
  if (hasFbq()) window.fbq!("track", "ViewContent", data);
}

export function trackInitiateCheckout(data: MetaEventData): void {
  if (hasFbq()) window.fbq!("track", "InitiateCheckout", data);
}

export function trackLead(data: MetaEventData): void {
  if (hasFbq()) window.fbq!("track", "Lead", data);
}

// Server-side Conversions API proxy — keeps the access token server-side.
// Never send customer PII (name, phone, address) to Meta.
export async function sendMetaConversion(eventName: string, data: MetaEventData): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/meta-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, data }),
    });
  } catch {
    // Analytics failure must never break the order flow.
  }
}
