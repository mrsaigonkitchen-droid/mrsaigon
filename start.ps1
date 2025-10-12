# Simple startup script for AI Sales Agents Platform

$ErrorActionPreference = "Stop"

Write-Host "AI Sales Agents Platform - Startup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Change to project root
Set-Location $PSScriptRoot

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  Node.js not found!" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  pnpm not found! Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    pnpm install
} else {
    Write-Host "  Dependencies OK" -ForegroundColor Green
}

# Check .env
Write-Host "Checking .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  Creating .env..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
}
Write-Host "  .env OK" -ForegroundColor Green

# Check Database
Write-Host "Checking database..." -ForegroundColor Yellow
if (-not (Test-Path "infra/prisma/dev.db")) {
    Write-Host "  Creating database..." -ForegroundColor Yellow
    pnpm run db:migrate
    pnpm run db:seed
}
Write-Host "  Database OK" -ForegroundColor Green

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "What would you like to start?" -ForegroundColor Yellow
Write-Host "  1) API only (port 3000)" -ForegroundColor White
Write-Host "  2) Landing only (port 4200)" -ForegroundColor White
Write-Host "  3) Admin only (port 4201)" -ForegroundColor White
Write-Host "  4) All services" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting API..." -ForegroundColor Green
        pnpm run dev:api
    }
    "2" {
        Write-Host ""
        Write-Host "Starting Landing..." -ForegroundColor Green
        pnpm run dev:landing
    }
    "3" {
        Write-Host ""
        Write-Host "Starting Admin..." -ForegroundColor Green
        pnpm run dev:admin
    }
    "4" {
        Write-Host ""
        Write-Host "Starting all services..." -ForegroundColor Green
        Write-Host ""
        
        $apiJob = Start-Job -ScriptBlock {
            Set-Location $using:PSScriptRoot
            pnpm run dev:api
        }
        Write-Host "  API started" -ForegroundColor Green
        Start-Sleep -Seconds 3
        
        $landingJob = Start-Job -ScriptBlock {
            Set-Location $using:PSScriptRoot
            pnpm run dev:landing
        }
        Write-Host "  Landing started" -ForegroundColor Green
        Start-Sleep -Seconds 3
        
        Write-Host "  Starting Admin..." -ForegroundColor Green
        Write-Host ""
        Write-Host "====================================" -ForegroundColor Cyan
        Write-Host "Services:" -ForegroundColor Green
        Write-Host "  API:     http://localhost:3000" -ForegroundColor White
        Write-Host "  Landing: http://localhost:4200" -ForegroundColor White
        Write-Host "  Admin:   http://localhost:4201" -ForegroundColor White
        Write-Host "====================================" -ForegroundColor Cyan
        Write-Host ""
        
        try {
            pnpm run dev:admin
        } finally {
            Write-Host ""
            Write-Host "Stopping services..." -ForegroundColor Yellow
            Stop-Job -Job $apiJob, $landingJob -ErrorAction SilentlyContinue
            Remove-Job -Job $apiJob, $landingJob -ErrorAction SilentlyContinue
            Write-Host "  Done" -ForegroundColor Green
        }
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

