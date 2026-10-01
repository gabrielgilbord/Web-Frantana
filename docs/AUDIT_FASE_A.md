# Design — FRANTANA Experience

<!-- impeccable:design-schema 1 · scroll-craft page grammar · 2026-10-01 -->

## Status

**Fase A (auditoría):** completa.  
**Fase B (dirección):** este documento.  
**Fase C+:** pendiente — no implementar hasta confirmación implícita del brief (siguiente paso: HeroExperience).

## Surface mode

**Persuade + Experience.** No es un documento con secciones: es un recorrido audiovisual. El visitante atraviesa capítulos; el scroll es timeline.

## Brand truth (no inventar)

- Cantante y compositor canario (Gran Canaria)
- Directo, show, música popular del archipiélago
- Contacto: Frantanaoriginal@gmail.com · Instagram @frantana
- Fuentes fijas: **Cormorant Garamond** (marca/display) · **Outfit** (UI/cuerpo)

## Anti-reference (lo que hay hoy)

Hero = vídeo + título + 2 CTAs (plantilla).  
Home = peinado de bloques texto/imagen + Reveal fade/blur repetido.  
Motion = Framer `whileInView` genérico; sin scrub, sin pin, sin GSAP.  
Vídeo hero = **8s** loop costa (Pexels) — no apto para scrub de timeline.  
Fotos IG = thumbs ~500px, tono casual (bathrobe/selfies) vs. ambition LIVE/SHOW.  
Sin gsap en package.json (solo skill `gsap` documental + Framer Motion).

## Page grammar (scroll-craft)

**Gramática elegida: plano secuencia editorial + capítulos con device distinto.**

No continuous camera chain (Scroll-World off por defecto — coste + no hay cadena de clips).  
Device kit (mínimo 4, nunca el mismo dos veces seguidas):

1. **Dimensional hero** — planos independientes (vídeo / tipografía / atmósfera / UI)
2. **Pinned stage frame** — un capítulo sticky donde tipografía y media se reencuadran
3. **Horizontal energy strip** — gente/luz/show (scroll horizontal o staggered full-bleed)
4. **Typographic monolith** — frase gigante que escala/clip con scrub
5. **Contact coda** — quiet close, no cards

## Narrative chapters (home)

| Cap | Nombre interno | Emoción | Device |
|-----|----------------|---------|--------|
| 00 | OPENING NIGHT | Inmersión | Dimensional hero |
| 01 | LA FIRMA | Identidad | Tipografía entre planos |
| 02 | EL OFICIO | Origen / Canarias | Editorial split asimétrico |
| 03 | EL DIRECTO | Energía | Full-bleed + overlay tipográfico |
| 04 | LA AGENDA | Próximo show | Lista tipográfica (no cards) |
| 05 | LA PIEL | Galería | Masonry / overlap, no grid 3×N |
| 06 | LA LLAMADA | Contacto | Coda quieta |

Rutas internas (`/sobre`, `/musica`, etc.) heredan tokens y motion language, pero la **experiencia firma** vive en home.

## Signature move

**“Curtain into the night”**

Al primer scroll significativo del hero:

1. El plano de vídeo se **reencuadra** (scale + clip-path), no hace fade out.
2. La tipografía FRANTANA **migra** de posición/escala (firma editorial → marca residual en nav).
3. Una **máscara horizontal** (luz de escenario / cortina) atraviesa el viewport y revela el Capítulo 01.
4. La nav cambia de contraste en el mismo scrub.

Una sola transición memorable > veinte fades.  
Reduced-motion: saltar a estado final del capítulo 01 sin scrub.

## Motion language

- Stack previsto: **GSAP + ScrollTrigger** (añadir dependencia) + Framer solo donde ya aporte UI puntual; centralizar params en `src/lib/motion/tokens.ts`.
- Easing firma: `cubic-bezier(0.16, 1, 0.3, 1)` / GSAP power3/4 out.
- Permitido: scrub, pin, clip-path, scale, translate, mask, blur→sharp (poco), parallax por planos.
- Prohibido como default: opacity 0→1 en cada bloque; mismo reveal en serie; sticky genérico sin reencuadre.
- Vídeo: autoplay muted loop en hero; **no scrub del currentTime** (clip 8s insuficiente). Híbrido: playback + transforms + overlays.

## Color & type

Mantener night stage:

- Night `#0c0b0a` · Stage `#171512` · Mist `#ebe6de` · Fog `#9a948b` · Ember `#c9a66b`
- Display: Cormorant · Body: Outfit
- Sin purple AI, sin cream/terracotta corporativo, sin glass genérico

## Assets — gaps

| Necesidad | Estado | Acción |
|-----------|--------|--------|
| Hero show footage (escenario/público/luces) | Falta (solo costa 8s) | Solicitar master; temporal: reencuadre cinematográfico del clip actual |
| Fotos show hi-res | Falta (thumbs IG) | Pedir exports oficiales; no inventar |
| Spotify / YouTube embeds | null | Pedir URLs |
| Concert dates | vacío | Admin panel |

## Preserve (no romper)

Admin (`/admin/*`), JSON store, auth, SEO, feature flag tienda, APIs content/concerts/gallery.

## Mobile

Composición propia: hero dimensional con tipografía más baja, un CTA primario, scroll indicator mínimo; sin apilar dos CTAs de igual peso; sin recortar desktop.
