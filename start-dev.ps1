# AI Sales Agents Platform - Development Startup Script
# This script starts all three services in separate PowerShell windows

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  AI Sales Agents Platform - Development Mode" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Set the base directory
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ensure we're in the right directory
Set-Location $baseDir

Write-Host "[1/4] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies with pnpm..." -ForegroundColor Yellow
    pnpm install
} else {
    Write-Host "Dependencies already installed ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Setting up Prisma..." -ForegroundColor Yellow
# Use absolute path to avoid nested directory creation
$dbAbsolutePath = Join-Path $baseDir "infra\prisma\dev.db"
$env:DATABASE_URL = "file:$dbAbsolutePath"

# Check if database exists
if (-not (Test-Path "infra/prisma/dev.db")) {
    Write-Host "Creating SQLite database..." -ForegroundColor Yellow
    pnpm prisma db push --schema=./infra/prisma/schema.prisma
} else {
    Write-Host "Database already exists ✓" -ForegroundColor Green
}

# Always generate Prisma Client to ensure it's up to date
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
pnpm prisma generate --schema=./infra/prisma/schema.prisma

Write-Host ""
Write-Host "[3/4] Starting services..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# Start API Server
Write-Host "  → Starting API Server (Port 4202)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$baseDir'
`$dbPath = Join-Path '$baseDir' 'infra\prisma\dev.db'
`$env:DATABASE_URL="file:`$dbPath"
Write-Host '╔════════════════════════════════════════╗' -ForegroundColor Green
Write-Host '║      API SERVER (Port 4202)           ║' -ForegroundColor Green
Write-Host '╚════════════════════════════════════════╝' -ForegroundColor Green
Write-Host ''
pnpm run dev:api
"@ -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Landing Page
Write-Host "  → Starting Landing Page (Port 4200)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$baseDir'
Write-Host '╔════════════════════════════════════════╗' -ForegroundColor Blue
Write-Host '║    LANDING PAGE (Port 4200)           ║' -ForegroundColor Blue
Write-Host '╚════════════════════════════════════════╝' -ForegroundColor Blue
Write-Host ''
pnpm run dev:landing
"@ -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Admin Dashboard
Write-Host "  → Starting Admin Dashboard (Port 4201)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$baseDir'
Write-Host '╔════════════════════════════════════════╗' -ForegroundColor Magenta
Write-Host '║   ADMIN DASHBOARD (Port 4201)         ║' -ForegroundColor Magenta
Write-Host '╚════════════════════════════════════════╝' -ForegroundColor Magenta
Write-Host ''
pnpm run dev:admin
"@ -WindowStyle Normal

Write-Host ""
Write-Host "[4/4] All services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Services are starting in separate windows:" -ForegroundColor White
Write-Host "  • API Server      → http://localhost:4202" -ForegroundColor Green
Write-Host "  • Landing Page    → http://localhost:4200" -ForegroundColor Blue
Write-Host "  • Admin Dashboard → http://localhost:4201" -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

