# Script interactivo para configurar o renovar las credenciales de Microsoft Store Developer CLI (msstore)
param(
    [string]$TenantId = "",
    [string]$SellerId = "",
    [string]$ClientId = "",
    [string]$ClientSecret = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Configurador de Microsoft Store CLI (Azure Entra ID)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Cargar configuracion por defecto si existe
$configJsonPath = Join-Path (Split-Path $PSScriptRoot -Parent) "msstore-projects-config.json"
$defaultTenantId = "53bb6c33-8f48-45b9-ae83-02280f5690c7"
$defaultSellerId = "94193860"
$defaultClientId = "0b5b3ddb-259f-4877-94d9-8a352de29d2b"

if (Test-Path $configJsonPath) {
    try {
        $json = Get-Content -Raw -Path $configJsonPath | ConvertFrom-Json
        if ($json.partnerCenter) {
            if ($json.partnerCenter.tenantId) { $defaultTenantId = $json.partnerCenter.tenantId }
            if ($json.partnerCenter.sellerId) { $defaultSellerId = $json.partnerCenter.sellerId }
            if ($json.partnerCenter.clientId) { $defaultClientId = $json.partnerCenter.clientId }
        }
    } catch { }
}

if ([string]::IsNullOrWhiteSpace($TenantId)) {
    $inputTenant = Read-Host "Tenant ID (Enter para usar: $defaultTenantId)"
    $TenantId = if ([string]::IsNullOrWhiteSpace($inputTenant)) { $defaultTenantId } else { $inputTenant.Trim() }
}

if ([string]::IsNullOrWhiteSpace($SellerId)) {
    $inputSeller = Read-Host "Seller ID (Enter para usar: $defaultSellerId)"
    $SellerId = if ([string]::IsNullOrWhiteSpace($inputSeller)) { $defaultSellerId } else { $inputSeller.Trim() }
}

if ([string]::IsNullOrWhiteSpace($ClientId)) {
    $inputClient = Read-Host "Client ID (Enter para usar: $defaultClientId)"
    $ClientId = if ([string]::IsNullOrWhiteSpace($inputClient)) { $defaultClientId } else { $inputClient.Trim() }
}

if ([string]::IsNullOrWhiteSpace($ClientSecret)) {
    $inputSecret = Read-Host "Client Secret (Valor de clave secreta generada en Azure AD/Partner Center)"
    $ClientSecret = $inputSecret.Trim()
}

if ([string]::IsNullOrWhiteSpace($ClientSecret)) {
    Write-Host "[ERROR] El Client Secret es obligatorio para autenticar con Azure." -ForegroundColor Red
    Pause
    exit 1
}

Write-Host ""
Write-Host "Configurando MSStore CLI..." -ForegroundColor Yellow

msstore reconfigure --tenantId $TenantId --sellerId $SellerId --clientId $ClientId --clientSecret $ClientSecret

Write-Host ""
Write-Host "Verificando estado de la conexion:" -ForegroundColor Cyan
msstore info

Write-Host ""
Write-Host "Probando conexion con tus aplicaciones..." -ForegroundColor Cyan
msstore apps list

Write-Host ""
Write-Host "Presiona cualquier tecla para finalizar..."
Pause
