# Entrega de sitio web — [NOMBRE DEL HOTEL]

Documento de handoff (llave en mano). Completa los campos y entrégaselo al cliente
junto con el acceso a las cuentas. Guarda una copia para ti.

---

## 1. Resumen

- **Sitio público:** https://[DOMINIO].com
- **Panel de administración:** https://[DOMINIO].com/admin
- **Fecha de entrega:** [FECHA]
- **Modelo:** Setup único + [60] días de soporte incluidos. Luego "as is"
  (los updates de seguridad corren por cuenta del cliente).

---

## 2. Cuentas (dueño: el cliente)

| Servicio | URL | Email de acceso | Notas |
|----------|-----|-----------------|-------|
| Supabase (base de datos) | https://supabase.com/dashboard | [email] | Facturación con tarjeta del cliente |
| GitHub (código) | https://github.com/[usuario]/[repo] | [email] | Repositorio del cliente |
| Vercel (hosting) | https://vercel.com/[cuenta] | [email] | Facturación con tarjeta del cliente |
| Registro de dominio | [registrar, ej. Namecheap] | [email] | Renovación anual ~$[10-15] |

> Importante: todas las cuentas están a **nombre del cliente** y con su tarjeta
> de facturación. Tú no pagas nada recurrente.

---

## 3. Accesos del sitio

- **Administrador:**
  - Email: `admin@[DOMINIO].com`  *(o el que hayas configurado)*
  - Contraseña: `[PASSWORD_TEMPORAL]`  → el cliente debe cambiarla tras el primer login
- **Usuario de demo (si aplica):** `demo@...` / `[...]`

---

## 4. Qué puede editar el cliente solo (sin programador)

Desde `/admin`:
- **Configuración:** nombre, dirección, logo, colores, imagen/título/descripción del hero.
- **Habitaciones / Inventario:** crear, editar, eliminar tipos de habitación y stock.
- **Servicios:** crear, editar, eliminar servicios que aparecen en la web.
- **Reservas:** ver, confirmar y cancelar reservas de huéspedes.
- **Analíticas:** ingresos, ocupación, reservas por estado, habitaciones top.

## 5. Qué NO debe tocar

- Las variables de entorno en Vercel (`DATABASE_URL`, `STRIPE_SECRET_KEY`, etc.).
- El código en GitHub / los deployments en Vercel.
- La base de datos directamente en Supabase, salvo que sepas lo que hace.

---

## 6. Pagos (Stripe)

- Modo actual: **[mock / real]**.
- Para cobros reales: el cliente debe crear su cuenta Stripe, copiar
  `STRIPE_SECRET_KEY` (test o live) en Vercel (Settings > Environment) y redeploy.
- Con la clave vacía, el sitio usa el modo mock (no cobra de verdad).

---

## 7. Costos recurrente (a cargo del cliente)

| Concepto | Aprox. |
|----------|--------|
| Supabase (plan free) | $0/mes |
| Vercel (plan free) | $0/mes |
| Dominio | ~$10–15/año |
| Stripe (comisión por venta) | % por transacción |

---

## 8. Soporte post-entrega

- Incluido: [60] días para correcciones de lo entregado.
- Fuera de plazo: se cobra por hora o se ignora (modelo "as is").
- Contacto: [tu email / WhatsApp].

---

*Generado a partir de la plantilla `docs/HANDOFF_TEMPLATE.md`.*
