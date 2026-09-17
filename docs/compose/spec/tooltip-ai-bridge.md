---
feature: tooltip-ai-bridge
status: designed
updated: 2026-09-17
branch: main
commits: (pending)
---

# Tooltip-ai Bridge — 5.ª módulo de accesibilidad

## Report

## [S1] Problem
Personas con deficiencias visuales, motrices, auditivas o cognitivas no pueden usar, aprender ni desarrollar tareas en Windows con la misma fluidez. La suite Tooltip-ai ya inspecciona la pantalla y explica UI; falta un módulo que **empareje** ese contexto con ayudas de accesibilidad.

## [S2] Design
- **Nombre de marca:** `Tooltip-ai Bridge` (dominio de suite: `tooltip-ai.com/bridge`).
- **Promesa:** «Puente entre tu forma de ver/moverte/escuchar/pensar y la interfaz.»
- **Perfiles v1 (todos):**
  1. **Visual / baja visión** — lupa de contexto, alto contraste, lectura en voz alta del control bajo el cursor.
  2. **Motriz / manos** — dwell + switch, comandos de voz, simplificar a un solo gesto/atajo.
  3. **Auditivo** — alertas visuales de sonidos del sistema, transcripción de avisos.
  4. **Cognitivo / aprendizaje** — pasos guiados, lenguaje simple, memoria de tarea, tutor socrático (reutiliza motor multi-proveedor).
- **Posicionamiento Store:** módulo de pago de la suite (misma franja que Aura/Voice/Translate).
- **Privacidad:** BYOK + DPAPI; sin backend intermedio de capturas (misma promesa que el núcleo).
- **Acreditación:** misma franja MiMo Desktop + proveedores de IA.

## [S3] Out of Scope
- Certificación VPAT/WCAG completa en v1.
- Hardware de asistencia externo.
- Publicación Chrome Web Store (después).

## Tasks
- [ ] T1: Landing `/bridge` alineada al design system — acceptance: nav suite enlaza Bridge (covers: S2)
- [ ] T2: Esqueleto app WPF o extensión browser MVP — acceptance: dwell + lectura del control (covers: S2)
- [ ] T3: Reserva de nombre Store + MSIX — acceptance: producto Bridge en Partner Center (covers: S2)
- [ ] T4: METADATOS ficha ES honestos — acceptance: sin claims de curación (covers: S2)
