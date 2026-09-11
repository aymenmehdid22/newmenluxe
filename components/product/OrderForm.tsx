"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Product, ProductVariant } from "@/types/product";
import WilayaSelect from "./WilayaSelect";
import DeliverySelector from "./DeliverySelector";
import { trackInitiateCheckout, trackLead, sendMetaConversion } from "@/lib/meta";
import { getAttribution } from "@/lib/analytics";
import { formatDZD } from "@/lib/format";

export default function OrderForm({
  product,
  variant,
  quantity,
}: {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [wilayaName, setWilayaName] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "stopdesk">("home");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [stopdesk, setStopdesk] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — invisible to humans
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);

  const total = product.price * quantity;

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
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
          commune: deliveryType === "home" ? commune : undefined,
          address: deliveryType === "home" ? address : undefined,
          stopdesk: deliveryType === "stopdesk" ? stopdesk : undefined,
          website,
          attribution: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      // Lead fires ONLY after the server confirmed the order was created.
      trackLead({
        content_name: product.name,
        content_ids: [product.id],
        value: total,
        currency: product.currency,
      });
      void sendMetaConversion("Lead", {
        value: total,
        currency: product.currency,
        content_name: product.name,
      });
      setSuccess({ orderNumber: data.orderNumber });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card scroll-mt-6 p-6 text-center" id="order-confirmation">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">COMMANDE ENREGISTRÉE</h2>
        <p className="mt-1 text-sm text-muted">Merci pour votre commande.</p>
        <p className="mt-4 text-sm">
          <span className="text-muted">Commande </span>
          <span className="font-bold">#{success.orderNumber}</span>
        </p>
        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-left text-sm">
          <p className="font-semibold">{product.name}</p>
          {variant && <p className="text-muted">Couleur : {variant.name}</p>}
          <p className="text-muted">Quantité : {quantity}</p>
          <p className="mt-2 text-base font-extrabold">Total : {formatDZD(total)}</p>
        </div>
        <p className="mt-4 text-sm text-muted">
          Nous allons vous contacter prochainement pour confirmer votre commande.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} id="order-form" className="card scroll-mt-6 p-5 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight">COMMANDER</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="customerName" className="label">
            Nom complet
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
            Numéro de téléphone
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="0550 12 34 56"
            className="input text-left"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>

        <div>
          <span className="label">Wilaya</span>
          <WilayaSelect
            value={wilayaCode}
            onChange={(code, name) => {
              setWilayaCode(code);
              setWilayaName(name);
            }}
          />
        </div>

        <div>
          <span className="label">Livraison</span>
          <div className="mt-1.5">
            <DeliverySelector value={deliveryType} onChange={setDeliveryType} />
          </div>
        </div>

        {deliveryType === "home" ? (
          <>
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
          </>
        ) : (
          <div>
            <label htmlFor="stopdesk" className="label">
              Stopdesk / agence
            </label>
            <input
              id="stopdesk"
              className="input"
              value={stopdesk}
              onChange={(e) => setStopdesk(e.target.value)}
              placeholder="Nom de l'agence de retrait"
              required
            />
          </div>
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

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted">Total produit</span>
          <span className="text-xl font-extrabold">{formatDZD(total)}</span>
        </div>
        <p className="-mt-2 text-xs text-muted">
          Frais de livraison payables à la réception.
        </p>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button id="commander-submit" type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "ENVOI EN COURS…" : "COMMANDER"}
        </button>
      </div>
    </form>
  );
}
