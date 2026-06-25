# JAKE Auto Backup Script
# Backs up critical Jake/JARVIS/LONGRISE files to Google Drive
# Runs daily via Windows Task Scheduler

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$logFile = "E:\Claude\backup_log.txt"

# Dynamically find Google Drive folder (handles Korean folder name encoding)
$googleDriveFolder = Get-ChildItem "C:\Users\YG\" | Where-Object { $_.Name -match 'Google' } | Select-Object -First 1
if (-not $googleDriveFolder) {
    Add-Content -Path $logFile -Value "[$timestamp] FAILED: Google Drive folder not found"
    exit 1
}

$backupRoot = Join-Path $googleDriveFolder.FullName "JAKE_BACKUP"
$backupFile = Join-Path $backupRoot "JAKE_BACKUP_$timestamp.zip"

if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
}

$items = @(
    "E:\Claude\CLAUDE.md",
    "E:\Claude\jake-agent",
    "E:\Claude\Desktop\Claude\jarvis-mode",
    "E:\Claude\설정집_작업"
)

$tempDir = "$env:TEMP\jake_backup_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $items) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

try {
    Compress-Archive -Path "$tempDir\*" -DestinationPath $backupFile -Force
    $size = [math]::Round((Get-Item $backupFile).Length / 1MB, 2)
    $msg = "[$timestamp] SUCCESS: JAKE_BACKUP_$timestamp.zip ($size MB) -> Google Drive"
    Write-Host $msg -ForegroundColor Green
} catch {
    $msg = "[$timestamp] FAILED: $_"
    Write-Host $msg -ForegroundColor Red
}

Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Add-Content -Path $logFile -Value $msg

# Keep only last 14 backups (2 weeks)
$old = Get-ChildItem $backupRoot -Filter "JAKE_BACKUP_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 14
foreach ($f in $old) { Remove-Item $f.FullName -Force }
