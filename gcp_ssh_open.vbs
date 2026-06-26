' GCP jake-server SSH 자동 열기
' 컴퓨터 켜진 후 30초 대기 (네트워크 연결 대기)
WScript.Sleep 30000

' 브라우저로 GCP SSH 페이지 열기
Dim url
url = "https://ssh.cloud.google.com/v2/ssh/projects/rugged-reality-500602-d7/zones/asia-northeast3-a/instances/jake-server"

Dim shell
Set shell = CreateObject("WScript.Shell")
shell.Run "cmd /c start " & url, 0, False
Set shell = Nothing
