# Script para instalar el Certificado de Prueba de TeachMe AI en Windows
# Ejecutar como Administrador para permitir la instalacion en 'TrustedPeople'

#Requires -RunAsAdministrator

$cerFile = Join-Path $PSScriptRoot "TeachMeAI_Test.cer"

if (-not (Test-Path $cerFile)) {
    Write-Error "No se encontro el archivo de certificado: $cerFile"
    exit 1
}

Write-Host "=========================================================="
Write-Host "  Instalador de Certificado de Prueba - TeachMe AI"
Write-Host "=========================================================="
Write-Host ""
Write-Host "Instalando certificado en el almacen de Personas de Confianza (TrustedPeople)..."

try {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("TrustedPeople", "LocalMachine")
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cerFile)
    $store.Add($cert)
    $store.Close()

    Write-Host ""
    Write-Host "[EXITO] Certificado instalado correctamente en la maquina local." -ForegroundColor Green
    Write-Host "Ahora puedes hacer doble clic en el archivo .msix para instalar y probar TeachMe AI en Windows!" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Error "Error instalando certificado: $_"
}

Pause
