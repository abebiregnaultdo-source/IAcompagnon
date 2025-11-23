<#
Download a curated list of open-source/public-domain mandala SVGs
and add them to `frontend/public/mandalas/manifest.json` and
`frontend/public/mandalas/licenses.json`.

USAGE (PowerShell):
  cd <repo-root>
  .\scripts\import_mandalas.ps1

Notes:
- This script requires an internet connection and permission to write files.
- It will only add files and manifest entries; it will not modify `Mandalas.js`.
- Review `licenses.json` after running to verify license/attribution.
#>

$ErrorActionPreference = 'Continue'

$destDir = Join-Path -Path $PSScriptRoot -ChildPath "..\frontend\public\mandalas" | Resolve-Path -Relative
$destDir = (Resolve-Path (Join-Path $PSScriptRoot "..\frontend\public\mandalas")).ProviderPath

if (-not (Test-Path $destDir)) {
    Write-Host "Creating mandalas directory: $destDir"
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# Prefer user-provided URL list in scripts/mandala_urls.txt (one URL per line, # comments allowed)
$urlFile = Join-Path $PSScriptRoot 'mandala_urls.txt'
$urls = @()
if (Test-Path $urlFile) {
    try {
        $lines = Get-Content $urlFile | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }
        foreach ($l in $lines) { $urls += $l }
        Write-Host "Loaded $($urls.Count) URLs from $urlFile"
    } catch {
        Write-Warning ("Failed to read {0}: {1}" -f $urlFile, $_)
    }
}

# Fallback curated list if no URL file provided or empty
if ($urls.Count -eq 0) {
    $urls = @(
        'https://upload.wikimedia.org/wikipedia/commons/4/4b/Mandala.svg',
        'https://upload.wikimedia.org/wikipedia/commons/0/0b/Art_Mandala.svg',
        'https://upload.wikimedia.org/wikipedia/commons/3/3e/Flower_mandala.svg'
    )
    Write-Host "Using fallback curated URL list ($($urls.Count) items)"
}

$manifestPath = Join-Path $destDir 'manifest.json'
$licensesPath = Join-Path $destDir 'licenses.json'

# Load or init manifest
if (Test-Path $manifestPath) {
    try { $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json } catch { $manifest = @() }
} else { $manifest = @() }

# Load or init licenses
if (Test-Path $licensesPath) {
    try { $licenses = Get-Content $licensesPath -Raw | ConvertFrom-Json } catch { $licenses = @() }
} else { $licenses = @() }

foreach ($u in $urls) {
    try {
        $fileName = [System.IO.Path]::GetFileName($u)
        $outPath = Join-Path $destDir $fileName
        Write-Host "Downloading $u -> $outPath"
        try {
            Invoke-WebRequest -Uri $u -OutFile $outPath -UseBasicParsing -ErrorAction Stop
        } catch {
            Write-Warning ("Failed to download {0} : {1}" -f $u, $_)
            continue
        }

        # Add to manifest if not present
        $relSrc = "/mandalas/$fileName"
        $exists = $manifest | Where-Object { $_.src -eq $relSrc }
        if (-not $exists) {
            $entry = @{ name = [System.IO.Path]::GetFileNameWithoutExtension($fileName); src = $relSrc; tags = @() }
            $manifest += $entry
            Write-Host "Added manifest entry for $fileName"
        } else {
            Write-Host "Manifest already contains $fileName"
        }

        # Add license placeholder (please verify manually)
        $licEntry = @{ file = $fileName; source = $u; license = 'unknown - please verify (likely Wikimedia Commons or PD)'}
        $licenses += $licEntry

    } catch {
        Write-Warning ("Error processing {0} : {1}" -f $u, $_)
    }
}

# Write back manifest and licenses
try {
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8
    Write-Host "Updated manifest.json"
} catch { Write-Warning ("Failed to update manifest.json: {0}" -f $_) }

try {
    $licenses | ConvertTo-Json -Depth 4 | Set-Content -Path $licensesPath -Encoding UTF8
    Write-Host "Wrote licenses.json (verify licenses manually)"
} catch { Write-Warning ("Failed to write licenses.json: {0}" -f $_) }

Write-Host "Import complete. Please review files in $destDir and update licenses.json with accurate license info."
