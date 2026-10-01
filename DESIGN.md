# Design — FRANTANA

<!-- impeccable:design-schema 1 · scroll-craft · Fase B 2026-10-01 -->

> Auditoría visual: `docs/AUDIT_FASE_A.md` · Screenshots: `.playwright-cli/audit/`

## Status

Fase A completa. Fase B completa. **Fase C implementada** (Hero + nav + curtain) — pendiente validación humana antes de Fase D. Screens: `.playwright-cli/fase-c/`.

## Surface mode

**Persuade + Experience.** Scroll = timeline. Capítulos, no “secciones de landing”.

## Brand (fijo)

- Display: **Cormorant Garamond** — FRANTANA y titulares
- Body/UI: **Outfit**
- Voz: canario, directo, show, oficio — sin slogans AI
- Hechos: Gran Canaria · cantante/compositor · @frantana · Frantanaoriginal@gmail.com

## Art direction

**Night stage cinematic.** LIVE / ENERGY / SHOW / NIGHT / MUSIC / MOVEMENT / PEOPLE / LIGHT.

Anti-reference: hero vídeo+copy+CTA, grids texto/imagen, Reveal fade repetido, SaaS cards, purple gradients, glass genérico, cream/terracotta.

## Signature move — “Curtain into the night”

Primer scroll del hero: el vídeo **se reencuadra** (scale + clip-path), FRANTANA **migra** tipográficamente hacia la nav, una **máscara de luz/cortina** atraviesa el viewport y revela el capítulo siguiente. Una transición memorable; no veinte fades.

Reduced-motion → estado final sin scrub.

## Page grammar

1. Dimensional hero (planos: vídeo / tipo / atmósfera / UI)  
2. Pinned stage frame (reencuadre tipográfico)  
3. Full-bleed directo / energía  
4. Monolito tipográfico  
5. Agenda tipográfica (filas, no cards)  
6. Galería overlap  
7. Coda contacto  

Nunca el mismo device dos veces seguidas.

## Home chapters

| Cap | Nombre | Emoción |
|-----|--------|---------|
| 00 | OPENING NIGHT | Inmersión |
| 01 | LA FIRMA | Identidad |
| 02 | EL OFICIO | Origen |
| 03 | EL DIRECTO | Energía |
| 04 | LA AGENDA | Próximo show |
| 05 | LA PIEL | Galería |
| 06 | LA LLAMADA | Contacto |

## Motion tokens (centralizar en impl.)

```
ease: cubic-bezier(0.16, 1, 0.3, 1)
stack: GSAP + ScrollTrigger (añadir) · Framer solo UI puntual
scrub: hero curtain + pin chapters
forbid: opacity-only reveals en serie
video: autoplay muted loop · NO currentTime scrub (clip ~8s)
```

## Palette

| Token | Value |
|-------|-------|
| night | `#0c0b0a` |
| stage | `#171512` |
| mist | `#ebe6de` |
| fog | `#9a948b` |
| ember | `#c9a66b` |

## Nav

Mínima: FRANTANA · links · contacto. Contraste dinámico por escena (sobre vídeo / sobre night). Parte del scrub del curtain.

## Scroll indicator

Línea o trazo mínimo; desaparece/transforma en el primer scrub. Nunca “SCROLL DOWN ↓” gigante.

## Cursor (desktop only)

Opcional y sutil: VIEW / PLAY solo en media interactiva. Off en móvil.

## Assets — límites honestos

- Hero actual: costa Pexels **8s** → híbrido transforms/overlays, no scrub de frames.
- Galería IG: thumbs bajas; pedir masters de show/luces/público.
- Spotify/YouTube/conciertos: pendientes de fuente oficial.
- Scroll-World: instalado pero **no activar** sin budget de clips.

## Preserve

Admin, auth, JSON store, SEO, shop flag, APIs — no romper.

## Mobile

Composición propia (no crop de desktop). Hero espectacular; un CTA primario; tipografía recalibrada en 375 / 390 / 430.
