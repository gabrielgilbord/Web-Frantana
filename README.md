# Web oficial FRANTANA

Sitio oficial del artista **Frantana**: identidad editorial, hero cinematográfico, agenda dinámica y panel de administración.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + design tokens CSS
- Framer Motion (principios GSAP: timelines/stagger/transforms)
- Almacenamiento local JSON (`src/data/site.json`) listo para desarrollo
- Schema + RLS Supabase en `supabase/migrations/` (opcional)
- Feature flag `SHOP_ENABLED=false` (tienda pública oculta)

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
Credenciales por defecto (cambiar en `.env.local`):

- Email: `admin@frantana.es`
- Password: `changeme-frantana-admin`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test:e2e` | Playwright E2E |

## Documentación

- [Assets y licencias](docs/ASSET_SOURCES.md)
- [Guía del administrador](docs/ADMIN_GUIDE.md)
- [Despliegue Vercel / DNS](docs/DEPLOY.md)
- [Activación futura de tienda](docs/SHOP_ACTIVATION.md)
- [Skills utilizadas](docs/SKILLS_USED.md)
- [Checklist de lanzamiento](docs/LAUNCH_CHECKLIST.md)

## Nota artística

Los textos marcados como `[TEXTO PROVISIONAL]` / `[PROVISIONAL]` deben sustituirse con contenido oficial. Las fotografías de archivo **no representan a Frantana**.
