import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return PRODUCTS.map((p) => ({
    url: SITE_URL + "/" + p.slug,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  }));
}
