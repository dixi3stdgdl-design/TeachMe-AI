# Script Oficial para Publicar Módulos ToolTip AI en Microsoft Store usando MSStore CLI
param (
    [string]$AppKey = "",
    [string]$PackagePath = "",
    [string]$ProductId = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Publicador Multi-Proyecto Microsoft Store (MSStore CLI) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Comprobar configuracion actual
$config = msstore info 2>&1 | Out-String
Write-Host $config

$projects = @{
    "1" = @{
        Key = "assistant"
        Name = "ToolTip AI (Assistant)"
        Id = "9N3D02KXKD3D"
        Package = "D:\ToolTip AI\MicrosoftStore_Submission\Package\ToolTipAIAssistant_1.1.3.0_x64.msix"
    }
    "2" = @{
        Key = "aura"
        Name = "ToolTip AI Aura"
        Id = "9P33P1P5Z8DC"
        Package = "D:\ToolTip AI Aura\MicrosoftStore_Submission\Package\ToolTipAIAura_1.0.2.0_x64.msix"
    }
    "3" = @{
        Key = "translate"
        Name = "ToolTip AI Translate"
        Id = "9NQN3RZ2Z655"
        Package = "D:\ToolTip AI Translate\ToolTipAI-Translate\MicrosoftStore_Submission\Package\ToolTipAITranslate_1.0.2.0_x64.msix"
    }
    "4" = @{
        Key = "voice"
        Name = "ToolTip AI Voice"
        Id = "9P417GZB0FVB"
        Package = "D:\ToolTip AI Voice\MicrosoftStore_Submission\Package\ToolTipAIVoice_1.0.1.0_x64.msix"
    }
}

if ([string]::IsNullOrWhiteSpace($ProductId) -and [string]::IsNullOrWhiteSpace($PackagePath)) {
    Write-Host "Selecciona el proyecto a publicar en Microsoft Store:" -ForegroundColor Yellow
    Write-Host " [1] ToolTip AI Assistant  (ID: 9N3D02KXKD3D) -> v1.1.3.0"
    Write-Host " [2] ToolTip AI Aura       (ID: 9P33P1P5Z8DC) -> v1.0.2.0"
    Write-Host " [3] ToolTip AI Translate  (ID: 9NQN3RZ2Z655) -> v1.0.2.0"
    Write-Host " [4] ToolTip AI Voice      (ID: 9P417GZB0FVB) -> v1.0.1.0"
    Write-Host " [5] Ingresar ID y ruta manualmente"
    Write-Host ""
    $choice = Read-Host "Elige una opción (1-5)"
    
    if ($projects.ContainsKey($choice)) {
        $selected = $projects[$choice]
        $ProductId = $selected.Id
        $PackagePath = $selected.Package
        Write-Host ""
        Write-Host "Seleccionado: $($selected.Name)" -ForegroundColor Green
    } else {
        $ProductId = Read-Host "Ingresa el Product ID (ej: 9NXXXXXXXXXX)"
        $PackagePath = Read-Host "Ingresa la ruta completa al archivo .msix"
    }
}

if (-not (Test-Path $PackagePath)) {
    Write-Host ""
    Write-Host "[ADVERTENCIA] No se encontró el archivo MSIX en: $PackagePath" -ForegroundColor Red
    $alt = Read-Host "Ingresa una ruta alternativa de paquete MSIX (o presiona Enter para cancelar)"
    if (Test-Path $alt) {
        $PackagePath = $alt
    } else {
        Write-Host "Operación cancelada."
        Pause
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Subiendo paquete a Microsoft Store..." -ForegroundColor Cyan
Write-Host "  - Product ID: $ProductId"
Write-Host "  - Paquete:    $PackagePath"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

msstore publish "$PackagePath" --id "$ProductId"

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
Pause
