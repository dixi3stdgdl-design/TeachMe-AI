---
feature: tooltip-ai-com-launch
status: delivered
updated: 2026-09-17
branch: main
commits: 0e8a04a..08e3af3
---

# Lanzamiento tooltip-ai.com + precios Store

## Report

**What was built** — El dominio `tooltip-ai.com` (Porkbun) quedó cableado a GitHub Pages del repo `TeachMe-AI`: 4×A + CNAME www, CNAME en Pages, y la suite (home, /translate, /voice, /aura, /privacy) sirve en `http://tooltip-ai.com`. Las landings reflejan IA multi-proveedor BYOK, bloque de aportación con enlace PayPal Business profesional (`paypal.com/ncp/payment/HPDSLDCAGVHFL`, USD, importe libre) más `paypal.me/DixLqb`, y acreditación de Xiaomi MiMo Desktop + Gemini con disclaimer de no-afiliación. Se documentó la matriz de precios Store (Assistant gratis; módulos 7.99–9.99 USD) y el payout por email PayPal en Partner Center.

**Verification** — `Resolve-DnsName tooltip-ai.com -Server 8.8.8.8` → 185.199.108–111.153. `Invoke-WebRequest http://tooltip-ai.com/` → 200 con `HPDSLDCAGVHFL`, «Xiaomi MiMo» y copy multi-proveedor. `gh run list` → Deploy GitHub Pages success en `08e3af3`. `gh api .../pages` → `cname=tooltip-ai.com`. Porkbun API retrieve → registros A/CNAME/MX/TXT esperados. HTTPS aún no emitido por GitHub (`certificate does not exist yet`); vigilante programado cada 7 min para forzar Enforce HTTPS.

**Journey log** —
1. DNS inicial apuntaba a parking Porkbun (ALIAS/CNAME → uixie.porkbun.com); la UI de DNS se colgó; se resolvió por API JSON v3 con key local.
2. `gh api` con `-f https_enforced=true` falla (string vs boolean); usar `-F`.
3. Setear cname+https juntos da 404 hasta que exista cert; primero solo `cname`.
4. El botón Donar no necesita API REST de PayPal: un enlace NCP Business (importes USD libres) es el cierre profesional correcto.
5. Partner Center y 2FA de Porkbun no se automatizan sin sesión/autenticador del usuario.

## [S1] Problem
Dominio comprado sin apuntar a la suite; landings posicionaban Gemini como único proveedor; faltaba monetización de aportaciones y acreditación del entorno de desarrollo; precios Store sin documentar.

## [S2] Design
- **Web host**: GitHub Pages workflow con `CNAME=tooltip-ai.com`.
- **DNS Porkbun**: A @ → IPs GitHub; CNAME www → `dixi3stdgdl-design.github.io`; sin parking.
- **Monetización**: Assistant gratis; módulos Aura/Voice/Translate 7.99–9.99 USD; Donar via NCP `HPDSLDCAGVHFL` + paypal.me.
- **Acreditación**: bloque en index + strip en módulos; disclaimer Xiaomi/Google.
- **Store**: payout = email PayPal; privacy URL github.io hasta HTTPS.

## [S3] Out of Scope
Chrome Web Store; código WPF de módulos; renombrar repo `TeachMe-AI`; activar 2FA (requiere authenticator del usuario); completar listing Partner Center (requiere login Microsoft del usuario).

## Tasks
- [x] T1: CNAME en GitHub Pages API — acceptance: `cname=tooltip-ai.com` (covers: S2)
- [x] T2: API key Porkbun + retrieve DNS SUCCESS (covers: S2)
- [x] T3: Borrar parking; 4×A + CNAME www (covers: S2)
- [x] T4: `http://tooltip-ai.com` HTTP 200 + landing Tooltip-ai (covers: S2)
- [x] T5: Landings multi-proveedor + Donar NCP + acreditación MiMo (covers: S2)
- [x] T6: Docs precios/payout Store (covers: S2)
- [ ] T7: Enforce HTTPS cuando GitHub emita cert — acceptance: `https://tooltip-ai.com` 200 (covers: S2; depends: T3)
- [ ] T8: Reenvío certificación Assistant (listing ES) — acceptance: estado Certification (covers: S2)
- [ ] T9: 2FA Porkbun con app — acceptance: switch on (covers: S2)
