<div align="center">

<img src="icon.png" width="128" height="128" alt="Tooltip AI Icon" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(0,245,160,0.3); margin-bottom: 12px;"/>

# 🧠 ToolTip AI
### Inspector de pantalla con IA didáctica para Windows 11

[![GitHub Pages](https://img.shields.io/badge/Web%20Oficial-Landing%20Page-00F5A0?style=for-the-badge&logo=github&logoColor=black)](https://dixi3stdgdl-design.github.io/TeachMe-AI/)
[![Microsoft Store](https://img.shields.io/badge/Microsoft%20Store-v1.0.2-0078D4?style=for-the-badge&logo=windows11&logoColor=white)](https://dixi3stdgdl-design.github.io/TeachMe-AI/)
[![Direct Download](https://img.shields.io/badge/Descarga%20Directa-v1.0.2.0-10B981?style=for-the-badge&logo=windows&logoColor=white)](https://dixi3stdgdl-design.github.io/TeachMe-AI/downloads/TooltipAI.exe)
[![Runtime - .NET 8](https://img.shields.io/badge/.NET-8.0%20WPF%20Standalone-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![License - MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Utilidad de escritorio para Windows 11 que explica botones, diálogos y errores con IA didáctica (Google Gemini, tu propia clave). Recorte global con <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>, HUD flotante y bandeja del sistema.</b>
</p>

</div>

---

## ⚡ Descarga e Instalación

### 1. Descarga Directa (Binario Standalone)
* 📥 **[Descargar ToolTip AI v1.0.2.0 para Windows 11 (.exe)](https://dixi3stdgdl-design.github.io/TeachMe-AI/downloads/TooltipAI.exe)**
* Compilado `win-x64 --self-contained`. Ejecuta y se aloja en la bandeja del sistema.

### 2. Microsoft Store
* **Partner Center ID:** `2f19281b-3d22-4767-9246-e6fe7d6e2d8a`
* Versión de reenvío limpia: **1.0.2.0** (atajos no conflictivos, branding unificado, vault DPAPI).

---

## 🌟 Características Principales

- **⚡ Recorte global (`Ctrl+Shift+A`):** congela la pantalla y permite seleccionar un área sin robar `Ctrl+A` (Seleccionar todo).
- **🪟 HUD flotante:** panel con veredicto, explicación en lenguaje llano, impacto y chat de seguimiento.
- **🤖 IA multi-proveedor (BYOK):** Gemini, OpenAI, Azure OpenAI, OpenRouter o Claude. Tú aportas la clave; se cifra con DPAPI local.
- **📸 Pantalla completa y portapapeles:** analiza capturas o texto copiado.
- **🔽 Bandeja del sistema:** presencia discreta; sin autoarranque forzado.
- **🔒 Clave cifrada localmente:** DPAPI de Windows (`ProtectedData`). Sin backend intermedio de capturas de Dixi3 Lqbs. El análisis va a la API de Google que configures.

---

## ⌨️ Atajos de Teclado

| Atajo | Función |
| :--- | :--- |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | Recorte y análisis |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> | Radar dwell On/Off (off por defecto) |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> | Ajustes |
| <kbd>Esc</kbd> | Cerrar / cancelar |
| **Hover (si radar activo)** | Análisis al reposar el cursor |

---

## 🏗️ Diagrama de Arquitectura

```mermaid
flowchart TD
    subgraph Windows 11 Environment
        Cursor[🖱️ Posición del Mouse / Interacción]
        Kbd[⌨️ HotKey Global Ctrl + A / Ctrl + D]
    end

    subgraph Native Desktop Host
        Hook["⚡ Win32 Low-Level Hook (user32.dll / RegisterHotKey)"]
        WPF["🖥️ Tooltip AI Host (MainWindow.xaml.cs)"]
        ScreenCap["📸 System.Drawing CopyFromScreen (PerMonitorV2 DPI)"]
        Tray["🔽 SystemTrayManager (NotifyIcon en Barra de Tareas)"]
    end

    subgraph Holographic HUD UI
        WV2["🌐 Microsoft WebView2 (Transparent Composition Layer)"]
        HUD["✨ Acrylic Glass HUD (VisionOS / Raycast Grade)"]
    end

    subgraph AI Engine
        Gemini["🤖 Google Gemini 2.5 Flash / Pro (Direct HTTPS / TLS)"]
    end

    Kbd --> Hook
    Hook --> WPF
    WPF --> ScreenCap
    WPF --> Tray
    WPF <-->|WebMessage IPC Bi-direccional| WV2
    WV2 --> HUD
    HUD -->|Prompt Multimodal + Base64| Gemini
    Gemini -->|Veredicto + Diagnóstico JSON| HUD
```

---

## 📁 Estructura del Repositorio

```text
TeachMe AI/
├── src-dotnet/                          # Aplicación de escritorio C# / .NET 8 WPF
│   ├── TeachMeAI.csproj                 # Configuración del proyecto WPF standalone
│   ├── MainWindow.xaml                  # Ventana acrílica de superposición
│   ├── MainWindow.xaml.cs               # Lógica de captura, hotkeys y WebView2 IPC
│   ├── GlobalHotKey.cs                  # Registrador de atajos de sistema Win32
│   ├── SystemTrayManager.cs             # Gestor de bandeja de sistema (System Tray)
│   ├── StartupManager.cs                # Administrador de arranque opcional en Windows
│   └── wwwroot/                         # Interfaz gráfica Fluent/VisionOS del HUD
├── MicrosoftStore_Submission/           # Kit Oficial para Microsoft Partner Center
│   ├── Package/
│   │   ├── TooltipAI.exe                # Ejecutable standalone de 72.4 MB
│   │   └── TooltipAI_1.0.0.0_x64.msix   # Paquete MSIX firmado
│   ├── Store_Assets/                    # Logos exactos (1080x1080, 2160x2160) y Screenshots
│   └── METADATOS_FICHA_TIENDA.md        # Textos y descripciones oficiales
├── downloads/
│   └── TooltipAI.exe                    # Binario servido directamente por CDN Fastly
├── index.html                           # Landing Page interactiva con simulador en vivo
├── privacy.html                         # Política de Privacidad oficial
├── LICENSE                              # Licencia MIT
└── README.md                            # Documentación del proyecto
```

---

## 🛠️ Compilación desde el Código Fuente

Si deseas compilar la aplicación tú mismo:

### Requisitos
- Windows 10 (1809+) o Windows 11.
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) instalado.

### Comandos de Compilación
```powershell
# 1. Clonar el repositorio
git clone https://github.com/dixi3stdgdl-design/TeachMe-AI.git
cd TeachMe-AI

# 2. Compilar binario autónomo de archivo único (Self-contained)
dotnet publish src-dotnet/TeachMeAI.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./dist

# 3. Ejecutar
.\dist\TooltipAI.exe
```

---

## 📜 Licencia y Privacidad

Distribuido bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) y nuestra [Política de Privacidad](privacy.html) para más detalles.

<div align="center">
  <sub>Desarrollado con ❤️ para los usuarios y entusiastas de Windows 11.</sub>
</div>
