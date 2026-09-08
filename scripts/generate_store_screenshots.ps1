# Generador de capturas de pantalla de alta definicion (1920x1080) para la ficha de Microsoft Store
param (
    [string]$OutputDir = "d:\TeachMe AI\MicrosoftStore_Submission\Store_Assets\Screenshots",
    [string]$IconPath = "d:\TeachMe AI\icon.png"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 32, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$fontCardHeader = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontCardBody = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontMono = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Regular)

function Create-BaseBackground {
    param ([int]$W = 1920, [int]$H = 1080)
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Fondo degradado Windows 11 Dark Mica
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.ColorTranslator]::FromHtml("#050811"),
        [System.Drawing.ColorTranslator]::FromHtml("#0D162A"),
        45.0
    )
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Rejilla sutil de fondo
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(15, 255, 255, 255), 1)
    for ($x = 0; $x -lt $W; $x += 60) { $g.DrawLine($gridPen, $x, 0, $x, $H) }
    for ($y = 0; $y -lt $H; $y += 60) { $g.DrawLine($gridPen, 0, $y, $W, $y) }
    $gridPen.Dispose()

    # Destellos de luz ambiental (Glow acrilico)
    $glowBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 0, 245, 160))
    $g.FillEllipse($glowBrush1, 200, 150, 600, 600)
    $glowBrush1.Dispose()

    $glowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 56, 189, 248))
    $g.FillEllipse($glowBrush2, 1100, 300, 700, 700)
    $glowBrush2.Dispose()

    return @($bmp, $g)
}

# --- SCREENSHOT 1: HUD COGNITIVO & INSPECTOR CON IA ---
$bg1, $g1 = Create-BaseBackground
# Titulo y banner superior
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"))
$skyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))

$g1.DrawString("TeachMe AI — Windows 11 Neural Inspector & HUD", $fontTitle, $cyanBrush, 120, 80)
$g1.DrawString("Diagnostico Didactico en Tiempo Real con IA Multimodal (Google Gemini)", $fontSub, $mutedBrush, 120, 140)

# Tarjeta HUD Central
$hudRect = New-Object System.Drawing.Rectangle(620, 240, 680, 700)
$hudBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 11, 16, 32))
$hudBorder = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 2)
$g1.FillRectangle($hudBg, $hudRect)
$g1.DrawRectangle($hudBorder, $hudRect)

# Header HUD
$g1.DrawString("TeachMe AI  v2.5 Pro", $fontCardHeader, $cyanBrush, 660, 270)
$g1.DrawString("Elemento Inspeccionado: 'Actualizar y Reiniciar' [explorer.exe]", $fontBadge, $whiteBrush, 660, 310)

# Badge Veredicto
$badgeRect = New-Object System.Drawing.Rectangle(660, 355, 300, 44)
$badgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 245, 160))
$badgePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 1)
$g1.FillRectangle($badgeBg, $badgeRect)
$g1.DrawRectangle($badgePen, $badgeRect)
$g1.DrawString("SEGURO  Accion: Continuar", $fontBadge, $cyanBrush, 680, 367)

# Explicacion didactica
$g1.DrawString("Explicacion Didactica:", $fontCardHeader, $skyBrush, 660, 425)
$explanation = "Este boton aplica los parches de seguridad acumulativos de Windows 11.`n`n" +
               "Impacto del Sistema:`n" +
               "- No borra documentos ni altera la configuracion del usuario.`n" +
               "- Cerrara los procesos abiertos tras una cuenta regresiva.`n`n" +
               "Riesgo: Ninguno. Es una tarea rutinaria y recomendada de mantenimiento."
$g1.DrawString($explanation, $fontCardBody, $whiteBrush, 660, 465)

# Bloque CLI
$cliRect = New-Object System.Drawing.Rectangle(660, 680, 600, 80)
$cliBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 6, 8, 16))
$g1.FillRectangle($cliBg, $cliRect)
$g1.DrawString("# Diagnostico Tecnico en PowerShell:`nGet-Process -Id 1420 | Select-Object ProcessName, Path, CPU", $fontMono, $skyBrush, 675, 700)

$bg1.Save((Join-Path $OutputDir "Screenshot_1_HUD_Inspection.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bg1.Dispose()
Write-Host "Generado: Screenshot_1_HUD_Inspection.png"


# --- SCREENSHOT 2: RECORTE INSTANTANEO GLOBAL (CTRL + A) ---
$bg2, $g2 = Create-BaseBackground
$g2.DrawString("Recorte Milimetrico Instantaneo en Cualquier Aplicacion", $fontTitle, $cyanBrush, 120, 80)
$g2.DrawString("Pulsa Ctrl + A en cualquier pantalla para congelar el escritorio y seleccionar el area de interes", $fontSub, $mutedBrush, 120, 140)

# Pantalla simulada
$screenRect = New-Object System.Drawing.Rectangle(260, 240, 1400, 700)
$screenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 15, 23, 42))
$screenPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"), 2)
$g2.FillRectangle($screenBg, $screenRect)
$g2.DrawRectangle($screenPen, $screenRect)

# Caja de recorte seleccionada
$snipRect = New-Object System.Drawing.Rectangle(600, 380, 720, 400)
$snipPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"), 3)
$snipBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 245, 160))
$g2.FillRectangle($snipBg, $snipRect)
$g2.DrawRectangle($snipPen, $snipRect)

# Tooltip de atajo en recorte
$tipRect = New-Object System.Drawing.Rectangle(620, 400, 320, 50)
$tipBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#080D1A"))
$g2.FillRectangle($tipBg, $tipRect)
$g2.DrawString("Area Seleccionada: 720x400  Analizando...", $fontBadge, $cyanBrush, 635, 415)

$bg2.Save((Join-Path $OutputDir "Screenshot_2_Snipping_Tool.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bg2.Dispose()
Write-Host "Generado: Screenshot_2_Snipping_Tool.png"


# --- SCREENSHOT 3: PANEL DE CONTROL & BANDEJA DEL SISTEMA ---
$bg3, $g3 = Create-BaseBackground
$g3.DrawString("Centro de Control Ultraligero & Alojamiento en Barra de Tareas", $fontTitle, $cyanBrush, 120, 80)
$g3.DrawString("Consume menos de 40 MB de RAM. No ralentiza el inicio de Windows y se activa solo cuando lo requieres.", $fontSub, $mutedBrush, 120, 140)

# Ventana Mini Dashboard
$dashRect = New-Object System.Drawing.Rectangle(450, 260, 480, 680)
$dashBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 10, 15, 28))
$dashPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"), 2)
$g3.FillRectangle($dashBg, $dashRect)
$g3.DrawRectangle($dashPen, $dashRect)

$g3.DrawString("TeachMe AI — Panel de Control", $fontCardHeader, $cyanBrush, 490, 300)

# Botones Dashboard
$btnSnip = New-Object System.Drawing.Rectangle(490, 360, 400, 75)
$btnSnipBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#00F5A0"))
$g3.FillRectangle($btnSnipBg, $btnSnip)
$blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#050811"))
$g3.DrawString("⚡ Recortar Pantalla (Ctrl + A)", $fontCardHeader, $blackBrush, 550, 385)

$btnFull = New-Object System.Drawing.Rectangle(490, 460, 400, 65)
$btnFullBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 56, 189, 248))
$g3.FillRectangle($btnFullBg, $btnFull)
$g3.DrawString("📸 Captura de Pantalla Completa", $fontCardBody, $skyBrush, 550, 480)

$btnClip = New-Object System.Drawing.Rectangle(490, 545, 400, 65)
$btnClipBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 245, 160))
$g3.FillRectangle($btnClipBg, $btnClip)
$g3.DrawString("📋 Analizar Portapapeles", $fontCardBody, $cyanBrush, 550, 565)

$btnRadar = New-Object System.Drawing.Rectangle(490, 630, 400, 65)
$btnRadarBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 255, 255, 255))
$g3.FillRectangle($btnRadarBg, $btnRadar)
$g3.DrawString("📡 Radar Automatico (Ctrl + D): ACTIVO", $fontCardBody, $whiteBrush, 520, 650)

# Panel de Ajustes Derecho
$setRect = New-Object System.Drawing.Rectangle(980, 260, 500, 680)
$g3.FillRectangle($dashBg, $setRect)
$g3.DrawRectangle($dashPen, $setRect)

$g3.DrawString("Ajustes de Inteligencia Artificial", $fontCardHeader, $skyBrush, 1020, 300)
$g3.DrawString("Modelo Seleccionado:`n- Gemini 2.5 Flash / Gemini Pro Oficial`n`nClave de API:`n- Tu clave privada guardada de forma segura en tu equipo local.`n`nPrivacidad Absoluta:`n- Tus imagenes y consultas van directo de tu PC a la API oficial de Google.`n- Ningun dato intermedio se almacena en servidores externos.`n`nAlojamiento en Barra de Tareas:`n- Al cerrar la ventana, TeachMe AI se aloja silenciosamente junto al reloj de Windows.", $fontCardBody, $whiteBrush, 1020, 350)

$bg3.Save((Join-Path $OutputDir "Screenshot_3_Dashboard_Controls.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose()
$bg3.Dispose()
Write-Host "Generado: Screenshot_3_Dashboard_Controls.png"

Write-Host "Todas las capturas de pantalla de Microsoft Store fueron generadas en $OutputDir"
