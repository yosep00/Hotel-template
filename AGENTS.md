## Objective
- Plantilla white-label de sitio web para hoteles, funcional de punta a punta (reservas públicas, panel admin, DB persistida, Stripe test, GitHub + Vercel auto-deploy). Fase 3 (white-label: nombre + dirección + logo + colores) COMPLETADA. Fase 5 (Pulido: sesión, ES/EN, SEO) COMPLETADA y verificada en Vercel.

## Important Details
- Entrega: instancia white-label por hotel (un repo GitHub, un proyecto Vercel por hotel).
- Supabase Postgres → ref `tllhcgdbyecsnvkapqqh`. **Puerto 5432 bloqueado; usar pooler 6543** (`aws-0-ca-central-1.pooler.supabase.com:6543`, `?pgbouncer=true&connection_limit=1&sslmode=require`).
- **URL Vercel:** `https://hotel-template-theta.vercel.app`.
- Pagos: Stripe test mode (claves test en `.env`/`.env.local`).
- Repo GitHub: `https://github.com/yosep00/Hotel-template`.
- **GitHub PAT `github_pat_11ANEPPBY0...UU` → 401 Bad credentials** (inválido). Los pushes se hacen con git local (credenciales guardadas en Windows): **`C:\Program Files\Git\bin\git.exe`** (NO está en PATH; invocar con ruta completa).
- Admin: `admin@grandoasis.com` / `admin123`.
- Variables CSS en `app/globals.css`: `--primary`, `--accent`, etc. Inyectadas dinámicamente por `HotelBrandingProvider` vía `:root`.
- **Esta versión de Next usa `proxy.js` (NO `middleware.js`)** — middleware deprecado/renombrado a proxy. Matcher de `proxy.js`: SOLO `['/admin', '/admin/:path*']` → protege admin, deja públicos `/api`, `/robots.txt`, `/sitemap.xml`, `/login`, `/register`, estáticos.
- Sesión: cookie `user_session` (JSON `{id, name, email, role}`), httpOnly, maxAge 1 día, set en `/api/auth/login/route.js`.
- `run_sql.mjs` lee token de `process.env.SUPABASE_TOKEN`; excluido del repo vía `.gitignore` (`run_sql.mjs`, `push_repo.mjs`, `.env*`).
- **Exports importantes:** `LanguageProvider` = export DEFAULT (en `components/LanguageProvider.js`); `HotelBrandingProvider` = export DEFAULT (en `components/HotelBranding.js`); `useTranslation`, `useHotelSettings`, `BrandLogo`, `BrandName` = named exports. ⚠️ Error típico: importar `LanguageProvider`/`HotelBrandingProvider` como named → `Element type is invalid: got undefined` en build.
- i18n en `lib/i18n.js`: objeto `dict = { es: {...}, en: {...} }` con claves `nav.*`, `hero.*`, `search.*`, `rooms.*`, `services.*`, `contact.*`, `footer.*`, `auth.*`, `admin.*`, `booking.*`, `amenity.*`, `common.*`. `useTranslation()` devuelve `t(key)`; fallback a la clave si falta. Persistencia: cookie `lang` + `localStorage`.
- Idioma UI: español (default) + inglés.
- **Campos de hero editables** (schema `Hotel`: `heroImage`, `heroTitle`, `heroDescription` añadidos; columnas creadas en Supabase). Expuestos en `/api/settings` (PUBLIC_FIELDS). Editables en `app/admin/settings/page.js` (tipo `logo` para imagen, `text` para título, `textarea` para descripción). Home (`app/page.js`) usa `settings.heroTitle || settings.hotelName || t('hero.heading')`, `settings.heroDescription || t('hero.body')`, y `settings.heroImage` como `backgroundImage` del hero (con overlay oscuro). El nombre del hotel (`hotelName`) es editable y se muestra en el hero por defecto (estilo "como antes").
- Header home: para invitados muestra botón **"Crear Cuenta"** (`/register`, fondo `--primary`) + "Iniciar Sesión" (`/login`).
- **Servicios Esenciales editables**: modelo `Service` (id, name, description, icon, image) + tabla creada en Supabase + 3 sembrados por defecto. API `/api/services` (GET lista, POST crea/edita) y `/api/services/[id]` (GET, DELETE). Admin `/admin/services` (interfaz estilo Habitaciones/Inventario: grid de tarjetas, modal crear/editar con nombre, icono emoji, descripción e imagen, y borrar). Home (`app/page.js`) renderiza los servicios dinámicamente desde `/api/services`. La nav del admin incluye "Servicios" en dashboard/rooms/bookings/settings.
- **Panel de Analíticas** (`app/admin/analytics/page.js`, commit `a9e4623`): página client-side (sin backend nuevo) que hace fetch a `/api/bookings` y `/api/rooms` y calcula: KPIs (ingresos confirmados, valor medio por reserva, reservas confirmadas, tasa de cancelación, pagos pendientes), gráfico de barras de ingresos por mes (últimos 6, con CSS puro — NO hay librería de charts instalada), reservas por estado (barras de progreso) y habitaciones top por ingresos. i18n claves `admin.analytics*`/`admin.avgBooking`/`admin.cancelRate`/etc (ES/EN). Nav "📈 Analíticas" añadida en TODAS las páginas admin (dashboard/analytics/bookings/rooms/services/settings). Protegida por `proxy.js` (verificado 307 → `/login?redirect=%2Fadmin%2Fanalytics`).
- **Reset de la DEMO cada 24h (commit `0ef93b4`)**: la instancia de prueba (`https://hotel-template-theta.vercel.app`) se reinicia a estado de fábrica (borra `User`, `Booking`, `Room`, `Service`, `Hotel` y resembra defaults: hotel, 3 habitaciones, 3 servicios, admin `admin@grandoasis.com`/`admin123`). Mecanismo: `.github/workflows/reset-demo.yml` (GitHub Actions, cron diario 06:00 UTC + `workflow_dispatch` manual) ejecuta `scripts/reset_demo.mjs`. **Requiere el secreto de repo `DEMO_DATABASE_URL`** = el `DATABASE_URL` (pooler 6543) que usa la demo en Vercel ( Settings → Secrets → Actions). Fuente única de seed: `scripts/seed_data.mjs` (usado también por `prisma/seed.js` y `scripts/provision_client.mjs`).
- **Provisioning por cliente (commit `0ef93b4`)**: `scripts/provision_client.mjs` aplica el esquema (`prisma db push`) y sembra datos iniciales en la base del cliente (apuntando `DATABASE_URL` a SU Supabase), e imprime las env vars a pegar en Vercel (`DATABASE_URL`, `STRIPE_SECRET_KEY` vacío=mock, `NEXT_PUBLIC_SITE_URL`). Plantilla de entrega llave en mano: `docs/HANDOFF_TEMPLATE.md`. NO crea las cuentas (Supabase/GitHub/Vercel/dominio) — eso es manual/on-call.

## Work State
### Completed
- Fase 0-4: Prisma + bcryptjs, pooler 6543, validación server bookings, Stripe test, repo GitHub + CI + Vercel deploy, `/api/settings` + `/admin/settings`.
- **Fase 3 COMPLETA** (verificada en vivo): schema +`logoUrl`/`primaryColor`/`accentColor`; `/api/settings` expone campos públicos; `components/HotelBranding.js` (provider vars CSS + `BrandLogo`/`BrandName`); `app/layout.js` envuelve en `HotelBrandingProvider`; marca hardcodeada reemplazada en home/login/register/admin/stripe-mock.
- **Fase 5 COMPLETA** (build + push + deploy verificado):
  - **Sesión**: `proxy.js` → `/admin` redirige 307 a `/login?redirect=...` si `user_session.role !== 'admin'`. Verificado en vivo (HTTP 307 → `/login?redirect=%2Fadmin`).
  - **SEO**: `app/sitemap.js`, `app/robots.js` (Allow `/`, Disallow `/admin` y `/api`, + Sitemap), `app/layout.js` metadata (metadataBase, OG, Twitter, canonical, alternates ES/EN), JSON-LD Hotel en `app/page.js`. Verificado: `/robots.txt` y `/sitemap.xml` → HTTP 200.
  - **i18n**: `lib/i18n.js` (ES/EN), `components/LanguageProvider.js`, `components/LanguageSwitcher.js` (ES/EN, persiste cookie+localStorage). Traducidos: `app/page.js` (nav, hero, search, rooms, services, contact, footer, modal + JSON-LD), `app/login/page.js`, `app/register/page.js`, y todo admin (`admin/page.js` dashboard, `admin/rooms/page.js`, `admin/bookings/page.js`, `admin/settings/page.js`) con `LanguageSwitcher` en cada topbar/sidebar.
  - **Build**: `npm run build` pasa (0 errores). Commits push a `main` (último `56b4236`). Vercel deploy OK (verificado `/api/settings` devuelve `logoUrl`/`primaryColor`/`accentColor`/`heroImage`/`heroTitle`/`heroDescription`).
  - **Cambios post-Fase 5 (commit `56b4236`)**:
    - Hero editable: schema + columnas Supabase (`heroImage`, `heroTitle`, `heroDescription`); `/api/settings` las expone; `admin/settings/page.js` las edita; `app/page.js` las usa (título por defecto = `hotelName`, editable). Nombre del hotel editable en panel y se muestra en hero "como antes".
    - Header home: botón **"Crear Cuenta"** (`/register`) para invitados + "Iniciar Sesión".
    - **Fix pago "atrás"**: `stripe-mock/page.js` tiene botón **"← Volver"** (Link a `/`); `app/api/checkout/route.js` `cancel_url` corregido de `/rooms/[id]` (ruta inexistente → 404) a `/?cancelled=true`.
    - **Servicios Esenciales editables (commit `8805066`)**: modelo `Service` + tabla Supabase + 3 sembrados; API `/api/services` y `/api/services/[id]`; admin `/admin/services` (estilo Inventario) con nav "Servicios" en todas las páginas admin; home renderiza servicios dinámicamente. Verificado `/api/services` devuelve los 3 servicios.
    - **Panel de Analíticas (commit `a9e4623`)**: `/admin/analytics` con KPIs (ingresos confirmados, valor medio, reservas confirmadas, tasa cancelación, pagos pendientes), gráfico ingresos por mes (barras CSS), reservas por estado (barras progreso) y top habitaciones por ingresos. Nav "📈 Analíticas" en todas las páginas admin; i18n ES/EN. Protegida por proxy (verificado 307 → login).
    - **Reset demo 24h + provisioning cliente (commit `0ef93b4`)**: `.github/workflows/reset-demo.yml` (cron diario + manual) ejecuta `scripts/reset_demo.mjs` → borra `User`/`Booking`/`Room`/`Service`/`Hotel` y resembra defaults (hotel, 3 hab, 3 servicios, admin). Requiere secreto repo `DEMO_DATABASE_URL`. Seed único en `scripts/seed_data.mjs` (reusa `prisma/seed.js`). `scripts/provision_client.mjs` inicializa la base de un cliente nuevo y lista env vars para Vercel. `docs/HANDOFF_TEMPLATE.md` = plantilla de entrega. Build OK.

### Active
- (ninguno en curso)

### Blocked
- (none)

## Next Move
1. (Manual, requerido para el reset 24h) Añadir el secreto de repo `DEMO_DATABASE_URL` en GitHub (Settings → Secrets → Actions) con el `DATABASE_URL` (pooler 6543) que usa la demo en Vercel. Luego disparar el workflow `Reset demo (24h)` manualmente (`workflow_dispatch`) para validar.
2. (Opcional, manual) Verificar en navegador: `LanguageSwitcher` ES/EN en home/admin, persistencia; subir hero en `/admin/settings`; CRUD servicios y panel Analytics con datos reales.
3. (Opcional) Traducir textos restantes menores (emails de confirmación si existen, placeholders).
4. (Opcional) Siguiente fase sugerida: multi-hotel (un repo + deploy + DB por cliente) o exportar datos (CSV).

## Relevant Files
- `proxy.js`: protección `/admin` (sesión). Matcher solo `/admin`, `/admin/:path*`.
- `lib/i18n.js`: diccionarios ES/EN (todas las claves).
- `components/LanguageProvider.js` (default export `LanguageProvider`, named `useTranslation`), `components/LanguageSwitcher.js` (default export).
- `components/HotelBranding.js`: `HotelBrandingProvider` (default), `useHotelSettings`, `BrandLogo`, `BrandName`.
- `app/layout.js`: metadata SEO + `<LanguageProvider><HotelBrandingProvider>`. ⚠️ importa ambos como default.
- `app/sitemap.js`, `app/robots.js`: SEO.
- `app/page.js`: home traducida + JSON-LD (contiene el modal de reserva con `t('booking.pay')`).
- `app/login/page.js`, `app/register/page.js`: traducidos.
- `app/admin/page.js`, `app/admin/rooms/page.js`, `app/admin/bookings/page.js`, `app/admin/settings/page.js`: traducidos + `LanguageSwitcher`.
- `app/admin/analytics/page.js`: nuevo panel de analíticas (KPIs + gráficos CSS).
- `scripts/seed_data.mjs`: fuente única de seed (Hotel + Rooms + Services + admin).
- `scripts/reset_demo.mjs`: borra y resembra la demo (cada 24h vía Actions).
- `scripts/provision_client.mjs`: inicializa la base de un cliente nuevo.
- `.github/workflows/reset-demo.yml`: cron diario + manual para reset de demo.
- `docs/HANDOFF_TEMPLATE.md`: plantilla de entrega llave en mano al cliente.
- `app/globals.css`: vars `--primary`/`--accent`.
- `.gitignore`: excluye `run_sql.mjs`, `push_repo.mjs`, `.env*`.
- `https://hotel-template-theta.vercel.app`: deploy real (verificado).
