# Script para sincronizar la Identidad de Microsoft Partner Center y compilar el MSIX Oficial
# Este script toma los datos generados por Microsoft Partner Center en:
# Panel de Control > Tu App > Administracion de Productos > Identidad del producto

param (
    [Parameter(Mandatory=$false)]
    [string]$PackageName = "TeachMeAI",

    [Parameter(Mandatory=$false)]
    [string]$Publisher = "CN=TeachMeAI-Dev",

    [Parameter(Mandatory=$false)]
    [string]$PublisherDisplayName = "TeachMe AI",

    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0.0"
)

$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$scriptPackage = Join-Path $rootDir "scripts\package_msix.ps1"

Write-Host "=========================================================="
Write-Host "  Sincronizador de Identidad & Empaquetador MSIX"
Write-Host "=========================================================="
Write-Host ""
Write-Host "Parametros actuales:"
Write-Host " - Package Name:          $PackageName"
Write-Host " - Publisher (CN):        $Publisher"
Write-Host " - Publisher DisplayName: $PublisherDisplayName"
Write-Host " - Version:               $Version"
Write-Host ""

if ($PackageName -eq "TeachMeAI" -and $Publisher -eq "CN=TeachMeAI-Dev") {
    Write-Host "NOTA: Si ya reservaste el nombre en Partner Center, ingresa tus datos oficiales." -ForegroundColor Yellow
    $inputName = Read-Host "Ingresa el 'Nombre del paquete' de Partner Center (presiona Enter para mantener '$PackageName')"
    if (![string]::IsNullOrWhiteSpace($inputName)) { $PackageName = $inputName.Trim() }

    $inputPub = Read-Host "Ingresa el 'Id. de publicador (CN)' de Partner Center (presiona Enter para mantener '$Publisher')"
    if (![string]::IsNullOrWhiteSpace($inputPub)) { $Publisher = $inputPub.Trim() }

    $inputPubDisp = Read-Host "Ingresa el 'Nombre para mostrar del publicador' (presiona Enter para mantener '$PublisherDisplayName')"
    if (![string]::IsNullOrWhiteSpace($inputPubDisp)) { $PublisherDisplayName = $inputPubDisp.Trim() }
}

Write-Host ""
Write-Host "Ejecutando empaquetado con Identity configurada..." -ForegroundColor Cyan

& powershell -ExecutionPolicy Bypass -File $scriptPackage `
    -Version $Version `
    -PackageName $PackageName `
    -Publisher $Publisher `
    -PublisherDisplayName $PublisherDisplayName

Write-Host ""
Write-Host "Proceso completado. Tu archivo MSIX esta listo en la carpeta Package/" -ForegroundColor Green
Pause
