# Checklist de certificación — ToolTip AI (Assistant) **1.1.5.0**

> Gate duro: si una fila está en `[ ]`, **NO se pulsa «Enviar para certificación»**.
> Regla completa: `PREFLIGHT.md` en la raíz de cada app.

| Estado | Elemento | Verificación |
| :---: | --- | --- |
| [x] | Versión unificada | csproj = AppxManifest = nombre MSIX = **1.1.5.0** |
| [x] | Identity | `Dixi3Lqbs.ToolTipAIAssistant` |
| [x] | DisplayName | ToolTip AI |
| [x] | Paquete NO single-file | `TeachMeAI.exe` 348 KB + `TeachMeAI.dll` + `coreclr.dll` (515 archivos) |
| [x] | Crash 10.1.2.10 corregido | `DispatcherUnhandledException` con `args.Handled=true` + `UnobservedTaskException` |
| [x] | Fallback pantallas | `Screen.AllScreens` sin `IndexOutOfRange` |
| [x] | Start/Stop escáner seguro | try/catch en `ScreenTranslateScanner` |
| [x] | Capturas 10.1.1.3 | 4 PNG 1920×1080, UI real, sin claims falsos |
| [x] | Privacy URL responde 200 | `https://tooltip-ai.com/privacy` |
| [ ] | Ficha ES/EN = METADATOS | revisar sin claims de &lt;40 MB / privacidad absoluta |
| [ ] | Opciones de envío completas | runFullTrust justificado |
| [ ] | Precios / payout OK | Free Assistant; PayPal configurado |
| [ ] | Paquete en Partner Center = este MSIX | `ToolTipAIAssistant_1.1.5.0_x64.msix` |

## Arreglo del crash al arrancar (política 10.1.2.10)

| Causa raíz | Corrección |
|---|---|
| `DispatcherUnhandledException` solo logueaba; WPF seguía y mataba el proceso | `args.Handled = true` |
| `Win32Exception (6) Controlador no válido` (UI Automation) al arrancar | ya no tumba la app |
| `PublishSingleFile` = exe de 78 MB que falla al extraer en PCs de certificación | publicación en carpeta (exe 348 KB + DLLs) |
| `Screen.AllScreens[0]` podía lanzar si no hay pantallas | fallback a `SystemParameters` |
| `ScreenTranslateScanner.Start()` creaba ventanas overlay sin red | try/catch |

## Nota al revisor (si hace falta)

```text
Product ID: 9N3D02KXKD3D

We fixed the launch crash reported under policy 10.1.2.10 (exception 0xe0434352).
Root causes addressed in 1.1.5.0:
1) Unhandled dispatcher exceptions are now logged and swallowed so WPF no longer tears down the process at startup.
2) The package is no longer a single-file bundle (78 MB self-extractor); it ships as a normal folder layout (TeachMeAI.exe + DLLs), which is the supported MSIX pattern for certification devices.
3) Screen/overlay startup paths are guarded so UI Automation invalid-handle errors cannot crash launch.

Package: ToolTipAIAssistant_1.1.5.0_x64.msix (515 files, signed).
```
