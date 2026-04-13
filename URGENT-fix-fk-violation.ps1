# ============================================================================
# EMERGENCY DATABASE CLEANUP - RUNS ORPHANED DATA REMOVAL
# ============================================================================
# Usage: .\URGENT-fix-fk-violation.ps1
# This will immediately fix the FK constraint error
# ============================================================================

param(
    [string]$DbHost = "localhost",
    [string]$DbUser = "postgres", 
    [string]$DbName = "ctu_activity_db",
    [string]$DbPort = "5432",
    [string]$DbPassword = ""
)

Clear-Host
Write-Host "=================================================="
Write-Host "EMERGENCY: FK CONSTRAINT VIOLATION FIX" -ForegroundColor Red
Write-Host "=================================================="
Write-Host ""

# Check psql availability
$psqlPath = "psql"
$psqlAvailable = $false

try {
    $version = & psql --version 2>&1
    $psqlAvailable = $true
    Write-Host "✓ PostgreSQL client found: $version" -ForegroundColor Green
} catch {
    Write-Host "✗ psql not found. Please install PostgreSQL client or run SQL manually." -ForegroundColor Red
}

if (-not $psqlAvailable) {
    Write-Host ""
    Write-Host "MANUAL FIX REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin or psql"
    Write-Host "2. Copy and paste contents of: URGENT-cleanup-orphaned-data.sql"
    Write-Host "3. Run the SQL script"
    Write-Host "4. Then restart backend: npm run start:dev"
    exit 1
}

# Prompt for DB password if needed
if ([string]::IsNullOrEmpty($DbPassword)) {
    Write-Host ""
    Write-Host "Database credentials:" -ForegroundColor Cyan
    Write-Host "Host: $DbHost"
    Write-Host "Port: $DbPort"
    Write-Host "Database: $DbName"
    Write-Host "User: $DbUser"
    Write-Host ""
    
    $dbPasswordSecure = Read-Host "Enter database password (or press Enter if none)" -AsSecureString
    if ($dbPasswordSecure.Length -gt 0) {
        $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPasswordSecure))
    }
}

# Read SQL file
$sqlFile = "URGENT-cleanup-orphaned-data.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "✗ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw

Write-Host ""
Write-Host "Executing cleanup SQL..." -ForegroundColor Yellow
Write-Host "[This will remove all orphaned records from user_activity_schedule]"
Write-Host ""

# Execute SQL
$env:PGPASSWORD = $DbPassword
try {
    $output = $sqlContent | & psql -h $DbHost -U $DbUser -d $DbName -p $DbPort 2>&1
    Write-Host $output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Cleanup successful!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Cleanup may have failed. Check output above." -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Offer to restart backend
Write-Host ""
Write-Host "=================================================="
Write-Host "Next Step:" -ForegroundColor Cyan
Write-Host "1. Stop any running backend: Ctrl+C"
Write-Host "2. Rebuild: npm run build"
Write-Host "3. Start: npm run start:dev"
Write-Host "=================================================="
