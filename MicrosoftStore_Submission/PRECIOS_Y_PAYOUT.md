# Precios y payout — ToolTip AI Suite (Microsoft Store)

Decisión de usuario (2026-09-17): **núcleo gratis + módulos de pago premium**.

## Matriz de precios

| Producto | Rol | Precio base | Comisión MS (~15%) | Neto aprox. |
|---|---|---|---|---|
| **ToolTip AI Assistant** | Embudo / núcleo inspector de pantalla | **Gratis (0.00)** | — | 0 |
| **ToolTip AI Aura** | Escudo cognitivo / dwell radar | **7.99 USD** (opción 9.99) | ~1.20 | ~6.79 |
| **ToolTip AI Voice** | TTS / canal acústico | **7.99 USD** (opción 9.99) | ~1.20 | ~6.79 |
| **ToolTip AI Translate** | OCR / lente de traducción | **7.99 USD** (opción 9.99) | ~1.20 | ~6.79 |

- Puedes subir a **9.99 USD** por módulo si quieres más margen; el tier estándar de Store lo permite.
- Trials opcionales: 7 o 15 días en módulos de pago (recomendado 7 días) para reducir fricción.
- Producto Assistant `9N3D02KXKD3D` ya existe; los módulos necesitan **reserva de nombre + submission propios**.

## PayPal / payout (Partner Center)

| Qué | Valor actual |
|---|---|
| **Enlace de cobro profesional (USD, importe libre)** | `https://www.paypal.com/ncp/payment/HPDSLDCAGVHFL` — «Apoyo a Tooltip-ai» |
| **PayPal.me** | `https://paypal.me/DixLqb` |
| **Payout Partner Center** | Email de la cuenta PayPal (no el enlace paypal.me) |

- El botón Donar de las landings usa el enlace NCP (Business, USD, tarjeta/Apple Pay).
- `paypal.me` se deja como alternativa corta.

## PayPal / payout (Partner Center) — nota Store

| Qué | ¿Necesario? | Detalle |
|---|---|---|
| **Cuenta PayPal (email)** | Sí, si eliges PayPal como método de payout | Se configura en Partner Center → **Payout account / Payment and tax info**. Es el **correo de tu cuenta PayPal**, no un enlace. |
| **Enlace `paypal.me/...`** | **No** para Store | Solo es un link público para cobrar. Útil si metes un botón «Donar» en la landing; **no** sustituye el payout de Microsoft. |
| **Cuenta bancaria** | Alternativa | ACH/IBAN según país de la cuenta Partner Center. |

**Recomendación:** usa el **email PayPal** ya verificado en tu cuenta Partner Center. Si aún no tienes payout configurado, hazlo antes de la primera venta; las ventas gratis no lo exigen con urgencia, pero sí al publicar módulos de pago.

## Privacy URL para Store

Usar ya (una vez el cert salga):

- `https://tooltip-ai.com/privacy`

Mientras HTTPS no esté forzado, puedes dejar la de Pages:

- `https://dixi3stdgdl-design.github.io/TeachMe-AI/privacy/`

## Estado dominio (verificado 2026-09-17)

| Comprobación | Resultado |
|---|---|
| DNS `A @` | 185.199.108–111.153 (GitHub) ✅ |
| `http://tooltip-ai.com` | HTTP 200, landing real Tooltip-ai ✅ |
| GitHub Pages `cname` | `tooltip-ai.com` ✅ |
| `CNAME www` | ✅ `dixi3stdgdl-design.github.io` (verificado 8.8.8.8) |
| HTTPS / Enforce | Certificado GitHub aún no emitido (`certificate does not exist yet`) ⏳ |

## Acciones manuales que solo tú puedes hacer

1. **Partner Center → Pricing and availability**: Assistant = Free; módulos = 7.99 (o 9.99).
2. **Payout account**: PayPal email o banco.
3. **Store listings → Español (Assistant)**: dejar de «Incompleto» y **Volver a enviar para la certificación**.
4. Cuando GitHub emita el cert: **Settings → Pages → Enforce HTTPS** (o lo activo yo con `gh api`).
