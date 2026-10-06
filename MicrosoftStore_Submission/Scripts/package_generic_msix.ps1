param (
    [string]$AppName = "Translate",
    [string]$ExeName = "ToolTipAITranslate.exe",
    [string]$PackageId = "Dixi3Lqbs.ToolTipAITranslate",
    [string]$Version = "1.1.4.0",
    [string]$MsixPrefix = "ToolTipAITranslate",
    [string]$RootDir = "D:\ToolTip AI Translate"
)

$ErrorActionPreference = "Stop"
$toolsDir = "D:\ToolTip AI\.tools\bin\x64"
$makeappx = Join-Path $toolsDir "makeappx.exe"
$signtool = Join-Path $toolsDir "signtool.exe"
$publisher = "CN=5A4F9620-3DD9-4496-B7BF-3252D9BF4477"
$publisherDisplay = "Dixi3 Lqbs"
$displayName = if ($AppName -eq "Voice") { "ToolTip AI Voice" } else { "ToolTip AI Translate" }

$staging = Join-Path $RootDir ".staging_publish"
if (-not (Test-Path (Join-Path $staging $ExeName))) { throw "Falta $ExeName en $staging" }

$subDir = Join-Path $RootDir "MicrosoftStore_Submission"
$packageOut = Join-Path $subDir "Package"
$certOut = Join-Path $subDir "Testing_Certificate"
$assets = Join-Path $subDir "Store_Assets"
New-Item -ItemType Directory -Path $packageOut, $certOut -Force | Out-Null

$layout = Join-Path $RootDir ".package_layout"
if (Test-Path $layout) { Remove-Item $layout -Recurse -Force }
New-Item -ItemType Directory -Path $layout -Force | Out-Null

Write-Host "[1/5] Copiando binarios completos (sin single-file)..."
Copy-Item (Join-Path $staging "*") $layout -Recurse -Force

Write-Host "[2/5] Assets..."
$la = Join-Path $layout "Assets"
New-Item -ItemType Directory -Path $la -Force | Out-Null
Get-ChildItem $assets -Filter "*.png" -ErrorAction SilentlyContinue | Copy-Item -Destination $la -Force

Write-Host "[3/5] AppxManifest..."
$desc = if ($AppName -eq "Voice") { "ToolTip AI Voice — Sintetizador de voz con atenuacion de audio" } else { "ToolTip AI Translate — Traductor visual de pantalla con OCR" }
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">
  <Identity Name="$PackageId" Publisher="$publisher" Version="$Version" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>$displayName</DisplayName>
    <PublisherDisplayName>$publisherDisplay</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
    <Description>$desc</Description>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26200.0" />
  </Dependencies>
  <Resources>
    <Resource Language="es" />
    <Resource Language="en" />
  </Resources>
  <Applications>
    <Application Id="App" Executable="$ExeName" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="$displayName" Description="$desc" BackgroundColor="#080D1A"
        Square150x150Logo="Assets\Square150x150Logo.png" Square44x44Logo="Assets\Square44x44Logo.png">
        <uap:SplashScreen Image="Assets\SplashScreen.png" BackgroundColor="#080D1A" />
      </uap:VisualElements>
    </Application>
  </Applications>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
"@
[System.IO.File]::WriteAllText((Join-Path $layout "AppxManifest.xml"), $manifest, [System.Text.Encoding]::UTF8)
Copy-Item (Join-Path $layout "AppxManifest.xml") (Join-Path $packageOut "AppxManifest.xml") -Force

Write-Host "[4/5] makeappx..."
$msix = Join-Path $packageOut "${MsixPrefix}_${Version}_x64.msix"
if (Test-Path $msix) { Remove-Item $msix -Force }
& $makeappx pack /d $layout /p $msix /o
if (-not (Test-Path $msix)) { throw "Fallo makeappx" }
Write-Host "MSIX: $msix ($([Math]::Round((Get-Item $msix).Length/1MB,2)) MB)"

Write-Host "[5/5] Firma de prueba..."
$pfx = Join-Path $certOut "Test.pfx"
$cer = Join-Path $certOut "Test.cer"
$pwd = ConvertTo-SecureString -String "TeachMeAI2026" -Force -AsPlainText
$cert = New-SelfSignedCertificate -Type Custom -Subject $publisher -KeyUsage DigitalSignature `
    -FriendlyName "$displayName Test" -CertStoreLocation "Cert:\CurrentUser\My" `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") -NotAfter (Get-Date).AddYears(5)
Export-PfxCertificate -Cert $cert -FilePath $pfx -Password $pwd | Out-Null
Export-Certificate -Cert $cert -FilePath $cer | Out-Null
& $signtool sign /fd SHA256 /a /f $pfx /p "TeachMeAI2026" $msix | Out-Null
Write-Host "LISTO: $msix"
