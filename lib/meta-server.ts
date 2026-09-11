// Server-side Conversions API. Token never leaves the server.
// No customer PII is ever sent to Meta (no name, phone, or address).

type ConversionPayload = {
  eventName: string;
  eventId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
};

export async function sendMetaConversion(payload: ConversionPayload): Promise<boolean> {
  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const token = process.env.META_ACCESS_TOKEN;
    if (!pixelId || !token) return false;

    const body = {
      data: [
        {
          event_name: payload.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: payload.eventId,
          event_source_url: undefined,
          action_source: "website",
          custom_data: {
            value: payload.value,
            currency: payload.currency,
            content_name: payload.contentName,
            content_ids: payload.contentIds,
            content_type: "product",
          },
        },
      ],
    };

    const res = await fetch(
      "https://graph.facebook.com/v20.0/" + pixelId + "/events?access_token=" + token,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      console.error("Meta CAPI error:", res.status, await res.text());
    }
    return res.ok;
  } catch (e) {
    console.error("Meta CAPI error:", e);
    return false;
  }
}

export async function sendLeadConversion(opts: {
  orderNumber: string;
  value: number;
  currency: string;
}): Promise<boolean> {
  return sendMetaConversion({
    eventName: "Lead",
    eventId: "order-" + opts.orderNumber, // deduplicates with the browser pixel event
    value: opts.value,
    currency: opts.currency,
    contentName: "COD Order",
  });
}
