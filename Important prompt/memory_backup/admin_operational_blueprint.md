---
name: LONGRISE 운영 관리자 패널 완벽 기획서
description: V6 정책 + V31.18 구조 분석 기반 실제 운영 관리자 기능 설계 (자동 Daily AI, 직추 10%, Rollup, M13 EXIT)
type: project
originSessionId: 47d1aac3-1a86-487b-9021-aa37a9428bb6
---
# 🔧 LONGRISE 운영 관리자 패널 완벽 기획서

## Phase 0: 현황 분석

### V31.18.html 데이터 구조
```javascript
userData = {
  email, name, phone, walletAddress,
  balanceUSDT, balanceCNYT, initialInvestment,
  rank (White/Blue/Purple/Red/Black),
  package (Flexible/Basic/Standard/Premium/VIP),
  memberType, distributorStatus,
  joinDate, kycLevel, kycProgress,
  securityScore, twoFactorEnabled, tradingPinSet,
  status (active/inactive),
  
  // 핵심: 월별 수익 데이터
  cumulativeMonthlyEarnings: [
    { 
      month, 
      dailyAI,      // 일일 AI 배당
      referral,     // 직추 수당
      rollup,       // 롤업 수당
      rankShare,    // 랭크 공유
      tokenBonus,   // 토큰 보너스
      total
    }
  ]
}
```

### V6 정책 핵심 요소
```
패키지: Flexible($100, 무조건) / Basic($200, 12M, 7%) / Standard($500, 12M, 9%) 
       / Premium($1K, 12M, 11%) / VIP($5K, 12M, 18%)

Reserve 83% 구성:
├─ USDT 배당 (패키지별 ROI)
├─ CNYT 마케팅 (1.9% of USDT)
├─ 롤업 보너스 (배당의 11.11%)
├─ 글로벌펀드 (2%)
└─ 직추 수당 (12%)

수익 5가지:
1. Daily AI: 매일 UTC 00시 자동 지급 (패키지 ROI ÷ 365)
2. Referral: 직추 1단계 - 가입금액의 10% (즉시)
3. Rollup: 2단계 이하 회원 거래 (배당의 11.11%)
4. Rank Share: 랭크별 글로벌펀드 공유 (1%)
5. Token Bonus: CNYT 보너스 (패키지별 2~10%)

M13 EXIT: 첫 만기 또는 M13 후 자동 종료 (SCAM 방지)
```

---

## Phase 1: 운영 관리자 핵심 기능 설계

### 1️⃣ 자동 Daily AI 배당 시스템

**요구사항:**
- UTC 00시마다 자동으로 모든 활성 사용자에게 Daily AI 지급
- 패키지별 ROI를 365일로 나누어 매일 배분
- 월말 누적 계산 (cumulativeMonthlyEarnings 자동 업데이트)

**관리자 제어:**
```
1. 배당 설정 (패키지별)
   ├─ Flexible: 4% ÷ 365 = 0.0110% 일일
   ├─ Basic: 7% ÷ 365 = 0.0192% 일일
   ├─ Standard: 9% ÷ 365 = 0.0247% 일일
   ├─ Premium: 11% ÷ 365 = 0.0301% 일일
   └─ VIP: 18% ÷ 365 = 0.0493% 일일

2. 수동 조정
   ├─ "글로벌 배당 배수" (예: 1.1배 증가)
   ├─ "특정 사용자 조정" (특정 user만 수동 증가)
   ├─ "배당 일시 중지" (유지보수 등)
   └─ "배당 내역 조회" (지난 6개월)

3. 모니터링
   ├─ 오늘 지급액 합계
   ├─ 이번 달 지급액
   ├─ 다음 배당 예정 시간
   └─ 배당 실패 로그
```

**Database 구조:**
```javascript
// localStorage.longrise_daily_ai_schedule
{
  lastDailyAIRun: "2026-04-15T00:00:00Z",
  todayPayoutAmount: 15240.50,
  monthlyPayoutTotal: 450000.00,
  globalMultiplier: 1.0,
  excludedUsers: ["user@example.com"],
  suspendedRanges: [],
  auditLog: [...]
}
```

---

### 2️⃣ 직추 수당(Referral) 자동 처리 시스템

**요구사항:**
- 신규 회원 가입 시 직추에게 **가입금액의 10% 즉시 지급**
- 직추 랭크가 Blue 이상이어야만 수당 수령 가능
- 월별 누적

**관리자 제어:**
```
1. 직추 수당 정책
   ├─ 수당률 (기본 10%, 조정 가능)
   ├─ 최소 랭크 요구사항 (현재 Blue)
   ├─ 즉시 지급 vs 지연 지급 선택
   └─ VIP 패키지 추가 보너스 (예: +2%)

2. 대기 중 직추 수당
   ├─ 아직 지급 안 된 신규 가입자 목록
   ├─ [승인], [거부], [보류] 버튼
   ├─ 부정 적립 감시 (동일 IP 중복 가입 등)
   └─ 수당 수정 기능

3. 통계
   ├─ 오늘 직추 수당 합계
   ├─ 이번 달 직추 수당
   ├─ 최상위 직추 TOP 10
   └─ 직추 수당 거부율
```

**Database 구조:**
```javascript
// localStorage.longrise_referral_queue
{
  pending: [
    {
      referrerEmail, newUserEmail, packageType, packageAmount,
      referralAmount, status: 'pending'|'approved'|'rejected',
      createdAt, approvedAt
    }
  ],
  referralRate: 0.10, // 10%
  minRankRequired: 'Blue',
  auditLog: [...]
}
```

---

### 3️⃣ 롤업 수당(Rollup) 자동 계산 시스템

**요구사항:**
- 2단계 이하 회원들의 거래 발생 시 자동 계산
- 배당금의 11.11%를 25년에 걸쳐 체감 지급
- 월별 누적

**관리자 제어:**
```
1. 롤업 정책 설정
   ├─ 롤업율 (기본 11.11%, 25년 체감)
   ├─ 적용 범위 (2단계까지)
   ├─ 자동 vs 수동 계산 모드
   └─ 특정 사용자 제외

2. 월별 롤업 수당 관리
   ├─ "자동 계산" (배당 데이터 기반)
   ├─ "수동 수정" (특정 사용자)
   ├─ "재계산" (이전 월)
   └─ "롤업 내역 조회"

3. 모니터링
   ├─ 오늘 롤업 지급액
   ├─ 이번 달 롤업 총액
   ├─ 체감 진행 상태 (1/25 ~ 25/25)
   └─ 롤업 미지급 대기 목록
```

**계산 로직:**
```javascript
// 배당 $100 → 롤업 비율 11.11%
dailyAI: 100
rollup: 100 * 0.1111 = 11.11 (1년차)

// 25년 체감: 매년 누적 금액
Year1: 11.11 (1/25 = 4%)
Year2: 11.11 × 0.96 (2/25 = 8%)
Year3: 11.11 × 0.92 (3/25 = 12%)
... → 합계 = 100 * 11.11% (무한등비급수)
```

---

### 4️⃣ 랭크 관리 & 글로벌 펀드(Rank Share) 자동 배분

**요구사항:**
- 5단계 랭크 (White/Blue/Purple/Red/Black)
- 각 랭크별 요구사항 자동 검증
- 글로벌 펀드(2%)를 Red/Black에게만 1% 공유

**관리자 제어:**
```
1. 랭크 요구사항 설정 (관리자 변경 가능)
   ├─ White: $0+, 0명, -
   ├─ Blue: $500+, 3명 직추, White 3명
   ├─ Purple: $1K+, 5명, Blue 3명
   ├─ Red: $5K+, 10명, Purple 3명 (글로벌 1% 수령)
   └─ Black: $10K+, 15명, Red 3명 (글로벌 1% 수령)

2. 랭크 승격 검증
   ├─ "자동 검증" (조건 충족 시 자동 상향)
   ├─ "수동 승격" (관리자 승격)
   ├─ "강등" (조건 미충족 시)
   └─ "상태 리셋"

3. 글로벌 펀드 관리
   ├─ 일일 펀드 풀 (Reserve 2%)
   ├─ Red/Black 사용자 수
   ├─ 1인당 일일 배분액
   └─ 월별 글로벌 펀드 합계

4. 모니터링
   ├─ 각 랭크별 사용자 수
   ├─ 승격 대기 중인 사용자
   ├─ 글로벌 펀드 분배 현황
   └─ 랭크 변동 이력
```

---

### 5️⃣ M13 EXIT 자동 종료 시스템

**요구사항:**
- 모든 패키지 (Flexible 제외) 만기가 M12
- M13에 자동 종료 (EXIT SCAM 방지)
- 잔여 자산 90% 반환, 10% 수수료

**관리자 제어:**
```
1. M13 EXIT 설정
   ├─ 자동 종료 (M13 자동)
   ├─ 수동 종료 (관리자 강제)
   ├─ 연장 기능 (특정 사용자 M14로 연장)
   └─ Reserve 반환 정책

2. M13 EXIT 대상자 관리
   ├─ "이번 달 EXIT 예정" 목록
   ├─ "[연장], [수동 종료], [재검토]" 버튼
   ├─ EXIT 이유 기록
   └─ 재계약 옵션

3. 출금 처리
   ├─ 자동 출금 (잔액 90%)
   ├─ USDT vs CNYT 선택
   ├─ 출금 내역 저장
   └─ 세금 계산 (선택)

4. 모니터링
   ├─ 현재 활성 사용자 수
   ├─ 이번 달 EXIT 예정 인원
   ├─ 연장 승인 대기 중
   └─ 누적 EXIT 회원 통계
```

**Database 구조:**
```javascript
// localStorage.longrise_m13_exit
{
  exitSchedule: [
    {
      userEmail, joinDate, packageType,
      projectedExitDate, status: 'pending'|'extended'|'exited',
      exitedAt, refundAmount, exitReason
    }
  ],
  returnPercentage: 0.90,
  cnytTokenPriceAtExit: 0.10,
  auditLog: [...]
}
```

---

### 6️⃣ CNYT 토큰 배분 & 마케팅 자금 관리

**요구사항:**
- 배당금의 일부를 CNYT 토큰으로 지급 (1.9% of Daily AI)
- 패키지별 CNYT 보너스 (2%~10%)
- 마케팅 자금 별도 관리 (Reserve의 10%)

**관리자 제어:**
```
1. CNYT 배분 정책
   ├─ 패키지별 CNYT 비율 설정
   │  ├─ Flexible: 0%
   │  ├─ Basic: 2%
   │  ├─ Standard: 4%
   │  ├─ Premium: 6%
   │  └─ VIP: 10%
   ├─ CNYT 토큰 가격 ($0.10 고정)
   ├─ 배당 CNYT 잠금 기간 (30일)
   └─ 마케팅 펀드 비율 (10%)

2. CNYT 거래 관리
   ├─ P2P 마켓플레이스 감시
   ├─ 가격 안정화 (0.10$ 유지)
   ├─ 거래량 모니터링
   └─ 거래 제한 (의심 거래 차단)

3. 마케팅 자금
   ├─ 일일 마케팅 펀드 풀
   ├─ 광고 및 인센티브 예산 관리
   ├─ 프로모션 캠페인 실행
   └─ ROI 분석

4. 통계
   ├─ 발행된 CNYT 총량
   ├─ 유통 중 CNYT
   ├─ 잠금된 CNYT
   ├─ 마켓 가격
   └─ 마케팅 펀드 사용 내역
```

---

## Phase 2: 고급 운영 기능

### 7️⃣ 실시간 대시보드 & 모니터링

```
주요 지표:
├─ 실시간 활성 사용자 수
├─ 오늘 매출 (가입금)
├─ 오늘 배당 지급액
├─ 이번 달 누적 배당
├─ 평균 ROI (패키지별)
├─ Reserve 현황 (남은 자금)
├─ M13 EXIT 예정자 수
├─ KYC 승인 대기
├─ Distributor 신청 대기
└─ 신고/문제 대기

차트:
├─ 일일 매출 추이 (30일)
├─ 패키지별 분포 (파이 차트)
├─ 랭크별 분포 (막대 차트)
├─ 배당금 지출 추이
└─ 사용자 증감 추이
```

### 8️⃣ 사용자 수익 재계산 & 감사 기능

```
1. 월별 수익 수동 조정
   ├─ "이 달만 수정" (해당 월만 변경)
   ├─ "이 달 이후로" (향후 모든 월 재계산)
   ├─ "모두 재계산" (위험: 모든 월 재설정)
   └─ "기간만" (from~to 기간만)

2. 감사 로그
   ├─ 모든 어드민 작업 기록
   ├─ 변경 전/후 비교
   ├─ 타임스탬프 & 관리자명
   ├─ CSV 내보내기
   └─ 변경 취소 옵션

3. 데이터 무결성
   ├─ 자동 백업 (일일 1회)
   ├─ 버전 히스토리 (30일)
   ├─ 복구 기능
   └─ 검증 검사
```

---

## Phase 3: 구현 우선순위

### 🔴 CRITICAL (Phase 1 - 필수)
1. **Daily AI 자동 배당** (UTC 00시 크론)
2. **직추 수당 자동 처리** (신규 가입 트리거)
3. **M13 EXIT 자동 종료** (만기 자동)
4. **기본 모니터링 대시보드**

### 🟡 HIGH (Phase 2 - 매우 중요)
5. **롤업 수당 자동 계산**
6. **랭크 승격 자동 검증**
7. **글로벌 펀드 배분**
8. **감사 로그 & 수익 재계산**

### 🟢 MEDIUM (Phase 3 - 추가)
9. **CNYT 토큰 관리**
10. **마케팅 펀드 관리**
11. **실시간 분석 차트**
12. **CSV 대량 관리**

---

## 실제 Admin Panel UI 구조

```
LONGRISE Admin Panel v3.0

[Header]
├─ 로그인 (Super Admin / Finance Admin / Operations Admin)
└─ 현재 운영자: admin@longrise.com

[Main Navigation]
├─ 📊 대시보드 (실시간 모니터링)
├─ 👥 사용자 관리 (검색, 필터, 상세 관리)
├─ 💰 수익 관리
│  ├─ Daily AI (자동 배당 설정)
│  ├─ Referral (직추 수당 승인)
│  ├─ Rollup (롤업 자동 계산)
│  ├─ Rank Share (글로벌 펀드)
│  └─ Token Bonus (CNYT 배분)
├─ 📈 랭크 관리 (자동 승격, 요구사항 설정)
├─ 🎫 패키지 관리 (ROI, 보너스, 정책 설정)
├─ 🔐 M13 EXIT (자동 종료, 연장 승인)
├─ 📋 거래 내역 (Daily AI, Referral, Rollup 기록)
├─ 📊 분석 & 통계 (차트, 리포트)
├─ 🔔 알림 & 신고 (KYC, Distributor, 문제 사항)
├─ ⚙️ 시스템 설정 (정책, 비율, 긴급)
└─ 📝 감사 로그 (모든 변경 이력, 복구)

[Footer]
└─ 로그아웃 | 문서 | 지원
```

---

## Database Schema (localStorage)

```javascript
// 핵심 운영 데이터
localStorage.longrise_investment_data = {
  allUsers: [...], // V31.18과 동기화
  mockTransactions: [...]
}

// 운영 전용 데이터
localStorage.longrise_admin_daily_ai = {
  lastRun: "2026-04-15T00:00:00Z",
  globalMultiplier: 1.0,
  suspendedUsers: [],
  auditLog: [...]
}

localStorage.longrise_admin_referral = {
  pending: [...],
  approved: [...],
  referralRate: 0.10
}

localStorage.longrise_admin_rollup = {
  monthlyRollup: {...},
  rollupRate: 0.1111,
  depthLimit: 2
}

localStorage.longrise_admin_ranks = {
  requirements: {...},
  userRanks: {...},
  promotionLog: [...]
}

localStorage.longrise_admin_m13_exit = {
  schedule: [...],
  exitLog: [...]
}

localStorage.longrise_admin_settings = {
  packages: {...},
  fees: {...},
  policies: {...}
}

localStorage.longrise_audit_log = [
  { timestamp, admin, action, userId, changes, status }
]
```

---

## 핵심 계산 공식

### Daily AI (일일 배당)
```
일일액 = 초기투자액 × (패키지_ROI ÷ 365) × (글로벌배수)

예) Standard $500, 9% ROI
일일액 = 500 × (0.09 ÷ 365) = $0.123 (일당)
월간액 = $0.123 × 30 = $3.70
```

### Referral (직추 수당)
```
직추수당 = 신규가입금액 × 0.10 (즉시)

조건: 직추 랭크 >= Blue

예) Standard $500 신규가입
직추수당 = $500 × 0.10 = $50 (즉시)
```

### Rollup (롤업 수당)
```
롤업비율 = Daily AI × 0.1111 (25년 체감)

예) Daily AI $100
Year1: $100 × 0.1111 = $11.11
Year2: $100 × 0.1111 × 0.96 = $10.67
...
Total (25년): $100 × 0.1111 = 합계 (무한등비)
```

### Rank Share (글로벌 펀드)
```
글로벌펀드 = (Reserve × 2%) ÷ (Red + Black 사용자 수)

예) Reserve $1M일 때, Red/Black 100명
1일 펀드 = $1,000,000 × 0.02 ÷ 100 = $200/명
```

---

## 운영 시나리오 예시

### Scenario 1: 신규 회원 가입 → 배당 시작
```
1. User A ($500 Standard 가입)
   └─ Admin Dashboard: "신규 가입 대기" 표시

2. Admin 검증
   ├─ KYC 승인
   ├─ 직추 수당 승인 ($50 to 직추)
   └─ 배당 시작

3. Daily AI 자동
   ├─ UTC 00시마다 $500 × 0.0247% = $0.123 자동 지급
   ├─ 월말 자동 누적 (cumulativeMonthlyEarnings 업데이트)
   └─ "오늘 배당 $50,000" 표시

4. Rollup 자동
   ├─ Daily AI가 지급될 때마다 롤업 계산
   ├─ User A의 하단 회원 배당 × 0.1111 → User A 롤업
   └─ 월말 누적
```

### Scenario 2: 직추 수당 검증 및 부정 방지
```
1. User B (referrer) → User C (신규) $500 가입

2. Referral Queue에 "User B에게 $50 지급" 대기

3. Admin 확인
   ├─ 동일 IP 확인 ❌ OK
   ├─ 중복 가입 확인 ❌ OK
   ├─ User B 랭크 확인 ✅ Blue 이상
   └─ "[승인]" 클릭 → 즉시 $50 지급

4. Audit Log에 기록
   └─ "User B ← $50 referral approval (2026-04-15 14:32)"
```

### Scenario 3: M13 EXIT 자동 종료
```
1. User D: Basic $200 (2025-04-15 가입) → M12 도달 (2026-04-15)

2. Admin Dashboard
   └─ "오늘 M13 EXIT 예정: 245명" 표시

3. Auto Exit Process
   ├─ 모든 배당 계산 완료
   ├─ Reserve 정산 (남은 자금 계산)
   ├─ 90% 반환 처리
   └─ cumulativeMonthlyEarnings 최종 확정

4. User D에게 알림
   └─ "계약 만료. $450 환불 대기" 또는 "[재계약]"

5. Audit Log
   └─ "User D EXIT: $450 refund processed"
```

---

## ✅ 완성 체크리스트

- [ ] Daily AI 자동 배당 시스템 (UTC 00시)
- [ ] 직추 수당 자동 처리 (가입금액 10%)
- [ ] 롤업 수당 자동 계산 (배당 11.11%)
- [ ] 랭크 승격 자동 검증
- [ ] 글로벌 펀드 배분
- [ ] M13 EXIT 자동 종료
- [ ] CNYT 토큰 관리
- [ ] 실시간 모니터링 대시보드
- [ ] 감사 로그 & 데이터 복구
- [ ] V31.18.html과 완벽 동기화
- [ ] 3단계 권한 제어 (Super/Finance/Operations)

---

## 다음 액션

1. **admin.html 재구축** (이 기획서 기반)
2. **Daily AI 크론 구현** (UTC 00시 자동 실행)
3. **Referral 큐 시스템** (신규 가입 트리거)
4. **M13 EXIT 스케줄러** (만기 자동 처리)
5. **실시간 대시보드** (모니터링 UI)
6. **감사 로그** (모든 변경 추적)
7. **팀 테스트** (제이크, 제인, 리리 등)
