import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartMiniModal } from "@/components/shop/CartMiniModal";
import { buildMetadata, musicGroupJsonLd } from "@/lib/seo/metadata";
import { getContent } from "@/lib/content/store";
import "./globals.css";

/** Fuentes empaquetadas: evita fallos intermitentes de next/font/google + Turbopack en Vercel. */
const cormorant = localFont({
  src: "./fonts/cormorant-latin.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const outfit = localFont({
  src: "./fonts/outfit-latin.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-outfit",
  display: "swap",
  adjustFontFallback: "Arial",
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
