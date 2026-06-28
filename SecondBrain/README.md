# LONGRISE SecondBrain (옵시디언 보관함)

카파시(Karpathy)의 LLM Wiki 3층 구조를 LONGRISE Alpha Squad 체계에 맞춰 구축한 지식 관리 시스템입니다.

## 구조
- `01_Raw_Data/` — 원본 자료 (회의록, 텔레그램 로그, 노션 export). **읽기 전용.**
- `02_AI_Wiki/` — Alpha Squad 14인 부서별 가공 지식. AI가 직접 작성/갱신.
- `CLAUDE.md` — 이 볼트 전용 규칙서 (지식관리 전담, 조직 규칙은 루트 CLAUDE.md 참조).

## 옵시디언 보관함으로 열기
1. 옵시디언 실행 → "새 보관함 생성" 대신 **"폴더를 보관함으로 열기"** 선택
2. `E:\Claude\SecondBrain` 폴더 선택
3. 그래프 뷰에서 `[[링크]]`로 연결된 문서들을 시각적으로 확인 가능

## 지금 당장 할 일 (Action Items)
1. 옵시디언으로 이 폴더를 열어서 그래프 뷰 확인
2. `01_Raw_Data/`에 실제 회의록·대화 원본을 던져넣기 시작 (텔레그램 대화 export, 노션 원본 등)
3. JAKE Brain(이 채팅방)에 "오늘 회의록 넣었어, 위키 갱신해줘" 라고 지시 → Ingest 루프 작동 확인
