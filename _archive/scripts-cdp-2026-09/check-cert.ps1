# Verificar certificación ToolTip AI Suite
# Uso: powershell -File check-cert.ps1
$ErrorActionPreference = "Continue"
$apps = @(
  @{ Id="9N3D02KXKD3D"; Name="ToolTip AI" },
  @{ Id="9P33P1P5Z8DC"; Name="ToolTip AI Aura" },
  @{ Id="9NQN3RZ2Z655"; Name="ToolTip AI Translate" },
  @{ Id="9P417GZB0FVB"; Name="ToolTip AI Voice" }
)
Write-Host "=== ToolTip AI Suite — certificación ===" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host ""
# Nota: msstore CLI sigue sin apps (falta Entra link). Estado se lee de Partner Center / status.json.
$statusFile = "D:\ToolTip AI\status.json"
if (Test-Path $statusFile) {
  $s = Get-Content $statusFile -Raw | ConvertFrom-Json
  Write-Host "status.json (web) — updated $($s.updated)"
  foreach ($a in $s.apps) {
    Write-Host ("  {0,-22} v{1,-10} {2}" -f $a.name, $a.version, $a.status)
  }
}
Write-Host ""
Write-Host "Tip: abrir Partner Center → Apps and games para estado en vivo."
