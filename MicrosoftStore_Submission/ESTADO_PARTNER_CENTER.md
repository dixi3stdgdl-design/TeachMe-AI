# Estado Partner Center — ToolTip AI (17/09/2026 · 12:00 UTC)

## Suite en certificación

| Producto | ID | Estado |
|---|---|---|
| **ToolTip AI** (Assistant) | `9N3D02KXKD3D` | **En proceso de certificación** (reenvío 17/09) |
| **ToolTip AI Aura** | `9P33P1P5Z8DC` | **En proceso de certificación** (reenvío 17/09) |
| **ToolTip AI Translate** | `9NQN3RZ2Z655` | **En proceso de certificación** (reenvío 17/09) |
| Tooltip AI Win32 | `2f19281b-…` | Se necesita atención (canal EXE, no bloquea MSIX) |
| ToolTip AI Voice | — | No reservado en Store aún |

Paquetes en envío: Assistant `1.0.4.0` · Translate `1.0.1.0` (Validated).  
`runFullTrust` justificado en Options (EN). Privacy URL: `https://dixi3stdgdl-design.github.io/TeachMe-AI/privacy/`.

## i18n producto (Release builds locales)

- Base **en-US**; es-ES / de-DE según SO. Compilan: Assistant, Aura, Voice, Translate.
- Landings: `/` ES · `/en/` · `/de/` (hreflang).
- **Los MSIX de Store aún son los binarios anteriores al i18n completo** — siguiente envío post-aprobación.

## Web

- `http://tooltip-ai.com` live. HTTPS: cert GitHub aún no emitido (`certificate does not exist yet`). Alternativa: Cloudflare (cambiar NS a Cloudflare y proxy → SSL universal).

## Pendientes post-cert

1. Voice: reserva de nombre + MSIX + listing.
2. Listings **en-US** y **de-DE** en las 3 submissions.
3. Precios: Assistant Free; módulos 9.99 (revisar en Pricing).
4. Subir MSIX con i18n cuando aprueben.
5. HTTPS Cloudflare o esperar Let’s Encrypt de GitHub.


**Cuenta:** Partner Center logueada · verificado con Playwright/CDP

## Productos en la cuenta

| Producto | ID | Tipo | Estado (17/09) |
|---|---|---|---|
| **ToolTip AI** (Assistant) | `9N3D02KXKD3D` | MSIX/PWA | **En proceso de certificación** — Submission 1 · mod. 16/09/2026 |
| **ToolTip AI Aura** | `9P33P1P5Z8DC` | MSIX/PWA | **En proceso de certificación** — Submission 1 · mod. 15/09/2026 |
| **ToolTip AI Translate** | `9NQN3RZ2Z655` | MSIX/PWA | **En proceso de certificación** — Submission 1 · mod. 16/09/2026 |
| Tooltip AI Win32 | `2f19281b-…` | EXE/MSI | **Se necesita atención** (no bloquea los MSIX) |
| ToolTip AI Voice | — | — | **No está** en Partner Center todavía |

Flujo en cada MSIX: Preprocesando → **Certificación** → Publicación. Microsoft avisa por correo; suelen ser horas, hasta 3 días hábiles.

## Web de soporte (lista para Store)

| URL | Uso |
|---|---|
| `http://tooltip-ai.com/` | Website (HTTPS cuando GitHub emita cert) |
| `https://dixi3stdgdl-design.github.io/TeachMe-AI/privacy/` | Privacy policy URL |
| `https://www.paypal.com/ncp/payment/HPDSLDCAGVHFL` | Donaciones (landings, no ficha Store) |

## Precios (decisión de producto)

- Assistant: **Gratis**
- Aura / Translate / Voice: **7.99–9.99 USD** (revisar en Pricing and availability de cada submission si aún no se aplicó)

## Ya no bloquea

El listing ES del Assistant dejó de estar «Incompleto»: hay submission en certificación desde el 16/09.

## Pendientes post-certificación

1. **Voice** — reservar nombre y subir MSIX (`D:\ToolTip AI Voice\MicrosoftStore_Submission\Package\ToolTipAIVoice_1.0.0.0_x64.msix`).
2. **Win32 EXE** — revisar «Se necesita atención» o archivar si solo quieres canal MSIX.
3. **HTTPS** `tooltip-ai.com` — vigilante GitHub Pages cada 7 min.
4. **Payout** — email PayPal en Ganancias/Payout account (para módulos de pago).
5. **2FA Porkbun** — el usuario debe activarlo con app.

## Nota al revisor (Assistant · si rechazan 10.1.1.3 de nuevo)

```text
Product ID: 9N3D02KXKD3D

We replaced the Spanish Store screenshots (policy 10.1.1.3). The new 1920x1080 screenshots show the actual ToolTip AI 1.0.4.0 UI (capsule + cognitive HUD), use real hotkeys (Ctrl+Shift+A/D/C), and contain no third-party product imagery or unverifiable claims. Package ToolTipAIAssistant_1.0.4.0_x64.msix is Validated.
```
