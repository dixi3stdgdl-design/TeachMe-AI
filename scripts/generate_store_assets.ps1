# Generador de Assets Oficiales para Microsoft Store y MSIX
param (
    [string]$SourceIcon = "d:\TeachMe AI\icon.png",
    [string]$OutputDir = "d:\TeachMe AI\MicrosoftStore_Submission\Store_Assets"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourceIcon)) {
    throw "No se encontro la imagen fuente: $SourceIcon"
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$targetSizesDir = Join-Path $OutputDir "TargetSizes"
if (-not (Test-Path $targetSizesDir)) {
    New-Item -ItemType Directory -Path $targetSizesDir -Force | Out-Null
}

$sourceImg = [System.Drawing.Image]::FromFile($SourceIcon)

function Resize-SquareImage {
    param (
        [System.Drawing.Image]$Image,
        [int]$Size,
        [string]$DestinationPath
    )
    $destBitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($Image, 0, 0, $Size, $Size)
    $destBitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Host "Generado: $(Split-Path $DestinationPath -Leaf) ($Size x $Size)"
}

function Create-ComposedWideImage {
    param (
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestinationPath,
        [string]$BgHex = "#080D1A"
    )
    $destBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml($BgHex)
    $graphics.Clear($bgColor)

    # Centrar icono con padding elegante
    $iconSize = [Math]::Min($Height * 0.70, $Width * 0.50)
    $x = ($Width - $iconSize) / 2
    $y = ($Height - $iconSize) / 2
    $graphics.DrawImage($Image, [int]$x, [int]$y, [int]$iconSize, [int]$iconSize)

    $destBitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Host "Generado: $(Split-Path $DestinationPath -Leaf) ($Width x $Height)"
}

# 1. StoreLogo
Resize-SquareImage -Image $sourceImg -Size 50 -DestinationPath (Join-Path $OutputDir "StoreLogo.png")
Resize-SquareImage -Image $sourceImg -Size 50 -DestinationPath (Join-Path $OutputDir "StoreLogo.scale-100.png")
Resize-SquareImage -Image $sourceImg -Size 100 -DestinationPath (Join-Path $OutputDir "StoreLogo.scale-200.png")
Resize-SquareImage -Image $sourceImg -Size 200 -DestinationPath (Join-Path $OutputDir "StoreLogo.scale-400.png")

# 2. Square44x44Logo
Resize-SquareImage -Image $sourceImg -Size 44 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.png")
Resize-SquareImage -Image $sourceImg -Size 44 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.scale-100.png")
Resize-SquareImage -Image $sourceImg -Size 55 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.scale-125.png")
Resize-SquareImage -Image $sourceImg -Size 66 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.scale-150.png")
Resize-SquareImage -Image $sourceImg -Size 88 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.scale-200.png")
Resize-SquareImage -Image $sourceImg -Size 176 -DestinationPath (Join-Path $OutputDir "Square44x44Logo.scale-400.png")

# TargetSizes for system trays, taskbars and notifications
foreach ($s in @(16, 24, 32, 48, 256)) {
    Resize-SquareImage -Image $sourceImg -Size $s -DestinationPath (Join-Path $OutputDir "Square44x44Logo.targetsize-$s.png")
    Resize-SquareImage -Image $sourceImg -Size $s -DestinationPath (Join-Path $OutputDir "Square44x44Logo.altform-unplated_targetsize-$s.png")
    Resize-SquareImage -Image $sourceImg -Size $s -DestinationPath (Join-Path $targetSizesDir "icon-$s.png")
}

# 3. Square150x150Logo (Medium Tile)
Resize-SquareImage -Image $sourceImg -Size 150 -DestinationPath (Join-Path $OutputDir "Square150x150Logo.png")
Resize-SquareImage -Image $sourceImg -Size 150 -DestinationPath (Join-Path $OutputDir "Square150x150Logo.scale-100.png")
Resize-SquareImage -Image $sourceImg -Size 300 -DestinationPath (Join-Path $OutputDir "Square150x150Logo.scale-200.png")
Resize-SquareImage -Image $sourceImg -Size 600 -DestinationPath (Join-Path $OutputDir "Square150x150Logo.scale-400.png")

# 4. Square310x310Logo (Large Tile)
Resize-SquareImage -Image $sourceImg -Size 310 -DestinationPath (Join-Path $OutputDir "Square310x310Logo.png")
Resize-SquareImage -Image $sourceImg -Size 310 -DestinationPath (Join-Path $OutputDir "Square310x310Logo.scale-100.png")
Resize-SquareImage -Image $sourceImg -Size 620 -DestinationPath (Join-Path $OutputDir "Square310x310Logo.scale-200.png")

# 5. Wide310x150Logo (Wide Tile)
Create-ComposedWideImage -Image $sourceImg -Width 310 -Height 150 -DestinationPath (Join-Path $OutputDir "Wide310x150Logo.png")
Create-ComposedWideImage -Image $sourceImg -Width 310 -Height 150 -DestinationPath (Join-Path $OutputDir "Wide310x150Logo.scale-100.png")
Create-ComposedWideImage -Image $sourceImg -Width 620 -Height 300 -DestinationPath (Join-Path $OutputDir "Wide310x150Logo.scale-200.png")

# 6. SplashScreen
Create-ComposedWideImage -Image $sourceImg -Width 620 -Height 300 -DestinationPath (Join-Path $OutputDir "SplashScreen.png")
Create-ComposedWideImage -Image $sourceImg -Width 620 -Height 300 -DestinationPath (Join-Path $OutputDir "SplashScreen.scale-100.png")
Create-ComposedWideImage -Image $sourceImg -Width 1240 -Height 600 -DestinationPath (Join-Path $OutputDir "SplashScreen.scale-200.png")

# 7. Store Listing Icons (1024x1024 and 512x512)
Resize-SquareImage -Image $sourceImg -Size 1024 -DestinationPath (Join-Path $OutputDir "StoreListing_Icon_1024.png")
Resize-SquareImage -Image $sourceImg -Size 512 -DestinationPath (Join-Path $OutputDir "StoreListing_Icon_512.png")

# 8. Store Listing Hero / Promo Art (1920x1080)
Create-ComposedWideImage -Image $sourceImg -Width 1920 -Height 1080 -DestinationPath (Join-Path $OutputDir "StoreListing_Hero_1920x1080.png")

$sourceImg.Dispose()
Write-Host "Todos los assets visuales de Microsoft Store fueron generados con exito en $OutputDir"
