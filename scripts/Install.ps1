param([switch]$NoRestart)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$cli = (Get-Command spicetify -ErrorAction Stop).Source
$config = (& $cli -c | Out-String).Trim()
if (-not (Test-Path -LiteralPath $config)) { throw 'Spicetify configuration was not found.' }
$configRoot = Split-Path $config -Parent
$themePath = Join-Path $configRoot 'Themes/Retrograde'
$backupRoot = Join-Path $projectRoot 'backups'
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
$originalConfig = Join-Path $backupRoot 'config-xpui.original.ini'
if (-not (Test-Path -LiteralPath $originalConfig)) { Copy-Item -LiteralPath $config -Destination $originalConfig }
if ((Test-Path -LiteralPath $themePath) -and -not (Test-Path -LiteralPath (Join-Path $backupRoot 'Retrograde-before-install'))) {
    Copy-Item -LiteralPath $themePath -Destination (Join-Path $backupRoot 'Retrograde-before-install') -Recurse
}
New-Item -ItemType Directory -Force -Path $themePath | Out-Null
foreach ($name in @('color.ini','user.css','theme.js')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "dist/Retrograde/$name") -Destination (Join-Path $themePath $name) -Force
}
& $cli config current_theme Retrograde color_scheme Classic inject_css 1 replace_colors 1 inject_theme_js 1
if ($LASTEXITCODE -ne 0) { throw 'Spicetify config failed.' }
if ($NoRestart) { & $cli -n apply } else { & $cli apply }
if ($LASTEXITCODE -ne 0) { throw 'Spicetify apply failed. Original configuration is in backups.' }
Write-Output "Installed Retrograde at $themePath"
