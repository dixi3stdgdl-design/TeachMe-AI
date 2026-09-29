# Solucionar-Y-Mandar.ps1
# Corrige y publica en Microsoft Store las apps con error vía msstore CLI.
param(
    [Parameter(Mandatory = $true)]
    [string]$ClientSecret,

    [string]$TenantId = "53bb6c33-8f48-45b9-ae83-02280f5690c7",
    [string]$SellerId = "94193860",
    [string]$ClientId = "0b5b3ddb-259f-4877-94d9-8a352de29d2b",

    # Apps a publicar: assistant, aura, translate, voice — por defecto las 2 típicas con error
    [string[]]$Apps = @("assistant", "translate")
)

$ErrorActionPreference = "Continue"

$catalog = @{
    assistant = @{
        Name    = "ToolTip AI Assistant"
        Id      = "9N3D02KXKD3D"
        Package = "D:\ToolTip AI\MicrosoftStore_Submission\Package\ToolTipAIAssistant_1.1.3.0_x64.msix"
    }
    aura      = @{
        Name    = "ToolTip AI Aura"
        Id      = "9P33P1P5Z8DC"
        Package = "D:\ToolTip AI Aura\MicrosoftStore_Submission\Package\ToolTipAIAura_1.0.2.0_x64.msix"
    }
    translate = @{
        Name    = "ToolTip AI Translate"
        Id      = "9NQN3RZ2Z655"
        Package = "D:\ToolTip AI Translate\ToolTipAI-Translate\MicrosoftStore_Submission\Package\ToolTipAITranslate_1.1.2.0_x64.msix"
    }
    voice     = @{
        Name    = "ToolTip AI Voice"
        Id      = "9P417GZB0FVB"
        Package = "D:\ToolTip AI Voice\MicrosoftStore_Submission\Package\ToolTipAIVoice_1.0.1.0_x64.msix"
    }
}

Write-Host "=== 1/5 msstore reconfigure ===" -ForegroundColor Cyan
& msstore reconfigure --tenantId $TenantId --sellerId $SellerId --clientId $ClientId --clientSecret $ClientSecret
Write-Host ""
Write-Host "=== 2/5 msstore info ===" -ForegroundColor Cyan
& msstore info
Write-Host ""
Write-Host "=== 3/5 Estado actual de TODAS las apps ===" -ForegroundColor Cyan
foreach ($key in @("assistant","aura","translate","voice")) {
    $p = $catalog[$key]
    Write-Host "--- $($p.Name) [$($p.Id)] ---" -ForegroundColor Yellow
    & msstore submission status $p.Id
    Write-Host ""
}

Write-Host "=== 4/5 Publicar apps seleccionadas: $($Apps -join ', ') ===" -ForegroundColor Cyan
foreach ($key in $Apps) {
    if (-not $catalog.ContainsKey($key)) {
        Write-Host "Key desconocida: $key" -ForegroundColor Red
        continue
    }
    $p = $catalog[$key]
    if (-not (Test-Path $p.Package)) {
        Write-Host "[FALTA PAQUETE] $($p.Package)" -ForegroundColor Red
        continue
    }
    Write-Host ">> $($p.Name)  $($p.Id)" -ForegroundColor Green
    Write-Host "   Paquete: $($p.Package)" -ForegroundColor DarkGray
    # Sintaxis oficial msstore: publish <ruta_al_.msix> --appId <productId>
    & msstore publish $p.Package --appId $p.Id --uploadTimeout 300
    Write-Host ""
}

Write-Host "=== 5/5 Estado final ===" -ForegroundColor Cyan
foreach ($key in $Apps) {
    $p = $catalog[$key]
    Write-Host "--- $($p.Name) ---" -ForegroundColor Yellow
    & msstore submission status $p.Id
    Write-Host ""
}

Write-Host "Hecho. Revisa arriba si algún publish devolvió Error." -ForegroundColor Cyan
