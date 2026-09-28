<#
  AI Team installer for Windows (PowerShell 5.1 or 7).
  Installs everything in docs/ai-team/SETUP-GUIDE.md that a script can install, skips what
  you already have, keeps going if one step fails, and prints a checklist of the steps only
  you can do (logins, API keys, Claude Code plugins).

  Run from the repo folder:
    powershell -ExecutionPolicy Bypass -File scripts\ai-team\install.ps1
  Options:
    -Tier A|B|C       which local models to download (default: picked from your hardware)
    -Skip a,b         skip steps by name, e.g. -Skip openclaw,aider
    -NoModels         install tools only, no model downloads
    -DryRun           show what would happen, change nothing
#>
param(
  [ValidateSet('auto', 'A', 'B', 'C')] [string]$Tier = 'auto',
  [string[]]$Skip = @(),
  [switch]$NoModels,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
# 'powershell -File' passes '-Skip a,b' as one string; split it into names.
$Skip = @($Skip | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Results = New-Object System.Collections.ArrayList
$ManualSteps = New-Object System.Collections.ArrayList

function Say($text, $color = 'Gray') { Write-Host $text -ForegroundColor $color }
function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# Windows ships a fake 'python' that only opens the Microsoft Store, so actually run it.
function Test-Python {
  if (-not (Has 'python')) { return $false }
  try { $v = (& python --version 2>&1) -join ''; return $v -match 'Python 3\.(1[0-9]|[89])' } catch { return $false }
}

# Run a command for its output only. Never throws; returns '' on any error.
function Get-Output([string]$exe, [string[]]$argList) {
  $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { return ((& $exe @argList 2>&1) | Out-String) } catch { return '' } finally { $ErrorActionPreference = $old }
}

# New installs change PATH in the registry, not in this window. Reload it so later steps see them.
function Update-Path {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = (@($machine, $user, $env:Path) | Where-Object { $_ }) -join [IO.Path]::PathSeparator
}

# Run an external command; fail the step if it exits non-zero.
function Invoke-Cmd([string]$exe, [string[]]$argList) {
  if ($DryRun) { Say "    would run: $exe $($argList -join ' ')" 'DarkGray'; return }
  # npm and friends print warnings to stderr; on PowerShell 5.1 that must not count as failure.
  $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { & $exe @argList } finally { $ErrorActionPreference = $old }
  if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "$exe exited with code $LASTEXITCODE" }
}

# Run a vendor's official install one-liner in a separate PowerShell, so an 'exit' inside
# the vendor script can't close this installer.
function Invoke-RemoteInstaller([string]$url) {
  if ($DryRun) { Say "    would run the installer from $url" 'DarkGray'; return }
  $ps = (Get-Process -Id $PID).Path
  & $ps -NoProfile -ExecutionPolicy Bypass -Command "irm '$url' | iex"
  if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "installer from $url exited with code $LASTEXITCODE" }
}

# One named step. $check returns $true when it is already done; $action does the install.
function Step([string]$name, [string]$label, [scriptblock]$check, [scriptblock]$action) {
  if ($Skip -contains $name) { [void]$Results.Add([pscustomobject]@{ Step = $label; Result = 'skipped (by you)' }); return }
  Say "`n== $label" 'Cyan'
  $done = $false
  try { $done = [bool](& $check) } catch { $done = $false }
  try {
    if ($done) { Say '   already installed' 'Green'; [void]$Results.Add([pscustomobject]@{ Step = $label; Result = 'already there' }); return }
    $script:StepNote = $null
    & $action
    Update-Path
    $result = 'installed'
    if ($DryRun) { $result = 'would install' }
    if ($script:StepNote) { $result = $script:StepNote }
    [void]$Results.Add([pscustomobject]@{ Step = $label; Result = $result })
    Say "   $result" 'Green'
  } catch {
    Say "   FAILED: $($_.Exception.Message)" 'Red'
    [void]$Results.Add([pscustomobject]@{ Step = $label; Result = "FAILED - $($_.Exception.Message)" })
  }
}

function Install-WingetPackage([string]$id) {
  if (-not (Has 'winget')) { throw 'winget is missing. Install "App Installer" from the Microsoft Store, then re-run.' }
  Invoke-Cmd 'winget' @('install', '--id', $id, '-e', '--silent', '--accept-package-agreements', '--accept-source-agreements')
}

function Get-NodeVersion {
  if (-not (Has 'node')) { return $null }
  try { return [version]((& node --version) -replace '^v', '') } catch { return $null }
}

function Get-HardwareTier {
  $ramGB = 0; $vramGB = 0
  try { $ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB) } catch { }
  if (Has 'nvidia-smi') {
    try {
      $mb = (& nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | Select-Object -First 1)
      $vramGB = [math]::Round([double]$mb / 1024)
    } catch { }
  }
  Say "   RAM: $ramGB GB   NVIDIA VRAM: $vramGB GB"
  if ($vramGB -ge 24) { return 'C' }
  if ($vramGB -ge 12 -or $ramGB -ge 32) { return 'B' }
  return 'A'
}

$Models = @{
  A = @('ministral-3:8b', 'gemma4:e4b')
  B = @('ministral-3:8b', 'gemma4:e4b', 'gpt-oss:20b', 'phi4-reasoning:14b', 'glm-4.7-flash', 'north-mini-code-1.0:q4')
  C = @('ministral-3:8b', 'gemma4:e4b', 'gpt-oss:20b', 'phi4-reasoning:14b', 'glm-4.7-flash', 'north-mini-code-1.0:q4',
        'qwen3.8:27b', 'devstral-small-2:24b', 'gemma4:26b', 'qwen3.6:35b')
}

Say 'AI Team installer' 'White'
Say "Repo: $Repo"
if ($DryRun) { Say 'DRY RUN - nothing will be changed.' 'Yellow' }

# ---------- 1. Base tools ----------
Step 'git' 'Git' { Has 'git' } { Install-WingetPackage 'Git.Git' }
Step 'node' 'Node.js 24.16+' {
  $v = Get-NodeVersion; $v -and $v -ge [version]'24.16.0'
} {
  if (Get-NodeVersion) { Invoke-Cmd 'winget' @('upgrade', '--id', 'OpenJS.NodeJS.LTS', '-e', '--silent', '--accept-package-agreements', '--accept-source-agreements') }
  else { Install-WingetPackage 'OpenJS.NodeJS.LTS' }
}
Step 'python' 'Python 3.12' { Test-Python } { Install-WingetPackage 'Python.Python.3.12' }
Step 'uv' 'uv (Python tool installer)' { Has 'uv' } { Install-WingetPackage 'astral-sh.uv' }
Step 'ollama' 'Ollama' { Has 'ollama' } { Install-WingetPackage 'Ollama.Ollama' }

# ---------- 2. Agents ----------
Step 'claude' 'Claude Code' { Has 'claude' } { Invoke-RemoteInstaller 'https://claude.ai/install.ps1' }
Step 'codex' 'Codex CLI' { Has 'codex' } { Invoke-Cmd 'npm' @('install', '-g', '@openai/codex') }
Step 'hermes' 'Hermes Agent' { Has 'hermes' } { Invoke-RemoteInstaller 'https://hermes-agent.nousresearch.com/install.ps1' }
Step 'opencode' 'OpenCode' { Has 'opencode' } { Invoke-Cmd 'npm' @('install', '-g', 'opencode-ai') }
Step 'aider' 'Aider' { Has 'aider' } { Invoke-RemoteInstaller 'https://aider.chat/install.ps1' }
Step 'openclaw' 'OpenClaw 2.0 (optional; skip with -Skip openclaw)' { Has 'openclaw' } {
  Invoke-RemoteInstaller 'https://openclaw.ai/install.ps1'
}
Step 'jev' 'JEV gateway' { Has 'jev-codex' } { Invoke-Cmd 'npm' @('install', '-g', 'jev-gateway') }

# ---------- 3. Shared tools and plugins ----------
Step 'graphify' 'Graphify' { Has 'graphify' } {
  Invoke-Cmd 'uv' @('tool', 'install', 'graphifyy')
  Update-Path
  Invoke-Cmd 'graphify' @('install')
}
Step 'jev-skill' 'JEV skill for Claude Code' {
  (Get-Output 'claude' @('plugin', 'list')) -match 'typesafe'
} {
  Invoke-Cmd 'claude' @('plugin', 'marketplace', 'add', 'typesafe-ai/skills')
  Invoke-Cmd 'claude' @('plugin', 'install', 'typesafe@typesafe-ai')
}
Step 'ponytail-codex' 'Ponytail for Codex' {
  (Get-Output 'codex' @('plugin', 'list')) -match 'ponytail'
} {
  Invoke-Cmd 'codex' @('plugin', 'marketplace', 'add', 'DietrichGebert/ponytail')
  Invoke-Cmd 'codex' @('plugin', 'add', 'ponytail@ponytail')
}

# ---------- 4. Settings ----------
Step 'env' 'Aider settings for local models' {
  [Environment]::GetEnvironmentVariable('AIDER_MODEL', 'User')
} {
  if ($DryRun) { Say '    would set OLLAMA_API_BASE and AIDER_MODEL for your user' 'DarkGray'; return }
  [Environment]::SetEnvironmentVariable('OLLAMA_API_BASE', 'http://127.0.0.1:11434', 'User')
  [Environment]::SetEnvironmentVariable('AIDER_MODEL', 'ollama_chat/qwen3.8:27b', 'User')
}

$hermesHome = $env:HERMES_HOME
if (-not $hermesHome) { $hermesHome = Join-Path $env:LOCALAPPDATA 'hermes' }
$profileConfig = Join-Path (Join-Path (Join-Path $hermesHome 'profiles') 'aiteam') 'config.yaml'
$marker = 'added by scripts/ai-team/install.ps1'
Step 'hermes-profile' 'Hermes "aiteam" profile (locked down)' {
  (Test-Path $profileConfig) -and ((Get-Content $profileConfig -Raw) -match [regex]::Escape($marker))
} {
  if (-not (Has 'hermes') -and -not $DryRun) { throw 'Hermes is not installed yet' }
  if (-not (Test-Path $profileConfig)) { Invoke-Cmd 'hermes' @('profile', 'create', 'aiteam') }
  if ($DryRun) { Say "    would write safety settings to $profileConfig" 'DarkGray'; return }
  $existing = ''
  if (Test-Path $profileConfig) { $existing = Get-Content $profileConfig -Raw }
  if ($existing -match '(?m)^(approvals|skills):') {
    $ManualSteps.Add("Hermes: $profileConfig already has an 'approvals:' or 'skills:' section. Add the settings from SETUP-GUIDE.md step 7 into those sections by hand.") | Out-Null
    $script:StepNote = 'needs you (see the list at the end)'
    return
  }
  $skills = (Join-Path $Repo '.claude\skills') -replace '\\', '/'
  $settings = @"

# --- $marker ---
approvals:
  mode: smart
  single_query_mode: deny
  unattended_mode: deny
skills:
  write_approval: true
  external_dirs:
    - $skills
"@
  New-Item -ItemType Directory -Force -Path (Split-Path $profileConfig) | Out-Null
  Add-Content -Path $profileConfig -Value $settings -Encoding UTF8
}

# ---------- 5. Local models ----------
if (-not $NoModels) {
  Say "`n== Local models" 'Cyan'
  if ($Tier -eq 'auto') { $Tier = Get-HardwareTier }
  Say "   Tier $Tier (change with -Tier A, B or C)"
  $pulled = ''
  if ((Has 'ollama') -and -not $DryRun) {
    $pulled = Get-Output 'ollama' @('list')
    if ($pulled -notmatch 'NAME') {
      # The Ollama server isn't running yet (common right after install): start it and wait.
      Start-Process -FilePath 'ollama' -ArgumentList 'serve' -WindowStyle Hidden
      for ($t = 0; $t -lt 15 -and $pulled -notmatch 'NAME'; $t++) { Start-Sleep 1; $pulled = Get-Output 'ollama' @('list') }
    }
  }
  foreach ($m in $Models[$Tier]) {
    $escaped = [regex]::Escape($m)
    Step "model:$m" "Model $m" { $pulled -match "(?m)^$escaped(:latest)?\s" } { Invoke-Cmd 'ollama' @('pull', $m) }
  }
  if ($Models[$Tier] -contains 'gpt-oss:20b') {
    Step 'model:gpt-oss-64k' 'gpt-oss-64k (64K-context copy for Hermes)' { $pulled -match '(?m)^gpt-oss-64k' } {
      $modelfile = Join-Path $env:TEMP 'gpt-oss-64k.Modelfile'
      if (-not $DryRun) { Set-Content -Path $modelfile -Value "FROM gpt-oss:20b`nPARAMETER num_ctx 64000" -Encoding ASCII }
      Invoke-Cmd 'ollama' @('create', 'gpt-oss-64k', '-f', $modelfile)
    }
  }
}

# ---------- 6. Check ----------
Say "`n== Team check (node scripts/ai-team/team.mjs doctor)" 'Cyan'
if ((Has 'node') -and -not $DryRun) { & node (Join-Path $Repo 'scripts\ai-team\team.mjs') doctor }
elseif ($DryRun) { Say '    would run the team check' 'DarkGray' }

# ---------- Summary ----------
Say "`n== Summary" 'White'
$Results | Format-Table -AutoSize | Out-String | Write-Host
$failed = @($Results | Where-Object { $_.Result -like 'FAILED*' }).Count
if ($failed) {
  foreach ($r in @($Results | Where-Object { $_.Result -like 'FAILED*' })) { Say "  $($r.Step): $($r.Result -replace '^FAILED - ', '')" 'Red' }
  Say "$failed step(s) failed. Fix the cause shown, then re-run: finished steps are skipped." 'Yellow'
}

Say "`n== Steps only you can do (a script can't log in for you)" 'White'
$base = @(
  'Close and reopen VS Code so it picks up the new tools and settings.',
  "Run 'claude' once and log in. Then in VS Code: Extensions (Ctrl+Shift+X) > search 'Claude Code' > Install.",
  "Run 'codex login' (ChatGPT plan or API key).",
  "Run 'hermes setup' and pick a model provider. For free local use: custom endpoint http://localhost:11434/v1, model gpt-oss-64k.",
  "Run 'opencode' once and pick Ollama as the provider.",
  "Run 'openclaw onboard', then 'openclaw security audit' (skip if you skipped OpenClaw).",
  'JEV: create a key at console.typesafe.ai/keys, then run:  setx TYPESAFE_API_KEY "your-key"',
  'Inside Claude Code, type each line:  /plugin marketplace add thedotmack/claude-mem  then  /plugin install claude-mem',
  '    /plugin marketplace add DietrichGebert/ponytail  then  /plugin install ponytail@ponytail  then  /ponytail full',
  '    /plugin marketplace add pbakaus/impeccable  then  /plugin  (install impeccable from the list)',
  '    /graphify .   (builds the project map; commit graph.json afterwards)',
  "Finally, in Claude Code:  /ai-team <your first request>"
)
$i = 1
foreach ($s in ($base + $ManualSteps)) { Say ("{0,2}. {1}" -f $i, $s); $i++ }
Say "`nFull explanations: docs/ai-team/SETUP-GUIDE.md" 'DarkGray'
