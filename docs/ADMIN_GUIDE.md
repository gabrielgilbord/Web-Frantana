# Guía del administrador — Frantana

## Acceso

1. Ir a `/admin/login`
2. Usar `ADMIN_EMAIL` / `ADMIN_PASSWORD` (o hash) definidos en variables de entorno
3. La sesión usa cookie httpOnly firmada (`ADMIN_SESSION_SECRET`)

No compartas credenciales ni subas `.env.local` al repositorio.

## Módulos

### Conciertos (`/admin/conciertos`)
- Crear, editar, publicar, despublicar y eliminar
- Campos: título, fecha, hora, ciudad, recinto, estado de entradas, URL, notas
- Solo los publicados aparecen en `/conciertos`

### Contenido (`/admin/contenido`)
- Subtítulo del hero
- Textos de home / sobre / música
- Embed y URL de Spotify
- Email, teléfono y redes
- Tras guardar, previsualiza la web pública

### Galería (`/admin/galeria`)
- Subida de JPEG/PNG/WebP/AVIF (máx. 8 MB)
- Publicar/ocultar/eliminar
- Archivos en `public/media/uploads/`

### Catálogo (`/admin/tienda`)
- Productos, variantes, precio, stock y categorías
- **No aparece en la web pública** mientras `SHOP_ENABLED=false`

### Ajustes
- Estado del flag de tienda y checklist Stripe/legal

## Supabase (opcional)

Cuando configures un proyecto Supabase:

1. Crea el proyecto y copia URL + anon key a `.env.local`
2. Ejecuta `supabase/migrations/001_initial.sql`
3. Crea el bucket `media` y verifica políticas RLS
4. Migra datos desde `src/data/site.json` (proceso manual o script futuro)
5. Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
