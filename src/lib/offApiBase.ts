/**
 * Basis-Pfad für alle Open-Food-Facts-Anfragen.
 *
 * Im Dev-Server läuft `/off-api` über den Vite-Proxy (`vite.config.ts`)
 * server-seitig gegen `world.openfoodfacts.org` – dort greift CORS nicht.
 * Dieser Proxy existiert nur für `npm run dev`, im Produktions-Build fehlt
 * er. Dort wird stattdessen eine Supabase Edge Function angesprochen
 * (`supabase/functions/off-proxy`), die denselben Zweck erfüllt: sie läuft
 * server-seitig und reicht Anfragen 1:1 an Open Food Facts durch.
 *
 * Per `VITE_OFF_API_BASE_URL` überschreibbar, falls die Function unter einem
 * anderen Supabase-Projekt läuft.
 */
export const OFF_API_BASE_URL: string = import.meta.env.DEV
  ? '/off-api'
  : (import.meta.env.VITE_OFF_API_BASE_URL as string | undefined) ??
    'https://pdjdejyoxnljcehrwyrb.supabase.co/functions/v1/off-proxy'
