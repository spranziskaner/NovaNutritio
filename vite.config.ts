import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Open Food Facts sendet für /cgi/search.pl und die Produkt-API keine
      // Access-Control-Allow-Origin-Freigabe für beliebige Browser-Origins
      // (empirisch geprüft). Im Dev-Server läuft die Anfrage daher server-
      // seitig über diesen Proxy statt als Browser-Request an die
      // Fremd-Domain – dort greift CORS nicht. Für den Produktions-Build
      // braucht es eine äquivalente Lösung auf Hosting-Ebene, siehe README.
      '/off-api': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/off-api/, ''),
      },
    },
  },
})
