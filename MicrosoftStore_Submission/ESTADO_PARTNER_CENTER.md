# Estado Partner Center — ToolTip AI (17/09/2026)

**Producto:** 9N3D02KXKD3D · Submission 1 (borrador)

## Web de soporte (lista para la ficha)

| URL | Uso en Store |
|---|---|
| `http://tooltip-ai.com/` | Website / soporte (candado HTTPS cuando GitHub emita cert) |
| `https://dixi3stdgdl-design.github.io/TeachMe-AI/privacy/` | **Privacy policy URL** (válida ya; pasar a `https://tooltip-ai.com/privacy` tras HTTPS) |
| `https://www.paypal.com/ncp/payment/HPDSLDCAGVHFL` | Donaciones (no va en la ficha Store; landings) |

## Completado en Partner Center

| Sección | Estado |
|---|---|
| Paquetes | `ToolTipAIAssistant_1.0.4.0_x64.msix` **Validated** |
| Propiedades | Completado |
| Opciones de envío | Completado |
| Clasificación por edades | IARC/PEGI/ESRB confirmados (mayores de 3) |
| Capturas ES | 4 nuevas 1920×1080 (UI real, v1.0.4) — se borraron las 3 mockups del 10.1.1.3 |
| Descripción ES | Reescrita: Ctrl+Shift+A/D/C, multi-proveedor, sin `<40 MB` / «Privacidad absoluta» / «Neural Screen» |
| Features ES | Reescritas (sin Ctrl+A) |
| Novedades ES | v1.0.4.0 (no 1.0.0) |

## Local listo para subir

- MSIX: `MicrosoftStore_Submission/Package/ToolTipAIAssistant_1.0.4.0_x64.msix`
- Capturas: `MicrosoftStore_Submission/Store_Assets/Screenshots/Screenshot_*.png`
- Generador: `scripts/generate_store_screenshots_v2.py`
- Multi-proveedor: `src-dotnet/AiProviderCatalog.cs`, `AiBridge.cs` + HUD Ctrl+Shift+C

## Pendiente (bloquea «Volver a enviar»)

El botón **Volver a enviar para la certificación** está **deshabilitado** porque:

**Descripciones de Store → Español → Incompleto**

Partner Center no indica el campo exacto desde la API/UI automatizada. En tu navegador:

1. Abrir `Descripciones de Store` → `Español`
2. Revisar que no quede ningún asterisco rojo / «requerido»
3. Confirmar 4 capturas + logos (póster 9:16 / caja 1:1 si los usas)
4. Pulsar **Guardar**
5. Volver a overview → **Volver a enviar para la certificación**

## Nota al revisor (cuando se reenvíe)

```text
Product ID: 9N3D02KXKD3D

We replaced the Spanish Store screenshots (policy 10.1.1.3). The previous images were marketing mockups. The new 1920x1080 screenshots show the actual ToolTip AI 1.0.4.0 UI (capsule + cognitive HUD), use real hotkeys (Ctrl+Shift+A/D/C), and contain no third-party product imagery or unverifiable claims. Package ToolTipAIAssistant_1.0.4.0_x64.msix is Validated.
```
