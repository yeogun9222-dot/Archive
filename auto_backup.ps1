# LONGRISE Claude 자동 백업 스크립트
# 실행 시각: 매일 오후 11:30 (PC 꺼져있었으면 켜지는 즉시 실행)

$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HH:mm:ss"
$logFile = "E:\Claude\backup_log.txt"

function Write-Log($msg) {
    $entry = "[$date $time] $msg"
    Add-Content -Path $logFile -Value $entry
    Write-Output $entry
}

Write-Log "===== 자동 백업 시작 ====="

# 1. 메모리 파일 백업
$memSrc = "C:\Users\YG\.claude\projects\C--Users-YG\memory"
$memDst = "E:\Claude\Memory backup"
if (Test-Path $memSrc) {
    Copy-Item "$memSrc\*" -Destination $memDst -Recurse -Force -ErrorAction SilentlyContinue
    $count = (Get-ChildItem $memDst | Measure-Object).Count
    Write-Log "메모리 파일 백업 완료: $count 개 파일 → $memDst"
} else {
    Write-Log "경고: 메모리 소스 경로 없음 ($memSrc)"
}

# 2. 설정집 작업파일 백업
$settingSrc = "C:\Users\YG\.claude\projects\C--Users-YG\memory\notion_settings_work_status.md"
$settingDst = "E:\Claude\Desktop\Claude\Setting book"
if (Test-Path $settingSrc) {
    Copy-Item $settingSrc -Destination $settingDst -Force -ErrorAction SilentlyContinue
    Write-Log "설정집 작업파일 백업 완료 → $settingDst"
}

# 3. 날짜별 스냅샷 (일별 이력 보관)
$snapshotDir = "E:\Claude\Daily snapshots\$date"
if (-not (Test-Path $snapshotDir)) {
    New-Item -ItemType Directory -Path $snapshotDir -Force | Out-Null
}
Copy-Item "$memSrc\*" -Destination $snapshotDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Log "날짜별 스냅샷 저장 완료 → $snapshotDir"

# 4. 오래된 스냅샷 정리 (30일 이상 된 것 삭제)
$oldSnapshots = Get-ChildItem "E:\Claude\Daily snapshots" -Directory |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
foreach ($old in $oldSnapshots) {
    Remove-Item $old.FullName -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "오래된 스냅샷 삭제: $($old.Name)"
}

Write-Log "===== 백업 완료 ====="
Write-Log ""
