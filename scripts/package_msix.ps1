param (
    [string]$Version = "1.0.4.0",
    [string]$PackageName = "Dixi3Lqbs.ToolTipAIAssistant",
    [string]$Publisher = "CN=5A4F9620-3DD9-4496-B7BF-3252D9BF4477",
    [string]$PublisherDisplayName = "Dixi3 Lqbs",
    [string]$DisplayName = "ToolTip AI"
)

$ErrorActionPreference = "Stop"

$rootDir = "D:\ToolTip AI"
$toolsDir = Join-Path $rootDir ".tools\bin\x64"
$makeappx = Join-Path $toolsDir "makeappx.exe"
$signtool = Join-Path $toolsDir "signtool.exe"

if (-not (Test-Path $makeappx)) { throw "No se encontro makeappx.exe en $makeappx" }
if (-not (Test-Path $signtool)) { throw "No se encontro signtool.exe en $signtool" }

$stagingPublish = Join-Path $rootDir ".staging_publish"
if (-not (Test-Path (Join-Path $stagingPublish "TeachMeAI.exe"))) {
    throw "No se encontro TeachMeAI.exe publicado en $stagingPublish. Ejecuta dotnet publish primero."
}

$submissionDir = Join-Path $rootDir "MicrosoftStore_Submission"
$packageOutDir = Join-Path $submissionDir "Package"
$certOutDir = Join-Path $submissionDir "Testing_Certificate"
$storeAssetsDir = Join-Path $submissionDir "Store_Assets"

New-Item -ItemType Directory -Path $packageOutDir -Force | Out-Null
New-Item -ItemType Directory -Path $certOutDir -Force | Out-Null

$layoutDir = Join-Path $rootDir ".package_layout"
if (Test-Path $layoutDir) { Remove-Item $layoutDir -Recurse -Force }
New-Item -ItemType Directory -Path $layoutDir -Force | Out-Null

Write-Host "[1/6] Copiando binarios a la estructura de paquete..."
Copy-Item (Join-Path $stagingPublish "TeachMeAI.exe") (Join-Path $layoutDir "TeachMeAI.exe") -Force
Copy-Item (Join-Path $rootDir "app.ico") (Join-Path $layoutDir "app.ico") -Force

Write-Host "[2/6] Copiando assets visuales..."
$layoutAssets = Join-Path $layoutDir "Assets"
New-Item -ItemType Directory -Path $layoutAssets -Force | Out-Null
Get-ChildItem -Path $storeAssetsDir -Filter "*.png" | Copy-Item -Destination $layoutAssets -Force

Write-Host "[3/6] Generando AppxManifest.xml..."
$manifestXml = @"
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10"
  IgnorableNamespaces="uap rescap desktop">

  <Identity
    Name="$PackageName"
    Publisher="$Publisher"
    Version="$Version"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>$DisplayName</DisplayName>
    <PublisherDisplayName>$PublisherDisplayName</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
    <Description>ToolTip AI — Inspector de pantalla con IA didactica y HUD flotante para Windows 11</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>

  <Resources>
    <Resource Language="es-419" />
    <Resource Language="es" />
    <Resource Language="en" />
  </Resources>

  <Applications>
    <Application Id="ToolTipAI"
      Executable="TeachMeAI.exe"
      EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="$DisplayName"
        Description="ToolTip AI — Inspector de pantalla con IA didactica y HUD flotante para Windows 11"
        BackgroundColor="#080D1A"
        Square150x150Logo="Assets\Square150x150Logo.png"
        Square44x44Logo="Assets\Square44x44Logo.png">
        <uap:DefaultTile
          Wide310x150Logo="Assets\Wide310x150Logo.png"
          Square310x310Logo="Assets\Square310x310Logo.png"
          ShortName="ToolTip AI">
          <uap:ShowNameOnTiles>
            <uap:ShowOn Tile="square150x150Logo"/>
            <uap:ShowOn Tile="wide310x150Logo"/>
            <uap:ShowOn Tile="square310x310Logo"/>
          </uap:ShowNameOnTiles>
        </uap:DefaultTile>
        <uap:SplashScreen Image="Assets\SplashScreen.png" BackgroundColor="#080D1A" />
      </uap:VisualElements>
    </Application>
  </Applications>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
"@

$manifestPath = Join-Path $layoutDir "AppxManifest.xml"
[System.IO.File]::WriteAllText($manifestPath, $manifestXml, [System.Text.Encoding]::UTF8)
# Copiar copia de respaldo a Package/
Copy-Item $manifestPath (Join-Path $packageOutDir "AppxManifest.xml") -Force

Write-Host "[4/6] Creando paquete MSIX con makeappx.exe..."
$msixFile = Join-Path $packageOutDir "ToolTipAIAssistant_${Version}_x64.msix"
if (Test-Path $msixFile) { Remove-Item $msixFile -Force }

& $makeappx pack /d $layoutDir /p $msixFile /o

if (-not (Test-Path $msixFile)) {
    throw "Fallo la creacion del paquete MSIX en $msixFile"
}

$fileSizeMB = [Math]::Round((Get-Item $msixFile).Length / 1MB, 2)
Write-Host "Paquete MSIX creado exitosamente ($fileSizeMB MB): $msixFile"

Write-Host "[5/6] Generando certificado de prueba para sideloading..."
$pfxFile = Join-Path $certOutDir "TeachMeAI_Test.pfx"
$cerFile = Join-Path $certOutDir "TeachMeAI_Test.cer"
$pfxPassword = ConvertTo-SecureString -String "TeachMeAI2026" -Force -AsPlainText

$cert = New-SelfSignedCertificate `
    -Type Custom `
    -Subject $Publisher `
    -KeyUsage DigitalSignature `
    -FriendlyName "TeachMe AI Test Sideloading Cert" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") `
    -NotAfter (Get-Date).AddYears(5)

Export-PfxCertificate -Cert $cert -FilePath $pfxFile -Password $pfxPassword | Out-Null
Export-Certificate -Cert $cert -FilePath $cerFile | Out-Null

Write-Host "[6/6] Firmando paquete MSIX con signtool.exe..."
& $signtool sign /fd SHA256 /a /f $pfxFile /p "TeachMeAI2026" $msixFile
& $signtool verify /pa /v $msixFile

Write-Host "=========================================================="
Write-Host "   EMPAQUETADO MSIX COMPLETADO CON EXITO"
Write-Host "   Archivo MSIX: $msixFile"
Write-Host "   Certificado:  $cerFile"
Write-Host "=========================================================="
