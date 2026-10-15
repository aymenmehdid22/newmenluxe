import { NextRequest, NextResponse } from "next/server";
import { orderSchema, normalizeAlgerianPhone } from "@/lib/validation";
import { getServiceSupabase } from "@/lib/supabase";
import { getProductById } from "@/data/products";
import { rateLimit } from "@/lib/rate-limit";
import { appendOrderToSheet, type SheetOrder } from "@/lib/google-sheets";
import { sendLeadConversion } from "@/lib/meta-server";
import { WILAYAS } from "@/data/wilayas";
import { getDeliveryRate } from "@/lib/delivery-rates";
import { computeOrderTotals, getDeliveryPrice } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit("orders:" + ip, 5, 60_000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute.", code: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", code: "invalid_data", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Honeypot: bots fill this invisible field — pretend success and drop.
    if (data.website) {
      return NextResponse.json({ success: true, orderNumber: "CMD-000000" });
    }

    const phone = normalizeAlgerianPhone(data.phone);
    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide.", code: "invalid_phone", issues: { phone: ["Format invalide"] } },
        { status: 400 }
      );
    }

    const product = getProductById(data.productId);
    if (!product) return NextResponse.json({ error: "Produit introuvable.", code: "product_not_found" }, { status: 400 });

    const variant = product.variants?.find((v) => v.id === data.variantId);
    if (data.variantId && !variant) {
      return NextResponse.json({ error: "Variante introuvable.", code: "variant_not_found" }, { status: 400 });
    }
    if (variant && !variant.available) {
      return NextResponse.json({ error: "Cette couleur est actuellement indisponible.", code: "variant_unavailable" }, { status: 400 });
    }

    // Server is the source of truth for pricing — never trust the client price.
    const unitPrice = product.price;

    // Delivery price comes from Supabase (delivery_rates), never from the client.
    const wilaya = WILAYAS.find((w) => w.code === data.wilayaCode);
    if (!wilaya) {
      return NextResponse.json({ error: "Wilaya invalide.", code: "wilaya_invalid" }, { status: 400 });
    }
    let rate;
    try {
      rate = await getDeliveryRate(data.wilayaCode);
    } catch (e) {
      console.error("delivery rate lookup failed:", e);
      return NextResponse.json(
        { error: "Tarifs de livraison indisponibles.", code: "rates_unavailable" },
        { status: 503 }
      );
    }
    const deliveryPrice = getDeliveryPrice(rate ?? undefined, data.deliveryType);
    if (deliveryPrice === null) {
      return NextResponse.json(
        { error: "Ce mode de livraison n'est pas disponible pour cette wilaya.", code: "delivery_unavailable" },
        { status: 400 }
      );
    }
    const totals = computeOrderTotals(unitPrice, data.quantity, deliveryPrice)!;
    const totalPrice = totals.total; // product + delivery

    // The customer must be charged exactly what they saw.
    if (data.expectedTotal !== undefined && data.expectedTotal !== totalPrice) {
      return NextResponse.json(
        { error: "Les tarifs de livraison ont changé. Rechargez la page puis réessayez.", code: "price_changed" },
        { status: 409 }
      );
    }

    const supabase = getServiceSupabase();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        product_name: product.name,
        variant_id: variant?.id ?? null,
        variant_name: variant?.name ?? null,
        quantity: data.quantity,
        unit_price: unitPrice,
        delivery_price: deliveryPrice,
        total_price: totalPrice,
        currency: product.currency,
        customer_name: data.customerName,
        phone,
        wilaya_code: data.wilayaCode,
        wilaya_name: wilaya.name, // canonical French name, not the client-sent label
        delivery_type: data.deliveryType,
        commune: data.deliveryType === "home" ? data.commune ?? null : null,
        address: data.deliveryType === "home" ? data.address ?? null : null,
        stopdesk: data.deliveryType === "stopdesk" ? data.stopdesk ?? null : null,
        utm_source: data.attribution?.utm_source ?? null,
        utm_medium: data.attribution?.utm_medium ?? null,
        utm_campaign: data.attribution?.utm_campaign ?? null,
        utm_content: data.attribution?.utm_content ?? null,
        fbclid: data.attribution?.fbclid ?? null,
      })
      .select("id, order_number")
      .single();

    if (error || !order) {
      console.error("Supabase insert failed:", error);
      return NextResponse.json({ error: "Erreur serveur, veuillez réessayer.", code: "server_error" }, { status: 500 });
    }

    // ---- Order is saved. Everything below must NEVER fail the order. ----
    const sheetOrder: SheetOrder = {
      orderNumber: order.order_number,
      createdAt: new Date().toISOString(),
      productName: product.name,
      variantName: variant?.name ?? "",
      quantity: data.quantity,
      customerName: data.customerName,
      phone,
      wilayaName: wilaya.name,
      deliveryType: data.deliveryType,
      commune: data.commune ?? "",
      address: data.address ?? "",
      stopdesk: data.stopdesk ?? "",
      unitPrice,
      totalPrice,
      deliveryPrice,
      status: "new",
      utmSource: data.attribution?.utm_source ?? "",
      utmCampaign: data.attribution?.utm_campaign ?? "",
    };

    void (async () => {
      try {
        const sheetResult = await Promise.allSettled([
          appendOrderToSheet(sheetOrder),
          sendLeadConversion({ orderNumber: order.order_number, value: totalPrice, currency: product.currency }),
        ]);
        if (sheetResult[0].status === "fulfilled" && sheetResult[0].value === true) {
          await supabase.from("orders").update({ google_sheet_synced: true }).eq("id", order.id);
        }
      } catch (e) {
        console.error("Post-order sync failed (non-blocking):", e);
      }
    })();

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (e) {
    console.error("Order error:", e);
    return NextResponse.json({ error: "Erreur serveur.", code: "server_error" }, { status: 500 });
  }
}
