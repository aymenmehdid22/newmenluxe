export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  variantId?: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  color?: string; // hex color used for the swatch
  images: string[]; // optional list of ProductImage ids (variantId on images is preferred)
  available: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  oldPrice?: number;
  currency: "DZD";
  rating?: number; // 0–5, displayed only when defined
  images: ProductImage[];
  variants?: ProductVariant[];
  benefits?: string[];
  deliveryAvailable: boolean;
  stock?: number;
};
