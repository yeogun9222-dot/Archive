$outputDir = "E:\Claude\ChatHistory"
$projectsDir = "C:\Users\YG\.claude\projects"

# 기존 파일 초기화
Remove-Item "$outputDir\*.md" -Force -ErrorAction SilentlyContinue

$jsonlFiles = Get-ChildItem $projectsDir -Recurse -Filter "*.jsonl" | 
    Where-Object { $_.Name -notlike "agent-*" } |
    Sort-Object LastWriteTime

$totalFiles = $jsonlFiles.Count
$processed = 0

foreach ($file in $jsonlFiles) {
    $processed++
    
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $lines = $content -split "`n" | Where-Object { $_ -ne "" }
        
        $messages = @()
        $title = ""
        $sessionDate = $file.LastWriteTime.ToString("yyyy-MM-dd")
        $firstTimestamp = $null
        
        foreach ($line in $lines) {
            try {
                $obj = $line | ConvertFrom-Json
                
                # 제목 추출 (aiTitle 필드)
                if ($obj.type -eq "ai-title" -and $obj.aiTitle) {
                    $title = $obj.aiTitle
                }
                
                # 첫 타임스탬프
                if (-not $firstTimestamp -and $obj.timestamp) {
                    $firstTimestamp = $obj.timestamp
                    try { $sessionDate = ([datetime]$obj.timestamp).ToString("yyyy-MM-dd") } catch {}
                }
                
                # 사용자 메시지
                if ($obj.type -eq "user" -and $obj.message.role -eq "user") {
                    $text = ""
                    $cb = $obj.message.content
                    if ($cb -is [array]) {
                        foreach ($block in $cb) { if ($block.type -eq "text") { $text += $block.text } }
                    } elseif ($cb -is [string]) { $text = $cb }
                    if ($text.Trim() -ne "") {
                        $ts = if ($obj.timestamp) { try { ([datetime]$obj.timestamp).ToString("HH:mm:ss") } catch { "" } } else { "" }
                        $messages += "### 👤 User [$ts]`n$($text.Trim())`n"
                    }
                }
                
                # 어시스턴트 메시지
                if ($obj.type -eq "assistant" -and $obj.message.role -eq "assistant") {
                    $text = ""
                    $cb = $obj.message.content
                    if ($cb -is [array]) {
                        foreach ($block in $cb) { if ($block.type -eq "text") { $text += $block.text } }
                    } elseif ($cb -is [string]) { $text = $cb }
                    if ($text.Trim() -ne "") {
                        $ts = if ($obj.timestamp) { try { ([datetime]$obj.timestamp).ToString("HH:mm:ss") } catch { "" } } else { "" }
                        $messages += "### 🤖 Claude [$ts]`n$($text.Trim())`n"
                    }
                }
            } catch {}
        }
        
        if ($messages.Count -eq 0) { continue }
        
        $sessionId = $file.BaseName.Substring(0, [Math]::Min(8, $file.BaseName.Length))
        $displayTitle = if ($title) { $title } else { "대화_$sessionId" }
        $safeTitle = $displayTitle -replace '[\\/:*?"<>|]', '_'
        $safeTitle = $safeTitle.Substring(0, [Math]::Min(60, $safeTitle.Length)).Trim()
        
        $outFile = "$outputDir\$sessionDate`_$safeTitle.md"
        $counter = 1
        while (Test-Path $outFile) {
            $outFile = "$outputDir\$sessionDate`_$safeTitle`_$counter.md"
            $counter++
        }
        
        $header = "# $displayTitle`n**날짜:** $sessionDate  `n**세션 ID:** $($file.BaseName)  `n**메시지 수:** $($messages.Count)`n`n---`n`n"
        $fullContent = $header + ($messages -join "`n---`n`n")
        $fullContent | Out-File -FilePath $outFile -Encoding UTF8
        
        Write-Host "[$processed/$totalFiles] $sessionDate - $displayTitle" -ForegroundColor Green
        
    } catch {
        Write-Host "오류: $($file.Name) - $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ 변환 완료!" -ForegroundColor Cyan
Get-ChildItem $outputDir -Filter "*.md" | Sort-Object Name | Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB,1)}} | Format-Table
