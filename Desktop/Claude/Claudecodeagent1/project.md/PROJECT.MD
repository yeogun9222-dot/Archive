# LONGRISE AI — 프로젝트 현황 기록
> 최종 업데이트: 2026-05-24 | 버전: V8.8

---

## 프로젝트 개요

LONGRISE AI 플랫폼의 영업 시연용 쇼케이스 계정 10개를 DB로 구성하는 작업.
실제 Gmail로 로그인하여 핸드폰으로 시연할 수 있는 현실감 있는 데이터를 만드는 것이 목표.

---

## 분석한 소스코드

| 소스 | 경로 | 주요 발견사항 |
|------|------|------------|
| MAIN 프론트엔드 | `LONGRISE-AI-MAIN-main` | 모든 데이터 하드코딩, DB 미연결 |
| ADMIN 백엔드 | `LONGRISE-AI-ADMIN-main` | Mock Mode (메모리 배열), MySQL 스키마만 존재 |
| 마스터플랜 | `LONGRISE_MasterPlan_V8_7_KO.html` | V8.8로 업그레이드 완료 |

**핵심 발견:**
- 로그인: Gmail + 이메일 인증코드 (비밀번호 없음)
- `App.tsx:558` — `SHARED_MOCK_USERS[1]` 하드코딩 (로그인 분기 로직 미구현)
- CryptoAIPage — 일일 수익 히스토리 화면 없음

---

## 확정된 설계 사항

### 공통 설정

| 항목 | 확정값 |
|------|--------|
| 로그인 방식 | Gmail + 이메일 인증코드 |
| 거래 비밀번호 | `Longrise1!` (전 계정 통일) |
| 가입일 = 패키지구매일 | 동일 날짜 적용 |
| CNYT 단가 | $0.02 고정 |
| USDT 구분 | 수익분(balance_usdt) / 원금(locked_usdt $1,000) 분리 |

### 10개 계정 최종 스펙

| # | 닉네임 | Gmail(임시) | 가입일 | 업그레이드일 | 직급 | USDT | CNYT | 팀인원 | 팀매출 |
|---|--------|------------|--------|------------|------|------|------|--------|--------|
| 1 | ⭐Kim_Dragon88 | kim88@gmail.com | 2025-02-05 | 2025-05-10 | **Blue Dragon** | $2,597 | 4,897 | 108명 | $28,500 |
| 2 | Lee_Profit99 | lee99@gmail.com | 2025-02-10 | 2025-05-17 | **Blue Dragon** | $2,157 | 4,824 | 35명 | $10,200 |
| 3 | Park_Alpha77 | park77@gmail.com | 2025-02-15 | 2025-05-22 | **Blue Dragon** | $2,100 | 4,771 | 22명 | $6,400 |
| 4 | Choi_Rise12 | choi12@gmail.com | 2025-02-18 | 2025-05-28 | White Dragon | $1,564 | 4,714 | 17명 | $4,200 |
| 5 | Han_Node34 | han34@gmail.com | 2025-02-22 | 2025-06-03 | White Dragon | $1,549 | 4,664 | 12명 | $3,000 |
| 6 | Jung_Bull56 | jung56@gmail.com | 2025-02-26 | 2025-06-08 | White Dragon | $1,481 | 4,611 | 8명 | $2,000 |
| 7 | Yoon_Gold78 | yoon78@gmail.com | 2025-03-02 | 2025-06-14 | White Dragon | $1,462 | 4,551 | 6명 | $1,500 |
| 8 | Song_Wave90 | song90@gmail.com | 2025-03-07 | 2025-06-19 | White Dragon | $1,445 | 4,498 | 5명 | $1,250 |
| 9 | Lim_Eagle23 | lim23@gmail.com | 2025-03-12 | 2025-06-24 | White Dragon | $1,426 | 4,442 | 4명 | $900 |
| 10 | Ko_Titan45 | ko45@gmail.com | 2025-03-17 | 2025-06-29 | White Dragon | $1,407 | 4,386 | 3명 | $600 |

> ※ Gmail은 임시. 실제 Gmail 10개 수령 후 `02_static_data.sql`의 email 컬럼만 교체.

---

## Kim_Dragon88 서사 (히어로 계정)

```
2025-02-05  Standard $500으로 가입
     ↓  해외 지인 5명 가입시킴 (중국1, 일본1, 한국1, 베트남1, 중국2)
     ↓  1년간 아무것도 하지 않음
     ↓  중국 지인(CN_Wei)이 자체 네트워크로 폭발적 성장 → 86명 / 23레벨
2025-05-10  배당이 들어오는 것을 확인, 추가 $500 입금 → Premium $1,000 달성
현재         Blue Dragon / Purple Dragon 목전 (Line3 하나만 더 키우면 달성)
```

### 조직 구조 (총 108명)

```
Kim_Dragon88 ★Blue Dragon ($1,000 Premium)
├── Line1: CN_Wei_Dragon ★Blue 🇨🇳 — 86명, 23레벨
│   ├── 척추 Blue Dragon ×20 (모두 Standard $500 → Purple 불가)
│   ├── White Dragon 자격자 ×60명
│   └── 꼬리 ×6명
├── Line2: JP_Tanaka_Rise ★Blue 🇯🇵 — 9명, 5레벨 (우연히 성장)
├── Line3: KR_Choi_Star ○White 🇰🇷 — 8명, 3레벨 ← Blue 되면 Purple Dragon!
├── Line4: VN_Nguyen_Pro ○White 🇻🇳 — 4명 (거의 비활성)
└── Line5: CN_Liu_Rise  ○White 🇨🇳 — 1명 (거의 비활성)
```

### 핵심 서사 포인트

> 하부 모든 Blue Dragon(CN_Wei 포함)은 **Standard $500** 보유
> → Purple Dragon 패키지 조건($1,000+) 미달로 Blue Dragon 고착
> → Kim만 Premium $1,000 투자 → 전체 네트워크에서 Purple Dragon 가장 근접

---

## DB 스키마 구조

| 테이블 | 행 수 | 역할 |
|--------|-------|------|
| `users` | 10행 | 주계정 10개 |
| `packages` | 20행 | 패키지 이력 (Standard→Premium) |
| `daily_returns` | ~3,650행 | 1년치 일일 수익 |
| `transactions` | ~5,000행 | 지갑 활동 내역 |
| `referral_tree` | ~220행 | 조직도 |
| `usdt_transfers` | 30행 | USDT 이체 내역 |

---

## USDT 잔고 계산 근거

```
인출 없음 기준:
  Blue Dragon (Kim):  일일수익 $1,513 + 직추천 $160 + 롤업 $924 = $2,597
  White Dragon (Ko):  일일수익 $1,347 + 직추천 $60  + 롤업 없음  = $1,407

롤업 구조 (Blue Dragon 3레벨):
  L1: CN_Wei($4.50) + JP_Tanaka($4.50) + KR_Choi($1.80) + VN_Nguyen($1.80) + CN_Liu($1.80) = $14.40/월
  L2: 16명 평균 × $31.50/월
  L3: 9명 평균  × $18.90/월
  → 연 누적 $924
```

---

## 일일 수익 알고리즘 (Page 11 V8.7 기준)

```
수익일 (80%): displayed_rate 0.40~1.50% / usdt_earned = 월약정 ÷ (30×0.85)
방어일 (15%): displayed_rate 0%          / usdt_earned = $0
역전일  (5%): displayed_rate 2.00~4.00%  / usdt_earned = 기본 × 1.4배

보정: 월 합산이 투자금×14% 미만 → ×1.15 / 투자금×22% 초과 → ×0.85
```

---

## 생성된 파일 목록

```
LONGRISE_DB_SETUP/
├── README.md                          ← 개발자 실행 가이드
├── PROJECT.MD                         ← 이 파일 (프로젝트 현황)
├── 01_schema.sql                      ← CREATE TABLE 6개
├── 02_static_data.sql                 ← 10계정 + 패키지 + 이체 INSERT
├── 03_referral_tree.sql               ← 조직도 ~220명 INSERT
├── 04_seed_generator.js               ← 일일수익 + 트랜잭션 자동생성
├── 05_mockData_update.ts              ← 프론트 즉시 적용용
├── PREVIEW.html                       ← 시각화 미리보기
├── generate_excel.js                  ← 엑셀 자동생성 스크립트
├── EXCEL_01_주계정스펙.csv             ← 10개 계정 스펙
├── EXCEL_02_패키지이력.csv             ← 패키지 구매 이력
├── EXCEL_03_Kim조직도.csv             ← Kim 108명 조직도
├── EXCEL_04_전체계정집계.csv           ← 전체 집계 + 수정 이력
└── EXCEL_05_전체220명_조직도및수당.csv  ← 220명 수당 체계
```

---

## 개발자 전달 시 확인 사항 (3가지)

1. **백엔드 DB 연결 시점** — `src/db/index.ts` 현재 Mock Mode, MySQL 전환 일정
2. **로그인 계정 분기 로직** — `App.tsx:558` 하드코딩 해결 일정
3. **일일 수익 히스토리 화면** — CryptoAIPage 신규 개발 예정 여부

---

## 버전 이력

| 버전 | 날짜 | 주요 변경사항 |
|------|------|------------|
| V8.7 | 이전 | 마스터플랜 초기 버전 |
| V8.8 | 2026-05-24 | DB 세팅 완전 명세 추가 (PAGE 11~13) / USDT 롤업 수정 / 현실감 재설계 |

### V8.8 주요 수정 이력

| 수정 | 이전 | 이후 | 사유 |
|------|------|------|------|
| USDT 잔고 (Kim) | $1,580 | $2,597 | 롤업 수당 $924 미반영 |
| 조직 인원 | 639명 | 220명 | 현실감 방향A 채택 |
| 직급 분포 | 전원 Blue Dragon | Blue 3 / White 7 | 균일한 분포가 오히려 비현실적 |
| 하부 서사 추가 | 없음 | Standard $500 → Purple 불가 | 논리적 일관성 확립 |
