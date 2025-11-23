param(
    [switch]$Install
)

<#
Start all services in separate PowerShell windows.

Usage:
  # Start assuming venvs and deps already installed
  .\scripts\run_all_services.ps1

  # Install dependencies first (may take time)
  .\scripts\run_all_services.ps1 -Install

This script opens new PowerShell windows for each service so you can monitor logs.
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Start-ServiceWindow($path, $commands, $title) {
    $cmd = "cd '$path'; $commands"
    Start-Process powershell -ArgumentList ("-NoExit","-Command",$cmd) -WindowStyle Normal
    Write-Host "Started: $title -> $path"
}

# API Gateway
$apiPath = Join-Path $root "..\backend\api-gateway"
$apiCmd = ""
if ($Install) { $apiCmd += "python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt; " }
$apiCmd += ".\.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-ServiceWindow -path $apiPath -commands $apiCmd -title "API Gateway (8000)"

# AI Engine
$aiPath = Join-Path $root "..\backend\ai-engine"
$aiCmd = ""
if ($Install) { $aiCmd += "python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt; " }
$aiCmd += ".\.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"
Start-ServiceWindow -path $aiPath -commands $aiCmd -title "AI Engine (8001)"

# Emotions Service
$emoPath = Join-Path $root "..\backend\emotions-service"
$emoCmd = ""
if ($Install) { $emoCmd += "python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt; " }
$emoCmd += ".\.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002"
Start-ServiceWindow -path $emoPath -commands $emoCmd -title "Emotions Service (8002)"

# Voice Service
$voicePath = Join-Path $root "..\backend\voice-service"
$voiceCmd = ""
if ($Install) { $voiceCmd += "python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt; " }
$voiceCmd += ".\.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8003"
Start-ServiceWindow -path $voicePath -commands $voiceCmd -title "Voice Service (8003)"

# Frontend (Vite)
$fePath = Join-Path $root "..\frontend"
$feCmd = "npm install; npm run dev -- --host 0.0.0.0"
Start-ServiceWindow -path $fePath -commands $feCmd -title "Frontend (Vite)"

Write-Host "All start commands issued. Give services a few seconds to boot."