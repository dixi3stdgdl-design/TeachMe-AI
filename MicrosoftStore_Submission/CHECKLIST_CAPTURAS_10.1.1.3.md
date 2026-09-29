# Checklist — subir capturas corregidas (política 10.1.1.3)

**Fecha:** 24/09/2026  
**Motivo:** las capturas podían mostrar versión/maquetación incorrecta. Ya están regeneradas en disco.

## ToolTip AI (`9N3D02KXKD3D`)

Ruta: `D:\ToolTip AI\MicrosoftStore_Submission\Store_Assets\Screenshots\`

| Orden | Archivo | Qué muestra |
|---|---|---|
| 1 | `Screenshot_1_HUD_Inspection.png` | HUD + cápsula (UI real) |
| 2 | `Screenshot_2_Snipping_Tool.png` | Recorte Ctrl+Shift+A |
| 3 | `Screenshot_3_Dashboard_Controls.png` | Panel + privacidad honesta |
| 4 | `Screenshot_4_Docking_UIAutomation.png` | Error UAC / UI Automation |

- Versión en la imagen: **1.1.3.0** (igual que el MSIX del envío)
- Tamaño: 1920×1080 PNG
- En Partner Center: Store listings → español → Screenshots → **borrar las 4 antiguas** → subir estas 4 en este orden.

## ToolTip AI Translate (`9NQN3RZ2Z655`)

Ruta: `D:\ToolTip AI Translate\ToolTipAI-Translate\MicrosoftStore_Submission\Screenshots\`

| Orden | Archivo | Qué muestra |
|---|---|---|
| 1 | `Screenshot_1_HoverTranslate.png` | Tooltip sobre Word (UIA) |
| 2 | `Screenshot_2_AiNuances.png` | Matices IA opcionales |
| 3 | `Screenshot_3_Settings.png` | Ajustes BYOK + DPAPI |
| 4 | `Screenshot_4_Overview.png` | Atajos y límites |

- Tamaño: 1920×1080 PNG (antes 1376×768 — no válido)
- Colores de la UI real del XAML (`TranslateTooltipWindow`, `TranslateSettingsWindow`)
- Mismo proceso: borrar capturas antiguas del listado ES y subir estas.

## Antes de «Volver a enviar»

1. Comprobar que en **Opciones de envío** aparece **Completado** (Assistant lo tenía **Incompleto**).
2. Descripción ES = textos de `METADATOS_FICHA_TIENDA.md` sin claims antiguos.
3. Luego botón **Volver a enviar para la certificación**.

## Nota al revisor (si la piden)

```text
Product ID: <ID de la app>

We replaced all Store listing screenshots with 1920x1080 PNGs that match the
shipped MSIX UI and version. No marketing mockups, no third-party product
imagery, no unverifiable claims. Hotkeys and privacy text match the app.
```

## Aviso

Las apps pueden seguir **en proceso de certificación** por el reenvío del 24/09.  
Si Microsoft devuelve error otra vez, subir estas capturas en el **siguiente envío** y reenviar.
