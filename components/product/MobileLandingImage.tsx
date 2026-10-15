import Image from "next/image";
import type { MobileLandingImage as MobileImage } from "@/lib/landing-settings";

// Mobile-only conversion image, managed from /admin/landing.
// - `md:hidden` => hidden from 768px up (tablet/desktop).
// - Lazy (no `priority`): a display:none image is never downloaded on desktop,
//   and on mobile it doesn't compete with the product gallery (LCP).
// - Real width/height from upload => no layout shift; h-auto => never distorted.
export default function MobileLandingImage({
  image,
  alt,
}: {
  image: MobileImage;
  alt: string;
}) {
  return (
    <div className="-mx-4 overflow-hidden md:hidden">
      <Image
        src={image.url}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes="100vw"
        quality={80}
        className="block h-auto w-full max-w-full"
      />
    </div>
  );
}
