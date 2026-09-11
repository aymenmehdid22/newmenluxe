import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/analytics/MetaPixel";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "COD Store", template: "%s" },
  description: "Commandez en ligne, payez à la livraison. Livraison 58 wilayas.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.variable + " font-sans"}>
        {children}
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
      </body>
    </html>
  );
}
