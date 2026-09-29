# Seguridad — ToolTip AI (auditoría 29/09/2026)

## Hallazgos y estado

| # | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| 1 | **Token Entra** en `_archive/.../usermgmt.html` (dump de browser) | Alto — GitHub Push Protection lo detectó | Fuera del commit `d74a480`. **Aún puede estar en historial de commits antiguos** → **revocar el token en Entra** |
| 2 | `TeachMeAI_Test.pfx` / `.cer` en `Testing_Certificate/` | Medio — certificado de prueba | Fuera de git; sigue en disco local |
| 3 | `APPINSIGHTS_CONFIG.json` con InstrumentationKey + ApplicationId | Bajo-medio — telemetry key de cliente | **Fuera del tracking** (`git rm --cached`) |
| 4 | `porkbun.ps1` lee `~\.porkbun_tooltip.json` | Bajo — keys fuera del repo | OK (no versionado) |
| 5 | Scripts `Configurar-MSStore-CLI.ps1` / `Solucionar-Y-Mandar.ps1` | Bajo — `ClientSecret` solo como parámetro | OK (no hay valor hardcodeado) |
| 6 | `src/wwwroot/app.js` Gemini key | — | Vacía, en memoria de sesión |

## Acciones obligatorias (tú)

1. **Revocar/rotar** el Application/Client secret de la app Entra `MSStoreCLI-ToolTipAI-Partner` y cualquier token que apareciera en dumps de `usermgmt.html`.
2. Si `~\.porkbun_tooltip.json` ha viajado en backups/copias, rotar API keys de Porkbun.
3. Activar **Secret Scanning** en GitHub (Settings → Security) para alertas futuras.

## Reglas de repo (ya en `.gitignore`)

- `*.pfx`, `*.cer`, `*.pem`, `*.key`, `.env`
- `APPINSIGHTS_CONFIG.json`
- `.porkbun*`
- `usermgmt*.html` y dumps `cdp_status_now/`
- `*secret*`, `*credential*`

## Proceso de commit

1. Antes de `git add`, revisar `git status` por nombres sensibles.
2. Nunca `git add -A` a ciegas si hay dumps de browser/temp.
3. Si GitHub bloquea por secreto: **no forzar push**; sacar el archivo y rotar la credencial.
