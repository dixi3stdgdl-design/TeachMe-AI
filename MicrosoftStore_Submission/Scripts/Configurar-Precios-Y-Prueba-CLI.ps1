# ==============================================================================
# ToolTip AI Suite — Gestor de Precios, Prueba de 1 Día y Bundle IAP (CLI)
# ==============================================================================
# Automatiza la configuración de precios en Microsoft Store Partner Center:
#   - ToolTip AI Assistant: Free (o Base) + Soporte para Bundle
#   - ToolTip AI Aura:      $9.99 USD (Tier1010) + Prueba de 1 Día (OneDay)
#   - ToolTip AI Translate: $9.99 USD (Tier1010) + Prueba de 1 Día (OneDay)
#   - ToolTip AI Voice:     $9.99 USD (Tier1010) + Prueba de 1 Día (OneDay)
#   - Suite Bundle IAP:     $24.99 USD (Tier1025) Durable Add-on (4 apps)
# ==============================================================================

param (
    [ValidateSet("status", "configure-trial", "export-drafts", "help")]
    [string]$Action = "status",
    [string]$AppKey = "all"
)

$ErrorActionPreference = "Continue"

$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$configPath = Join-Path $PSScriptRoot "..\msstore-projects-config.json"

if (-not (Test-Path $configPath)) {
    Write-Host "[ERROR] No se encontró el archivo de configuración: $configPath" -ForegroundColor Red
    exit 1
}

$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json

function Show-Header {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  ToolTip AI Suite — Configuración de Precios y Prueba de 1 Día   " -ForegroundColor Cyan
    Write-Host "  Microsoft Partner Center / Store Developer CLI                  " -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-StatusTable {
    Write-Host "  MATRIZ COMERCIAL DE LA SUITE (MICROSOFT STORE):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host ("  {0,-12} | {1,-24} | {2,-12} | {3,-10} | {4,-10}" -f "MÓDULO", "PRODUCT ID", "PRECIO", "TIER", "PRUEBA") -ForegroundColor DarkGray
    Write-Host "  -------------+--------------------------+--------------+------------+------------" -ForegroundColor DarkGray

    foreach ($app in $config.projects) {
        $trial = if ($app.trialPeriod) { $app.trialPeriod + " (24h)" } else { "N/A" }
        $tier = if ($app.priceTier) { $app.priceTier } else { "Free" }
        Write-Host ("  {0,-12} | {1,-24} | {2,-12} | {3,-10} | {4,-10}" -f $app.key, $app.storeId, $app.pricing, $tier, $trial) -ForegroundColor White
    }

    Write-Host ""
    Write-Host "  COMPLEMENTO DURABLE (SUITE BUNDLE IAP):" -ForegroundColor Yellow
    Write-Host "  - Token / Add-on ID:  $($config.suiteBundle.addOnId)" -ForegroundColor White
    Write-Host "  - Tipo:               $($config.suiteBundle.type) (Perpetuo, no expira)" -ForegroundColor White
    Write-Host "  - Precio Bundle:      $($config.suiteBundle.pricing) ($($config.suiteBundle.priceTier))" -ForegroundColor Green
    Write-Host "  - Cobertura:          Desbloquea Assistant, Aura, Translate y Voice de por vida" -ForegroundColor DarkGray
    Write-Host ""
}

function Export-SubmissionPricingDrafts {
    Write-Host "[+] Generando plantillas de precios y prueba de 1 día para cada app..." -ForegroundColor Yellow
    $outDir = Join-Path $PSScriptRoot "..\Pricing_Drafts"
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null

    foreach ($app in $config.projects) {
        $draftFile = Join-Path $outDir "$($app.key)_pricing_config.json"
        
        $pricingObj = @{
            productId = $app.storeId
            name = $app.name
            targetPrice = $app.pricing
            priceTier = if ($app.priceTier) { $app.priceTier } else { "Free" }
            trialPeriod = if ($app.trialPeriod) { $app.trialPeriod } else { "None" }
            durableBundleAddon = $config.suiteBundle.addOnId
            notes = "Configuración para Microsoft Partner Center Submission API: 1 día de prueba (24 horas) + cobro individual o bundle"
        }

        $pricingObj | ConvertTo-Json -Depth 5 | Set-Content -Path $draftFile -Encoding UTF8
        Write-Host "  -> Generado: $draftFile" -ForegroundColor Green
    }

    # Plantilla de Add-on Bundle
    $bundleFile = Join-Path $outDir "suite_bundle_addon_spec.json"
    $bundleObj = @{
        addOnId = $config.suiteBundle.addOnId
        name = $config.suiteBundle.name
        type = "Durable"
        targetPrice = $config.suiteBundle.pricing
        priceTier = $config.suiteBundle.priceTier
        supportedProducts = @($config.projects | ForEach-Object { $_.storeId })
    }
    $bundleObj | ConvertTo-Json -Depth 5 | Set-Content -Path $bundleFile -Encoding UTF8
    Write-Host "  -> Generado: $bundleFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "[OK] Plantillas exportadas en: $outDir" -ForegroundColor Cyan
}

function Configure-TrialViaCli {
    param([string]$targetKey)
    Write-Host "[+] Verificando herramienta MSStore CLI en el sistema..." -ForegroundColor Yellow

    $msstoreCmd = Get-Command msstore -ErrorAction SilentlyContinue
    if (-not $msstoreCmd) {
        Write-Host "[ERROR] 'msstore' no está en el PATH del sistema." -ForegroundColor Red
        return
    }

    Write-Host "[✓] MSStore CLI disponible: $($msstoreCmd.Source)" -ForegroundColor Green
    Write-Host ""

    $targets = if ($targetKey -eq "all") {
        $config.projects | Where-Object { $_.trialPeriod -eq "OneDay" }
    } else {
        $config.projects | Where-Object { $_.key -eq $targetKey }
    }

    foreach ($app in $targets) {
        Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "Configurando: $($app.name) (ID: $($app.storeId))" -ForegroundColor Cyan
        Write-Host "  - Precio Base: $($app.pricing) ($($app.priceTier))" -ForegroundColor White
        Write-Host "  - Periodo de Prueba: $($app.trialPeriod) (24 horas)" -ForegroundColor White
        Write-Host ""

        Write-Host "  [1/2] Consultando borrador de sumisión actual..." -ForegroundColor DarkGray
        $draftOutput = & msstore submission get $app.storeId 2>&1 | Out-String
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [INFO] La sumisión actual no tiene un borrador abierto editable mediante CLI." -ForegroundColor Yellow
            Write-Host "  [GUÍA] Para aplicar este precio directamente en la próxima sumisión:" -ForegroundColor White
            Write-Host "         msstore publish `"$($app.latestPackage)`" --id $($app.storeId) --priceId $($app.priceTier) --noCommit" -ForegroundColor DarkCyan
        } else {
            Write-Host "  [2/2] Borrador recuperado con éxito." -ForegroundColor Green
        }
    }
    Write-Host ""
}

# ----------------- EJECUCIÓN PRINCIPAL -----------------
Show-Header

switch ($Action) {
    "status" {
        Show-StatusTable
        Write-Host "Comandos disponibles:" -ForegroundColor DarkGray
        Write-Host "  .\Configurar-Precios-Y-Prueba-CLI.ps1 -Action export-drafts" -ForegroundColor White
        Write-Host "  .\Configurar-Precios-Y-Prueba-CLI.ps1 -Action configure-trial -AppKey translate" -ForegroundColor White
        Write-Host ""
    }
    "export-drafts" {
        Show-StatusTable
        Export-SubmissionPricingDrafts
    }
    "configure-trial" {
        Show-StatusTable
        Configure-TrialViaCli -targetKey $AppKey
    }
    default {
        Show-StatusTable
    }
}
