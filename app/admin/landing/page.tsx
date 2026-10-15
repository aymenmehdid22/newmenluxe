import { PRODUCTS } from "@/data/products";
import { getLandingSettings } from "@/lib/landing-settings";
import LandingImageManager from "@/components/admin/LandingImageManager";

export const dynamic = "force-dynamic";

export default async function AdminLandingPage() {
  const rows = await Promise.all(
    PRODUCTS.map(async (p) => ({ product: p, settings: await getLandingSettings(p.id) }))
  );

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Image mobile</h1>
        <p className="mt-1 text-sm text-muted">
          Image de présentation affichée uniquement sur mobile (moins de 768 px), au-dessus du
          formulaire de commande. Désactivée, la page mobile reste inchangée.
        </p>
      </div>
      {rows.map(({ product, settings }) => (
        <LandingImageManager
          key={product.id}
          productId={product.id}
          productName={product.name}
          initial={{
            enabled: settings?.mobile_image_enabled ?? false,
            url: settings?.mobile_image_url ?? null,
            width: settings?.mobile_image_width ?? null,
            height: settings?.mobile_image_height ?? null,
          }}
        />
      ))}
    </div>
  );
}
