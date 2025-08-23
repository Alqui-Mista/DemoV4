$cssPath = Join-Path $PSScriptRoot '..\src\pages\Rebecca.css'
$srcGlob = Join-Path $PSScriptRoot '..\src\**\*.*'

$css = Get-Content $cssPath -Raw
# remove comments
$cssNoComments = [regex]::Replace($css, '/\*[\s\S]*?\*/', '')

# extract tokens starting with . or #
$matches = [regex]::Matches($cssNoComments, '([#.][A-Za-z0-9_-]+)') | ForEach-Object { $_.Groups[1].Value }
$selectors = $matches | Sort-Object -Unique

$srcFiles = Get-ChildItem -Path (Join-Path $PSScriptRoot '..\src') -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.html | Select-Object -ExpandProperty FullName

$result = @()
foreach ($sel in $selectors) {
    $name = $sel.Substring(1)
    $isClass = $sel.StartsWith('.')
    $used = $false
    foreach ($f in $srcFiles) {
        $content = Get-Content $f -Raw -ErrorAction SilentlyContinue
        if ($null -eq $content) { continue }
        if ($isClass) {
            if ($content -match "class(Name)?\s*=\s*[`\"'].*\b$name\b.*[`\"']") { $used = $true; break }
            if ($content -match "\.(querySelector(All)?|querySelector)\(\s*['\"]\.$name['\"]\s*\)") { $used = $true; break }
            if ($content -match "getElementsByClassName\(\s*['\"]$name['\"]\s*\)") { $used = $true; break }
            if ($content -match "\b$name\b") { $used = $true; break }
        } else {
            if ($content -match "id\s*=\s*[`\"'].*\b$name\b.*[`\"']") { $used = $true; break }
            if ($content -match "\.(querySelector(All)?|querySelector)\(\s*['\"]#$name['\"]\s*\)") { $used = $true; break }
            if ($content -match "getElementById\(\s*['\"]$name['\"]\s*\)") { $used = $true; break }
            if ($content -match "\b$name\b") { $used = $true; break }
        }
    }
    $result += [PSCustomObject]@{ selector = $sel; used = $used }
}

$unused = $result | Where-Object { -not $_.used }

$report = @{ totalSelectors = $selectors.Count; checkedFiles = $srcFiles.Count; unused = $unused.selector }
$report | ConvertTo-Json -Depth 5
