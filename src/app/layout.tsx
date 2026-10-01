import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartMiniModal } from "@/components/shop/CartMiniModal";
import { buildMetadata, musicGroupJsonLd } from "@/lib/seo/metadata";
import { getContent } from "@/lib/content/store";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  const jsonLd = musicGroupJsonLd({
    spotifyUrl: content.spotifyArtistUrl ?? content.social.spotify,
    social: [
      content.social.instagram,
      content.social.facebook,
      content.social.spotify ?? content.spotifyArtistUrl,
      content.social.youtube,
      content.social.tiktok,
      content.social.appleMusic,
    ],
  });

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${outfit.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <div id="fr-portal-root" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <SiteHeader />
          <CartMiniModal />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <SiteFooter content={content} />
        </CartProvider>
      </body>
    </html>
  );
}
