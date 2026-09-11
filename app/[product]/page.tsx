import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import ProductOrderClient from "@/components/product/ProductOrderClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.slug }));
}

export function generateMetadata({ params }: { params: { product: string } }): Metadata {
  const product = getProductBySlug(params.product);
  if (!product) return {};
  const url = SITE_URL + "/" + product.slug;
  const price = product.price.toLocaleString("en-US");
  return {
    title: product.name + " — " + price + " DA | Livraison 58 wilayas",
    description:
      product.description ??
      product.name + " à " + price + " DA. Paiement à la livraison, livraison à domicile ou stopdesk dans les 58 wilayas.",
    alternates: { canonical: url },
    openGraph: {
      title: product.name + " — " + price + " DA",
      description: product.description ?? "Paiement à la livraison — 58 wilayas.",
      url,
      siteName: "COD Store",
      locale: "fr_DZ",
      type: "website",
      images: product.images.length
        ? [{ url: SITE_URL + product.images[0].url, width: 800, height: 800, alt: product.name }]
        : [],
    },
  };
}

export default function ProductPage({ params }: { params: { product: string } }) {
  const product = getProductBySlug(params.product);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => SITE_URL + i.url),
    description: product.description,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "DZD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-16 md:pt-8">
      <ProductOrderClient product={product} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
