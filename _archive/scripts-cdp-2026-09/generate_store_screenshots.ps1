# Generador de capturas de pantalla de alta definicion (1920x1080) para la ficha de Microsoft Store - ToolTip AI
param (
    [string]$OutputDir = "d:\TeachMe AI\MicrosoftStore_Submission\Store_Assets\Screenshots",
    [string]$IconPath = "d:\TeachMe AI\icon.png"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$fontHero = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)
$fontCardHeader = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontCardSub = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontCardBody = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontMono = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Regular)

function Create-BaseBackground {
    param ([int]$W = 1920, [int]$H = 1080)
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Fondo degradado Windows 11 Dark Mica / Deep Space
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.ColorTranslator]::FromHtml("#050812"),
        [System.Drawing.ColorTranslator]::FromHtml("#0C1528"),
        45.0
    )
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Rejilla sutil de diseno
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(14, 255, 255, 255), 1)
    for ($x = 0; $x -lt $W; $x += 60) { $g.DrawLine($gridPen, $x, 0, $x, $H) }
    for ($y = 0; $y -lt $H; $y += 60) { $g.DrawLine($gridPen, 0, $y, $W, $y) }
    $gridPen.Dispose()

    # Destellos de luz ambiental (Glow acrilico esmeralda y cian)
    $glowBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 0, 245, 160))
    $g.FillEllipse($glowBrush1, 160, 120, 650, 650)
    $glowBrush1.Dispose()

    $glowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 56, 189, 248))
    $g.FillEllipse($glowBrush2, 1150, 280, 750, 750)
    $glowBrush2.Dispose()

    # Linea de acento luminosa superior
    $accentPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 3)
    $g.DrawLine($accentPen, 120, 45, 380, 45)
    $accentPen.Dispose()

    return @($bmp, $g)
}

$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"))
$skyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
$darkBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 11, 18, 34))

# =========================================================================
# --- SCREENSHOT 1: HUD COGNITIVO & INSPECTOR DIDACTICO ---
# =========================================================================
$bg1, $g1 = Create-BaseBackground
$g1.DrawString("ToolTip AI — Neural Screen Inspector & Cognitive HUD", $fontHero, $cyanBrush, 120, 70)
$g1.DrawString("Diagnostico Didactico en Tiempo Real con IA Vision Multimodal para Windows 11", $fontSub, $mutedBrush, 120, 130)

# Tarjeta HUD Central translúcida
$hudRect = New-Object System.Drawing.Rectangle(560, 210, 800, 780)
$hudBorder = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 2)
$g1.FillRectangle($darkBgBrush, $hudRect)
$g1.DrawRectangle($hudBorder, $hudRect)

# Header HUD
$g1.DrawString("ToolTip AI  |  Vision HUD v1.0.1", $fontCardHeader, $cyanBrush, 600, 240)
$g1.DrawString("Elemento Analizado: 'Actualizar y reiniciar ahora'  •  [explorer.exe]", $fontCardSub, $whiteBrush, 600, 280)

# Badge Veredicto
$badgeRect = New-Object System.Drawing.Rectangle(600, 325, 340, 46)
$badgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 0, 245, 160))
$badgePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 1)
$g1.FillRectangle($badgeBg, $badgeRect)
$g1.DrawRectangle($badgePen, $badgeRect)
$g1.DrawString("VEREDICTO: SEGURO (Nivel de Riesgo 0/10)", $fontBadge, $cyanBrush, 620, 338)

# Explicacion didactica
$g1.DrawString("Explicacion Didactica:", $fontCardHeader, $skyBrush, 600, 395)
$explanation = "Este boton aplica parches de seguridad y mejoras oficiales acumulativas de Windows 11.`n`n" +
               "Impacto en el Sistema:`n" +
               "  - Archivos y datos personales: 100% Intactos (sin riesgo de perdida).`n" +
               "  - Registro y arranque: Actualizacion protegida por punto de restauracion automatico.`n" +
               "  - Memoria: Cierre ordenado de procesos de usuario tras aviso previo.`n`n" +
               "Recomendacion: Seguro para ejecutar ahora o al final de tu jornada laboral."
$g1.DrawString($explanation, $fontCardBody, $whiteBrush, 600, 435)

# Bloque CLI / Diagnostico PowerShell
$cliRect = New-Object System.Drawing.Rectangle(600, 720, 720, 110)
$cliBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 6, 10, 20))
$cliBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 56, 189, 248), 1)
$g1.FillRectangle($cliBg, $cliRect)
$g1.DrawRectangle($cliBorder, $cliRect)
$g1.DrawString("# Diagnostico Avanzado de Sistema (PowerShell Win32):`nGet-Process -Id (Get-Process explorer).Id | Select-Object Name, CPU, WorkingSet64`nGet-HotFix -Description 'Security Update' | Select -First 1", $fontMono, $skyBrush, 615, 735)

# Footer HUD
$g1.DrawString("Motor: IA Multimodal  |  Acoplamiento: Inteligente  |  Latencia: 420 ms", $fontMono, $mutedBrush, 600, 850)

$bg1.Save((Join-Path $OutputDir "Screenshot_1_HUD_Inspection.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bg1.Dispose()
Write-Host "Generado con exito: Screenshot_1_HUD_Inspection.png"


# =========================================================================
# --- SCREENSHOT 2: RECORTE INSTANTANEO GLOBAL (CTRL + A) ---
# =========================================================================
$bg2, $g2 = Create-BaseBackground
$g2.DrawString("Recorte Milimetrico Instantaneo en Cualquier Aplicacion (Ctrl + A)", $fontHero, $cyanBrush, 120, 70)
$g2.DrawString("Congela el escritorio con un atajo global y selecciona dialogos, botones o menus confusos", $fontSub, $mutedBrush, 120, 130)

# Pantalla simulada
$screenRect = New-Object System.Drawing.Rectangle(240, 210, 1440, 780)
$screenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 12, 18, 32))
$screenPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"), 2)
$g2.FillRectangle($screenBg, $screenRect)
$g2.DrawRectangle($screenPen, $screenRect)

# Caja de recorte seleccionada con guia cruzada
$snipRect = New-Object System.Drawing.Rectangle(580, 360, 760, 420)
$snipPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 3)
$snipBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 0, 245, 160))
$g2.FillRectangle($snipBg, $snipRect)
$g2.DrawRectangle($snipPen, $snipRect)

# Lineas de mira milimetrica
$crossPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 0, 245, 160), 1)
$crossPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$g2.DrawLine($crossPen, 240, 570, 1680, 570)
$g2.DrawLine($crossPen, 960, 210, 960, 990)
$crossPen.Dispose()

# Tooltip flotante en recorte
$tipRect = New-Object System.Drawing.Rectangle(600, 380, 420, 55)
$tipBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#070B16"))
$tipBorder = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 1)
$g2.FillRectangle($tipBg, $tipRect)
$g2.DrawRectangle($tipBorder, $tipRect)
$g2.DrawString("Area Seleccionada: 760 x 420 px  |  Procesando IA...", $fontBadge, $cyanBrush, 620, 396)

# Badge de instruccion
$helpRect = New-Object System.Drawing.Rectangle(1240, 240, 400, 60)
$g2.FillRectangle($tipBg, $helpRect)
$g2.DrawRectangle($screenPen, $helpRect)
$g2.DrawString("Atajo Global: Ctrl + A  •  Salir: Esc", $fontCardBody, $skyBrush, 1260, 258)

$bg2.Save((Join-Path $OutputDir "Screenshot_2_Snipping_Tool.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bg2.Dispose()
Write-Host "Generado con exito: Screenshot_2_Snipping_Tool.png"


# =========================================================================
# --- SCREENSHOT 3: CENTRO DE CONTROL, BOVEDA DPAPI Y BANDEJA ---
# =========================================================================
$bg3, $g3 = Create-BaseBackground
$g3.DrawString("Centro de Control Ultraligero, Boveda DPAPI & System Tray", $fontHero, $cyanBrush, 120, 70)
$g3.DrawString("Consumo minimo de RAM (<40 MB), cifrado seguro local y presencia silenciosa junto al reloj", $fontSub, $mutedBrush, 120, 130)

# Ventana Dashboard Izquierda
$dashRect = New-Object System.Drawing.Rectangle(380, 210, 520, 780)
$dashBorder = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"), 2)
$g3.FillRectangle($darkBgBrush, $dashRect)
$g3.DrawRectangle($dashBorder, $dashRect)

$g3.DrawString("ToolTip AI  —  Panel de Control", $fontCardHeader, $cyanBrush, 420, 250)
$g3.DrawString("Version 1.0.1  |  Estado: Listo y Monitoreando", $fontCardBody, $mutedBrush, 420, 285)

# Botones de Accion Rapida
$btnSnip = New-Object System.Drawing.Rectangle(420, 340, 440, 75)
$btnSnipBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"))
$g3.FillRectangle($btnSnipBg, $btnSnip)
$blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#050811"))
$g3.DrawString("⚡ Recortar Pantalla (Ctrl + A)", $fontCardHeader, $blackBrush, 480, 365)

$btnFull = New-Object System.Drawing.Rectangle(420, 440, 440, 68)
$btnFullBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 56, 189, 248))
$g3.FillRectangle($btnFullBg, $btnFull)
$g3.DrawString("📸 Inspeccionar Pantalla Completa", $fontCardBody, $skyBrush, 480, 462)

$btnClip = New-Object System.Drawing.Rectangle(420, 530, 440, 68)
$btnClipBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 0, 245, 160))
$g3.FillRectangle($btnClipBg, $btnClip)
$g3.DrawString("📋 Inspeccionar Imagen o Texto de Portapapeles", $fontCardBody, $cyanBrush, 440, 552)

$btnRadar = New-Object System.Drawing.Rectangle(420, 620, 440, 68)
$btnRadarBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))
$g3.FillRectangle($btnRadarBg, $btnRadar)
$g3.DrawString("📡 Dwell Engine / Radar Automatico: ACTIVO", $fontCardBody, $whiteBrush, 450, 642)

# Tarjeta Derecha: Seguridad y Ajustes
$setRect = New-Object System.Drawing.Rectangle(940, 210, 600, 780)
$g3.FillRectangle($darkBgBrush, $setRect)
$g3.DrawRectangle($dashBorder, $setRect)

$g3.DrawString("Boveda Segura & Privacidad Absoluta", $fontCardHeader, $skyBrush, 980, 250)

$securityText = "🔐 Boveda DPAPI (Data Protection API):`n" +
                "Tu clave de API se cifra con el algoritmo nativo de Windows (ProtectedData).`n" +
                "Nadie fuera de tu cuenta de Windows puede leerla.`n`n" +
                "🛡️ Comunicacion Directa HTTPS/TLS:`n" +
                "Tus capturas viajan cifradas directamente entre tu equipo y el servidor oficial.`n" +
                "Cero intermediarios. Cero almacenamiento de capturas en la nube.`n`n" +
                "🪶 Ultra-Bajo Consumo de Recursos:`n" +
                "- Memoria RAM: <40 MB en reposo.`n" +
                "- CPU: 0% en segundo plano.`n" +
                "- Alojamiento silencioso en la bandeja del sistema (System Tray)."

$g3.DrawString($securityText, $fontCardBody, $whiteBrush, 980, 310)

$bg3.Save((Join-Path $OutputDir "Screenshot_3_Dashboard_Controls.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose()
$bg3.Dispose()
Write-Host "Generado con exito: Screenshot_3_Dashboard_Controls.png"


# =========================================================================
# --- SCREENSHOT 4: ACOPLAMIENTO MAGNETICO & UI AUTOMATION WIN32 ---
# =========================================================================
$bg4, $g4 = Create-BaseBackground
$g4.DrawString("Acoplamiento Magnetico Inteligente & Deteccion UI Automation", $fontHero, $cyanBrush, 120, 70)
$g4.DrawString("El HUD se ancla suavemente a los bordes de la pantalla y extrae la jerarquia nativa de controles", $fontSub, $mutedBrush, 120, 130)

# Simulación de ventana de trabajo y HUD acoplado a la derecha
$workRect = New-Object System.Drawing.Rectangle(200, 210, 960, 780)
$workPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#334155"), 2)
$g4.FillRectangle($screenBg, $workRect)
$g4.DrawRectangle($workPen, $workRect)

$g4.DrawString("Ventana de Trabajo o Error del Sistema (Simulacion)", $fontCardHeader, $mutedBrush, 240, 250)

# Caja de error simulada
$errRect = New-Object System.Drawing.Rectangle(280, 360, 800, 320)
$errBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 239, 68, 68))
$errPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#EF4444"), 1)
$g4.FillRectangle($errBg, $errRect)
$g4.DrawRectangle($errPen, $errRect)
$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#FCA5A5"))
$g4.DrawString("⚠️ Error de Acceso al Registro: 0x80070005 (Access Denied)", $fontCardHeader, $redBrush, 310, 390)
$errBody = "El instalador intento modificar la clave HKLM\Software\Policies pero carece de permisos.`n`n" +
           "UI Automation detecto: Ventana modal de sistema, Boton de Reintentar y Cancelar.`n" +
           "ToolTip AI analizo automaticamente el error y genero la solucion didactica a la derecha."
$g4.DrawString($errBody, $fontCardBody, $whiteBrush, 310, 450)

# HUD Acoplado en el borde derecho
$dockRect = New-Object System.Drawing.Rectangle(1200, 210, 520, 780)
$dockBorder = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 2)
$g4.FillRectangle($darkBgBrush, $dockRect)
$g4.DrawRectangle($dockBorder, $dockRect)

$g4.DrawString("HUD Acoplado (Magnetic Dock)", $fontCardHeader, $cyanBrush, 1230, 250)
$g4.DrawString("Veredicto: Requiere Elevacion UAC", $fontCardSub, $skyBrush, 1230, 290)

$dockSolution = "Que significa este error?`n" +
                "Una aplicacion intento cambiar ajustes de administrador sin permisos.`n`n" +
                "Solucion Recomendada:`n" +
                "1. Haz clic derecho sobre el instalador.`n" +
                "2. Selecciona 'Ejecutar como administrador'.`n`n" +
                "Comando de Correccion PowerShell:`n" +
                "Start-Process setup.exe -Verb RunAs"
$g4.DrawString($dockSolution, $fontCardBody, $whiteBrush, 1230, 350)

$bg4.Save((Join-Path $OutputDir "Screenshot_4_Docking_UIAutomation.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g4.Dispose()
$bg4.Dispose()
Write-Host "Generado con exito: Screenshot_4_Docking_UIAutomation.png"

Write-Host "=========================================================="
Write-Host "Todas las capturas de pantalla de Microsoft Store listas en:"
Write-Host "$OutputDir"
Write-Host "=========================================================="
