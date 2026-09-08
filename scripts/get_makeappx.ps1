# Script to acquire makeappx.exe and signtool.exe from official Microsoft NuGet
$ErrorActionPreference = "Stop"
$toolsDir = Join-Path $PSScriptRoot "..\.tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

$makeappxExe = Join-Path $toolsDir "bin\x64\makeappx.exe"
if (Test-Path $makeappxExe) {
    Write-Host "makeappx.exe ya existe en: $makeappxExe"
    exit 0
}

$zipPath = Join-Path $toolsDir "sdk_buildtools.zip"

Write-Host "Descargando Microsoft.Windows.SDK.BuildTools via curl.exe..."
& curl.exe -L -s -S -o $zipPath "https://api.nuget.org/v3-flatcontainer/microsoft.windows.sdk.buildtools/10.0.26100.1742/microsoft.windows.sdk.buildtools.10.0.26100.1742.nupkg"

if (-not (Test-Path $zipPath) -or (Get-Item $zipPath).Length -lt 1000000) {
    throw "Fallo la descarga de sdk_buildtools.zip"
}

Write-Host "Extrayendo herramientas x64..."
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$targetPrefix = "bin/10.0.26100.0/x64/"
$destDir = Join-Path $toolsDir "bin\x64"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

foreach ($entry in $archive.Entries) {
    if ($entry.FullName.StartsWith($targetPrefix) -and -not $entry.FullName.EndsWith("/")) {
        $relativePath = $entry.FullName.Substring($targetPrefix.Length)
        $targetFilePath = Join-Path $destDir $relativePath
        $targetFileDir = Split-Path $targetFilePath -Parent
        if (-not (Test-Path $targetFileDir)) { New-Item -ItemType Directory -Path $targetFileDir -Force | Out-Null }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetFilePath, $true)
    }
}
$archive.Dispose()
Remove-Item $zipPath -Force

Write-Host "Listo! Herramientas instaladas en: $destDir"
