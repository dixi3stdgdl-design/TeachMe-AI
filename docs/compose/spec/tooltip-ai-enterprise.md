---
feature: tooltip-ai-enterprise
status: in-progress
updated: 2026-09-17
branch: main
commits: (pending)
---

# Paquetes empresariales Tooltip-ai

## Report

## [S1] Problem
La suite se vende como apps individuales (Free + módulos 9.99). Equipos y empresas necesitan un paquete claro: despliegue, licencias por volumen, soporte y una sola factura/relación comercial. Hoy no hay sección enterprise en las landings ni licencia organizacional activada en Store.

## [S2] Design
### Oferta (3 tiers web + Store)
| Tier | Incluye | Canal |
|---|---|---|
| **Individual** | Assistant gratis; módulo 9.99 USD | Store retail + descarga EXE |
| **Team** | Suite completa ×N asientos, actualizaciones, soporte email | Store org licensing + PayPal Business / contacto |
| **Enterprise** | Suite + Bridge, despliegue MSI/MSIX, BYOK corporativo, SSO/Intune-ready notes, SLA soporte, factura | Contacto comercial `enterprise@tooltip-ai.com` / PayPal custom |

### Store
- En **Cada submission** → Precios → *Concesión de licencias de organizaciones*: permitir compra por volumen.
- Precios base: Assistant **Free**; Aura/Translate/Voice **9.99 USD**.

### Landings
- Bloque «Empresas» en `index.html` y en `translate/voice/aura` (strip + CTA).
- CTA principal: correo enterprise + enlace PayPal NCP (donativo/apoyo) y EXE; no inventar checkout B2B falso.
- Copy honesto: BYOK, sin backend de capturas, MSIX Store, despliegue asistido.

## [S3] Out of Scope
- Portal de licencias propio / facturación SaaS.
- Contrato legal enterprise (plantilla después).
- Bridge aún en diseño (se menciona como roadmap).

## Tasks
- [x] T1: Especificación enterprise — acceptance: este doc (covers: S2)
- [ ] T2: Sección Empresas en index + 3 landings — acceptance: CTA visible en las 4 (covers: S2)
- [ ] T3: Organizational licensing on en 3 submissions Store — acceptance: checkbox activo (covers: S2)
- [ ] T4: Precios 0 / 9.99 + reenvío certificación — acceptance: estado Certification (covers: S2)
- [ ] T5: Voice reserva + submission — acceptance: producto Voice en Partner Center (covers: S2)
