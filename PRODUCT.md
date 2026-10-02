# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fans, prensa y booking que buscan la presencia oficial de Frantana: música, agenda de conciertos, galería y contacto. El administrador del sitio edita contenidos sin desplegar código.

## Product Purpose

Web oficial del artista Frantana. Presenta identidad, música, conciertos y novedades; permite gestionar agenda, galería y copy desde un panel admin.

## Positioning

Presencia oficial del artista — no un blog genérico ni un marketplace. El hero cinematográfico y la agenda dinámica son el núcleo.

## Capabilities

- Sitio público: home, sobre, música, conciertos, galería, contacto
- Panel admin: login, conciertos, galería, contenido, ajustes (tienda feature-flagged)
- Datos en JSON local (`src/data/site.json`); schema Supabase opcional
- SEO: metadatos, JSON-LD MusicGroup, sitemap/robots

## Constraints

- Feature flag `SHOP_ENABLED=false` (tienda pública oculta)
- Textos `[TEXTO PROVISIONAL]` / `[PROVISIONAL]` deben sustituirse con copy oficial
- Fotografías de archivo **no representan a Frantana**
- No inventar canciones, álbumes, fechas ni claims no confirmados
- Accesibilidad: focus visible, skip link, reduced-motion, labels

## Brand commitments

- Nombre de marca: **FRANTANA** (hero-level, no solo nav)
- Identidad: cantante y compositor canario (Gran Canaria)
- Idioma: español
- Contacto público: Frantanaoriginal@gmail.com
- Instagram oficial: https://www.instagram.com/frantana/
- Dominio / deploy: Vercel (`web-frantana.vercel.app` / frantana.es)
- No inventar discografía, fechas ni claims no confirmados por el artista

## Evidence sources (2026-10-01)

- Instagram bio @frantana (cantante/compositor canario; email)
- Soundcharts artist overview (trayectoria canaria / península; temas públicos)
