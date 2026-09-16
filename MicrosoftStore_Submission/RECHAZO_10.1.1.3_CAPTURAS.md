# Rechazo 10.1.1.3 — Capturas ToolTip AI (listado español)

**Producto:** ToolTip AI · **ID:** 9N3D02KXKD3D · **Publisher:** Dixi3 Lqbs  
**Política:** 10.1.1.3 Inaccurate Representation  
**Hallazgo:** Las imágenes de Metadata (Screenshots) anunciaban otro producto / incluían imaginería no publicada por el editor.  
**Idioma del listado:** español

---

## Causa raíz

El script `scripts/generate_store_screenshots.ps1` generaba **posters de marketing**, no capturas de la app real:

| Problema | Evidencia |
|---|---|
| UI inventada | Paneles “Vision HUD”, “Magnetic Dock”, “Panel de Control” que no existen en el binario |
| Atajo incorrecto | `Ctrl + A` (el real es `Ctrl+Shift+A`) |
| Versión desactualizada | Capturas decían v1.0.1; el paquete es **1.0.3.0** |
| Claims falsos | “&lt;40 MB RAM”, “Privacidad Absoluta”, “Cero almacenamiento en la nube” |
| Branding inglés inventado | “Neural Screen Inspector & Cognitive HUD” |
| Ruta obsoleta del generador | Apuntaba a `D:\TeachMe AI\…` (proyecto movido a `D:\ToolTip AI`) |

Microsoft interpreta eso como imaginería de un producto distinto al publicado → 10.1.1.3.

---

## Qué se corrigió

Nuevas capturas 1920×1080 PNG en:

`D:\ToolTip AI\MicrosoftStore_Submission\Store_Assets\Screenshots\`

| Archivo | Qué muestra (fiel al XAML) |
|---|---|
| `Screenshot_1_HUD_Inspection.png` | Cápsula Dynamic Island + HUD morado analizando “Actualizar y reiniciar ahora” |
| `Screenshot_2_Snipping_Tool.png` | Superficie de recorte con **Ctrl+Shift+A** |
| `Screenshot_3_Dashboard_Controls.png` | Cápsula expandida + acciones reales + privacidad honesta (DPAPI / API Google) |
| `Screenshot_4_Docking_UIAutomation.png` | Error 0x80070005 + veredicto de elevación UAC |

Reglas aplicadas:
- UI = `MainWindow.xaml` + `HudWindow.xaml` (colores #00F5A0, #38BDF8, #A855F7)
- Atajos reales: Ctrl+Shift+A / D / C
- Versión **1.0.3.0**
- Sin claims no verificables
- Sin logos ni UI de terceros
- Textos en español alineados a `METADATOS_FICHA_TIENDA.md`

Generador nuevo: `scripts/generate_store_screenshots_v2.py`  
(Ejecutar: `& $env:MIMO_PYTHON scripts\generate_store_screenshots_v2.py`)

---

## Checklist de resubmisión en Partner Center

En la página que tienes abierta (Submission 1, borrador):

1. **Eliminar capturas antiguas**  
   Store listings → español (y cualquier otro idioma) → Screenshots → borrar las 4 viejas.

2. **Subir las 4 nuevas** desde  
   `D:\ToolTip AI\MicrosoftStore_Submission\Store_Assets\Screenshots\`  
   - Formato PNG · 1920×1080  
   - Orden: HUD → Recorte → Panel/Privacidad → Error UAC

3. **Revisar descripción ES**  
   Pegar textos de `METADATOS_FICHA_TIENDA.md` (sin claims de &lt;40 MB / privacidad absoluta).

4. **Paquete**  
   Ya validado: `ToolTipAIAssistant_1.0.3.0_x64.msix` — no hace falta recompilar solo por esto.

5. **Reenviar a certificación**  
   Botón «Volver a enviar para la certificación».

6. **Si Partner Center pide nota al revisor**, usar:

```text
Product ID: 9N3D02KXKD3D

We replaced all Store screenshots for the Spanish listing under policy 10.1.1.3.
The previous images were marketing mockups that did not match the shipped UI.
The new 1920x1080 screenshots show the actual ToolTip AI 1.0.3.0 interface
(floating capsule + cognitive HUD), use the real hotkeys (Ctrl+Shift+A/D/C),
and contain no third-party product imagery or unverifiable claims.
```

---

## NO subir otra vez

- `scripts/generate_store_screenshots.ps1` (legacy, mockups)
- Capturas con Ctrl+A, v1.0.1, “Neural Screen Inspector”, “&lt;40 MB”, “Privacidad Absoluta”
- Imágenes de `ToolTip AI Transalate` (otro producto)
