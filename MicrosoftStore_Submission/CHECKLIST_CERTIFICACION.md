# Checklist de certificación — ToolTip AI (Assistant) **1.1.3.0**

> Gate duro: si una fila está en `[ ]`, **NO se pulsa «Enviar para certificación»**.
> Regla completa: `PREFLIGHT.md` en la raíz de cada app.

| Estado | Elemento | Verificación |
| :---: | --- | --- |
| [x] | Versión unificada | csproj = AppxManifest = nombre MSIX = **1.1.3.0** |
| [x] | Identity | `Dixi3Lqbs.ToolTipAIAssistant` |
| [x] | DisplayName | ToolTip AI |
| [x] | Capturas 10.1.1.3 | 4 PNG 1920×1080, UI real, sin claims falsos |
| [ ] | Privacy URL responde 200 | `https://tooltip-ai.com/privacy` |
| [ ] | Ficha ES/EN = METADATOS | Sin claims de &lt;40 MB / privacidad absoluta |
| [ ] | Opciones de envío completas | runFullTrust justificado |
| [ ] | Precios / payout OK | Free Assistant; PayPal configurado |
| [ ] | Paquete en Partner Center = este MSIX | `ToolTipAIAssistant_1.1.3.0_x64.msix` |

**Nota al revisor (si hace falta):** screenshots are real product UI; package 1.1.3.0 matches store listing metadata.
