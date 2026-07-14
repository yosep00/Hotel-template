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

### Active
- (ninguno en curso)

### Blocked
- (none)

## Next Move
1. (Opcional, manual) Verificar en navegador que el `LanguageSwitcher` ES/EN cambia todo el texto en home y admin, y que la preferencia persiste tras recargar.
2. (Opcional, manual) En el panel `/admin/settings` subir/probar imagen de hero, título y descripción, y confirmar que el home las refleja.
3. (Opcional) Traducir textos restantes menores si se desea (p. ej. emails de confirmación en `lib/email.js` si existen, o placeholders).
4. (Opcional) Siguiente fase sugerida: multi-hotel (un deploy por cliente) o panel de analytics.

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
- `app/globals.css`: vars `--primary`/`--accent`.
- `.gitignore`: excluye `run_sql.mjs`, `push_repo.mjs`, `.env*`.
- `https://hotel-template-theta.vercel.app`: deploy real (verificado).
