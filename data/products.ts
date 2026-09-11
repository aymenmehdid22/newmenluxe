import type { Product, ProductImage } from "@/types/product";

// ---------------------------------------------------------------------------
// ADDING A PRODUCT = editing this file only. Drop images in
// public/images/products/<slug>/ and list them below. One engine drives all
// product pages (app/[product]/page.tsx).
// ---------------------------------------------------------------------------

const BASE = "/images/products/paris-vintage-cap";

function variantImages(variantId: string, label: string): ProductImage[] {
  return [1, 2].map((n) => ({
    id: variantId + "-" + n,
    url: BASE + "/" + variantId + "-" + n + ".webp",
    alt: label + " — Paris Vintage Cap (vue " + n + ")",
    variantId,
  }));
}

export const PRODUCTS: Product[] = [
  {
    id: "paris-vintage-cap",
    name: "PARIS VINTAGE CAP",
    slug: "paris-vintage-cap",
    description:
      "Casquette vintage brodée « PARIS ». Coton premium, coupe ajustable, taille universelle. Un style intemporel qui va avec tout.",
    price: 1900,
    oldPrice: 2500,
    currency: "DZD",
    rating: 5,
    images: [
      ...variantImages("noir", "Noir"),
      ...variantImages("bleu", "Bleu"),
      ...variantImages("rouge", "Rouge"),
      ...variantImages("vert", "Vert"),
      ...variantImages("beige", "Beige"),
      ...variantImages("jaune", "Jaune"),
    ],
    variants: [
      { id: "noir", name: "Noir", color: "#161616", images: [], available: true },
      { id: "bleu", name: "Bleu", color: "#2b4acb", images: [], available: true },
      { id: "rouge", name: "Rouge", color: "#c0392b", images: [], available: true },
      { id: "vert", name: "Vert", color: "#2f9e44", images: [], available: true },
      { id: "beige", name: "Beige", color: "#d9cbb2", images: [], available: true },
      { id: "jaune", name: "Jaune", color: "#f2c94c", images: [], available: true },
    ],
    benefits: [
      "Livraison 58 wilayas",
      "Paiement à la livraison",
      "À domicile ou Stopdesk",
    ],
    deliveryAvailable: true,
    stock: 10,
  },

  // ---- Example: add more products below, e.g. ----
  // {
  //   id: "perfume-x",
  //   name: "PERFUME X",
  //   slug: "perfume-x",
  //   price: 2500,
  //   currency: "DZD",
  //   images: [{ id: "p1", url: "/images/products/perfume-x/1.webp", alt: "Perfume X" }],
  //   deliveryAvailable: true,
  // },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
