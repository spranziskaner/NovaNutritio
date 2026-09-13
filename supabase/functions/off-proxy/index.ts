// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

/**
 * Reverse-Proxy für Open Food Facts, als Ersatz für den Vite-Dev-Proxy
 * (`vite.config.ts`, Pfad `/off-api`) im Produktions-Build.
 *
 * `world.openfoodfacts.org` sendet für Browser-Anfragen von beliebigen
 * Origins keine `Access-Control-Allow-Origin`-Freigabe (siehe README). Diese
 * Function läuft server-seitig (kein Browser-Request an die Fremd-Domain,
 * daher kein CORS-Problem) und reicht Anfragen 1:1 an Open Food Facts durch,
 * inklusive Pfad, Query-String und Response-Body.
 *
 * Bewusst ohne Supabase-Auth (siehe `verify_jwt = false` in
 * `supabase/config.toml`): der Client ruft diese Function direkt aus dem
 * Browser auf, ohne Anon-Key im Request.
 */

const OFF_ORIGIN = "https://world.openfoodfacts.org";
const FUNCTION_PATH = "/off-proxy";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function upstreamPathFor(url: URL): string {
  const index = url.pathname.indexOf(FUNCTION_PATH);
  if (index === -1) return url.pathname;
  const rest = url.pathname.slice(index + FUNCTION_PATH.length);
  return rest === "" ? "/" : rest;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const upstreamUrl = `${OFF_ORIGIN}${upstreamPathFor(url)}${url.search}`;

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: { "User-Agent": "NovaNutritio (Supabase Edge Function off-proxy)" },
  });

  const body = await upstreamResponse.arrayBuffer();
  return new Response(body, {
    status: upstreamResponse.status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": upstreamResponse.headers.get("Content-Type") ?? "application/json",
      // Explizit statt dem Runtime-Default überlassen: der openapi-fetch-
      // Client im Frontend behandelt eine fehlende/falsche Content-Length
      // bei leerem Body als Sonderfall (kein Fehler, aber auch keine Daten).
      "Content-Length": String(body.byteLength),
    },
  });
});
