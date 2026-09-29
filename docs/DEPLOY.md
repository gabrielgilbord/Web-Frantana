# Despliegue — Frantana (Vercel + frantana.es)

**No desplegar a producción sin confirmación explícita del propietario.**

## Variables

Copia `.env.example` → variables de Vercel. Separa:

| Pública | Secreta |
|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `ADMIN_PASSWORD` / `ADMIN_PASSWORD_HASH` |
| `NEXT_PUBLIC_SUPABASE_URL` | `ADMIN_SESSION_SECRET` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_SERVICE_ROLE_KEY` (solo server) |
| `NEXT_PUBLIC_SHOP_ENABLED` | `STRIPE_SECRET_KEY` (futuro) |

`SHOP_ENABLED` / `NEXT_PUBLIC_SHOP_ENABLED` deben permanecer `false` hasta completar `docs/SHOP_ACTIVATION.md`.

## Vercel

1. Importar el repositorio en Vercel
2. Framework preset: Next.js
3. Configurar variables de entorno
4. Deploy preview primero; producción solo con autorización

## DNS para frantana.es

Cuando el dominio esté disponible:

1. En el registrador, apuntar:
   - `A` / `ALIAS` / `CNAME` según indique Vercel para el apex
   - `CNAME www` → `cname.vercel-dns.com` (o el valor actual de Vercel)
2. Añadir el dominio en Vercel → Domains
3. SSL/TLS lo gestiona Vercel (Let's Encrypt) automáticamente tras propagación DNS
4. Actualizar `NEXT_PUBLIC_SITE_URL=https://frantana.es`

## Supabase

- Plan free: límites de DB, Storage y Auth; suficiente para MVP editorial
- Revisar cuotas de Storage si se suben muchas fotos HD
- Activar Auth solo para el usuario administrador

## Costes orientativos (free tiers)

- Vercel Hobby: previews + tráfico limitado
- Supabase Free: proyecto pausable por inactividad
- Pexels assets: sin coste (licencia Pexels)
- Dominio frantana.es: coste anual del registrador (no comprar desde este entorno)
