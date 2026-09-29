# Search Console + Bing — checklist de activación

El sitio ya sirve `sitemap.xml` y `robots.txt` en https://tooltip-ai.com/.

## 1. Google Search Console (5 min)

1. Abrir https://search.google.com/search-console
2. **Añadir propiedad** → tipo **Prefijo de URL**: `https://tooltip-ai.com/`
3. Verificación recomendada: **Etiqueta HTML** o **DNS** (Porkbun TXT).
   - Si eliges etiqueta: se pega en `<head>` de `index.html` (te lo inserto al dar el código).
4. **Sitemaps** → enviar `https://tooltip-ai.com/sitemap.xml`
5. Solicitar indexación de:
   - `/`
   - `/en/`
   - `/de/`
   - `/privacy/`

## 2. Bing Webmaster Tools (5 min)

1. https://www.bing.com/webmasters
2. Añadir `https://tooltip-ai.com/`
3. Importar desde Search Console (si ya lo verificaste) **o** meta tag / XML file
4. Sitemaps → `https://tooltip-ai.com/sitemap.xml`

## 3. Tras verificar

| Métrica | Dónde |
|---|---|
| Páginas indexadas | Search Console → Cobertura / Páginas |
| Consultas (`tooltip ai`, `inspector de pantalla`) | Rendimiento |
| Errores de rastreo | Cobertura |

## Nota técnica

- `CNAME`: tooltip-ai.com → GitHub Pages
- HTTPS activo
- Canonical + hreflang en ES/EN/DE
