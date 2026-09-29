# Resultados de pruebas — Frantana

Fecha: 2026-09-29

## Automatizadas

| Suite | Resultado |
|-------|-----------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass (Next.js 16.3.6) |
| `npx playwright test` | **18/18 pass** (desktop 1440, tablet 768, mobile 390) |

### Cobertura E2E

- Home con brand FRANTANA + CTAs
- Rutas públicas `/sobre` `/musica` `/conciertos` `/galeria` `/contacto`
- Tienda `/tienda` redirige y no aparece en nav
- Admin no enlazado en header público
- API `/api/concerts` → 401 sin sesión
- Login admin + crear/publicar concierto + visible en `/conciertos`

## Manual / visual

Pendiente de captura con navegador (hero desktop/móvil) en esta entrega; se adjunta evidencia walkthrough si el entorno lo permite.

## Notas

- No se desplegó a producción.
- `SHOP_ENABLED=false` verificado.
- Login cookie corregido (payload base64url; el email con `.` rompía el split anterior).
