$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$cli = (Get-Command spicetify -ErrorAction Stop).Source
$config = (& $cli -c | Out-String).Trim()
$backup = Join-Path $projectRoot 'backups/config-xpui.original.ini'
if (-not (Test-Path -LiteralPath $backup)) { throw 'No original configuration backup found.' }
Copy-Item -LiteralPath $backup -Destination $config -Force
$priorTheme = Join-Path $projectRoot 'backups/Retrograde-before-install'
if (Test-Path -LiteralPath $priorTheme) {
    $themePath = Join-Path (Split-Path $config -Parent) 'Themes/Retrograde'
    Copy-Item -Path (Join-Path $priorTheme '*') -Destination $themePath -Recurse -Force
}
& $cli apply
if ($LASTEXITCODE -ne 0) { throw 'Configuration restored, but Spicetify apply failed.' }
Write-Output 'Restored the original theme configuration. Retrograde source and preferences are retained.'
