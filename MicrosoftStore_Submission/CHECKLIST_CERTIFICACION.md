# Checklist de certificación — ToolTip AI 1.0.2

| Estado | Elemento | Verificación |
| :---: | :--- | :--- |
| [x] | **Nombre comercial unificado** | DisplayName, ShortName, UI y tray usan **ToolTip AI**. |
| [x] | **Atajos no conflictivos** | Snip `Ctrl+Shift+A`, Radar `Ctrl+Shift+D`, Ajustes `Ctrl+Shift+C`. Sin `Ctrl+A` / `Ctrl+D`. |
| [x] | **Hook LL preciso** | Solo fallback de las combinaciones exactas del producto. |
| [x] | **Bóveda DPAPI** | API key solo vía `ProtectedData`; migración plaintext re-cifra al cargar. Landing no persiste claves. |
| [x] | **Modelos reales** | `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.5-pro`. |
| [x] | **Privacidad alineada** | `privacy.html` describe DPAPI, BYOK y envío a Google sin “privacidad absoluta”. |
| [x] | **Ficha honesta** | Sin claims de &lt;40 MB / enterprise / neural sin base. |
| [x] | **Versión 1.0.2.0** | csproj + AppxManifest alineados. |
| [ ] | **Paquete MSIX 1.0.2 firmado y subido** | Generar y firmar en Partner Center. |
| [ ] | **Cancelación del submission #1 (1.0.1)** | Hacerlo en Partner Center antes de reenviar. |
| [ ] | **Textos de ficha actualizados** | Pegar desde `METADATOS_FICHA_TIENDA.md`. |
