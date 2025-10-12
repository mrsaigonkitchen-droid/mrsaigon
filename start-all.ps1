# Quick Start Script - Launch API, Landing, Admin
# Usage: .\start-all.ps1

param(
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = 'Stop'

# Colors
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Banner
Clear-Host
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Quick Start - All Services" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
Write-Info "Project: $projectRoot"

# Set database (use absolute path to avoid confusion)
$dbPath = Join-Path $projectRoot "infra\prisma\dev.db"
$env:DATABASE_URL = "file:$($dbPath.Replace('\', '/'))"
Write-Info "Database: $env:DATABASE_URL"

# Stop existing processes
Write-Info "Stopping existing node processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Check database
if (-not (Test-Path "infra\prisma\dev.db")) {
    Write-Warn "Database not found!"
    Write-Host "Run: pnpm tsx infra/prisma/seed.ts" -ForegroundColor Yellow
    exit 1
}

Write-Success "Launching services...`n"

# Display service info
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  [API]     http://localhost:4202" -ForegroundColor White
Write-Host "  [Landing] http://localhost:4203" -ForegroundColor White
Write-Host "  [Admin]   http://localhost:4200" -ForegroundColor White
Write-Host ""

# Launch API
Write-Info "Starting API Server (port 4202)..."
$dbPathForward = $dbPath.Replace('\', '/')
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$env:DATABASE_URL='file:$dbPathForward'; `$host.UI.RawUI.WindowTitle='API Server (4202)'; Write-Host 'API Server Starting...' -ForegroundColor Green; pnpm dev:api"
Start-Sleep -Seconds 3

# Launch Landing
Write-Info "Starting Landing Page (port 4203)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$host.UI.RawUI.WindowTitle='Landing Page (4203)'; Write-Host 'Landing Page Starting...' -ForegroundColor Blue; pnpm dev:landing"
Start-Sleep -Seconds 2

# Launch Admin
Write-Info "Starting Admin Dashboard (port 4200)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$host.UI.RawUI.WindowTitle='Admin Dashboard (4200)'; Write-Host 'Admin Dashboard Starting...' -ForegroundColor Magenta; pnpm dev:admin"

Write-Host ""
Write-Success "All services launched in separate windows!"
Write-Info "Wait 10-20 seconds for services to be ready...`n"

# Health check
if (-not $SkipHealthCheck) {
    Write-Info "Testing API health in 8 seconds..."
    Start-Sleep -Seconds 8
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4202/pages" -TimeoutSec 5 -ErrorAction Stop
        Write-Success "API is healthy! Found $($response.Count) pages"
    } catch {
        Write-Warn "API not ready yet. Check the API window for errors."
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Quick Access URLs:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  API:     http://localhost:4202" -ForegroundColor White
Write-Host "  Landing: http://localhost:4203" -ForegroundColor White
Write-Host "  Admin:   http://localhost:4200" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Admin Login:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Pass:  admin123`n" -ForegroundColor White

Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Each service runs in its own window" -ForegroundColor Gray
Write-Host "  - Close window or Ctrl+C to stop" -ForegroundColor Gray
Write-Host "  - Check each window for logs/errors`n" -ForegroundColor Gray

Write-Success "Ready! Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
