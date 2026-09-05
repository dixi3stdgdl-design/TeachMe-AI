<div align="center">

# 🧠 TeachMe AI
### Windows 11 Neural Screen Inspector & Cognitive HUD

[![OS - Windows 11](https://img.shields.io/badge/OS-Windows%2011%20Fluent-0078D4?style=for-the-badge&logo=windows11&logoColor=white)](https://microsoft.com)
[![Engine - Rust](https://img.shields.io/badge/Engine-Rust%202021%20C--ABI-DEA584?style=for-the-badge&logo=rust&logoColor=black)](https://www.rust-lang.org/)
[![Runtime - .NET 10](https://img.shields.io/badge/.NET-10%20WPF%20Preview-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![UI - WebView2 Acrylic](https://img.shields.io/badge/UI-WebView2%20%7C%20Acrylic%20HUD-00C7B7?style=for-the-badge&logo=microsoftedge&logoColor=white)](https://developer.microsoft.com/microsoft-edge/webview2/)
[![License - MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Utilidad de escritorio de ultra-bajo consumo que analiza cualquier ventana, diálogo de error o interfaz en Windows 11 en tiempo real mediante hooks de bajo nivel y un HUD acrílico translúcido flotante.</b>
</p>

</div>

---

## 🌟 Características Principales

- **⚡ Recorte Instantáneo Global (<kbd>Shift</kbd> + <kbd>A</kbd>):**
  Interrupción mediante hook de sistema operativo (`WH_KEYBOARD_LL`) que congela la pantalla en cualquier aplicación (Chrome, Blender, juegos o asistentes de instalación) permitiendo seleccionar un área de interés con cruz milimétrica.
- **🦀 Núcleo Nativo en Rust (`src-rust/`):**
  Librería C-ABI (`teachme_core.dll`) con llamadas Win32 atómicas a `WindowFromPoint`, `GetWindowTextW`, y captura de memoria Direct GDI BitBlt sin copias redundantes en espacio de usuario.
- **🔷 Host Robusto en .NET 10 (C# / WPF):**
  Host en WPF con aceleración por hardware, soporte para múltiples monitores (`PerMonitorV2` High-DPI), y fallback dinámico P/Invoke para máxima compatibilidad sin dependencias externas obligatorias.
- **🪟 HUD Acrílico Translúcido de 270px (VisionOS / Raycast Grade):**
  Panel ultracompacto con 60% de opacidad, desenfoque de fondo dinámico, tipografía ergonómica de lectura confortable (`Plus Jakarta Sans` y `JetBrains Mono`) y conector holográfico libre de cables invasivos.
- **⏳ Radar de Descanso de Ratón (3.0s Dwell):**
  Temporizador radial no intrusivo con micro-animaciones en tiempo real para evitar estrés de espera. Al pausar sobre cualquier control, el HUD se activa automáticamente; pulsa <kbd>Espacio</kbd> para saltar la espera.
- **🛡️ Auditoría Integral de Procesos:**
  Identifica firmas digitales (Authenticode), binarios asociados, consumo estimado de recursos, claves de registro y códigos de error (ej. `0x80070005`).

---

## 🏗️ Diagrama de Arquitectura

```mermaid
flowchart TD
    subgraph Windows 11 Environment
        Cursor[🖱️ Posición del Mouse / Interacción]
        Kbd[⌨️ HotKey Shift + A]
    end

    subgraph Native Kernel Layer
        Hook["⚡ Low-Level Hook (WH_KEYBOARD_LL / HotKey)"]
        RustLib["🦀 Rust Core (teachme_core.dll C-ABI)"]
        Win32API["🪟 Win32 API (user32 / kernel32 / gdi32)"]
    end

    subgraph .NET 10 Host
        Bridge["🔷 RustNativeBridge.cs (P/Invoke + Fast-Path)"]
        WPF["🖥️ TeachMe AI Host Window (MainWindow.xaml)"]
        ScreenCap["📸 System.Drawing CopyFromScreen"]
    end

    subgraph Holographic HUD UI
        WV2["🌐 Microsoft WebView2 (Transparent Composition)"]
        HUD["✨ 270px Acrylic Glass Card (5 Tab Views)"]
    end

    Cursor -->|3s Dwell| Hook
    Kbd --> Hook
    Hook --> WPF
    WPF --> Bridge
    Bridge --> RustLib
    Bridge -.-> Win32API
    WPF --> ScreenCap
    WPF <-->|WebMessage IPC| WV2
    WV2 --> HUD
```

---

## 📁 Estructura del Proyecto

```text
TeachMe AI/
├── src-rust/                      # Núcleo de bajo nivel en Rust
│   ├── Cargo.toml                 # Configuración cdylib + windows-rs
│   └── src/
│       └── lib.rs                 # Exports C-ABI (WindowFromPoint, BitBlt, PIDs)
├── src-dotnet/                    # Aplicación Host en C# / .NET 10 WPF
│   ├── TeachMeAI.csproj           # Configuración con System.Drawing 10.0.11 + WebView2
│   ├── app.manifest               # DPI Awareness PerMonitorV2
│   ├── MainWindow.xaml            # Ventana transparente de superposición
│   ├── MainWindow.xaml.cs         # Inicialización, IPC y captura de pantalla
│   ├── RustNativeBridge.cs        # Cargador dinámico de Rust con Win32 fallback
│   ├── GlobalHotKey.cs            # Hook de teclado global (Shift+A / Alt+A)
│   └── wwwroot/                   # Interfaz HUD distribuida con la app
│       ├── index.html             # Estructura del HUD y visor de recorte
│       ├── styles.css             # Estilos Fluent Acrylic y micro-animaciones
│       └── app.js                 # Lógica de estados, radar dwell y comunicación IPC
├── build.bat                      # Script de compilación automatizada Rust + .NET
├── run.bat                        # Lanzador directo en Windows
├── .gitignore                     # Filtros de exclusión para Git
└── README.md                      # Documentación del proyecto
```

---

## ⌨️ Atajos de Teclado y Gestos

| Atajo / Gesto | Función | Comportamiento |
| :--- | :--- | :--- |
| <kbd>Shift</kbd> + <kbd>A</kbd> | **Recorte Instantáneo** | Congela la pantalla en cualquier aplicación y activa el cursor de precisión. |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> | **Recorte Alternativo** | Atajo compatible con editores de código y suites 3D. |
| <kbd>Espacio</kbd> | **Saltar Espera** | Abre el panel inmediatamente mientras el radar de 3s está activo. |
| <kbd>Esc</kbd> | **Cancelar / Cerrar** | Cancela el recorte en curso o desvanece el panel HUD. |
| **Hover 3.0s** | **Dwell Activo** | Inicia el escaneo automático del elemento bajo el cursor. |
| **Icono 📌** | **Fijar Panel** | Ancla el HUD para lectura continua sin que desaparezca al mover el ratón. |

---

## 🚀 Requisitos y Compilación

### Requisitos Previos
- **Sistema Operativo:** Windows 10 (1809+) o Windows 11 (Recomendado).
- **.NET SDK:** .NET 8.0 o superior (compatible con paquetes .NET 10 Preview).
- **WebView2 Runtime:** Incluido de forma nativa en Windows 11.
- **Rust Toolchain (Opcional):** Si deseas recompilar `teachme_core.dll` con `cargo`. Si no está instalado, la app ejecuta su Fast-Path Win32 nativo integrado automáticamente.

### Compilación Rápida (Scripts Incluidos)

1. **Compilar todo el proyecto (Rust + .NET):**
   ```cmd
   build.bat
   ```

2. **Ejecutar la aplicación:**
   ```cmd
   run.bat
   ```

### Compilación Manual vía CLI

```powershell
# 1. (Opcional) Compilar Crate de Rust
cd src-rust
cargo build --release
cd ..

# 2. Compilar y Ejecutar Host en .NET
dotnet run --project "src-dotnet\TeachMeAI.csproj"
```

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.

<div align="center">
  <sub>Desarrollado con ❤️ para la comunidad de ingeniería de software y diseño en Windows 11.</sub>
</div>
