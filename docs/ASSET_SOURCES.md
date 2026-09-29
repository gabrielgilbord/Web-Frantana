# Fuentes de assets — FRANTANA

Fecha de consulta: **2026-09-29**.

Todos los recursos multimedia listados se descargaron desde Pexels (CDN verificado HTTP 200) y se almacenan en `public/media/`. Licencia: [Pexels License](https://www.pexels.com/license/) — uso gratuito para proyectos personales y comerciales; no se requiere atribución (recomendada). **Ninguna persona de stock se presenta como Frantana**; son placeholders editoriales atmosféricos.

## Tipografías

| Fuente | Uso | Licencia | Origen |
|--------|-----|----------|--------|
| Cormorant Garamond | Titulares editoriales | SIL Open Font License 1.1 | [Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond) |
| Manrope | Texto UI / cuerpo | SIL Open Font License 1.1 | [Google Fonts](https://fonts.google.com/specimen/Manrope) |

## Vídeo hero

| Archivo local | Origen | Autor | ID | Licencia | Notas |
|---------------|--------|-------|----|----------|-------|
| `public/media/hero/hero-cinematic.mp4` | [Pexels — pianist live audience](https://www.pexels.com/video/a-pianist-playing-in-front-of-a-live-audience-8513524/) | Big Bag Films | 8513524 | Pexels License | HD 1920×1080, 25 fps. Temática musical cinematográfica (piano en vivo). CDN: `videos.pexels.com/video-files/8513524/8513524-hd_1920_1080_25fps.mp4` (HTTP 200, 2026-09-29). |
| `public/media/hero/hero-poster.jpg` | Frame extraído del vídeo anterior vía ffmpeg | Derivado del asset anterior | — | Misma licencia | Poster horizontal 1920×1080. |

## Fotografía editorial / galería

| Archivo local | Origen | Autor (página Pexels) | ID | Licencia | Uso |
|---------------|--------|----------------------|----|----------|-----|
| `gallery/stage-lights-01.jpg` | [pexels.com/photo/13872114](https://www.pexels.com/photo/illuminated-concert-stage-13872114/) | Matheus Bertelli | 13872114 | Pexels | Escenario iluminado |
| `gallery/festival-crowd-02.jpg` | [pexels.com/photo/17570361](https://www.pexels.com/photo/view-of-audience-and-illuminated-stage-at-a-concert-during-a-festival-17570361/) | (Pexels) | 17570361 | Pexels | Público / festival |
| `gallery/band-silhouette-03.jpg` | [pexels.com/photo/15583331](https://www.pexels.com/photo/lights-over-band-on-stage-on-concert-15583331/) | Harimadhav S | 15583331 | Pexels | Silueta escenario |
| `gallery/stage-silhouette-04.jpg` | [pexels.com/photo/894557](https://www.pexels.com/photo/silhouette-photo-of-music-band-playing-on-stage-894557/) | Josh Sorenson | 894557 | Pexels | Silueta banda |
| `gallery/bw-stage-05.jpg` | [pexels.com/photo/8130650](https://www.pexels.com/photo/grayscale-photo-of-band-performing-on-stage-8130650/) | Akshar Dave | 8130650 | Pexels | Escenario B/N |
| `gallery/concert-smoke-06.jpg` | [pexels.com/photo/1763075](https://www.pexels.com/photo/1763075/) | (Pexels) | 1763075 | Pexels | Concierto / humo |
| `gallery/crowd-lights-07.jpg` | [pexels.com/photo/1190297](https://www.pexels.com/photo/1190297/) | (Pexels) | 1190297 | Pexels | Público / luces |
| `gallery/guitar-stage-08.jpg` | [pexels.com/photo/210922](https://www.pexels.com/photo/210922/) | (Pexels) | 210922 | Pexels | Guitarra / escenario |
| `editorial/piano-keys.jpg` | [pexels.com/photo/164821](https://www.pexels.com/photo/164821/) | (Pexels) | 164821 | Pexels | Teclas de piano |
| `editorial/crowd-hands.jpg` | [pexels.com/photo/1105666](https://www.pexels.com/photo/1105666/) | (Pexels) | 1105666 | Pexels | Manos en concierto |
| `editorial/microphone.jpg` | [pexels.com/photo/2747446](https://www.pexels.com/photo/2747446/) | (Pexels) | 2747446 | Pexels | Micrófono |
| `editorial/studio-headphones.jpg` | [pexels.com/photo/995301](https://www.pexels.com/photo/995301/) | (Pexels) | 995301 | Pexels | Auriculares estudio |
| `editorial/vinyl-close.jpg` | [pexels.com/photo/1626481](https://www.pexels.com/photo/1626481/) | (Pexels) | 1626481 | Pexels | Vinilo |

## Verificación

- CDN de vídeo e imágenes: respuestas HTTP **200** el 2026-09-29.
- Página HTML de licencia Pexels protegida por Cloudflare en el entorno de build (403 challenge); la licencia se documenta por la URL oficial conocida y la descarga directa exitosa desde el CDN de Pexels.
- Asset no verificado descartado: `167404` (HTTP 404) — no se usó.

## Sustitución futura

Las fotografías reales del artista Frantana deben reemplazar estos placeholders editoriales. No usar rostros de stock como identidad del artista.
