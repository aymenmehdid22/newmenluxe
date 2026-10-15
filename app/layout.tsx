import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/analytics/MetaPixel";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// preload:false + unicode-range subset => the Arabic font is only downloaded
// when a page actually shows Arabic characters (nothing extra for French).
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-arabic", display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "COD Store", template: "%s" },
  description: "Commandez en ligne, payez à la livraison. Livraison 58 wilayas.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.variable + " " + cairo.variable + " font-sans"}>
        {children}
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
      </body>
    </html>
  );
}
