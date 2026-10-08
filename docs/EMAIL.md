# Correo y entrega — ToolTip AI

## Destinos reales (del dueño)

| Uso | Correo |
|---|---|
| **Ventas / entrega de licencias (principal)** | `dixstdgdl3@gmail.com` |
| **Equipos / Enterprise / Partner Center** | `DixStdGdl@hotmail.com` |
| Dominio | `tooltip-ai.com` (Porkbun) |

## DNS del dominio (verificado 28/09/2026)

| Tipo | Valor |
|---|---|
| MX | `fwd1.porkbun.com` (10), `fwd2.porkbun.com` (20) |
| SPF | `v=spf1 include:_spf.porkbun.com ~all` |

Es **reenvío de Porkbun**, no buzón alojado.

## Configuración obligatoria en Porkbun (hazlo una vez)

Porkbun → `tooltip-ai.com` → **Email Forwarding**:

| Alias | Reenvía a |
|---|---|
| `enterprise@tooltip-ai.com` | `dixstdgdl3@gmail.com` |
| `ventas@tooltip-ai.com` (opcional) | `dixstdgdl3@gmail.com` |
| `team@tooltip-ai.com` (opcional) | `DixStdGdl@hotmail.com` |
| `*` (catch-all, si lo hay) | `dixstdgdl3@gmail.com` |

**Mientras el reenvío no esté puesto, `empresa@dominio` no llega a nadie.**  
La web ya enlaza a los correos reales (`gmail` para ventas, `hotmail` para Team) para no perder cobros.

## Flujo de una venta

```text
1. Cliente paga (PayPal.me 48.88 / 9.99)
2. Te escribe a dixstdgdl3@gmail.com con el comprobante
3. Respondes con instaladores (MSIX/EXE + APK) + licencia (24 h máx.)
4. Registras la venta en tu hoja de caja
```

## Regla

- No se publica un correo en la web que no compruebes cada día.
- Antes de cada campaña de ventas: enviar 1 mail de prueba al alias del dominio.
