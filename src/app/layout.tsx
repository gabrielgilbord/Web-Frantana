import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartMiniModal } from "@/components/shop/CartMiniModal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  musicGroupJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "@/lib/seo/metadata";
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
  const headerList = await headers();
  const initialPathname = headerList.get("x-pathname") ?? "";
  const content = await getContent();
  const graph = [
    websiteJsonLd(),
    musicGroupJsonLd({
      description:
        content.seoDescription ||
        (content.aboutBody ? content.aboutBody.slice(0, 280) : undefined),
      spotifyUrl: content.spotifyArtistUrl ?? content.social.spotify,
      email: content.contactEmail,
      phone: content.contactPhone,
      social: [
        content.social.instagram,
        content.social.facebook,
        content.social.spotify ?? content.spotifyArtistUrl,
        content.social.youtube,
        content.social.tiktok,
        content.social.appleMusic,
      ],
    }),
    personJsonLd(content),
  ];

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
        <JsonLd data={graph} />
        <CartProvider>
          <SiteHeader initialPathname={initialPathname} />
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
