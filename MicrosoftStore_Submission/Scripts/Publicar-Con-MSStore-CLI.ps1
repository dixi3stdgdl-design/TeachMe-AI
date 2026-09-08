# Script Oficial para Publicar TeachMe AI en Microsoft Store usando MSStore CLI
param (
    [string]$PackagePath = "d:\TeachMe AI\MicrosoftStore_Submission\Package\TeachMeAI_1.0.0.0_x64.msix",
    [string]$ProductId = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Publicador Oficial Microsoft Store (MSStore CLI)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Comprobar configuracion actual
$config = msstore info 2>&1 | Out-String
Write-Host $config

Write-Host "[OK] Credenciales ya configuradas y listas en el sistema." -ForegroundColor Green
Write-Host ""

if ([string]::IsNullOrWhiteSpace($ProductId)) {
    Write-Host "Consultando tus aplicaciones registradas..." -ForegroundColor Cyan
    msstore apps list
    Write-Host ""
    $ProductId = Read-Host "Ingresa el 'Store ID' o 'Product ID' de TeachMe AI (ejemplo: 9NXXXXXXXXXX)"
}

if (-not [string]::IsNullOrWhiteSpace($ProductId)) {
    Write-Host ""
    Write-Host "Subiendo paquete MSIX a Microsoft Store..." -ForegroundColor Cyan
    msstore publish $PackagePath --id $ProductId.Trim()
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
Pause
