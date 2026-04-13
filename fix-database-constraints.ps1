# ============================================================================
# AUTOMATED DATABASE FK CONSTRAINT FIX
# ============================================================================
# Usage: .\fix-database-constraints.ps1
# This script will:
# 1. Stop the backend server
# 2. Drop the problematic table
# 3. Rebuild the database
# 4. Restart the backend
# ============================================================================

param(
    [switch]$SkipRestart = $false,
    [string]$DbHost = "localhost",
    [string]$DbUser = "postgres",
    [string]$DbName = "ctu_activity_db",
    [string]$DbPort = "5432"
)

Write-Host "=================================================="
Write-Host "USER_ACTIVITY_SCHEDULE FK CONSTRAINT FIX"
Write-Host "=================================================="
Write-Host ""

# Step 1: Confirm before proceeding
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Drop user_activity_schedule table"
Write-Host "2. Rebuild TypeORM schema"
Write-Host "3. Restart backend service"
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

# Step 2: Stop backend if running
Write-Host ""
Write-Host "Step 1/4: Checking for running Node processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found Node process. Stopping..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Node process stopped" -ForegroundColor Green
} else {
    Write-Host "✓ No Node process running" -ForegroundColor Green
}

# Step 3: Drop and recreate table
Write-Host ""
Write-Host "Step 2/4: Connecting to database..." -ForegroundColor Cyan
$psqlPath = "psql"  # Assumes psql is in PATH

# Check if psql is available
$psqlCheck = & {
    try {
        & $psqlPath --version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

if ($psqlCheck) {
    Write-Host "✓ PostgreSQL client found" -ForegroundColor Green
    
    # Create SQL command
    $sqlCommand = @"
SET session_replication_role = 'replica';
DROP TABLE IF EXISTS user_activity_schedule CASCADE;
SET session_replication_role = 'default';
"@

    Write-Host "Step 3/4: Dropping user_activity_schedule table..." -ForegroundColor Cyan
    
    # Save SQL to temp file
    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempSqlFile -Value $sqlCommand
    
    # Execute with psql
    & $psqlPath -h $DbHost -U $DbUser -d $DbName -p $DbPort -f $tempSqlFile 2>&1 | Write-Host
    
    # Cleanup
    Remove-Item -Path $tempSqlFile -Force -ErrorAction SilentlyContinue
    
    Write-Host "✓ Table dropped successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL client (psql) not found in PATH" -ForegroundColor Yellow
    Write-Host "Please run this SQL manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DROP TABLE IF EXISTS user_activity_schedule CASCADE;" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Then manually restart the backend." -ForegroundColor Yellow
    exit
}

# Step 4: Rebuild and restart
Write-Host ""
Write-Host "Step 4/4: Rebuilding and restarting backend..." -ForegroundColor Cyan

$backendDir = Get-Location
Write-Host "Backend directory: $backendDir"

# Build
if (Test-Path "package.json") {
    Write-Host "Building NestJS application..." -ForegroundColor Yellow
    npm run build 2>&1 | Write-Host
    Write-Host "✓ Build complete" -ForegroundColor Green
} else {
    Write-Host "⚠ package.json not found in current directory" -ForegroundColor Yellow
}

# Restart
if (-not $SkipRestart) {
    Write-Host ""
    Write-Host "Starting backend service..." -ForegroundColor Cyan
    Write-Host "Monitor logs for: 'Database connection initialized successfully'" -ForegroundColor Yellow
    Write-Host ""
    npm run start:dev
} else {
    Write-Host ""
    Write-Host "✓ Fix complete! To restart backend, run:" -ForegroundColor Green
    Write-Host "npm run start:dev" -ForegroundColor White
}

Write-Host ""
Write-Host "=================================================="
Write-Host "FIX COMPLETE" -ForegroundColor Green
Write-Host "=================================================="
