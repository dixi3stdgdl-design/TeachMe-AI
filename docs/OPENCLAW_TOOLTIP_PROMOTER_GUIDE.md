# Guía de OpenClaw Companion & Agente Promotor de ToolTip AI

Esta guía documenta la integración entre **OpenClaw Companion**, su nodo en Windows y la API de Google Gemini para convertir al agente en el embajador autónomo de crecimiento de la suite **ToolTip AI**.

---

## 1. Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────┐
│                   WINDOWS 11 HOST                      │
│                                                        │
│  [OpenClaw Companion] ─── (Tray WinUI 3)               │
│    • Capacidades de Nodo: Screen Snapshot, Canvas      │
│    • CLI en PATH: `openclaw` (PowerShell / CMD)        │
│                                                        │
│             ▲ WebSocket ws://127.0.0.1:18789           │
│             ▼ Token: 3d49cf88ba34...                   │
├────────────────────────────────────────────────────────┤
│             WSL2 (OpenClawGateway Distro)              │
│                                                        │
│  [OpenClaw Gateway Service] (v2026.9.7)                │
│    • Motor IA: Google Gemini (gemini-2.5-flash)        │
│    • Workspace: /home/openclaw/.openclaw/workspace     │
│    • Identidad: Claw (ToolTip AI Growth Partner)       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Configuración y Enlace Realizados

1. **CLI en Windows disponible globalmente**:
   - Puedes abrir cualquier terminal de PowerShell o CMD y ejecutar directamente:
     ```powershell
     openclaw --version
     openclaw status
     ```
2. **Motor de IA conectado**:
   - Integrado con la API de Google Gemini (`GEMINI_API_KEY`) en el backend de OpenClaw.
   - Modelos por defecto: `google/gemini-2.5-flash` y `google/gemini-2.5-flash-lite`.
3. **Identidad del Agente (`IDENTITY.md` y `SOUL.md`)**:
   - Especializado con el conocimiento integral de la suite ToolTip AI:
     - **Assistant**: Prueba gratuita de 3 días · Gratis de por vida en la Suite.
     - **Translate**: Traducción en pantalla por reposo y OCR sin copiar/pegar ($9.99 USD).
     - **Aura**: Contexto y radar por reposo ($9.99 USD).
     - **Voice**: Lectura con Audio Ducking WASAPI automático ($9.99 USD).
     - **Suite Completa Bundle**: Las 4 apps de por vida por $24.99 USD.
     - **Web y Enlaces**: [https://tooltip-ai.com/](https://tooltip-ai.com/) y `/translate`, `/aura`, `/voice`, `/assistant`.

---

## 3. Comandos para Poner al Agente a Trabajar en Promoción

Puedes interactuar con el agente desde tu terminal en Windows con estos comandos de ejemplo:

### A. Generar Hilos Virales para Redes Sociales (X / Twitter / LinkedIn)
```powershell
openclaw agent --message "Genera 3 hilos para Twitter/X explicando por qué las herramientas nativas WPF de ToolTip AI son 20 veces más ligeras que las apps de Electron, destacando la prueba gratis de 3 días de Assistant y el enlace a https://tooltip-ai.com"
```

### B. Prospección de Medios y Blogs Tecnológicos
```powershell
openclaw agent --message "Redacta un correo de propuesta de prensa para editores de Genbeta, Xataka y Windows Central sobre el lanzamiento de ToolTip AI Suite, enfatizando el cifrado local DPAPI y cero telemetría externa."
```

### C. Estrategia de Reddit & Comunidades de Productividad
```powershell
openclaw agent --message "Prepara un post para Reddit (r/windows y r/productivity) titulado: 'Construí un traductor e inspector de pantalla nativo de 15 MB que traduce sin copiar ni pegar'. Incluye preguntas frecuentes y llamado a la acción."
```

### D. Modo Interactivo Terminal (TUI)
Para chatear directamente en la consola con el agente:
```powershell
openclaw tui
```
