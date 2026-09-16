# Script para sincronizar la Identidad de Microsoft Partner Center y compilar el MSIX Oficial
# Este script toma los datos generados por Microsoft Partner Center en:
# Panel de Control > Tu App > Administracion de Productos > Identidad del producto

param (
    [Parameter(Mandatory=$false)]
    [string]$PackageName = "Dixi3Lqbs.ToolTipAIAssistant",

    [Parameter(Mandatory=$false)]
    [string]$Publisher = "CN=5A4F9620-3DD9-4496-B7BF-3252D9BF4477",

    [Parameter(Mandatory=$false)]
    [string]$PublisherDisplayName = "Dixi3 Lqbs",

    [Parameter(Mandatory=$false)]
    [string]$DisplayName = "ToolTip AI",

    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.3.0"
)

$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$scriptPackage = Join-Path $rootDir "scripts\package_msix.ps1"

Write-Host "=========================================================="
Write-Host "  Sincronizador de Identidad & Empaquetador MSIX"
Write-Host "=========================================================="
Write-Host ""
Write-Host "Parametros oficiales configurados:"
Write-Host " - Package Name:          $PackageName"
Write-Host " - Publisher (CN):        $Publisher"
Write-Host " - Publisher DisplayName: $PublisherDisplayName"
Write-Host " - Display Name:          $DisplayName"
Write-Host " - Version:               $Version"
Write-Host ""

Write-Host ""
Write-Host "Ejecutando empaquetado con Identity configurada..." -ForegroundColor Cyan

& powershell -ExecutionPolicy Bypass -File $scriptPackage `
    -Version $Version `
    -PackageName $PackageName `
    -Publisher $Publisher `
    -PublisherDisplayName $PublisherDisplayName `
    -DisplayName $DisplayName

Write-Host ""
Write-Host "Proceso completado. Tu archivo MSIX esta listo en la carpeta Package/" -ForegroundColor Green
Pause
