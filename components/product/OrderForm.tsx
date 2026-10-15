"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Product, ProductVariant } from "@/types/product";
import WilayaSelect from "./WilayaSelect";
import DeliverySelector from "./DeliverySelector";
import { trackInitiateCheckout, trackLead, sendMetaConversion } from "@/lib/meta";
import { getAttribution } from "@/lib/analytics";
import { formatDZD } from "@/lib/format";
import { normalizeAlgerianPhone } from "@/lib/phone";
import { WILAYAS } from "@/data/wilayas";
import {
  computeOrderTotals,
  getDeliveryPrice,
  isWilayaDeliverable,
  type DeliveryRate,
  type DeliveryType,
  type OrderTotals,
} from "@/lib/delivery";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function OrderForm({
  product,
  variant,
  quantity,
  rates,
  onTotalChange,
}: {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
  // Delivery rates loaded from Supabase on the server. null = failed to load.
  rates: DeliveryRate[] | null;
  // Reports the full total (product + delivery), or null while incomplete.
  onTotalChange?: (total: number | null) => void;
}) {
  const { t, lang } = useI18n();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [wilayaName, setWilayaName] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [stopdesk, setStopdesk] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — invisible to humans
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    orderNumber: string;
    totals: OrderTotals;
    deliveryType: DeliveryType;
  } | null>(null);

  const rateMap = useMemo(
    () => new Map((rates ?? []).map((r) => [r.wilaya_code, r])),
    [rates]
  );
  const disabledCodes = useMemo(
    () =>
      new Set(
        rates ? WILAYAS.filter((w) => !isWilayaDeliverable(rateMap.get(w.code))).map((w) => w.code) : []
      ),
    [rates, rateMap]
  );

  // ---- Pricing (single source for display, tracking and submission) ----
  const rate = wilayaCode ? rateMap.get(wilayaCode) : undefined;
  const methodPrices: Record<DeliveryType, number | null> | undefined = wilayaCode
    ? { home: getDeliveryPrice(rate, "home"), stopdesk: getDeliveryPrice(rate, "stopdesk") }
    : undefined;
  const deliveryPrice = wilayaCode ? getDeliveryPrice(rate, deliveryType) : null;
  const subtotal = product.price * quantity;
  const totals = computeOrderTotals(product.price, quantity, deliveryPrice);

  useEffect(() => {
    onTotalChange?.(totals ? totals.total : null);
  }, [totals?.total]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    trackInitiateCheckout({
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: product.currency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onWilayaChange(code: string, name: string) {
    setWilayaCode(code);
    setWilayaName(name);
    // If the chosen method doesn't exist for this wilaya but the other does, switch.
    const r = rateMap.get(code);
    if (getDeliveryPrice(r, deliveryType) === null) {
      const other: DeliveryType = deliveryType === "home" ? "stopdesk" : "home";
      if (getDeliveryPrice(r, other) !== null) setDeliveryType(other);
    }
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    // Client-side validation with localized messages (the server re-validates everything).
    if (customerName.trim().length < 3) return setError(t.errors.name);
    if (!normalizeAlgerianPhone(phone)) return setError(t.errors.phone);
    if (!rates) return setError(t.errors.ratesUnavailable);
    if (!wilayaCode) return setError(t.errors.wilaya);
    if (!totals) return setError(t.errors.deliveryUnavailable);

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: variant?.id,
          quantity,
          customerName,
          phone,
          wilayaCode,
          wilayaName,
          deliveryType,
          expectedTotal: totals.total,
          commune: deliveryType === "home" ? commune : undefined,
          address: deliveryType === "home" ? address : undefined,
          stopdesk: deliveryType === "stopdesk" ? stopdesk : undefined,
          website,
          attribution: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.errors.byCode[data.code] ?? data.error ?? t.errors.generic);
        return;
      }
      // Lead fires ONLY after the server confirmed the order was created.
      trackLead({
        content_name: product.name,
        content_ids: [product.id],
        value: totals.total,
        currency: product.currency,
      });
      void sendMetaConversion("Lead", {
        value: totals.total,
        currency: product.currency,
        content_name: product.name,
      });
      setSuccess({ orderNumber: data.orderNumber, totals, deliveryType });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.errors.network);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const s = t.success;
    return (
      <div className="card scroll-mt-6 p-6 text-center" id="order-confirmation">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">{s.title}</h2>
        <p className="mt-1 text-sm text-muted">{s.thanks}</p>
        <p className="mt-4 text-sm">
          <span className="text-muted">{s.order} </span>
          <span className="font-bold" dir="ltr">#{success.orderNumber}</span>
        </p>
        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-start text-sm">
          <p className="font-semibold">{product.name}</p>
          {variant && (
            <p className="text-muted">
              {s.color} : {t.colors[variant.id] ?? variant.name}
            </p>
          )}
          <p className="text-muted">
            {s.quantity} : {quantity}
          </p>
          <p className="text-muted">
            {s.delivery} ({success.deliveryType === "home" ? t.home.title : t.stopdesk.title}) :{" "}
            {formatDZD(success.totals.deliveryPrice, lang)}
          </p>
          <p className="mt-2 text-base font-extrabold">
            {s.total} : {formatDZD(success.totals.total, lang)}
          </p>
        </div>
        <p className="mt-4 text-sm text-muted">{s.contact}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate id="order-form" className="card scroll-mt-6 p-5 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight">{t.orderTitle}</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="customerName" className="label">
            {t.fullName}
          </label>
          <input
            id="customerName"
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            autoComplete="name"
            required
            minLength={3}
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            {t.phone}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="0550 12 34 56"
            className="input text-left rtl:text-right"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>

        <div>
          <span className="label">{t.wilaya}</span>
          <WilayaSelect value={wilayaCode} onChange={onWilayaChange} disabledCodes={disabledCodes} />
        </div>

        <div>
          <span className="label">{t.delivery}</span>
          <div className="mt-1.5">
            <DeliverySelector value={deliveryType} onChange={setDeliveryType} prices={methodPrices} />
          </div>
          {methodPrices && methodPrices.home !== null && methodPrices.stopdesk === null && (
            <p className="mt-2 text-xs text-muted">{t.onlyHomeNote}</p>
          )}
          {methodPrices && methodPrices.home === null && methodPrices.stopdesk !== null && (
            <p className="mt-2 text-xs text-muted">{t.onlyStopdeskNote}</p>
          )}
        </div>

        {/*
          Commune input removed for "home" delivery.
          Address input commented out below — re-enable by uncommenting if needed.
          Stopdesk input removed entirely.
        */}
        {deliveryType === "home" && (
          <>
            {/*
            <div>
              <label htmlFor="commune" className="label">
                Commune
              </label>
              <input
                id="commune"
                className="input"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                required
              />
            </div>
            */}
            {/*
            <div>
              <label htmlFor="address" className="label">
                Adresse
              </label>
              <input
                id="address"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rue, immeuble, point de repère…"
                required
              />
            </div>
            */}
          </>
        )}

        {/* Honeypot: invisible to humans, bots fill it. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <div className="space-y-2 border-t border-border pt-4 text-sm" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="text-muted">
              {t.summaryProduct}
              {quantity > 1 ? " × " + quantity : ""}
            </span>
            <span className="font-semibold">{formatDZD(subtotal, lang)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">{t.summaryDelivery}</span>
            {deliveryPrice !== null ? (
              <span className="font-semibold">{formatDZD(deliveryPrice, lang)}</span>
            ) : (
              <span className="text-xs text-muted">
                {wilayaCode ? t.unavailable : t.pickWilaya}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold">{t.summaryTotal}</span>
            <span className="text-xl font-extrabold">
              {totals ? formatDZD(totals.total, lang) : "—"}
            </span>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted">{t.payOnReceipt}</p>

        {!rates && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.errors.ratesUnavailable}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button id="commander-submit" type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}
