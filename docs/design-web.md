# Design — Tooltip AI (v2 impacto)

**Frase:** *Cyber-cinematic × Glass HUD × Procedural light-field*: un vacío profundo con cintas de luz iridiscentes que siguen el cursor, tipografía editorial enorme y paneles de cristal que flotan sobre el campo de energía — la UI de Windows “cobra vida” como en una demo en vivo.

## Concepto
Tooltip AI no se explica: se **ve**. El usuario mueve el cursor y la luz reacciona (como el producto). El scroll cuenta 3 actos: promesa → prueba → compra.

## DNA visual
| Canal | Decisión |
|---|---|
| Material | Vidrio (glass) + luz volumétrica + metal esmerilado |
| Motion | Cintas de luz que ondulan (shader), micro-parallax, reveal por scroll |
| Paleta | Void `#05070C` · teal `#2DD4BF` · sky `#38BDF8` · violet `#A78BFA` · ink `#F4F7FB` |
| Tipografía | Outfit (display) + Inter (body) · escala hero 5–6vw |

## Secciones
1. **Hero** — shader interactivo + claim + CTA magnético + HUD flotante
2. **Showcase** — ventana Windows + análisis Tooltip (live feel)
3. **Módulos** — 4 tarjetas glass con icono glow
4. **Cómo** — 3 pasos numerados sobre panel
5. **Precios** — 3 planes, Bundle destacado
6. **Footer** — crédito MiMo honesto

## Interacciones
- Cursor → desplaza cintas de luz (shader uniform)
- Scroll → fade/translate secciones + barra de progreso
- Hover CTA → magnético + shine
- Click módulo → checkout modal (PayPal popup, sin redirect)
- Hover cards → lift + glow

## Stack
Canvas WebGL (shader propio, sin CDNs) + CSS + JS vanilla. Offline. Pages-ready.
