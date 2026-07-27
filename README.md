# Finanzas

App de finanzas personales multi-perfil (Gabriel, Papá, Mamá): cuentas bancarias, inversiones
en USD, metales preciosos y otras inversiones, con reportes mes a mes de patrimonio neto.

## Stack

Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres + Auth) + Recharts.
Precios automáticos: FX vía `open.er-api.com`, metales vía `metalpriceapi.com`, acciones vía
`financialmodelingprep.com`, cripto vía CoinGecko.

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea un proyecto gratuito.
2. En el panel del proyecto, ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ve a **SQL Editor** y ejecuta, en orden, el contenido de:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_profiles_function.sql`
4. En **Authentication → URL Configuration**, agrega como *Redirect URL*:
   `http://localhost:3000/auth/callback` (y luego la URL de producción de Vercel cuando
   despliegues, ej. `https://tu-app.vercel.app/auth/callback`).
5. El login es por "magic link" (correo), no requiere contraseña ni proveedor externo.

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y llena:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
METALPRICE_API_KEY=       # opcional — sin esto, metales usan precio manual
FMP_API_KEY=              # opcional — sin esto, acciones/fondos usan precio manual
```

- `METALPRICE_API_KEY`: crea una cuenta gratuita en https://metalpriceapi.com (free tier,
  ~100 requests/mes) y copia tu API key.
- `FMP_API_KEY`: crea una cuenta gratuita en https://site.financialmodelingprep.com y copia tu
  API key.
- Cripto (CoinGecko) y el tipo de cambio USD/COP no requieren key.
- Si dejas alguna key vacía, esa categoría simplemente pide el precio manual en el formulario
  de captura mensual — la app no se rompe.

## 3. Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000, entra con tu correo (recibirás un enlace mágico), y al primer
login se crean automáticamente los perfiles "Gabriel", "Papá" y "Mamá".

## 4. Desplegar en Vercel

1. Sube este repo a GitHub.
2. En https://vercel.com, importa el repo.
3. Agrega las mismas variables de entorno del paso 2 en **Settings → Environment Variables**.
4. Agrega la URL de producción (`https://<tu-proyecto>.vercel.app/auth/callback`) en
   Supabase → Authentication → URL Configuration → Redirect URLs.
5. Despliega. El free tier de Vercel + Supabase cubre este uso sin costo.

## Flujo de uso

1. Elige un perfil en el selector del encabezado.
2. En **Cuentas**, da de alta cada cuenta (banco, USD, metal, u otra inversión).
3. Cada mes, entra a **Captura mensual**, elige el mes y digita saldos/cantidades. El precio
   de metales/acciones/cripto se resuelve automático (o puedes sobreescribirlo manualmente).
4. En **Reportes**, revisa el patrimonio neto consolidado o por persona, su evolución mensual,
   el desglose por tipo de activo y la variación mes a mes.
