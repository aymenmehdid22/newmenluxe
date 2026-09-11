"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import type { Product, ProductImage } from "@/types/product";
import ProductGallery from "./ProductGallery";
import ColorSelector from "./ColorSelector";
import QuantitySelector from "./QuantitySelector";
import OrderForm from "./OrderForm";
import StickyCTA from "./StickyCTA";
import { formatDZD } from "@/lib/format";
import { trackViewContent } from "@/lib/meta";

function getVariantImages(product: Product, variantId: string | undefined): ProductImage[] {
  if (variantId) {
    const variant = product.variants?.find((v) => v.id === variantId);
    const byVariantId = product.images.filter((img) => img.variantId === variantId);
    if (byVariantId.length > 0) return byVariantId;
    if (variant && variant.images.length > 0) {
      const byId = product.images.filter((img) => variant.images.includes(img.id));
      if (byId.length > 0) return byId;
    }
  }
  const generic = product.images.filter((img) => !img.variantId);
  return generic.length > 0 ? generic : product.images;
}

export default function ProductOrderClient({ product }: { product: Product }) {
  const availableVariants = product.variants?.filter((v) => v.available) ?? [];
  const [variantId, setVariantId] = useState<string | undefined>(availableVariants[0]?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants?.find((v) => v.id === variantId);
  const images = useMemo(
    () => getVariantImages(product, variantId),
    [product, variantId]
  );

  useEffect(() => {
    trackViewContent({
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: product.currency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 md:gap-12">
        <div className="self-start md:sticky md:top-6">
          <ProductGallery
            images={images.length > 0 ? images : product.images}
            productName={product.name}
          />
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            {typeof product.rating === "number" && (
              <div className="mt-1.5 flex items-center gap-0.5" aria-label={product.rating + " sur 5"}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      "h-4 w-4 " +
                      (i < Math.round(product.rating!) ? "fill-amber-400 text-amber-400" : "text-border")
                    }
                  />
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight">
                {formatDZD(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-muted line-through">
                  {formatDZD(product.oldPrice)}
                </span>
              )}
            </div>
            {product.oldPrice && (
              <p className="mt-1 text-sm font-semibold text-green-700">
                Économisez {formatDZD(product.oldPrice - product.price)}
              </p>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <ColorSelector
              variants={product.variants}
              selectedId={variantId}
              onSelect={setVariantId}
            />
          )}

          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={product.stock ?? 10}
          />

          {product.benefits && product.benefits.length > 0 && (
            <ul className="space-y-2 rounded-2xl border border-border bg-white p-4">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-[#333]">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {product.description && (
            <details className="rounded-2xl border border-border bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold">Description</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
            </details>
          )}

          <OrderForm product={product} variant={variant} quantity={quantity} />
        </div>
      </div>

      <StickyCTA price={product.price} quantity={quantity} />
    </>
  );
}
