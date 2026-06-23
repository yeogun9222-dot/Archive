# Claude 대화 자동 백업 스크립트
# 실행: powershell -ExecutionPolicy Bypass -File "E:\Claude\auto_backup_chats.ps1"

$outputDir = "E:\Claude\ChatHistory"
$projectsDir = "C:\Users\YG\.claude\projects"

# 오늘 수정된 jsonl 파일만 처리
$cutoff = (Get-Date).Date
$jsonlFiles = Get-ChildItem $projectsDir -Recurse -Filter "*.jsonl" | 
    Where-Object { $_.Name -notlike "agent-*" -and $_.LastWriteTime -ge $cutoff }

if ($jsonlFiles.Count -eq 0) {
    Write-Host "오늘 새 대화 없음"
    exit
}

foreach ($file in $jsonlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $lines = $content -split "`n" | Where-Object { $_ -ne "" }
    
    $messages = @(); $title = ""; $sessionDate = $file.LastWriteTime.ToString("yyyy-MM-dd")
    
    foreach ($line in $lines) {
        try {
            $obj = $line | ConvertFrom-Json
            if ($obj.type -eq "ai-title" -and $obj.aiTitle) { $title = $obj.aiTitle }
            if ($obj.timestamp -and $sessionDate -eq $file.LastWriteTime.ToString("yyyy-MM-dd")) {
                try { $sessionDate = ([datetime]$obj.timestamp).ToString("yyyy-MM-dd") } catch {}
            }
            if ($obj.type -eq "user" -and $obj.message.role -eq "user") {
                $text = ""; $cb = $obj.message.content
                if ($cb -is [array]) { foreach ($b in $cb) { if ($b.type -eq "text") { $text += $b.text } } }
                elseif ($cb -is [string]) { $text = $cb }
                if ($text.Trim()) {
                    $ts = try { ([datetime]$obj.timestamp).ToString("HH:mm:ss") } catch { "" }
                    $messages += "### 👤 User [$ts]`n$($text.Trim())`n"
                }
            }
            if ($obj.type -eq "assistant" -and $obj.message.role -eq "assistant") {
                $text = ""; $cb = $obj.message.content
                if ($cb -is [array]) { foreach ($b in $cb) { if ($b.type -eq "text") { $text += $b.text } } }
                elseif ($cb -is [string]) { $text = $cb }
                if ($text.Trim()) {
                    $ts = try { ([datetime]$obj.timestamp).ToString("HH:mm:ss") } catch { "" }
                    $messages += "### 🤖 Claude [$ts]`n$($text.Trim())`n"
                }
            }
        } catch {}
    }
    
    if ($messages.Count -eq 0) { continue }
    
    $displayTitle = if ($title) { $title } else { "대화_$($file.BaseName.Substring(0,8))" }
    $safeTitle = ($displayTitle -replace '[\\/:*?"<>|]', '_').Substring(0, [Math]::Min(60, $displayTitle.Length))
    $outFile = "$outputDir\$sessionDate`_$safeTitle.md"
    
    $header = "# $displayTitle`n**날짜:** $sessionDate  `n**세션 ID:** $($file.BaseName)  `n**메시지 수:** $($messages.Count)`n`n---`n`n"
    ($header + ($messages -join "`n---`n`n")) | Out-File -FilePath $outFile -Encoding UTF8 -Force
    Write-Host "백업 완료: $displayTitle"
}
Write-Host "백업 완료 $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
