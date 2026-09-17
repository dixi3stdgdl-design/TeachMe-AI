---
feature: tooltip-ai-com-launch
status: in-progress
updated: 2026-09-17
branch: main (worktree blocked by session isolation)
commits: (pending)
---

# Lanzamiento tooltip-ai.com + precios Store

## Report

(en curso — se completa al finalizar)

## [S1] Problem
El dominio `tooltip-ai.com` estaba comprado en Porkbun pero apuntaba al parking. La suite (landing raíz + /translate + /voice + /aura + /privacy) ya desplegaba en GitHub Pages desde `TeachMe-AI`. Faltaba cablear DNS → Pages, HTTPS y cerrar la estrategia de precios de Microsoft Store.

## [S2] Design
- **Web host**: GitHub Pages (workflow `.github/workflows/pages.yml`) con `CNAME=tooltip-ai.com`.
- **DNS Porkbun**:
  - `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `CNAME www` → `dixi3stdgdl-design.github.io`
  - Borrar `ALIAS @ → uixie.porkbun.com` y `CNAME * → uixie.porkbun.com` (parking)
  - Conservar MX/TXT de email Porkbun
- **GitHub Pages**: custom domain `tooltip-ai.com`; Enforce HTTPS cuando exista certificado.
- **Monetización Store (decisión de usuario)**:
  - **ToolTip AI Assistant (núcleo)**: **Gratis** (embudo de adquisición)
  - **Módulos Aura / Voice / Translate**: de **pago**, rango premium **7.99–9.99 USD**
  - Payout Partner Center: método de pago (PayPal **email** de cuenta o banco). El enlace `paypal.me` **no** es el campo de payout; solo sirve si quieres un botón de donaciones en la landing.
- **API Porkbun**: key local en `%USERPROFILE%\.cache\playwright-tooltip-ai\porkbun-creds.json` (no commitear).

## [S3] Out of Scope
- Publicación de extensiones Chrome Web Store / Edge Add-ons
- Código de las apps WPF Aura/Voice/Translate
- Cambio de nombre del repo `TeachMe-AI`

## Tasks
- [x] T1: Fijar CNAME en GitHub Pages API — acceptance: `cname=tooltip-ai.com` (covers: S2)
- [x] T2: Crear API key Porkbun + opt-in API — acceptance: retrieve DNS SUCCESS (covers: S2)
- [x] T3: Borrar parking y crear 4×A + CNAME www — acceptance: retrieve final con IPs GitHub (covers: S2)
- [x] T4: Verificar `http://tooltip-ai.com` sirve la landing — acceptance: HTTP 200 + título Tooltip-ai (covers: S2)
- [ ] T5: Enforce HTTPS cuando el cert exista — acceptance: `https://tooltip-ai.com` 200 (covers: S2; depends: T3)
- [ ] T6: `www.tooltip-ai.com` resuelve a github.io — acceptance: CNAME `dixi3stdgdl-design.github.io` (covers: S2)
- [ ] T7: Registrar precios + payout en Partner Center — acceptance: Assistant gratis; módulos 7.99–9.99 (covers: S2)
- [ ] T8: Reenviar submission Assistant (listing ES completo) — acceptance: estado Certification (covers: S2)
