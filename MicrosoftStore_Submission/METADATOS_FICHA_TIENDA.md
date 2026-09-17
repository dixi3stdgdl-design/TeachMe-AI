# Metadatos de Microsoft Store — ToolTip AI

Textos honestos listos para pegar en Partner Center. Sin claims imposibles de verificar.

## Información básica

- **Nombre del producto:** `ToolTip AI`
- **Subtítulo (máx. 100):** `Inspector de pantalla con IA didáctica para Windows 11`

## Descripción corta (máx. 270)

```text
Analiza botones, diálogos y errores de Windows con IA didáctica multi-proveedor BYOK (Gemini, OpenAI, Azure, OpenRouter o Claude — tu propia clave). Recorte con Ctrl+Shift+A, HUD flotante y bandeja del sistema. Clave cifrada con DPAPI; sin backend intermedio de capturas.
```

## Descripción completa

```text
ToolTip AI — Inspector de pantalla con IA didáctica para Windows 11

¿Un diálogo de error confuso o un botón cuyo efecto no conoces? ToolTip AI te ayuda a decidir con más contexto antes de hacer clic.

CÓMO FUNCIONA
1. Pulsa Ctrl+Shift+A (o usa la bandeja del sistema).
2. Selecciona el área de la pantalla que quieres entender.
3. Lee el veredicto, la explicación en lenguaje llano y, si eres avanzado, comandos de diagnóstico.

FUNCIONES
• Recorte global con Ctrl+Shift+A (no interfiere con Seleccionar todo).
• HUD flotante con veredicto, explicación, impacto y chat de seguimiento.
• Radar opcional con Ctrl+Shift+D (análisis al reposar el cursor; apagado por defecto).
• Captura de pantalla completa y análisis de portapapeles.
• Proveedores de IA a tu elección (BYOK): Gemini, OpenAI, Azure OpenAI, OpenRouter o Claude.

PRIVACIDAD
• Tu clave de API se cifra en el equipo con Windows DPAPI; no se envía a nuestros servidores.
• Las capturas, cuando pides un análisis, van cifradas a la API de Google que tú configuras.
• No operamos un backend intermedio de capturas ni incluimos publicidad.

REQUISITOS
• Windows 10 (1809+) o Windows 11, x64.
• Conexión a Internet y una clave de API del proveedor de IA que elijas (p. ej. Google Gemini u OpenAI).
```

## Características (máx. 120 c/u)

1. `Recorte global con Ctrl+Shift+A sin bloquear Seleccionar todo.`
2. `Explicación didáctica de botones, diálogos y errores con IA.`
3. `Veredicto de riesgo y comandos de diagnóstico listos para copiar.`
4. `Clave de API cifrada localmente con DPAPI de Windows.`
5. `Bandeja del sistema y HUD flotante con bajo impacto.`
6. `Radar dwell opcional (Ctrl+Shift+D), apagado por defecto.`

## Palabras clave (máx. 7)

1. `ToolTip AI`
2. `Inspector de pantalla`
3. `Asistente IA`
4. `Diálogos de error`
5. `Gemini`
6. `Windows 11`
7. `Productividad`

## Justificación para funcionalidad restringida: runFullTrust (Copiar y pegar en Partner Center)

Cuando Partner Center pregunte por la justificación de la capacidad restringida `runFullTrust`, ingresa el siguiente texto (en inglés o español según te lo solicite):

**En inglés (recomendado para revisores de Microsoft):**
```text
ToolTip AI is a Windows 10/11 desktop utility built with .NET 8 WPF, packaged as an MSIX desktop bridge application. It requires the 'runFullTrust' capability for the following core functionalities:
1. Screen region capture (using standard Windows desktop GDI/Graphics APIs) triggered only when the user requests screen inspection.
2. Registering global hotkeys (RegisterHotKey API: Ctrl+Shift+A for inspection, Ctrl+Shift+D for hover radar) to allow quick access from any active window.
3. System tray (notification area) integration for background status and quick configuration access.
4. Local secure storage of user-provided API keys using Windows DPAPI (Data Protection API).
```

**En español:**
```text
ToolTip AI es una utilidad de escritorio para Windows 10/11 desarrollada en .NET 8 WPF y empaquetada como aplicación MSIX de puente de escritorio. Requiere la capacidad 'runFullTrust' para:
1. Captura de área de pantalla (APIs de gráficos de Windows) iniciada exclusivamente cuando el usuario solicita una inspección.
2. Registro de atajos de teclado globales (Ctrl+Shift+A y Ctrl+Shift+D) mediante la API RegisterHotKey para accesibilidad rápida desde cualquier ventana.
3. Icono en la bandeja del sistema (System Tray) para ejecución en segundo plano y acceso a configuración.
4. Almacenamiento seguro local de credenciales con Windows DPAPI.
```

## Notas de certificación y versión

- **Regla de versión de la Tienda:** Microsoft Store exige que el cuarto dígito (Revisión) sea SIEMPRE `0` (formato `Mayor.Menor.Compilación.0`). Por eso la versión del paquete es **1.0.3.0**.
- **Capacidad declarada:** `runFullTrust` (justificación incluida arriba).
- **Atajos globales:** `Ctrl+Shift+A` (recorte), `Ctrl+Shift+D` (radar hover), `Ctrl+Shift+C` (portapapeles) — ninguno interfiere con atajos estándar del sistema como `Ctrl+A`.
- **Privacidad y Seguridad:** Cifrado DPAPI local para clave Gemini; no hay servidores intermediarios.

