Add-Type -Assembly "System.IO.Compression.FileSystem"

$src = "C:\Users\A.K CTIT\.gemini\antigravity\scratch\chicken-town-sl"
$tmpDir = "C:\Users\A.K CTIT\.gemini\antigravity\scratch\ct-deploy-tmp"
$zip = "C:\Users\A.K CTIT\.gemini\antigravity\scratch\chicken-town-sl-cloudflare.zip"

# Clean up previous tmp and zip
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }

New-Item -ItemType Directory -Path $tmpDir | Out-Null

# Files/folders to EXCLUDE
$exclude = @("server.ps1", "run.bat", "make_zip.ps1", "make_deploy_zip.ps1", "ct-deploy-tmp", ".git")

# Copy files
Get-ChildItem -Path $src | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination "$tmpDir\$($_.Name)" -Recurse
    } else {
        Copy-Item -Path $_.FullName -Destination "$tmpDir\$($_.Name)"
    }
}

Write-Host "Files copied to temp folder:"
Get-ChildItem $tmpDir | ForEach-Object { Write-Host "  $($_.Name)" }

# Create ZIP
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmpDir, $zip)

# Cleanup tmp
Remove-Item $tmpDir -Recurse -Force

$zipExists = Test-Path $zip
$zipSize = if ($zipExists) { [Math]::Round((Get-Item $zip).Length / 1KB, 1) } else { 0 }
Write-Host ""
Write-Host "ZIP created: $zipExists"
Write-Host "ZIP path: $zip"
Write-Host "ZIP size: $zipSize KB"
