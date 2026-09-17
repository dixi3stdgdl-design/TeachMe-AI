---
feature: tooltip-ai-i18n
status: in-progress
updated: 2026-09-17
branch: main
commits: (pending)
---

# Multiidioma mundial Tooltip-ai

## Report

## [S1] Problem
La UI WPF y las landings están en español fijo. Quien compre en China/Japón/Egipto puede adquirir la app en Store, pero la ve en español. No hay `resx` ni `CurrentUICulture`.

## [S2] Design
- **Cultura:** `es-ES` por defecto (producto nativo) + `en-US` fallback de sistema (`CultureInfo.CurrentUICulture`).
- **WPF Assistant:** `src-dotnet/Strings.resx` (neutro/en) + `Strings.es.resx`; clase `Loc` con indexer. Cadenas críticas de HUD/ajeses/tray migradas primero.
- **Landings:** `en/` con réplicas de index/translate/voice/aura/privacy + `hreflang`; nav ES↔EN.
- **Store:** listing `en-US` además de `es-ES` (mismo package).
- **Fuera de v1:** JA/ZH/AR completos, RTL, satélites de Aura/Voice WPF.

## [S3] Out of Scope
Traducción machine de 100% de strings de todos los .cs; localización de mensajes de error de red de terceros.

## Tasks
- [ ] T1: Infra Loc + Strings.resx/es — acceptance: cultura se resuelve en arranque (covers: S2)
- [ ] T2: Migrar cadenas HUD/App principales — acceptance: HUD EN con OS en-US (covers: S2)
- [ ] T3: Landings /en/ 5 páginas + hreflang — acceptance: https://tooltip-ai.com/en/ 200 (covers: S2)
- [ ] T4: Build MSIX/EXE — acceptance: compile sin errores (covers: S2)
- [ ] T5: Store listing en-US — acceptance: idioma añadido en submission (covers: S2)
