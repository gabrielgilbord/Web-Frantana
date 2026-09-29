# Skills utilizadas — proyecto Frantana

Fecha: 2026-09-29.

## Descubrimiento

- Skills nativas del entorno Cloud (`~/.cursor/skills-cursor/`): `canvas`, `walkthrough-artifacts`, `env-setup`, `migrate-to-builds`, `subscribe`.
- **No** había skills de frontend design / motion / a11y preinstaladas.
- Se usó el CLI `npx skills` (skills.sh) para buscar e instalar skills compatibles en `.agents/skills/`.

## Skills instaladas y aplicadas

| Skill | Origen | Uso en Frantana |
|-------|--------|-----------------|
| `frontend-design` | `anthropics/skills` | Dirección artística editorial: hero como momento memorable, tipografía deliberada, tokens, evitar estética genérica AI, restraint alrededor del vídeo |
| `design` | `nextlevelbuilder/ui-ux-pro-max-skill` | Sistema de tokens, identidad y routing de trabajo de diseño |
| `gsap` | `mengto/skills` | Principios de motion (stagger, timelines, transforms, cleanup, reduced-motion); implementado con Framer Motion (ya en stack) siguiendo esos patrones |
| `better-accessibility` | `jakubkrehel/skills` | Focus visible, skip link, lightbox teclado, pause de vídeo, labels, reduced-motion |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Criterios de UI/a11y/UX para revisión de interfaces |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | `Promise.all` en páginas, `next/dynamic` para hero, evitar waterfalls |
| `seo-audit` | `anthropics/knowledge-work-plugins` | Metadatos, robots, sitemap, JSON-LD MusicGroup, noindex admin |

## Skills nativas usadas en entrega

| Skill | Uso |
|-------|-----|
| `walkthrough-artifacts` | Evidencia visual (screenshots/vídeo) tras pruebas manuales |
| `subscribe` | Disponible para CI/PR si se necesita espera de eventos |

## No instaladas / fallidas

- `uizze.sh@ui-taste`: el instalador no pudo clonar el repositorio (`repository does not exist` con ese identificador).
- Skills específicas GSAP vs Motion: se priorizó Motion en runtime por dependencia ya instalada; la skill `gsap` guió los patrones de animación.
