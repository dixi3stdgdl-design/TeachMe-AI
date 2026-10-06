# gsc.ps1 — Google Search Console & SEO Automation CLI for ToolTip AI
param(
  [Parameter(Position=0)]
  [ValidateSet("status", "open", "welcome", "sitemaps", "inspect", "indexnow", "dns-verify", "help")]
  [string]$Action = "status",

  [Parameter(Position=1)]
  [string]$Param1
)

$ErrorActionPreference = "Continue"

$SiteUrl = "https://tooltip-ai.com/"
$SitemapUrl = "https://tooltip-ai.com/sitemap.xml"
$KeyFileUrl = "https://tooltip-ai.com/4fa97eb81f8c4cb3a709210c4d28fe61.txt"

function Write-Header {
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host "     ToolTip AI — Google Search Console & SEO CLI         " -ForegroundColor Yellow
  Write-Host "==========================================================" -ForegroundColor Cyan
}

switch ($Action) {
  "status" {
    Write-Header
    Write-Host "[1/4] Verificando respuesta web de $SiteUrl..." -NoNewline
    try {
      $res = curl.exe -s -o /dev/null -w "%{http_code}" $SiteUrl
      if ($res -eq "200") { Write-Host " [OK 200]" -ForegroundColor Green }
      else { Write-Host " [$res]" -ForegroundColor Red }
    } catch { Write-Host " [ERROR]" -ForegroundColor Red }

    Write-Host "[2/4] Verificando metaetiqueta google-site-verification en vivo..." -NoNewline
    $meta = curl.exe -s $SiteUrl | Select-String -Pattern "google-site-verification"
    if ($meta) {
      Write-Host " [PRESENTE]" -ForegroundColor Green
      Write-Host "      $($meta.ToString().Trim())" -ForegroundColor DarkGray
    } else {
      Write-Host " [NO ENCONTRADA]" -ForegroundColor Red
    }

    Write-Host "[3/4] Verificando sitemap.xml..." -NoNewline
    $smRes = curl.exe -s -o /dev/null -w "%{http_code}" $SitemapUrl
    if ($smRes -eq "200") { Write-Host " [OK 200]" -ForegroundColor Green }
    else { Write-Host " [$smRes]" -ForegroundColor Red }

    Write-Host "[4/4] Verificando clave IndexNow (Bing/Yahoo)..." -NoNewline
    $keyRes = curl.exe -s $KeyFileUrl
    if ($keyRes -match "4fa97eb81f8c4cb3a709210c4d28fe61") {
      Write-Host " [ACTIVA]" -ForegroundColor Green
    } else {
      Write-Host " [PENDIENTE]" -ForegroundColor Yellow
    }

    Write-Host "`nPara abrir la consola directamente ejecuta:" -ForegroundColor White
    Write-Host "  gsc open       -> Abre Google Search Console" -ForegroundColor Cyan
    Write-Host "  gsc sitemaps   -> Abre la seccion de Sitemaps" -ForegroundColor Cyan
    Write-Host "  gsc inspect    -> Inspecciona y solicita indexacion" -ForegroundColor Cyan
    Write-Host "  gsc indexnow   -> Re-envia IndexNow a Bing/Yahoo/Yandex" -ForegroundColor Cyan
  }

  "open" {
    Write-Header
    $url = "https://search.google.com/search-console/welcome"
    Write-Host "Abriendo Google Search Console (Pantalla de bienvenida y añadir propiedad)..." -ForegroundColor Green
    Write-Host "1. Elige 'Prefijo de la URL' a la derecha." -ForegroundColor Yellow
    Write-Host "2. Pega: https://tooltip-ai.com/" -ForegroundColor Cyan
    Write-Host "3. Haz clic en 'Continuar' (se validara al instante con tu metaetiqueta)." -ForegroundColor Yellow
    Start-Process $url
  }

  "welcome" {
    Write-Header
    $url = "https://search.google.com/search-console/welcome"
    Write-Host "Abriendo pantalla de bienvenida en Google Search Console..." -ForegroundColor Green
    Start-Process $url
  }

  "sitemaps" {
    Write-Header
    $url = "https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Ftooltip-ai.com%2F"
    Write-Host "Abriendo seccion de Sitemaps en Google Search Console..." -ForegroundColor Green
    Write-Host "Escribe 'sitemap.xml' y presiona Enviar." -ForegroundColor Yellow
    Start-Process $url
  }

  "inspect" {
    Write-Header
    $url = "https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Ftooltip-ai.com%2F&id=https%3A%2F%2Ftooltip-ai.com%2F"
    Write-Host "Abriendo herramienta de Inspeccion de URLs para https://tooltip-ai.com/..." -ForegroundColor Green
    Write-Host "Haz clic en 'Solicitar indexacion' una vez que cargue la comprobacion." -ForegroundColor Yellow
    Start-Process $url
  }

  "indexnow" {
    Write-Header
    Write-Host "Enviando pings de IndexNow (Bing, Yahoo, DuckDuckGo, Yandex)..." -ForegroundColor Cyan
    $body = @{
      host = "tooltip-ai.com"
      key = "4fa97eb81f8c4cb3a709210c4d28fe61"
      keyLocation = "https://tooltip-ai.com/4fa97eb81f8c4cb3a709210c4d28fe61.txt"
      urlList = @(
        "https://tooltip-ai.com/",
        "https://tooltip-ai.com/assistant/",
        "https://tooltip-ai.com/translate/",
        "https://tooltip-ai.com/aura/",
        "https://tooltip-ai.com/voice/",
        "https://tooltip-ai.com/en/",
        "https://tooltip-ai.com/de/",
        "https://tooltip-ai.com/privacy/"
      )
    } | ConvertTo-Json -Compress

    $tmp = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tmp -Value $body

    Write-Host "`n-> api.indexnow.org:" -NoNewline
    $res1 = curl.exe -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json; charset=utf-8" -d "@$tmp" https://api.indexnow.org/indexnow
    if ($res1 -eq "200" -or $res1 -eq "202") { Write-Host " [$res1 Aceptado]" -ForegroundColor Green }
    else { Write-Host " [$res1]" -ForegroundColor Yellow }

    Write-Host "-> bing.com/indexnow:" -NoNewline
    $res2 = curl.exe -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json; charset=utf-8" -d "@$tmp" https://www.bing.com/indexnow
    if ($res2 -eq "200" -or $res2 -eq "202") { Write-Host " [$res2 Aceptado]" -ForegroundColor Green }
    else { Write-Host " [$res2]" -ForegroundColor Yellow }

    Remove-Item $tmp -Force
    Write-Host "`nNotificacion IndexNow completada." -ForegroundColor Green
  }

  "dns-verify" {
    Write-Header
    if (-not $Param1) {
      Write-Host "Uso: gsc dns-verify <token-google>" -ForegroundColor Yellow
      Write-Host "Ejemplo: gsc dns-verify google-site-verification=abc123xyz" -ForegroundColor DarkGray
      return
    }
    Write-Host "Agregando registro TXT en Porkbun para verificacion de dominio..." -ForegroundColor Cyan
    & "D:\ToolTip AI\.tools\porkbun\porkbun.ps1" -Action create -Type TXT -Name "" -Content $Param1
  }

  default {
    Write-Header
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host "  gsc status       -> Comprueba estado de la web, metaetiqueta, sitemap e IndexNow"
    Write-Host "  gsc open         -> Abre Google Search Console en la propiedad oficial"
    Write-Host "  gsc sitemaps     -> Abre directo la carga del sitemap.xml"
    Write-Host "  gsc inspect      -> Abre la inspeccion de URL para solicitar indexacion"
    Write-Host "  gsc indexnow     -> Vuelve a disparar la indexacion instantanea en Bing/Yahoo"
    Write-Host "  gsc dns-verify   -> Agrega un token TXT de Google a tu DNS de Porkbun"
  }
}
