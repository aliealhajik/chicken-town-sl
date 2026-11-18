$src = "C:\Users\A.K CTIT\.gemini\antigravity\scratch\chicken-town-sl"
$zip = "C:\Users\A.K CTIT\.gemini\antigravity\scratch\chicken-town-sl-deploy.zip"

if (Test-Path $zip) { Remove-Item $zip -Force }

$items = Get-ChildItem $src | Where-Object { $_.Name -notin @('server.ps1', 'run.bat', 'make_zip.ps1') } | ForEach-Object { $_.FullName }
Compress-Archive -Path $items -DestinationPath $zip

Write-Host "Created ZIP: $(Test-Path $zip)"
Write-Host "File size: $((Get-Item $zip).Length) bytes"
