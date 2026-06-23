# LONGRISE AI — 쇼케이스 DB 세팅 가이드 V8.9 Rev.2

## 개발자이사님께

영업 시연용 리더 계정 10개 세팅 패키지입니다.
아래 순서대로 실행하시면 됩니다.

---

## 파일 목록 (7개)

| 순서 | 파일 | 역할 |
|------|------|------|
| 1 | `01_schema.sql` | DB 테이블 생성 (7개 테이블 — locked_wallet 추가) |
| 2 | `02_static_data.sql` | 10개 주계정 + 패키지 이력 + USDT 이체 내역 |
| 3 | `03_referral_tree.sql` | Kim 조직도 46개 + 독립 시연계정 7개 = 플랫폼 108개 계정 |
| 4 | `04_seed_generator.js` | 일일수익(daily_returns) + 트랜잭션 자동 생성 |
| 5 | `05_mockData_update.ts` | 프론트엔드 shared/mockData.ts 교체파일 |
| 6 | `06_mockTransactions.ts` | 프론트엔드 WalletPage 거래이력 교체파일 |
| — | `README.md` | 이 파일 |

---

## DB 실행 순서

```bash
# 1단계: 테이블 생성 (7개 테이블)
mysql -u root -p longrise < 01_schema.sql

# 2단계: 주계정 + 패키지 + 이체내역 입력
mysql -u root -p longrise < 02_static_data.sql

# 3단계: 조직도 입력 (플랫폼 108개 계정)
mysql -u root -p longrise < 03_referral_tree.sql

# 4단계: 일일수익 + 트랜잭션 자동생성
node 04_seed_generator.js | mysql -u root -p longrise
```

---

## 프론트엔드 적용 (DB 연동 전 임시 사용)

```bash
# 5단계: 아래 두 파일을 src/shared/ 폴더에 복사
05_mockData_update.ts  →  src/shared/mockData.ts   (덮어쓰기)
06_mockTransactions.ts →  src/shared/mockTransactions.ts  (신규)

# App.tsx 558번째 줄 — 원하는 계정 인덱스로 변경:
# SHARED_MOCK_USERS[0]  → Kim_Dragon88  (히어로 / 45명 / Blue Dragon)
# SHARED_MOCK_USERS[3]  → Choi_Rise12   (White Dragon / 17명)
# SHARED_MOCK_USERS[9]  → Ko_Titan45    (신생 / 3명 / White Dragon)
```

```typescript
// WalletPage.tsx — hardcoded activities 교체
import { getWalletActivities } from '../shared/mockTransactions';

// 기존 const activities = [...] 삭제 후:
const activities = getWalletActivities(user.id, 20); // 최근 20건
```

---

## 생성되는 데이터 규모

| 테이블 | 행 수 | 내용 |
|--------|-------|------|
| users | 10행 | 주계정 |
| packages | 20행 | Premium 각 1건 (Standard 없음) |
| referral_tree | ~220행 | 조직도 |
| daily_returns | ~3,650행 | 1년치 일일 수익 |
| transactions | ~4,080건 | 입금·CNYT·직추천·롤업·일일ROI·인출 |
| usdt_transfers | 30행 | 계정당 3건 |
| locked_wallet | 10행 | 원금 잠금 상태 (Kim = RELEASED, 나머지 = LOCKED) |

---

## 10개 계정 스펙 (V8.9 Rev.2 확정)

| # | 닉네임 | 직급 | USDT잔고 | LOCKED | CNYT | 팀인원 | 팀매출 | 비고 |
|---|--------|------|---------|--------|------|--------|--------|------|
| 1 | ⭐Kim_Dragon88 | **Blue Dragon** | $3,139 | $1,000 | 104,927 | 45명 | $28,500 | 재구매 2026-03-09(만기전) / 2nd패키지 진행중 |
| 2 | Lee_Profit99 | **Blue Dragon** | $2,680 | $1,000 | 104,732 | 3명 | $1,500 | 재구매 2026-03-15(만기전) / 2nd패키지 진행중 |
| 3 | Park_Alpha77 | **Blue Dragon** | $2,540 | $1,000 | 104,653 | 3명 | $1,500 | 재구매 2026-04-02(만기후) / 2nd패키지 진행중 |
| 4 | Choi_Rise12 | White Dragon | $1,564 | $1,000 | 129,431 | 17명 | $4,200 | Standard→Premium / 재구매 2026-02-08 |
| 5 | Han_Node34 | White Dragon | $1,549 | $1,000 | 129,167 | 12명 | $3,000 | Standard→Premium / 재구매 2026-03-03 |
| 6 | Jung_Bull56 | White Dragon | $1,481 | $1,000 | 129,068 | 8명 | $2,000 | Standard→Premium / 재구매 2026-03-12 |
| 7 | Yoon_Gold78 | White Dragon | $1,462 | $1,000 | 129,299 | 6명 | $1,500 | Standard→Premium / 재구매 2026-02-20 |
| 8 | Song_Wave90 | White Dragon | $1,445 | $1,000 | 129,233 | 5명 | $1,250 | Standard→Premium / 재구매 2026-02-26 |
| 9 | Lim_Eagle23 | White Dragon | $1,426 | $1,000 | 128,969 | 4명 | $900 | Standard→Premium / 재구매 2026-03-20 |
| 10 | Ko_Titan45 | White Dragon | $1,407 | $1,000 | 128,847 | 3명 | $600 | Standard→Premium / 재구매 2026-04-01 |

> ※ Kim(1번): LOCKED $0 = Premium 2026-03-23 만기 완료, 재투자 없음
> ※ Kim 인출이력: 1차 $1,150 (2025-10-08) / 2차 $380 (2026-03-12) / 총 $1,530
> ※ Lee(2번) / Park(3번): Kim 직접 L1 Blue Dragon / Premium 만기 후 LOCKED $0 / 팀 3명 소규모

---

## Kim_Dragon88 수익 타임라인 요약 (서사용)

| 시점 | 이벤트 | 누적 잔고 |
|------|--------|-----------|
| 2025-03-23 | 가입 당일 Wei/Choi/Nguyen/Liu 4명 직추천 수당 $640 수령 | $640 |
| 2025-03-25~26 | Lee/Park 가입 직추천 수당 $200 추가 수령 | $840 |
| 2025-10-08 | 오랜만에 앱 열어 $2,650 확인 → $1,150 인출 | $1,500 |
| **2026-03-09** | **만기 14일 전 Premium $1,000 재구매 (-$1,000)** | $1,835 |
| 2026-03-12 | $1,862 확인 → $380 인출 | $1,482 |
| 2026-03-23 | 1st 패키지 만기 → 원금 $1,000 반환 / 2nd 배당 계속 | $2,579 |
| 2026-06-05 | 현재 최종 잔고 (가용) | $3,139 |

총 자산: 가용USDT $3,139 + LOCKED $1,000 + 인출금 $1,530 + CNYT 104,927개(예상 $104,927+) = **$110,596+**

---

## 공통 설정

| 항목 | 값 |
|------|-----|
| 로그인 방식 | 이메일 아이디 입력 → 인증코드 발송 → 코드 인증 후 비밀번호 설정 (로그인 아이디 + 비밀번호 필수) |
| 거래 비밀번호 | `Longrise1!` (전 계정 통일) |
| 가입일 = 패키지 구매일 | 동일 날짜 적용 |
| CNYT 단가 | $0.02 고정 |
| 원금 (LOCKED) | $1,000 별도 컬럼 / Kim은 만기 후 $0 |
| 만기 원금 반환 | 100% (수수료 0% 확정) |
| 직접추천 수당 | 구매 건당 10% 매회 지급 |

---

## 추천인 코드 정책 (V8.9 Rev.2 신규)

| 항목 | 정책 |
|------|------|
| 코드 형식 | 대문자 영문+숫자 혼합 8자리 (예: DRAGON88) |
| 생성 방식 | 시스템 자동생성 (DB UNIQUE 체크) |
| 가입 시 입력 | 필수 — 미입력 시 가입 불가 |
| 공유 링크 | `https://longrise.ai/join?ref=[코드]` |
| Kim 시연 코드 | **DRAGON88** (수동 지정 / QA 테스트용) |

```sql
-- users 테이블 추가 컬럼
referral_code      VARCHAR(8) UNIQUE NOT NULL,  -- 본인 코드
referred_by_code   VARCHAR(8) NULL              -- 가입 시 입력한 코드
```

---

## Gmail 교체 방법

실제 Gmail 10개 수령 후 `02_static_data.sql`에서 email 컬럼만 교체:

```sql
kim88@gmail.com   →  [실제 Gmail 1]
lee99@gmail.com   →  [실제 Gmail 2]
park77@gmail.com  →  [실제 Gmail 3]
choi12@gmail.com  →  [실제 Gmail 4]
han34@gmail.com   →  [실제 Gmail 5]
jung56@gmail.com  →  [실제 Gmail 6]
yoon78@gmail.com  →  [실제 Gmail 7]
song90@gmail.com  →  [실제 Gmail 8]
lim23@gmail.com   →  [실제 Gmail 9]
ko45@gmail.com    →  [실제 Gmail 10]
```

---

## 플랫폼 기준일

| 항목 | 값 |
|------|-----|
| 플랫폼 오픈일 | 2025-01-01 |
| 현재 기준일 | 2026-06-05 |
| Kim 가입일 | 2025-03-23 |
| Kim Premium 만기 | 2026-03-23 |

## ⚠️ END_DATE 연장 안내 (개발자 필독)

오픈이 2026년 7월 또는 8월로 늦어질 경우:

```js
// 04_seed_generator.js 상단 수정
const END_DATE = '2026-06-05'; // ← 실제 오픈일로 변경 후 재실행
// 예: '2026-07-31' 또는 '2026-08-31'
```

변경 후 4단계를 재실행하면 해당 날짜까지 데이터가 자동 연장됩니다.

## 일일 수익 알고리즘

```
수익일 (80%) : displayed_rate 0.40~1.50%  / 실지급 $4.31/일 (Premium $1,000 기준)
방어일 (15%) : displayed_rate 0%           / 실지급 $0 (손실 없음)
역전일  (5%) : displayed_rate 2.00~4.00%  / 실지급 기본 x1.4배

월별 합산 → 14%~22% 범위 자동 보정 (평균 18% 목표)
```

---

## 확인 필요 사항 (3가지)

**Q1. 백엔드 DB 연결 시점**
`src/db/index.ts`가 Mock Mode입니다. 실제 MySQL 전환 시점 확인 필요.

**Q2. 로그인 계정 분기 로직**
`App.tsx:558`에 `SHARED_MOCK_USERS[1]` 하드코딩 중.
이메일 로그인 후 계정 자동 라우팅 개발 일정 확인 필요.
(그 전까지는 05, 06 파일로 임시 대응 가능)

**Q3. 일일 수익 히스토리 화면**
현재 CryptoAIPage에 전체 이력 조회 없음.
DB에는 365일치 데이터 준비 완료 — 화면 개발 예정 여부 확인 필요.
