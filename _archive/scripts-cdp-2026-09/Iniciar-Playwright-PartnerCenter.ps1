# Script para iniciar Brave con puerto de depuración CDP y ejecutar Playwright automáticamente
$bravePath = "C:\Users\drbea\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

$browserExe = if (Test-Path $bravePath) { $bravePath } else { $edgePath }

Write-Host "Iniciando navegador con control de automatización en puerto 9222..." -ForegroundColor Cyan

# Iniciar navegador en segundo plano con remote debugging
Start-Process -FilePath $browserExe -ArgumentList "--remote-debugging-port=9222", "https://partner.microsoft.com/dashboard"

Start-Sleep -Seconds 3

Write-Host "Ejecutando automatización con Playwright..." -ForegroundColor Yellow
node "d:\ToolTip AI\scripts\partner_center_cdp_handler.js"
