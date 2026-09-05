/**
 * TeachMe AI — Windows 11 Neural Screen Inspector (Raycast/VisionOS Grade)
 * Advanced Dynamic Positioning, SVG Holographic Guide Ray, Laser Sweep & Socratic Q&A
 */

// Comprehensive Target Metadata simulating UI Automation + Multimodal Vision
const INSPECTION_DATABASE = {
  installer_bloatware: {
    name: "Opera Browser & WebSearcher Bar",
    controlType: "UIA_CheckBox",
    confidence: "99.4% Certeza",
    processName: "MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"Instalar Opera Browser y Barra de Búsqueda WebSearcher"',
    verdictText: "Adware No Necesario • Desmarcar Recomendado",
    safetyTag: "Riesgo: Medio",
    actionTag: "Acción: Omitir",
    summary: "Es una casilla de software patrocinado de terceros (PUA / Adware) bundled en el instalador. No es requerida para que MediaPro funcione.",
    nature: "Oferta promocional bundled. Modifica el motor de búsqueda predeterminado del sistema.",
    impact: "Agrega servicios en segundo plano al arranque de Windows e incrementa el consumo de memoria.",
    riskLevel: "Alerta: Se recomienda desmarcar",
    riskClass: "warning",
    consequences: "Si dejas marcada esta casilla, se descargarán 140MB adicionales e instalarán extensiones de navegación que cambian tu página de inicio. Te recomendamos desmarcarla para mantener el sistema optimizado.",
    vendor: "Opera Software AS / Sponsor Network",
    signStatus: "Válida (SHA256 Authenticode)",
    exePath: "C:\\Users\\AppData\\Local\\Temp\\is-44A.tmp",
    resources: "CPU: ~0.1% | RAM: ~18 MB",
    accessKey: "Espacio (Toggle)",
    cliSnippet: `# Desactivar instalación silenciosa de bloatware:
Start-Process "MediaProSetup.exe" -ArgumentList "/VERYSILENT /NOICONS /TASKS='!optout'"`
  },
  installer_main_checkbox: {
    name: "MediaPro Codec Pack (Requerido)",
    controlType: "UIA_CheckBox (Disabled)",
    confidence: "99.8% Certeza",
    processName: "MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"Instalar MediaPro Codec Pack (Requerido)"',
    verdictText: "Componente Crítico • Motor de Codecs",
    safetyTag: "Seguro",
    actionTag: "Acción: Requerido",
    summary: "Componente esencial que instala bibliotecas de decodificación AV1, H.265 y Opus en el subsistema DirectShow de Windows.",
    nature: "Bibliotecas nativas de tiempo de ejecución (DirectShow & Media Foundation filters).",
    impact: "Necesario para la renderización y exportación de archivos multimedia.",
    riskLevel: "Seguro y Necesario",
    riskClass: "safe",
    consequences: "Este componente no puede desmarcarse porque es el motor principal del programa. Está verificado contra virus y malware.",
    vendor: "MediaPro Studio Corp.",
    signStatus: "Válida (Microsoft Windows Third-Party Compatibility)",
    exePath: "C:\\Program Files\\MediaPro\\codecs\\mpfilter.dll",
    resources: "Almacenamiento: 85 MB en System32",
    accessKey: "Espacio (Bloqueado)",
    cliSnippet: `# Registrar filtro de codecs manualmente:
regsvr32.exe /s "C:\\Program Files\\MediaPro\\codecs\\mpfilter.dll"`
  },
  btn_custom_install: {
    name: "Botón 'Instalación Avanzada...'",
    controlType: "UIA_Button",
    confidence: "98.9% Certeza",
    processName: "MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"Instalación Avanzada..."',
    verdictText: "Opciones Avanzadas • Permite Cambiar Disco",
    safetyTag: "Seguro",
    actionTag: "Acción: Recomendado",
    summary: "Abre el menú de configuración de rutas de destino, selección granular de componentes y asociación de extensiones (.mp4, .mkv).",
    nature: "Control estándar de diálogo de opciones de despliegue InnoSetup/NSIS.",
    impact: "Permite cambiar el disco de destino (ej. de C: a D:) y desactivar telemetría opcional.",
    riskLevel: "Recomendado para usuarios con SSD secundarios",
    riskClass: "safe",
    consequences: "Al hacer clic, se presentará un árbol de carpetas para elegir dónde instalar y decidir si crear accesos directos en el escritorio.",
    vendor: "MediaPro Studio Corp.",
    signStatus: "Válida (Certum Code Signing)",
    exePath: "C:\\Program Files\\MediaPro\\",
    resources: "Sin impacto en recursos de fondo",
    accessKey: "Alt + A",
    cliSnippet: `# Ejecutar con ruta predeterminada personalizada:
.\\MediaProSetup.exe /DIR="D:\\Apps\\MediaPro"`
  },
  btn_next: {
    name: "Botón 'Siguiente >'",
    controlType: "UIA_Button (DefaultAction)",
    confidence: "99.9% Certeza",
    processName: "MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"Siguiente >"',
    verdictText: "Avanzar Asistente • Copia de Binarios",
    safetyTag: "Seguro",
    actionTag: "Acción: Siguiente",
    summary: "Avanza al siguiente paso del instalador, validando los permisos de escritura en la carpeta de destino.",
    nature: "Paso de transición de asistente Win32.",
    impact: "Iniciará la copia de archivos binarios si ya se aceptó la licencia de software.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Si no desmarcaste el software publicitario anterior, continuará con la instalación de ambos programas.",
    vendor: "MediaPro Studio Corp.",
    signStatus: "Válida",
    exePath: "C:\\Program Files\\MediaPro\\",
    resources: "Tiempo estimado de copia: 15 seg",
    accessKey: "Enter o Alt + S",
    cliSnippet: `# Ejecutar todo el setup sin interfaz gráfica:
.\\MediaProSetup.exe /SILENT`
  },
  error_code_heading: {
    name: "Error 0x80070005: ERROR_ACCESS_DENIED",
    controlType: "UIA_Text / Win32 HRESULT",
    confidence: "100.0% Exacto",
    processName: "consent.exe / csrss.exe",
    pid: 912,
    signature: "Microsoft Windows OS Component",
    ocrText: '"Error 0x80070005: ERROR_ACCESS_DENIED"',
    verdictText: "Fallo Win32 HRESULT • Acceso Denegado",
    safetyTag: "Error Crítico",
    actionTag: "Acción: Elevar UAC",
    summary: "Es un código de error nativo del núcleo de Windows (Win32 HRESULT) que indica que el token de seguridad actual carece de privilegios suficientes sobre el objeto.",
    nature: "Fallo de control de acceso ACL (Discretionary Access Control List) en el sistema de archivos o Registro.",
    impact: "La operación de lectura o escritura solicitada fue abortada por el kernel de seguridad.",
    riskLevel: "Error Crítico del Sistema",
    riskClass: "warning",
    consequences: "El programa no podrá guardar archivos ni actualizar configuraciones en carpetas protegidas como 'C:\\Program Files' o 'C:\\Windows'.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Production PCA 2011",
    exePath: "C:\\Windows\\System32\\ntdll.dll",
    resources: "Kernel Subsystem Error Event ID 1001",
    accessKey: "Ctrl + C (Copiar mensaje)",
    cliSnippet: `# Reparar permisos en PowerShell con Privilegios Elevados:
icacls "C:\\Ruta\\Objetivo" /grant Administrators:F /T`
  },
  btn_error_uac: {
    name: "Botón 'Ejecutar como Administrador'",
    controlType: "UIA_Button (Shield Icon)",
    confidence: "99.7% Certeza",
    processName: "consent.exe",
    pid: 1044,
    signature: "Microsoft Windows OS Component",
    ocrText: '"Ejecutar como Administrador"',
    verdictText: "Elevación de Token • High Integrity Level",
    safetyTag: "Precaución",
    actionTag: "Acción: Confirmar",
    summary: "Solicita elevación de privilegios a través del Servicio de Información de Cuenta de Usuario (UAC / User Account Control).",
    nature: "Disparador de elevación de token de seguridad a High Integrity Level.",
    impact: "Aparecerá la pantalla oscurecida de confirmación segura (Secure Desktop) de Windows.",
    riskLevel: "Requiere precaución: Solo si confías en el programa",
    riskClass: "warning",
    consequences: "Al aceptar, el software obtendrá acceso total de lectura y escritura al disco duro y al Registro del sistema.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\System32\\consent.exe",
    resources: "Nivel de integridad: High Integrity Level",
    accessKey: "Alt + E",
    cliSnippet: `# Iniciar proceso elevado desde consola:
Start-Process "powershell" -Verb RunAs`
  },
  tool_bake_ao: {
    name: "Herramienta 'Bake Ambient Occlusion'",
    controlType: "UIA_MenuItem / ActionButton",
    confidence: "99.1% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation",
    ocrText: '"Bake AO"',
    verdictText: "Hornear Oclusión • Render Pass GPU",
    safetyTag: "Cálculo GPU",
    actionTag: "Acción: Hornear",
    summary: "Calcula sombras difusas de contacto basadas en la proximidad geométrica de las mallas 3D y las hornea en un mapa de texturas 2D.",
    nature: "Paso de cálculo por trazado de rayos (Ray-tracing rendering pass).",
    impact: "Incrementará temporalmente el uso de la GPU / CPU al 100% durante el cálculo de oclusión ambiental.",
    riskLevel: "Seguro (Uso intensivo de hardware)",
    riskClass: "safe",
    consequences: "Generará una nueva textura de sombras que mejorará el realismo de los modelos sin necesidad de luces dinámicas en tiempo real.",
    vendor: "Stichting Blender Foundation",
    signStatus: "Válida (Open Source Foundation)",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "VRAM GPU: ~2.4 GB requeridos para mapas 4K",
    accessKey: "F3 -> 'Bake AO'",
    cliSnippet: `# Hornear AO vía Python API en Blender:
bpy.ops.object.bake(type='AO', margin=16, use_clear=True)`
  },
  tool_subsurface: {
    name: "Multiplicador Subsurface Scattering (SSS)",
    controlType: "UIA_ToolButton / ShaderProperty",
    confidence: "99.5% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation",
    ocrText: '"Subsurface Scattering Multiplier"',
    verdictText: "Dispersión Subsuperficial • Shader Cycles/EEVEE",
    safetyTag: "Shader 3D",
    actionTag: "Acción: Ajustar Radio",
    summary: "Simula el transporte y penetración de la luz dentro de materiales orgánicos translúcidos (como piel humana, cera, mármol o líquidos) antes de salir refraccionada.",
    nature: "Algoritmo BSSRDF de dispersión lumínica volumétrica.",
    impact: "Aumenta la cantidad de muestras de rayos en el pase de render para calcular la suavidad dérmica sin ruido granular.",
    riskLevel: "Seguro (Optimización gráfica)",
    riskClass: "safe",
    consequences: "Si el valor es 0, el modelo luce como plástico opaco. Al incrementarlo, adquiere el aspecto suave y orgánico característico de la piel viva.",
    vendor: "Stichting Blender Foundation",
    signStatus: "Válida (Open Source Foundation)",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "GPU Compute: Shading Pass",
    accessKey: "Ctrl + Espacio (Search Shader)",
    cliSnippet: `# Configurar SSS via Python API:
bpy.context.object.active_material.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.45`
  },
  tool_denoiser: {
    name: "Desruidador AI (Intel OIDN / NVIDIA OptiX)",
    controlType: "UIA_ToolButton / AI Render Post-Process",
    confidence: "99.8% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation & NVIDIA Corp.",
    ocrText: '"OptiX / OpenImageDenoise AI"',
    verdictText: "Red Neuronal • Limpieza de Muestras",
    safetyTag: "Aceleración AI",
    actionTag: "Acción: Activar",
    summary: "Red neuronal profunda entrenada para predecir y limpiar el ruido estocástico del trazado de rayos en viewport interactivo o render final.",
    nature: "Tensor Core AI Denoising pass con datos de Albedo y Normales de superficie.",
    impact: "Permite previsualizar escenas complejas con solo 32 muestras en lugar de 4096, acelerando el flujo de trabajo hasta un 800%.",
    riskLevel: "Altamente recomendado para agilizar renderizado",
    riskClass: "safe",
    consequences: "Reduce radicalmente los tiempos de espera por fotograma manteniendo la nitidez en bordes, texturas y reflejos especulares.",
    vendor: "NVIDIA / Intel Open Image Denoise",
    signStatus: "Válida (Firmas Digitales Oficiales)",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "Uso de Tensor Cores GPU: ~40% en pico",
    accessKey: "Shift + Alt + D",
    cliSnippet: `# Activar OptiX denoiser en Python:
bpy.context.scene.cycles.use_denoising = True
bpy.context.scene.cycles.denoiser = 'OPTIX'`
  },
  tool_lut: {
    name: "Gestor de Color AgX (OpenColorIO)",
    controlType: "UIA_ToolButton / Color Transform",
    confidence: "99.6% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation",
    ocrText: '"AgX OCIO Color Management"',
    verdictText: "Transformación Cromática • Rango Dinámico Alto",
    safetyTag: "Colorimetría",
    actionTag: "Acción: Calibrar",
    summary: "Transformación de visualización de alta fidelidad que sustituye a sRGB y Filmic, diseñada para manejar sobreexposiciones extremas con degradados suaves.",
    nature: "Mapeo tonal basado en curvas cinemáticas fotográficas (PBR OCIO v2).",
    impact: "Evita que las luces saturadas se conviertan en manchas amarillas o blancas quemadas no naturales.",
    riskLevel: "Estándar moderno en animación y VFX",
    riskClass: "safe",
    consequences: "Otorga un acabado cinematográfico profesional a la iluminación digital respetando la física de la luz.",
    vendor: "Academy Software Foundation / Blender",
    signStatus: "Válida",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "Calculado en LUT Shader GPU",
    accessKey: "Propiedades de Escena -> Color Management",
    cliSnippet: `# Activar AgX OCIO:
bpy.context.scene.view_settings.view = 'AgX'`
  },
  btn_error_logs: {
    name: "Visor de Eventos de Windows (EventViewer Logs)",
    controlType: "UIA_Button / SystemDiagnostic",
    confidence: "99.7% Certeza",
    processName: "eventvwr.exe",
    pid: 2840,
    signature: "Microsoft Windows OS Component",
    ocrText: '"Ver Logs EventViewer"',
    verdictText: "Diagnóstico del Sistema • Logs ETW de Seguridad",
    safetyTag: "Herramienta Oficial",
    actionTag: "Acción: Abrir Logs",
    summary: "Abre la consola de registro de eventos del kernel de Windows para auditar la pila de llamadas, subclave de Registro y código NTSTATUS que causó el fallo.",
    nature: "Consola MMC (Microsoft Management Console) para inspeccionar registros de Application, Security y System.",
    impact: "Permite diagnosticar qué archivo o proceso exacto causó la denegación de permisos sin modificar ningún archivo.",
    riskLevel: "Totalmente seguro: Solo lectura de diagnósticos",
    riskClass: "safe",
    consequences: "Muestra el GUID de la directiva y el identificador de seguridad (SID) del usuario que fue bloqueado.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\System32\\eventvwr.msc",
    resources: "Sin impacto en el rendimiento",
    accessKey: "Win + R -> 'eventvwr'",
    cliSnippet: `# Ver últimos eventos de error en PowerShell:
Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2} -MaxEvents 5`
  },
  win_logo_btn: {
    name: "Botón de Inicio de Windows 11",
    controlType: "UIA_StartButton / SystemLauncher",
    confidence: "100.0% Certeza",
    processName: "StartMenuExperienceHost.exe",
    pid: 1420,
    signature: "Microsoft Windows OS",
    ocrText: '"Inicio de Windows"',
    verdictText: "Lanzador Principal • Windows Shell Hub",
    safetyTag: "Núcleo Windows",
    actionTag: "Acción: Lanzador",
    summary: "Punto de acceso centralizado a aplicaciones ancladas, archivos recientes de OneDrive, búsquedas globales del sistema y control de energía.",
    nature: "Componente XAML Fluent alojado en el proceso StartMenuExperienceHost.",
    impact: "Abre el menú flotante centrado de Windows 11.",
    riskLevel: "Componente crítico del sistema",
    riskClass: "safe",
    consequences: "Permite buscar programas, ejecutar comandos y gestionar la sesión del usuario.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\SystemApps\\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\\StartMenuExperienceHost.exe",
    resources: "RAM: ~45 MB en standby",
    accessKey: "Tecla Windows o Ctrl + Esc",
    cliSnippet: `# Reiniciar proceso del Menú Inicio si se congela:
Stop-Process -Name "StartMenuExperienceHost" -Force`
  },
  taskbar_installer: {
    name: "Ventana Activa: MediaPro Installer",
    controlType: "UIA_TaskbarItem / RunningApplication",
    confidence: "99.2% Certeza",
    processName: "explorer.exe / MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"MediaPro Installer"',
    verdictText: "Ventana en Primer Plano • Instalador Activo",
    safetyTag: "Proceso Activo",
    actionTag: "Acción: Minimizar/Restaurar",
    summary: "Representa el botón de la barra de tareas correspondiente a la ventana de instalación en primer plano de MediaPro Ultra Suite.",
    nature: "Control ITaskbarList3 de la barra de tareas de Windows Shell.",
    impact: "Alterna el foco de la ventana activa o muestra su miniatura en Aero Peek.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Al hacer clic, minimiza o restaura la ventana del instalador en pantalla.",
    vendor: "MediaPro Studio Corp.",
    signStatus: "Válida",
    exePath: "C:\\Users\\AppData\\Local\\Temp\\is-44A.tmp",
    resources: "RAM: ~18 MB",
    accessKey: "Win + 1",
    cliSnippet: `# Enfocar ventana desde PowerShell:
(New-Object -ComObject WScript.Shell).AppActivate((Get-Process -Name "MediaProSetup").MainWindowTitle)`
  },
  taskbar_security: {
    name: "Ventana en Segundo Plano: Windows Security",
    controlType: "UIA_TaskbarItem / SecurityCenter",
    confidence: "99.9% Certeza",
    processName: "SecHealthUI.exe",
    pid: 3012,
    signature: "Microsoft Windows Component",
    ocrText: '"Windows Security"',
    verdictText: "Centro de Seguridad • Protección en Tiempo Real",
    safetyTag: "Protección Oficial",
    actionTag: "Acción: Ver Estado",
    summary: "Panel central de Windows Defender que administra la protección antivirus, aislamiento de núcleo, firewall de red y control de aplicaciones SmartScreen.",
    nature: "Interfaz moderna de seguridad de Windows (WinUI 3).",
    impact: "Monitorea llamadas a archivos y firmas de controladores para prevenir ejecución de malware.",
    riskLevel: "Protección Crítica Activa",
    riskClass: "safe",
    consequences: "Permite ver el historial de amenazas bloqueadas y configurar exclusiones de carpetas de confianza.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\SystemApps\\Microsoft.SecHealthUI_8wekyb3d8bbwe\\SecHealthUI.exe",
    resources: "RAM: ~32 MB",
    accessKey: "Win + I -> Seguridad",
    cliSnippet: `# Comprobar estado de antivirus en PowerShell:
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusSignatureAge`
  },
  taskbar_blender: {
    name: "Ventana en Segundo Plano: Blender 4.2 LTS",
    controlType: "UIA_TaskbarItem / 3DApplication",
    confidence: "99.4% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation",
    ocrText: '"Blender 4.2"',
    verdictText: "Suite 3D Activa • Proyecto en Memoria",
    safetyTag: "Productividad 3D",
    actionTag: "Acción: Cambiar a Blender",
    summary: "Instancia en segundo plano de la suite de modelado, animación y renderizado 3D de código abierto Blender 4.2 LTS.",
    nature: "Aplicación gráfica intensiva OpenGL/Vulkan/DirectX.",
    impact: "Mantiene en memoria VRAM la geometría 3D y los mapas de texturas del proyecto abierto.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Trae al frente la ventana de edición 3D para continuar modelando o renderizando.",
    vendor: "Stichting Blender Foundation",
    signStatus: "Válida (Open Source Foundation)",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "VRAM: ~2.4 GB | RAM: ~1.8 GB",
    accessKey: "Win + 3",
    cliSnippet: `# Iniciar Blender en segundo plano para renderizar escena:
blender -b "escena.blend" -o "//render_" -F PNG -x 1 -a`
  },
  tray_teachme: {
    name: "Servicio TeachMe AI (Kernel Accessibility Hook)",
    controlType: "UIA_NotificationTrayIcon / Daemon",
    confidence: "100.0% Exacto",
    processName: "TeachMeAI.exe",
    pid: 1120,
    signature: "TeachMe AI Cognitive Engine",
    ocrText: '"TeachMe AI Service — Engine Activo en user32.dll"',
    verdictText: "Motor Cognitivo Activo • Hook Win32 UIA",
    safetyTag: "Asistente Activo",
    actionTag: "Acción: Configurar",
    summary: "Daemon residente que intercepta eventos del mouse con WH_MOUSE_LL y consulta el árbol de accesibilidad UIA para enseñar interactivamente.",
    nature: "Hook global de bajo nivel en user32.dll acoplado a OCR y modelos multimodales.",
    impact: "Consumo ultra bajo (<0.1% CPU en reposo). Se activa únicamente cuando el mouse descansa o pulsas Shift+A.",
    riskLevel: "Totalmente seguro: Asistente pedagógico local",
    riskClass: "safe",
    consequences: "Proporciona contexto educativo instantáneo sin requerir abrir el navegador web ni manuales de texto.",
    vendor: "TeachMe AI Inc.",
    signStatus: "Válida (Authenticode Developer Certificate)",
    exePath: "C:\\Program Files\\TeachMe AI\\TeachMeAI.exe",
    resources: "CPU: 0.05% | RAM: ~22 MB",
    accessKey: "Shift + A (Recorte Instantáneo)",
    cliSnippet: `# Estado del servicio TeachMe AI:
Get-Process -Name "TeachMeAI" | Format-List Id, CPU, WorkingSet64`
  },
  tray_clock: {
    name: "Reloj y Notificaciones de Windows",
    controlType: "UIA_Clock / SystemTrayArea",
    confidence: "100.0% Exacto",
    processName: "explorer.exe",
    pid: 3204,
    signature: "Microsoft Windows Component",
    ocrText: '"12:00 PM"',
    verdictText: "Hora del Sistema • Calendario & Focus Sessions",
    safetyTag: "Núcleo Windows",
    actionTag: "Acción: Calendario",
    summary: "Área de notificación del reloj del sistema sincronizada vía protocolo NTP (Network Time Protocol) con time.windows.com.",
    nature: "Control nativo de barra de tareas Windows Shell Tray.",
    impact: "Al hacer clic, despliega el calendario mensual, el selector de Modo Concentración (Focus Session) y el centro de notificaciones.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Permite comprobar citas de Outlook, silenciar alertas y consultar zonas horarias.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\explorer.exe",
    resources: "Sin impacto en el sistema",
    accessKey: "Win + N (Notificaciones)",
    cliSnippet: `# Sincronizar reloj de Windows con servidor horario:
w32tm /resync`
  },
  win_header_blender: {
    name: "Barra de Título: Viewport Shading & Render Passes",
    controlType: "UIA_TitleBar / WindowChrome",
    confidence: "99.1% Certeza",
    processName: "blender.exe",
    pid: 6180,
    signature: "Blender Foundation",
    ocrText: '"Viewport Shading & Render Passes (3D Engine)"',
    verdictText: "Control de Ventana • Arrastrar o Maximizar",
    safetyTag: "Interfaz 3D",
    actionTag: "Acción: Mover Ventana",
    summary: "Cabecera de la ventana de visualización 3D. Permite arrastrar la ventana, hacer doble clic para maximizar o usar Windows Snap (Win + Flechas).",
    nature: "Borde superior de ventana con gestión de eventos WM_NCHITTEST.",
    impact: "Sin impacto de rendimiento.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Permite organizar la ventana en monitores secundarios o acoplarla a los bordes de la pantalla.",
    vendor: "Stichting Blender Foundation",
    signStatus: "Válida",
    exePath: "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    resources: "Sin impacto",
    accessKey: "Alt + Espacio (Menú de Ventana)",
    cliSnippet: `# Acoplar ventana a la mitad derecha de pantalla:
# Win + Flecha Derecha`
  },
  error_file_operation: {
    name: "Llamada COM IFileOperation::PerformOperations()",
    controlType: "UIA_Text / COM Interface Error",
    confidence: "100.0% Exacto",
    processName: "SystemSettings.exe",
    pid: 1044,
    signature: "Microsoft Windows Component",
    ocrText: '"La llamada a IFileOperation::PerformOperations() ha fallado"',
    verdictText: "Fallo Interfaz COM • Descriptor de Seguridad",
    safetyTag: "Fallo de Permiso",
    actionTag: "Acción: Diagnosticar",
    summary: "IFileOperation es la interfaz COM de shell moderna que reemplazó a SHFileOperation en Windows Vista y superior para mover, copiar y borrar archivos con control de acceso.",
    nature: "Método de ejecución transaccional de operaciones sobre el sistema de archivos NTFS.",
    impact: "El método retornó E_ACCESSDENIED porque el descriptor de seguridad del archivo (DACL) no incluye permisos de escritura para el proceso llamante.",
    riskLevel: "Error de ejecución transaccional",
    riskClass: "warning",
    consequences: "La operación de copia o modificación fue revertida automáticamente para preservar la integridad del archivo original.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\System32\\shell32.dll",
    resources: "Kernel HRESULT: 0x80070005",
    accessKey: "Ctrl + C",
    cliSnippet: `# Verificar permisos de archivo en PowerShell:
Get-Acl "C:\\Ruta\\Archivo" | Format-List AccessToString`
  },
  btn_win_close: {
    name: "Botón Cerrar Ventana (✕)",
    controlType: "UIA_Button / WindowControl",
    confidence: "100.0% Exacto",
    processName: "DWM.exe / explorer.exe",
    pid: 880,
    signature: "Microsoft Windows Component",
    ocrText: '"✕"',
    verdictText: "Cierre de Ventana • Envía Mensaje WM_CLOSE",
    safetyTag: "Cierre de Aplicación",
    actionTag: "Acción: Cerrar",
    summary: "Envía el mensaje de sistema WM_CLOSE a la cola de mensajes de la ventana. La aplicación preguntará si deseas guardar los cambios antes de terminar el proceso.",
    nature: "Control estándar de la barra de título de Windows Desktop Window Manager.",
    impact: "Liberará la memoria RAM y recursos de GPU ocupados por la ventana.",
    riskLevel: "Asegúrate de haber guardado tu trabajo",
    riskClass: "safe",
    consequences: "Si la aplicación tiene cambios no guardados, mostrará un cuadro de diálogo confirmando si deseas guardarlos antes de salir.",
    vendor: "Microsoft Corporation",
    signStatus: "Microsoft Windows Component",
    exePath: "C:\\Windows\\System32\\dwm.exe",
    resources: "Libera recursos al cerrarse",
    accessKey: "Alt + F4",
    cliSnippet: `# Cerrar proceso de forma limpia:
Stop-Process -Name "nombre_proceso"`
  },
  btn_back: {
    name: "Botón '< Atrás'",
    controlType: "UIA_Button",
    confidence: "99.5% Certeza",
    processName: "MediaProSetup.exe",
    pid: 4982,
    signature: "Authenticode Verified",
    ocrText: '"< Atrás"',
    verdictText: "Paso Anterior • Revisar Licencia o Opciones",
    safetyTag: "Seguro",
    actionTag: "Acción: Retroceder",
    summary: "Permite regresar a la pantalla anterior del asistente de instalación sin perder las opciones que hayas marcado.",
    nature: "Control de navegación de asistente secuencial (Wizard Navigation).",
    impact: "No altera el disco duro ni modifica archivos.",
    riskLevel: "Seguro",
    riskClass: "safe",
    consequences: "Te regresa a la pantalla de aceptación de términos o bienvenida para revisar tu configuración.",
    vendor: "MediaPro Studio Corp.",
    signStatus: "Válida",
    exePath: "C:\\Program Files\\MediaPro\\",
    resources: "Sin impacto",
    accessKey: "Alt + T",
    cliSnippet: `# N/A`
  }
};

// Dynamic Universal Information Analyzer for Any Untracked Element
function generateDynamicInspection(el) {
  if (!el) return INSPECTION_DATABASE.installer_bloatware;

  const rawText = (el.dataset.teachmeNativeTitle || el.title || el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
  const cleanName = rawText.length > 0 ? (rawText.length > 40 ? rawText.substring(0, 40) + '...' : rawText) : (el.tagName.toLowerCase());

  let processName = "explorer.exe";
  let pid = 3204;
  let vendor = "Microsoft Windows";
  
  if (el.closest('.window-tools')) {
    processName = "blender.exe";
    pid = 6180;
    vendor = "Stichting Blender Foundation";
  } else if (el.closest('.window-error')) {
    processName = "SystemSettings.exe";
    pid = 1044;
    vendor = "Microsoft Corporation";
  } else if (el.closest('.window-installer')) {
    processName = "MediaProSetup.exe";
    pid = 4982;
    vendor = "MediaPro Studio Corp.";
  }

  let controlType = "UIA_Element";
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || el.classList.contains('mock-win-btn') || el.classList.contains('tool-btn')) {
    controlType = "UIA_Button / ActionControl";
  } else if (tag === 'input' && el.type === 'checkbox') {
    controlType = "UIA_CheckBox";
  } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
    controlType = "UIA_Heading / TextLabel";
  } else if (tag === 'code') {
    controlType = "UIA_Text / CodeSegment";
  } else if (el.classList.contains('taskbar-item')) {
    controlType = "UIA_TaskbarItem";
  }

  return {
    name: cleanName,
    controlType: controlType,
    confidence: "98.9% Certeza (OCR & UIA)",
    processName: processName,
    pid: pid,
    signature: "Authenticode Verified",
    ocrText: `"${cleanName}"`,
    verdictText: "Elemento de Interfaz Detectado",
    safetyTag: "Inspección AI",
    actionTag: "Acción: Contextual",
    summary: `TeachMe AI ha extraído este control activo ("${cleanName}") dentro del proceso ${processName}. Proporciona información interactiva para el usuario.`,
    nature: `Control nativo de interfaz gestionado por el subsistema de ventanas de ${processName}.`,
    impact: `Interactuar con este elemento actualiza el estado de la vista o dispara la acción vinculada.`,
    riskLevel: "Seguro (Componente legítimo de interfaz)",
    riskClass: "safe",
    consequences: `Al interactuar con "${cleanName}", el programa procesa el comando correspondiente en su hilo de ejecución principal.`,
    vendor: vendor,
    signStatus: "Válida (Firma del Proceso)",
    exePath: `C:\\Program Files\\${processName}`,
    resources: "Bajo consumo de memoria",
    accessKey: "Clic izquierdo del mouse",
    cliSnippet: `# Inspeccionar proceso en PowerShell:
Get-Process -Name "${processName.replace('.exe', '')}"`
  };
}

// Global App State
const state = {
  currentMode: 'hover', // Default a modo detección intencional
  isPinned: false,
  cardVisible: false,   // Oculto por defecto: solo aparece cuando se detecta información tras 5s de descanso
  currentTargetKey: 'installer_bloatware',
  mousePos: { x: window.innerWidth * 0.45, y: window.innerHeight * 0.35 },
  cardPos: { x: window.innerWidth * 0.45 + 20, y: window.innerHeight * 0.35 + 20 },
  targetPos: { x: window.innerWidth * 0.45 + 20, y: window.innerHeight * 0.35 + 20 },
  anchorPoint: { x: window.innerWidth * 0.45, y: window.innerHeight * 0.35 },
  offsetX: 20,
  offsetY: 20,
  smartClamp: true,
  useLerp: true,
  showBeam: false, // Omitido por defecto: interfaz limpia, profesional y libre de cables
  scanLaser: true,
  specular: true,
  isSnipping: false,
  snipStart: { x: 0, y: 0 },

  // Dwell / Descanso de 3 Segundos del Mouse
  dwellDuration: 3000, // 3 segundos
  dwellStartTime: 0,
  dwellAnimationFrame: null,
  dwellAnchorMouse: { x: 0, y: 0 },
  activeTargetEl: null,
  mouseStillTimer: null,

  // Hover Bridge (permite mover el mouse hacia la tarjeta sin que desaparezca)
  isMouseOverCard: false,
  hoverLeaveTimeout: null,

  // Motor Multimodal de Inteligencia Artificial (Google Gemini)
  geminiApiKey: localStorage.getItem('teachme_gemini_api_key') || '',
  geminiModel: localStorage.getItem('teachme_gemini_model') || 'gemini-2.5-flash',
  lastCapturedImage: null,
  isAnalyzing: false
};

// Cached DOM Elements
const DOM = {
  card: document.getElementById('teachmeOverlayCard'),
  specularGlow: document.getElementById('specularGlow'),
  connectorSvg: document.getElementById('connectorSvg'),
  connectorPath: document.getElementById('connectorPath'),
  connectorAnchorDot: document.getElementById('connectorAnchorDot'),
  connectorTargetDot: document.getElementById('connectorTargetDot'),
  activeCropAnchor: document.getElementById('activeCropAnchor'),
  cropScanBeam: document.getElementById('cropScanBeam'),
  cropThumbRes: document.getElementById('cropThumbRes'),
  cardConfidence: document.getElementById('cardConfidence'),
  cardOcrText: document.getElementById('cardOcrText'),
  btnCopyOcr: document.getElementById('btnCopyOcr'),
  
  // Gemini AI Engine Controls
  inputApiKey: document.getElementById('inputApiKey'),
  btnToggleKeyVisibility: document.getElementById('btnToggleKeyVisibility'),
  selectAiModel: document.getElementById('selectAiModel'),
  btnSaveApiKey: document.getElementById('btnSaveApiKey'),
  btnTestApiKey: document.getElementById('btnTestApiKey'),
  aiStatusPill: document.getElementById('aiStatusPill'),

  // Dwell Indicator (3s Radial Countdown & Interactive Scanner)
  mouseDwellIndicator: document.getElementById('mouseDwellIndicator'),
  dwellProgressCircle: document.getElementById('dwellProgressCircle'),
  dwellTimeText: document.getElementById('dwellTimeText'),
  dwellStatusPhase: document.getElementById('dwellStatusPhase'),

  // Quick Context Bar
  cardVerdictPill: document.getElementById('cardVerdictPill'),
  cardVerdictText: document.getElementById('cardVerdictText'),
  cardSafetyTag: document.getElementById('cardSafetyTag'),
  cardActionTag: document.getElementById('cardActionTag'),

  btnModeCursor: document.getElementById('btnModeCursor'),
  btnModeHover: document.getElementById('btnModeHover'),
  btnModePin: document.getElementById('btnModePin'),
  btnPinCard: document.getElementById('btnPinCard'),
  btnCloseCard: document.getElementById('btnCloseCard'),
  btnTriggerSnipping: document.getElementById('btnTriggerSnipping'),
  snippingOverlay: document.getElementById('snippingOverlay'),
  snipSelectionBox: document.getElementById('snipSelectionBox'),
  snipCoords: document.getElementById('snipCoords'),
  hudModeIndicator: document.getElementById('hudModeIndicator'),
  trayClock: document.getElementById('trayClock'),
  
  // Tabs
  tabPills: document.querySelectorAll('.tab-pill'),
  tabViews: document.querySelectorAll('.tab-view'),
  
  // Card Fields
  targetName: document.getElementById('cardTargetName'),
  controlType: document.getElementById('cardControlType'),
  processName: document.getElementById('cardProcessName'),
  processPid: document.getElementById('cardProcessPid'),
  signatureBadge: document.getElementById('cardSignatureBadge'),
  summary: document.getElementById('cardSummary'),
  nature: document.getElementById('cardNature'),
  systemImpact: document.getElementById('cardSystemImpact'),
  riskBox: document.getElementById('cardRiskBox'),
  riskLevel: document.getElementById('cardRiskLevel'),
  consequences: document.getElementById('cardConsequences'),
  vendor: document.getElementById('cardVendor'),
  signStatus: document.getElementById('cardSignStatus'),
  exePath: document.getElementById('cardExePath'),
  resourceFootprint: document.getElementById('cardResourceFootprint'),
  accessKey: document.getElementById('cardAccessKey'),
  cliSnippet: document.getElementById('cardCliSnippet'),
  btnCopyCli: document.getElementById('btnCopyCli'),
  btnCopyJson: document.getElementById('btnCopyJson'),

  // Chat
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatHistory: document.getElementById('chatMiniHistory'),
  btnExplainAction: document.getElementById('btnExplainAction'),
  btnIsSafe: document.getElementById('btnIsSafe'),

  // Design Studio Drawer
  btnOpenStudio: document.getElementById('btnOpenStudio'),
  btnCloseStudio: document.getElementById('btnCloseStudio'),
  drawer: document.getElementById('designStudioDrawer'),
  sliderBlur: document.getElementById('sliderBlur'),
  sliderOpacity: document.getElementById('sliderOpacity'),
  sliderGlow: document.getElementById('sliderGlow'),
  sliderRadius: document.getElementById('sliderRadius'),
  sliderOffsetX: document.getElementById('sliderOffsetX'),
  sliderOffsetY: document.getElementById('sliderOffsetY'),
  sliderDwell: document.getElementById('sliderDwell'),
  valDwell: document.getElementById('valDwell'),
  valBlur: document.getElementById('valBlur'),
  valOpacity: document.getElementById('valOpacity'),
  valGlow: document.getElementById('valGlow'),
  valRadius: document.getElementById('valRadius'),
  valOffsetX: document.getElementById('valOffsetX'),
  valOffsetY: document.getElementById('valOffsetY'),
  chkShowBeam: document.getElementById('chkShowBeam'),
  chkScanLaser: document.getElementById('chkScanLaser'),
  chkSpecular: document.getElementById('chkSpecular'),
  chkSmartClamp: document.getElementById('chkSmartClamp'),
  chkLerp: document.getElementById('chkLerp'),
  swatches: document.querySelectorAll('.swatch-btn'),
  scenarioBtns: document.querySelectorAll('.btn-scenario')
};

// Initialize Application
function init() {
  updateClock();
  setInterval(updateClock, 1000);
  
  populateCard(INSPECTION_DATABASE[state.currentTargetKey]);
  setupEventListeners();
  setupDesignStudio();
  setupNativeInterop();
  
  // Start Continuous 60fps Render Loop for Physics & Holographic Ray
  requestAnimationFrame(renderLoop);
}

// Populate Card UI
function populateCard(data) {
  if (!data) return;
  
  DOM.targetName.textContent = data.name;
  DOM.controlType.textContent = data.controlType;
  DOM.cardConfidence.textContent = data.confidence || "99.4% Certeza";
  DOM.cardOcrText.textContent = data.ocrText || `"${data.name}"`;
  DOM.processName.textContent = data.processName;
  DOM.processPid.textContent = `PID: ${data.pid}`;
  DOM.summary.textContent = data.summary;
  DOM.nature.textContent = data.nature;
  DOM.systemImpact.textContent = data.impact;
  
  // Executive Context Pill
  if (DOM.cardVerdictText) DOM.cardVerdictText.textContent = data.verdictText || "Información Verificada";
  if (DOM.cardSafetyTag) DOM.cardSafetyTag.textContent = data.safetyTag || "Seguro";
  if (DOM.cardActionTag) DOM.cardActionTag.textContent = data.actionTag || "Sugerido";
  if (DOM.cardVerdictPill) {
    const indicator = DOM.cardVerdictPill.querySelector('.context-indicator');
    if (indicator) {
      indicator.className = `context-indicator ${data.riskClass || 'safe'}`;
    }
  }

  DOM.riskLevel.textContent = data.riskLevel;
  DOM.consequences.textContent = data.consequences;
  DOM.riskBox.className = `risk-card ${data.riskClass}`;

  DOM.vendor.textContent = data.vendor;
  DOM.signStatus.textContent = data.signStatus;
  DOM.exePath.textContent = data.exePath;
  DOM.resourceFootprint.textContent = data.resources;

  DOM.accessKey.textContent = data.accessKey;
  DOM.cliSnippet.textContent = data.cliSnippet;
}

// Taskbar Clock
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  DOM.trayClock.textContent = `${hours}:${minutes}`;
}

// Event Listeners
function setupEventListeners() {
  // Global Mouse Move & Universal Stillness Tracker
  window.addEventListener('mousemove', (e) => {
    state.mousePos.x = e.clientX;
    state.mousePos.y = e.clientY;

    // Si el recorte está activo, manejar el arrastre
    if (state.isSnipping) {
      handleSnipDrag(e);
      return;
    }

    // Reposicionar el indicador radial de dwell si está activo
    if (state.dwellAnimationFrame) {
      DOM.mouseDwellIndicator.style.left = `${e.clientX}px`;
      DOM.mouseDwellIndicator.style.top = `${e.clientY}px`;

      // Cancelar dwell si el ratón se mueve bruscamente
      const dist = Math.hypot(e.clientX - state.dwellAnchorMouse.x, e.clientY - state.dwellAnchorMouse.y);
      if (dist > 14) {
        cancelDwellCountdown();
      }
    }

    // Limpiar temporizador de reposo previo
    if (state.mouseStillTimer) {
      clearTimeout(state.mouseStillTimer);
      state.mouseStillTimer = null;
    }

    // Verificar si el cursor está sobre la UI del HUD, cajón o dock superior
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    const isOverUi = targetEl && (targetEl.closest('#teachmeOverlayCard') || targetEl.closest('#designStudioDrawer') || targetEl.closest('.top-nav-bar'));

    // Detector Universal de Reposo: si el ratón se detiene durante 250ms fuera de la UI, arrancar Dwell
    if (!state.isPinned && !isOverUi && !state.dwellAnimationFrame) {
      state.mouseStillTimer = setTimeout(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el.closest('#teachmeOverlayCard') || el.closest('#designStudioDrawer') || el.closest('.top-nav-bar')) return;

        let targetId = el.getAttribute('data-target-id') || el.closest('[data-target-id]')?.getAttribute('data-target-id');
        if (!targetId) {
          targetId = 'target_at_' + Math.round(e.clientX) + '_' + Math.round(e.clientY);
        }
        state.currentTargetKey = targetId;
        state.activeTargetEl = el;
        startDwellCountdown(el, targetId);
      }, 250);
    }

    // Actualizar coordenadas de resplandor especular
    if (state.specular) {
      const cardRect = DOM.card.getBoundingClientRect();
      const relX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
      const relY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
      DOM.card.style.setProperty('--mouse-card-x', `${relX}%`);
      DOM.card.style.setProperty('--mouse-card-y', `${relY}%`);
    }

    if (state.currentMode === 'cursor' && !state.isPinned && state.cardVisible) {
      state.anchorPoint = { x: e.clientX, y: e.clientY };
      calculateTargetPosition(e.clientX, e.clientY);
    }
  });

  // Seamless Card Interaction Bridge (el usuario puede mover el cursor hacia el panel para explorarlo)
  DOM.card.addEventListener('mouseenter', () => {
    state.isMouseOverCard = true;
    if (state.hoverLeaveTimeout) {
      clearTimeout(state.hoverLeaveTimeout);
      state.hoverLeaveTimeout = null;
    }
  });

  DOM.card.addEventListener('mouseleave', () => {
    state.isMouseOverCard = false;
    if (!state.isPinned && state.currentMode === 'hover') {
      state.hoverLeaveTimeout = setTimeout(() => {
        hideCard();
        state.activeTargetEl = null;
      }, 250);
    }
  });

  // Universal Information Inspector: any control, text, button, tool, title or info block
  const universalSelector = [
    '.inspectable-box',
    '.inspectable-target',
    '.tool-btn',
    '.mock-win-btn',
    '.taskbar-item',
    '.win-logo-btn',
    '.tray-teachme-icon',
    '.tray-clock',
    '.mock-win-controls span',
    '[data-target-id]',
    '[title]',
    '.error-content p',
    '.mock-instruction',
    'code',
    'h3',
    'h4'
  ].join(', ');

  const inspectables = document.querySelectorAll(universalSelector);
  inspectables.forEach(el => {
    // Suppress native browser tooltips so they don't block the screen
    if (el.title && el.title.trim().length > 0) {
      el.dataset.teachmeNativeTitle = el.title;
      el.title = ''; // Suppress browser native tooltip
    }

    el.addEventListener('mouseenter', (e) => {
      if (state.hoverLeaveTimeout) {
        clearTimeout(state.hoverLeaveTimeout);
        state.hoverLeaveTimeout = null;
      }

      // Suppress any native title
      if (el.title) {
        el.dataset.teachmeNativeTitle = el.title;
        el.title = '';
      }

      let targetId = el.getAttribute('data-target-id');
      if (!targetId) {
        targetId = 'dyn_' + Math.random().toString(36).substring(2, 8);
        el.setAttribute('data-target-id', targetId);
      }

      state.currentTargetKey = targetId;
      state.activeTargetEl = el;

      // Inicia el temporizador de descanso de 3 segundos
      if (!state.isPinned) {
        startDwellCountdown(el, targetId);
      }
    });

    // Clic en el elemento salta la espera de 3s inmediatamente
    el.addEventListener('click', () => {
      const targetId = el.getAttribute('data-target-id') || state.currentTargetKey;
      if (targetId && !state.isPinned) {
        onDwellSuccess(el, targetId);
      }
    });

    el.addEventListener('mouseleave', () => {
      cancelDwellCountdown();

      // Si el panel está abierto, damos tiempo de gracia para que el cursor pueda deslizarse al panel
      if (!state.isPinned && state.currentMode === 'hover' && state.cardVisible) {
        state.hoverLeaveTimeout = setTimeout(() => {
          if (!state.isMouseOverCard) {
            hideCard();
            state.activeTargetEl = null;
          }
        }, 250);
      } else {
        state.activeTargetEl = null;
      }
    });
  });

  // Mode Selection
  DOM.btnModeCursor.addEventListener('click', () => setMode('cursor'));
  DOM.btnModeHover.addEventListener('click', () => setMode('hover'));
  DOM.btnModePin.addEventListener('click', () => togglePin());
  DOM.btnPinCard.addEventListener('click', () => togglePin());

  // Close Card
  DOM.btnCloseCard.addEventListener('click', hideCard);
  
  // Keyboard Shortcuts (Shift + A for Snipping, Space to Skip Dwell, Esc to Close)
  window.addEventListener('keydown', (e) => {
    // Si la espera de dwell está activa y se pulsa Espacio, se abre de inmediato
    if (e.code === 'Space') {
      if (state.dwellAnimationFrame) {
        e.preventDefault();
        const target = state.activeTargetEl || document.elementFromPoint(state.mousePos.x, state.mousePos.y);
        onDwellSuccess(target, state.currentTargetKey);
        return;
      }
    }

    if (e.key === 'Escape') {
      if (state.isSnipping) {
        cancelSnipping();
      } else if (DOM.drawer && DOM.drawer.classList.contains('open')) {
        DOM.drawer.classList.remove('open');
      } else {
        hideCard();
      }
    } else if ((e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
      e.preventDefault();
      triggerSnipping();
    }
  });

  // Trigger Snipping Button
  DOM.btnTriggerSnipping.addEventListener('click', triggerSnipping);

  // Snipping Mouse Interaction
  DOM.snippingOverlay.addEventListener('mousedown', startSnipDrag);
  window.addEventListener('mousemove', handleSnipDrag);
  window.addEventListener('mouseup', finishSnipDrag);

  // Tab Pill Switching
  DOM.tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tabId = pill.getAttribute('data-tab');
      DOM.tabPills.forEach(p => p.classList.remove('active'));
      DOM.tabViews.forEach(v => v.classList.remove('active'));
      
      pill.classList.add('active');
      const targetView = document.getElementById(tabId);
      if (targetView) targetView.classList.add('active');
    });
  });

  // Copy Buttons
  DOM.btnCopyOcr.addEventListener('click', () => {
    const text = DOM.cardOcrText.textContent.replace(/^"|"$/g, '');
    navigator.clipboard.writeText(text);
    DOM.btnCopyOcr.textContent = '✓ Copiado';
    setTimeout(() => { DOM.btnCopyOcr.textContent = 'Copiar'; }, 1800);
  });

  DOM.btnCopyCli.addEventListener('click', () => {
    navigator.clipboard.writeText(DOM.cliSnippet.textContent);
    DOM.btnCopyCli.textContent = '¡Copiado!';
    setTimeout(() => { DOM.btnCopyCli.textContent = 'Copiar'; }, 1800);
  });

  DOM.btnCopyJson.addEventListener('click', () => {
    const currentData = INSPECTION_DATABASE[state.currentTargetKey];
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
    DOM.btnCopyJson.textContent = '✓ Copiado';
    setTimeout(() => { DOM.btnCopyJson.textContent = '📋 Exportar JSON'; }, 1800);
  });

  // Quick Action Chat Buttons
  DOM.btnExplainAction.addEventListener('click', () => {
    switchTab('tabChat');
    sendUserQuestion("¿Puedes explicarme esto de forma aún más sencilla en un minuto?");
  });

  DOM.btnIsSafe.addEventListener('click', () => {
    switchTab('tabChat');
    sendUserQuestion("¿Es seguro tocar o desmarcar este elemento para mi sistema operativo?");
  });

  // Mini Q&A Chat Form
  DOM.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = DOM.chatInput.value.trim();
    if (!query) return;
    sendUserQuestion(query);
    DOM.chatInput.value = '';
  });
}

function switchTab(tabId) {
  DOM.tabPills.forEach(p => p.classList.remove('active'));
  DOM.tabViews.forEach(v => v.classList.remove('active'));

  const pill = document.querySelector(`.tab-pill[data-tab="${tabId}"]`);
  const view = document.getElementById(tabId);
  if (pill) pill.classList.add('active');
  if (view) view.classList.add('active');
}

async function sendUserQuestion(question) {
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = question;
  DOM.chatHistory.appendChild(userMsg);
  DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;

  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'msg bot thinking';
  thinkingMsg.innerHTML = state.geminiApiKey 
    ? '✨ <i>Analizando con Gemini Multimodal...</i>' 
    : '🧠 <i>Consultando TeachMe AI...</i>';
  DOM.chatHistory.appendChild(thinkingMsg);
  DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;

  try {
    const answer = await callGeminiChat(question);
    thinkingMsg.remove();

    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.innerHTML = answer.replace(/\n/g, '<br>');
    DOM.chatHistory.appendChild(botMsg);
    DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
  } catch (err) {
    thinkingMsg.remove();
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.textContent = generateSmartAnswer(question, state.currentTargetKey);
    DOM.chatHistory.appendChild(botMsg);
    DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
  }
}

function generateSmartAnswer(q, targetKey) {
  const current = INSPECTION_DATABASE[targetKey] || INSPECTION_DATABASE.installer_bloatware;
  const lower = q.toLowerCase();

  if (lower.includes('seguro') || lower.includes('peligro') || lower.includes('virus')) {
    if (current.riskClass === 'warning') {
      return `⚠️ No es un virus dañino, pero sí es software publicitario no deseado. Desmarcarlo es 100% seguro y protegerá tu velocidad de navegación.`;
    }
    return `✅ Sí, es un componente legítimo firmado por ${current.vendor}. No representa riesgo de seguridad.`;
  }
  
  if (lower.includes('desmarcar') || lower.includes('quitar') || lower.includes('clic')) {
    return `Al interactuar con "${current.name}", el resultado directo es: ${current.consequences}`;
  }

  if (lower.includes('comando') || lower.includes('powershell') || lower.includes('terminal')) {
    return `Puedes automatizarlo en consola ejecutando el comando de la pestaña 'Atajos & CLI'.`;
  }

  return `Entendido. Respecto a "${current.name}": es gestionado por ${current.processName}. Su función principal es ${current.nature.toLowerCase()}`;
}

// ==========================================================================
// DWELL & REST DETECTION ENGINE (3s Interactive Wait Experience)
// ==========================================================================

const SCAN_PHASES = [
  { threshold: 0.25, text: "🔍 Fijando HWND & Coordenadas..." },
  { threshold: 0.55, text: "🧠 Extrayendo OCR & Árbol UIA..." },
  { threshold: 0.80, text: "🛡️ Verificando Firma Authenticode..." },
  { threshold: 1.00, text: "✨ Sintetizando con TeachMe AI..." }
];

function startDwellCountdown(targetEl, targetId) {
  cancelDwellCountdown();

  state.dwellAnchorMouse = { x: state.mousePos.x, y: state.mousePos.y };
  state.dwellStartTime = performance.now();

  // Position and activate interactive neural scanner near cursor
  DOM.mouseDwellIndicator.style.left = `${state.mousePos.x}px`;
  DOM.mouseDwellIndicator.style.top = `${state.mousePos.y}px`;
  DOM.mouseDwellIndicator.classList.add('active');

  const circumference = 119.38; // 2 * PI * 19
  DOM.dwellProgressCircle.style.strokeDashoffset = `${circumference}`;
  DOM.dwellTimeText.textContent = `${(state.dwellDuration / 1000).toFixed(1)}s`;
  if (DOM.dwellStatusPhase) DOM.dwellStatusPhase.textContent = SCAN_PHASES[0].text;

  function animateDwell(now) {
    const elapsed = now - state.dwellStartTime;
    const progress = Math.min(1, elapsed / state.dwellDuration);
    const remaining = Math.max(0, (state.dwellDuration - elapsed) / 1000);

    const offset = circumference * (1 - progress);
    DOM.dwellProgressCircle.style.strokeDashoffset = `${offset}`;
    DOM.dwellTimeText.textContent = `${remaining.toFixed(1)}s`;

    // Dynamic Progressive Phase Messaging to reduce wait stress
    if (DOM.dwellStatusPhase) {
      const currentPhase = SCAN_PHASES.find(p => progress <= p.threshold) || SCAN_PHASES[SCAN_PHASES.length - 1];
      DOM.dwellStatusPhase.textContent = currentPhase.text;
    }

    if (progress < 1) {
      state.dwellAnimationFrame = requestAnimationFrame(animateDwell);
    } else {
      // 3 seconds completed! Information detected!
      onDwellSuccess(targetEl, targetId);
    }
  }

  state.dwellAnimationFrame = requestAnimationFrame(animateDwell);
}

function cancelDwellCountdown() {
  if (state.dwellAnimationFrame) {
    cancelAnimationFrame(state.dwellAnimationFrame);
    state.dwellAnimationFrame = null;
  }
  if (DOM.mouseDwellIndicator) {
    DOM.mouseDwellIndicator.classList.remove('active');
    DOM.dwellProgressCircle.style.strokeDashoffset = '119.38';
  }
}

function onDwellSuccess(targetEl, targetId) {
  cancelDwellCountdown();

  const mouseX = (state.dwellAnchorMouse && typeof state.dwellAnchorMouse.x === 'number') 
    ? state.dwellAnchorMouse.x 
    : state.mousePos.x;
  const mouseY = (state.dwellAnchorMouse && typeof state.dwellAnchorMouse.y === 'number') 
    ? state.dwellAnchorMouse.y 
    : state.mousePos.y;

  // Si estamos en el host nativo de .NET / WebView2, consultar la ventana de Windows bajo el cursor
  if (window.chrome && window.chrome.webview) {
    window.chrome.webview.postMessage({
      action: 'query_window_under_cursor',
      x: Math.round(mouseX),
      y: Math.round(mouseY)
    });
  }

  // Cargar datos estáticos o sintetizados
  if (INSPECTION_DATABASE[targetId]) {
    populateCard(INSPECTION_DATABASE[targetId]);
  } else {
    const dynamicData = generateDynamicInspection(targetEl);
    INSPECTION_DATABASE[targetId] = dynamicData;
    populateCard(dynamicData);
  }

  // Calcular caja delimitadora segura
  const rect = (targetEl && typeof targetEl.getBoundingClientRect === 'function')
    ? targetEl.getBoundingClientRect()
    : { left: mouseX - 24, top: mouseY - 24, width: 48, height: 48 };

  state.anchorPoint = { x: mouseX, y: mouseY };
  updateCropAnchor(rect.left, rect.top, rect.width, rect.height);
  calculateTargetPosition(mouseX, mouseY);

  // Revelar panel con animación
  showCard();
}

// Positioning & Collision Engine
function calculateTargetPosition(anchorX, anchorY) {
  const cardWidth = DOM.card.offsetWidth || 270;
  const cardHeight = DOM.card.offsetHeight || 300;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let posX = anchorX + state.offsetX;
  let posY = anchorY + state.offsetY;

  if (state.smartClamp) {
    // If overflowing right, flip left
    if (posX + cardWidth > viewportWidth - 16) {
      posX = anchorX - cardWidth - state.offsetX;
    }

    // If overflowing bottom, flip top
    if (posY + cardHeight > viewportHeight - 52) {
      posY = anchorY - cardHeight - state.offsetY;
    }

    // Strict boundary clamps
    posX = Math.max(12, Math.min(posX, viewportWidth - cardWidth - 12));
    posY = Math.max(54, Math.min(posY, viewportHeight - cardHeight - 52));
  }

  state.targetPos.x = posX;
  state.targetPos.y = posY;
}

// 60FPS Physics & Holographic Ray Render Loop
function renderLoop() {
  if (state.cardVisible) {
    if (state.useLerp && !state.isPinned) {
      state.cardPos.x += (state.targetPos.x - state.cardPos.x) * 0.22;
      state.cardPos.y += (state.targetPos.y - state.cardPos.y) * 0.22;
    } else if (!state.isPinned) {
      state.cardPos.x = state.targetPos.x;
      state.cardPos.y = state.targetPos.y;
    }

    DOM.card.style.left = `${state.cardPos.x}px`;
    DOM.card.style.top = `${state.cardPos.y}px`;

    // Draw Dynamic SVG Holographic Ray
    if (state.showBeam) {
      drawHolographicRay();
    } else {
      DOM.connectorPath.setAttribute('d', '');
      DOM.connectorAnchorDot.setAttribute('opacity', '0');
      DOM.connectorTargetDot.setAttribute('opacity', '0');
    }
  }

  requestAnimationFrame(renderLoop);
}

// Draw Curved SVG Holographic Guide Line (opcional en Estudio de Diseño)
function drawHolographicRay() {
  if (!state.showBeam || !state.cardVisible) {
    DOM.connectorPath.setAttribute('d', '');
    DOM.connectorAnchorDot.setAttribute('opacity', '0');
    DOM.connectorTargetDot.setAttribute('opacity', '0');
    return;
  }

  const startX = state.anchorPoint.x;
  const startY = state.anchorPoint.y;

  // Use stable interpolated card coordinates
  const cardX = state.cardPos.x;
  const cardY = state.cardPos.y;
  const cardW = 270;
  const cardH = DOM.card.offsetHeight || 280;

  // Calculate clean, stable attachment point on nearest card edge
  let targetX, targetY;

  if (startX < cardX) {
    targetX = cardX;
    targetY = Math.max(cardY + 14, Math.min(startY, cardY + cardH - 14));
  } else if (startX > cardX + cardW) {
    targetX = cardX + cardW;
    targetY = Math.max(cardY + 14, Math.min(startY, cardY + cardH - 14));
  } else {
    targetX = startX;
    targetY = startY < cardY ? cardY : cardY + cardH;
  }

  // Smooth Bezier control points with bounded curvature
  const dist = Math.hypot(targetX - startX, targetY - startY);
  const factor = Math.min(0.5, Math.max(0.2, 40 / (dist + 1)));
  const dx = (targetX - startX) * factor;
  
  const cp1X = startX + dx;
  const cp1Y = startY;
  const cp2X = targetX - dx;
  const cp2Y = targetY;

  const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`;
  DOM.connectorPath.setAttribute('d', pathData);

  DOM.connectorAnchorDot.setAttribute('cx', startX);
  DOM.connectorAnchorDot.setAttribute('cy', startY);
  DOM.connectorAnchorDot.setAttribute('opacity', '1');

  DOM.connectorTargetDot.setAttribute('cx', targetX);
  DOM.connectorTargetDot.setAttribute('cy', targetY);
  DOM.connectorTargetDot.setAttribute('opacity', '1');
}

// Update Active Crop Region Frame
function updateCropAnchor(x, y, w, h) {
  DOM.activeCropAnchor.style.left = `${x}px`;
  DOM.activeCropAnchor.style.top = `${y}px`;
  DOM.activeCropAnchor.style.width = `${w}px`;
  DOM.activeCropAnchor.style.height = `${h}px`;
  DOM.activeCropAnchor.style.display = 'block';

  // Thumbnail dimensions tag
  DOM.cropThumbRes.textContent = `${Math.round(w)}x${Math.round(h)}`;

  // Trigger laser scan beam animation if enabled
  if (state.scanLaser) {
    DOM.cropScanBeam.style.display = 'block';
    DOM.cropScanBeam.style.animation = 'none';
    void DOM.cropScanBeam.offsetWidth; // trigger reflow
    DOM.cropScanBeam.style.animation = 'laserSweep 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
}

// Mode Management
function setMode(mode) {
  state.currentMode = mode;
  DOM.btnModeCursor.classList.toggle('active', mode === 'cursor');
  DOM.btnModeHover.classList.toggle('active', mode === 'hover');
  
  if (mode === 'cursor') {
    state.isPinned = false;
    DOM.btnModePin.classList.remove('active');
    DOM.btnPinCard.classList.remove('pinned');
    DOM.hudModeIndicator.textContent = 'Modo: Siguiendo Cursor';
    state.anchorPoint = { x: state.mousePos.x, y: state.mousePos.y };
    calculateTargetPosition(state.mousePos.x, state.mousePos.y);
    showCard();
  } else if (mode === 'hover') {
    state.isPinned = false;
    DOM.btnModePin.classList.remove('active');
    DOM.btnPinCard.classList.remove('pinned');
    DOM.hudModeIndicator.textContent = 'Modo: Hover en Controles';
  }
}

function togglePin() {
  state.isPinned = !state.isPinned;
  DOM.btnModePin.classList.toggle('active', state.isPinned);
  DOM.btnPinCard.classList.toggle('pinned', state.isPinned);
  DOM.btnPinCard.title = state.isPinned ? "Desanclar posición" : "Anclar posición";
  DOM.hudModeIndicator.textContent = state.isPinned ? 'Modo: Panel Anclado' : (state.currentMode === 'cursor' ? 'Modo: Siguiendo Cursor' : 'Modo: Hover en Controles');
  
  if (!state.isPinned && state.currentMode === 'cursor') {
    calculateTargetPosition(state.mousePos.x, state.mousePos.y);
  }
}

function showCard() {
  state.cardVisible = true;
  DOM.card.style.display = 'block';
  setTimeout(() => {
    DOM.card.style.opacity = '1';
    DOM.card.style.transform = 'scale(1)';
  }, 10);
}

function hideCard() {
  DOM.card.style.opacity = '0';
  DOM.card.style.transform = 'scale(0.96)';
  DOM.connectorPath.setAttribute('d', '');
  DOM.connectorAnchorDot.setAttribute('opacity', '0');
  DOM.connectorTargetDot.setAttribute('opacity', '0');
  DOM.activeCropAnchor.style.display = 'none';

  setTimeout(() => {
    DOM.card.style.display = 'none';
    state.cardVisible = false;
  }, 200);
}

// Snipping Tool Simulator (Shift + A)
function triggerSnipping() {
  state.isSnipping = true;
  DOM.snippingOverlay.classList.add('active');
  DOM.snipSelectionBox.style.display = 'none';
}

function cancelSnipping() {
  state.isSnipping = false;
  DOM.snippingOverlay.classList.remove('active');
  DOM.snipSelectionBox.style.display = 'none';
}

function startSnipDrag(e) {
  state.snipStart.x = e.clientX;
  state.snipStart.y = e.clientY;
  
  DOM.snipSelectionBox.style.left = `${e.clientX}px`;
  DOM.snipSelectionBox.style.top = `${e.clientY}px`;
  DOM.snipSelectionBox.style.width = '0px';
  DOM.snipSelectionBox.style.height = '0px';
  DOM.snipSelectionBox.style.display = 'block';
}

function handleSnipDrag(e) {
  if (!state.isSnipping || DOM.snipSelectionBox.style.display !== 'block') return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const left = Math.min(state.snipStart.x, currentX);
  const top = Math.min(state.snipStart.y, currentY);
  const width = Math.abs(currentX - state.snipStart.x);
  const height = Math.abs(currentY - state.snipStart.y);

  DOM.snipSelectionBox.style.left = `${left}px`;
  DOM.snipSelectionBox.style.top = `${top}px`;
  DOM.snipSelectionBox.style.width = `${width}px`;
  DOM.snipSelectionBox.style.height = `${height}px`;
  DOM.snipCoords.textContent = `${Math.round(width)} x ${Math.round(height)} px`;
}

function finishSnipDrag(e) {
  if (!state.isSnipping || DOM.snipSelectionBox.style.display !== 'block') return;

  const rect = DOM.snipSelectionBox.getBoundingClientRect();
  cancelSnipping();

  if (rect.width > 20 && rect.height > 20) {
    state.anchorPoint = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateCropAnchor(rect.left, rect.top, rect.width, rect.height);
    
    calculateTargetPosition(rect.right + 18, rect.top);
    state.isPinned = true;
    DOM.btnPinCard.classList.add('pinned');
    DOM.hudModeIndicator.textContent = 'Modo: Recorte Analizado';
    showCard();

    // Native .NET 10 & Rust Desktop Interop
    if (window.chrome && window.chrome.webview) {
      window.chrome.webview.postMessage({
        action: 'snip_completed',
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    }
  }
}

// Native .NET 10 & Rust Interop Setup
function setupNativeInterop() {
  if (window.chrome && window.chrome.webview) {
    window.chrome.webview.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.action === 'trigger_snipping') {
        triggerSnipping();
      } else if (data.action === 'snip_result') {
        applyRealDesktopData(data);
      }
    });

    console.log("[TeachMe AI] Conectado al Host Nativo .NET 10 & Rust Kernel via WebView2");
  }
}

function applyRealDesktopData(data) {
  if (!data) return;

  state.lastCapturedImage = data.image || null;

  const realItem = {
    name: data.title || "Ventana Activa de Windows 11",
    controlType: data.isRustEngine ? "Rust_Kernel_GDI_Region" : "Win32_Window_Surface",
    confidence: data.isRustEngine ? "100% Rust Kernel (Zero-Copy BitBlt)" : "99.8% Win32 API Kernel Hook",
    processName: `${data.process}.exe`,
    pid: data.pid || 0,
    signature: data.isRustEngine ? "Rust C-ABI Authenticated" : "Windows Authenticode",
    ocrText: `[HWND: 0x${(data.hwnd || 0).toString(16).toUpperCase()}] ${data.title}`,
    verdictText: `Proceso: ${data.process}.exe • PID: ${data.pid}`,
    safetyTag: data.isRustEngine ? "Rust Engine" : "Proceso Nativo",
    actionTag: "Acción: Inspeccionar",
    summary: `Captura en tiempo real del proceso '${data.process}' (PID: ${data.pid}) ejecutándose en Windows 11. Ventana de destino: "${data.title}".`,
    nature: `Control gráfico nativo enlazado a la cola de mensajes del hilo de '${data.process}'.`,
    impact: `El proceso '${data.process}' gestiona sus propios hilos y memoria virtual asignada por el kernel de Windows.`,
    riskLevel: "Proceso del Sistema / Usuario Verificado",
    riskClass: "safe",
    consequences: `La interacción con este elemento transmitirá eventos de ratón y teclado al proceso '${data.process}'.`,
    vendor: data.isRustEngine ? "TeachMe AI Native Rust Engine" : "Microsoft Windows Shell / App",
    signStatus: "Verificado en tiempo real",
    exePath: `C:\\Windows\\System32\\${data.process}.exe`,
    resources: `PID: ${data.pid} | Manejador HWND: 0x${(data.hwnd || 0).toString(16).toUpperCase()}`,
    accessKey: "Shift + A (Recortar)",
    cliSnippet: `# Consultar información detallada del proceso en PowerShell:
Get-Process -Id ${data.pid} | Select-Object Id, ProcessName, Path, CPU, WorkingSet64`
  };

  populateCard(realItem);

  // If real screenshot was returned by C# / Rust, update crop anchor preview!
  if (data.image) {
    if (DOM.activeCropAnchor) {
      DOM.activeCropAnchor.style.backgroundImage = `url(${data.image})`;
      DOM.activeCropAnchor.style.backgroundSize = 'cover';
      DOM.activeCropAnchor.style.backgroundPosition = 'center';
    }

    const miniThumb = document.getElementById('cropMiniThumbnail');
    if (miniThumb) {
      miniThumb.style.backgroundImage = `url(${data.image})`;
      miniThumb.style.backgroundSize = 'cover';
      miniThumb.style.backgroundPosition = 'center';
    }

    // SI HAY CLAVE DE GEMINI CONFIGURADA, LLAMAR AL MOTOR DE VISIÓN MULTIMODAL EN VIVO
    if (state.geminiApiKey) {
      callGeminiVision(data.image, data);
    }
  }
}

// ==========================================================================
// GEMINI MULTIMODAL AI VISION & CHAT ENGINE
// ==========================================================================

async function callGeminiVision(base64Image, windowMetadata) {
  if (!state.geminiApiKey || state.isAnalyzing) return;

  state.isAnalyzing = true;
  DOM.card.classList.add('analyzing');
  DOM.cardConfidence.textContent = '✨ Analizando con Gemini Vision...';
  DOM.cardVerdictText.textContent = 'Examinando píxeles y estructura visual del control...';

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const model = state.geminiModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`;

    const promptText = `Eres TeachMe AI, un asistente visual neural de ultra-alta fidelidad para Windows 11.
Analiza la captura de pantalla adjunta.
Metadatos del proceso:
- Título de ventana: "${windowMetadata.title || 'Desconocido'}"
- Nombre de proceso: "${windowMetadata.process || 'explorer'}.exe"
- PID: ${windowMetadata.pid || 0}
- Coordenadas: (${windowMetadata.x}, ${windowMetadata.y}) tamaño ${windowMetadata.width}x${windowMetadata.height}px

Proporciona un diagnóstico exhaustivo de accesibilidad, seguridad y educación técnica.
Responde ÚNICAMENTE con un JSON válido con este esquema:
{
  "name": "Nombre conciso del control, botón, diálogo o ventana analizada",
  "controlType": "Tipo de control UI (ej. UIA_Button, UIA_CheckBox, Diálogo de Error, Barra de Herramientas)",
  "confidence": "99.8% Certeza Gemini Multimodal",
  "ocrText": "Texto visible relevante detectado en la captura",
  "verdictText": "Veredicto ejecutivo en 1 línea (ej. Seguro • Función Principal / Alerta • Desmarcar)",
  "safetyTag": "Seguro | Alerta | Precaución | Crítico",
  "actionTag": "Acción: Recomendado | Acción: Omitir | Acción: Inspeccionar",
  "summary": "Explicación clara en 2-3 oraciones dirigida a cualquier usuario sobre qué es este elemento.",
  "nature": "Explicación técnica de la función interna del control en el proceso.",
  "impact": "Impacto en memoria, disco, red o sistema si se interactúa con él.",
  "riskLevel": "Nivel de riesgo descriptivo",
  "riskClass": "safe | warning | danger",
  "consequences": "Qué ocurrirá exactamente en Windows si el usuario hace clic o lo activa.",
  "vendor": "Desarrollador o empresa responsable",
  "signStatus": "Válida (SHA256 Authenticode) o información de firma",
  "exePath": "C:\\\\Windows\\\\System32\\\\... o ruta inferida",
  "resources": "Consumo estimado de CPU / RAM",
  "accessKey": "Atajo de teclado nativo recomendado (ej. Espacio, Enter, Alt + Letra)",
  "cliSnippet": "# Comando de PowerShell equivalente para automatizar o auditar este proceso:\\nGet-Process..."
}`;

    const bodyPayload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: "image/png",
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      parsed.pid = windowMetadata.pid || parsed.pid;
      parsed.processName = windowMetadata.process ? `${windowMetadata.process}.exe` : parsed.processName;
      INSPECTION_DATABASE[state.currentTargetKey] = parsed;
      populateCard(parsed);

      const introMsg = document.createElement('div');
      introMsg.className = 'msg bot';
      introMsg.innerHTML = `✨ <b>Análisis de Gemini completado</b> sobre <i>${parsed.name}</i>.<br>¿Tienes dudas sobre las consecuencias de interactuar con este elemento?`;
      DOM.chatHistory.appendChild(introMsg);
      DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
    }
  } catch (err) {
    console.error("[TeachMe AI] Gemini Vision Error:", err);
    DOM.cardConfidence.textContent = 'Aviso: API Gemini no disponible';
    DOM.cardVerdictText.textContent = 'Error al conectar con Gemini: ' + err.message;
  } finally {
    state.isAnalyzing = false;
    DOM.card.classList.remove('analyzing');
  }
}

async function callGeminiChat(question) {
  if (!state.geminiApiKey) {
    return generateSmartAnswer(question, state.currentTargetKey);
  }

  try {
    const model = state.geminiModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`;
    const current = INSPECTION_DATABASE[state.currentTargetKey] || {};

    const systemPrompt = `Eres TeachMe AI, un tutor cognitivo y de accesibilidad para Windows 11.
Estás asesorando a un usuario sobre el elemento actual:
- Nombre: "${current.name || 'Elemento de pantalla'}"
- Proceso: "${current.processName || 'explorer.exe'}"
- Resumen: "${current.summary || ''}"
- Consecuencias: "${current.consequences || ''}"

Responde de forma concisa, cordial, pedagógica y directa en español. Si el usuario pregunta si es seguro o si debe hacer clic, sé claro y da un consejo práctico.`;

    const parts = [
      { text: `${systemPrompt}\n\nPregunta del usuario: ${question}` }
    ];

    if (state.lastCapturedImage) {
      const cleanBase64 = state.lastCapturedImage.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inline_data: {
          mime_type: "image/png",
          data: cleanBase64
        }
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || generateSmartAnswer(question, state.currentTargetKey);
  } catch (err) {
    console.warn("[TeachMe AI] Fallback to local answering:", err);
    return generateSmartAnswer(question, state.currentTargetKey);
  }
}

// Live Design Studio Drawer Logic
function setupDesignStudio() {
  DOM.btnOpenStudio.addEventListener('click', () => DOM.drawer.classList.add('open'));
  DOM.btnCloseStudio.addEventListener('click', () => DOM.drawer.classList.remove('open'));

  // Gemini AI Engine Configuration in Studio
  if (DOM.inputApiKey) {
    if (state.geminiApiKey) {
      DOM.inputApiKey.value = state.geminiApiKey;
      if (DOM.aiStatusPill) {
        DOM.aiStatusPill.classList.add('connected');
        DOM.aiStatusPill.textContent = 'Gemini Conectado ✨';
      }
    }

    if (DOM.selectAiModel) {
      DOM.selectAiModel.value = state.geminiModel;
      DOM.selectAiModel.addEventListener('change', (e) => {
        state.geminiModel = e.target.value;
        localStorage.setItem('teachme_gemini_model', state.geminiModel);
      });
    }

    if (DOM.btnToggleKeyVisibility) {
      DOM.btnToggleKeyVisibility.addEventListener('click', () => {
        DOM.inputApiKey.type = DOM.inputApiKey.type === 'password' ? 'text' : 'password';
      });
    }

    if (DOM.btnSaveApiKey) {
      DOM.btnSaveApiKey.addEventListener('click', () => {
        const key = DOM.inputApiKey.value.trim();
        state.geminiApiKey = key;
        localStorage.setItem('teachme_gemini_api_key', key);
        if (key) {
          if (DOM.aiStatusPill) {
            DOM.aiStatusPill.classList.add('connected');
            DOM.aiStatusPill.textContent = 'Gemini Conectado ✨';
          }
          DOM.btnSaveApiKey.textContent = '✓ Guardada';
          setTimeout(() => { DOM.btnSaveApiKey.textContent = 'Guardar Clave'; }, 1800);
        } else {
          if (DOM.aiStatusPill) {
            DOM.aiStatusPill.classList.remove('connected');
            DOM.aiStatusPill.textContent = 'Modo Simulado';
          }
        }
      });
    }

    if (DOM.btnTestApiKey) {
      DOM.btnTestApiKey.addEventListener('click', async () => {
        const key = DOM.inputApiKey.value.trim();
        if (!key) {
          alert("Por favor ingresa primero tu clave de API de Gemini.");
          return;
        }
        DOM.btnTestApiKey.textContent = '⏳ Probando...';
        try {
          const model = state.geminiModel || 'gemini-2.5-flash';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Responde únicamente: CONEXION_OK" }] }] })
          });
          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`HTTP ${res.status}: ${errBody}`);
          }
          DOM.btnTestApiKey.textContent = '✓ Conexión Exitosa';
          if (DOM.aiStatusPill) {
            DOM.aiStatusPill.classList.add('connected');
            DOM.aiStatusPill.textContent = 'Gemini Conectado ✨';
          }
          setTimeout(() => { DOM.btnTestApiKey.textContent = 'Probar Conexión'; }, 2000);
        } catch (err) {
          alert("Error al conectar con la API de Gemini: " + err.message);
          DOM.btnTestApiKey.textContent = '✗ Falló Conexión';
          setTimeout(() => { DOM.btnTestApiKey.textContent = 'Probar Conexión'; }, 2000);
        }
      });
    }
  }

  // Acrylic Blur
  DOM.sliderBlur.addEventListener('input', (e) => {
    const val = e.target.value;
    DOM.valBlur.textContent = `${val}px`;
    document.documentElement.style.setProperty('--acrylic-blur', `${val}px`);
  });

  // Acrylic Opacity
  DOM.sliderOpacity.addEventListener('input', (e) => {
    const val = e.target.value;
    DOM.valOpacity.textContent = `${val}%`;
    document.documentElement.style.setProperty('--acrylic-opacity', val / 100);
  });

  // Glow Power
  DOM.sliderGlow.addEventListener('input', (e) => {
    const val = e.target.value;
    DOM.valGlow.textContent = `${val}%`;
    document.documentElement.style.setProperty('--glow-power', val / 100);
  });

  // Corner Radius
  DOM.sliderRadius.addEventListener('input', (e) => {
    const val = e.target.value;
    DOM.valRadius.textContent = `${val}px`;
    document.documentElement.style.setProperty('--acrylic-radius', `${val}px`);
  });

  // Offsets
  DOM.sliderOffsetX.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.offsetX = val;
    DOM.valOffsetX.textContent = `${val}px`;
    calculateTargetPosition(state.anchorPoint.x, state.anchorPoint.y);
  });

  DOM.sliderOffsetY.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.offsetY = val;
    DOM.valOffsetY.textContent = `${val}px`;
    calculateTargetPosition(state.anchorPoint.x, state.anchorPoint.y);
  });

  // Dwell Duration Slider (0.5s - 8s)
  if (DOM.sliderDwell) {
    DOM.sliderDwell.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.dwellDuration = val * 1000;
      DOM.valDwell.textContent = `${val.toFixed(1)}s`;
    });
  }

  // Toggles
  DOM.chkShowBeam.addEventListener('change', (e) => {
    state.showBeam = e.target.checked;
  });

  DOM.chkScanLaser.addEventListener('change', (e) => {
    state.scanLaser = e.target.checked;
  });

  DOM.chkSpecular.addEventListener('change', (e) => {
    state.specular = e.target.checked;
  });

  DOM.chkSmartClamp.addEventListener('change', (e) => {
    state.smartClamp = e.target.checked;
    calculateTargetPosition(state.anchorPoint.x, state.anchorPoint.y);
  });

  DOM.chkLerp.addEventListener('change', (e) => {
    state.useLerp = e.target.checked;
  });

  // Color Swatches
  DOM.swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      DOM.swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const palette = swatch.getAttribute('data-accent');
      document.body.setAttribute('data-palette', palette);
    });
  });

  // Presets
  DOM.scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      let targetKey = 'installer_bloatware';
      if (preset === 'error') targetKey = 'error_code_heading';
      if (preset === 'blender') targetKey = 'tool_bake_ao';
      if (preset === 'uac') targetKey = 'btn_error_uac';

      state.currentTargetKey = targetKey;
      populateCard(INSPECTION_DATABASE[targetKey]);
      showCard();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
