# porkbun.ps1 — CLI Porkbun API
param(
  [Parameter(Mandatory=$true)][string]$Action,
  [string]$Domain = "tooltip-ai.com",
  [string]$Type,
  [string]$Name,
  [string]$Content,
  [string]$Id
)
$ErrorActionPreference = "Stop"
$cfg = Get-Content "$env:USERPROFILE\.porkbun_tooltip.json" -Raw | ConvertFrom-Json

function Invoke-PB($path, $body) {
  $body.apikey = $cfg.api_key
  $body.secretapikey = $cfg.secret_api_key
  $json = $body | ConvertTo-Json
  Invoke-RestMethod -Uri "https://api.porkbun.com/api/json/v3/$path" -Method POST -Body $json -ContentType "application/json"
}

switch ($Action) {
  "ping" { Invoke-PB "ping" @{} | ConvertTo-Json -Depth 3 }
  "dns"  { Invoke-PB "dns/retrieve/$Domain" @{} | ConvertTo-Json -Depth 6 }
  "create" { Invoke-PB "dns/create/$Domain" @{ name=$Name; type=$Type; content=$Content; ttl="600" } | ConvertTo-Json -Depth 4 }
  "edit"   { Invoke-PB "dns/edit/$Domain/$Id" @{ name=$Name; type=$Type; content=$Content; ttl="600" } | ConvertTo-Json -Depth 4 }
  "delete" { Invoke-PB "dns/delete/$Domain/$Id" @{} | ConvertTo-Json -Depth 4 }
  default { "Uso: ping|dns|create|edit|delete" }
}
