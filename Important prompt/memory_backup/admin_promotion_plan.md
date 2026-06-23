---
name: 프로모션 지급 기능 구현 계획
description: 직급자 보너스 및 돌발 프로모션 기능 추가 설계
type: project
originSessionId: 4f14d8a1-ba17-4d72-a2d0-3b027b517502
---
# 프로모션 지급 기능 구현 계획

**목적**: 수당 조정 시 직급자 보너스 프로모션, 이벤트 돌발 프로모션 등을 신속하게 실행

## 현재 viewPayouts() 구조
```
1. AI 데일리 노드 수당 일일 설정 센터
   - 일일 요율 설정
   - 설정 히스토리

2. 5대 수당 엔진 크론 스케줄러
   - 엔진별 ON/OFF 토글

3. 에러 감지 및 복구 (DLQ Monitor)
   - 실패 건수 감시
   - 일괄 재처리

4. 개별 유저 정밀 복구 데스크
   - 특정 유저 1건씩 복구
   - 기준/사유 기록

5. 수당 트랜잭션 실시간 모니터링
   - 거래 로그 테이블
```

## 추가 구현 위치
**개별 유저 정밀 복구 데스크 아래에 새로운 섹션 추가:**

```
6. 프로모션 일괄 지급 센터 (新)
   - 프로모션 생성
   - 프로모션 실행
   - 프로모션 이력
```

## 기능 사양

### 프로모션 타입

#### Type 1: 직급자 보너스 프로모션
```
목표: 특정 직급(들) 회원에게 일괄 보너스 지급

설정 항목:
- 프로모션명: "신년 직급 보너스", "월드컵 보너스" 등
- 대상 직급: Black Dragon / Red Dragon / Purple Dragon / Blue Dragon / White Dragon / Investor
- 지급 금액: USDT or CNYT
- 프로모션 기간: 2026-04-20 ~ 2026-04-30
- 설명/비고: "신년 특별 이벤트"

실행 결과:
- 대상 회원 자동 필터링
- 예상 지급액 계산
- 클릭 1개로 일괄 실행
- 모든 회원 Ledger에 기록

예시: 
- Black Dragon 50명 × $500 = $25,000
- Red Dragon 120명 × $300 = $36,000
- 총 $61,000 지급
```

#### Type 2: 돌발 프로모션
```
목표: 특정 조건 회원(들)에게 일괄 지급

설정 항목:
- 프로모션명: "신규 회원 환영 이벤트", "고액 거래자 감사" 등
- 대상 필터:
  ✓ 가입 기간: 0-7일 / 7-30일 / 30-90일 등
  ✓ 총 매출: $500 이상 / $1000 이상 등
  ✓ 활동 상태: Active 회원만
  ✓ KYC 상태: Approved만
  ✓ 지정 회원 그룹: CSV 업로드
- 지급 금액: 고정액 or 기준값 기반
- 기간: 즉시 or 예약
- 설명: "신규 회원 보너스"

실행 결과:
- 조건별 회원 자동 필터링
- 예상 대상 수 + 총 지급액 표시
- 실행 전 미리보기
- 일괄 실행 후 기록
```

## appState 확장

```javascript
// 추가할 프로모션 관련 상태
promotionTab: 'list',           // list / create / history
promotionForm: {
    type: 'rank_bonus',          // rank_bonus / event_promo
    name: '',
    description: '',
    
    // 직급 보너스 필터
    selectedRanks: [],           // ['Black Dragon', 'Red Dragon', ...]
    
    // 돌발 프로모션 필터
    joinDayFrom: '',
    joinDayTo: '',
    minVolume: '',
    maxVolume: '',
    status: 'Active',
    kycStatus: 'Approved',
    
    // 공통
    amount: 0,
    asset: 'USDT',              // USDT / CNYT
    startDate: '',
    endDate: '',
    reason: ''
},
promotionPreview: {
    targetCount: 0,
    totalAmount: 0,
    users: []
},
promotionShowPreview: false
```

## db 확장

```javascript
// promotions 컬렉션
promotions: [
    {
        id: 'PROMO-001',
        type: 'rank_bonus',
        name: '신년 직급 보너스',
        description: '신년 기념 직급별 보너스',
        targetCriteria: { ranks: ['Black Dragon', 'Red Dragon'] },
        amount: 500,
        asset: 'USDT',
        targetCount: 50,
        totalAmount: 25000,
        status: 'completed',    // pending / executing / completed / cancelled
        createdAt: '2026-04-17 10:00',
        executedAt: '2026-04-17 10:05',
        executedBy: 'Jake (PM)',
        notes: '신년 특별 이벤트'
    }
],

// promotionLogs 컬렉션
promotionLogs: [
    {
        id: 'PL-001',
        promotionId: 'PROMO-001',
        userId: 'LR-1001',
        amount: 500,
        asset: 'USDT',
        executedAt: '2026-04-17 10:05',
        status: 'completed'
    }
]
```

## UI 설계

### 섹션 1: 프로모션 생성 폼
```
┌─────────────────────────────────────────┐
│ 프로모션 생성                           │
├─────────────────────────────────────────┤
│ 프로모션 타입 선택:                     │
│ ○ 직급자 보너스  ○ 돌발 프로모션       │
│                                          │
│ 프로모션명: [________________]          │
│ 설명: [________________________]        │
│                                          │
│ [대상 선택 폼 - 타입별로 변경]         │
│                                          │
│ 지급액: [___] [USDT▼]                  │
│ 기간: [시작일] ~ [종료일]              │
│                                          │
│ [미리보기] [생성]                      │
└─────────────────────────────────────────┘
```

### 섹션 2: 미리보기
```
┌──────────────────────────────┐
│ 프로모션 미리보기             │
├──────────────────────────────┤
│ 대상 회원: 150명             │
│ 예상 지급액: $75,000 USDT   │
│                              │
│ [대상 회원 목록]             │
│ LR-1001 (Black Dragon) $500  │
│ LR-1002 (Black Dragon) $500  │
│ ...                          │
│ [스크롤]                     │
│                              │
│ [실행] [취소]                │
└──────────────────────────────┘
```

### 섹션 3: 프로모션 이력
```
테이블:
- ID | 타입 | 프로모션명 | 대상 | 금액 | 상태 | 실행일 | 담당자 | 관리
```

## 구현 단계

### Phase 1: 기본 기능
- [ ] appState 확장
- [ ] db 컬렉션 추가
- [ ] 프로모션 생성 폼 UI
- [ ] 직급자 보너스 프로모션 로직
- [ ] 실행 함수

### Phase 2: 고도화
- [ ] 돌발 프로모션 필터
- [ ] 미리보기 기능
- [ ] 프로모션 이력 조회
- [ ] CSV 업로드 지원

### Phase 3: 안전장치
- [ ] 프로모션 승인 워크플로우 (Maker-Checker)
- [ ] 프로모션 롤백 기능
- [ ] 감시 로그

## 예상 효과

✅ 수당 조정 시 신속한 프로모션 실행 가능
✅ 직급/이벤트별 차별화된 보너스 제공
✅ 모든 지급 기록 자동 Ledger 저장
✅ PM이 클릭 몇 개로 대규모 프로모션 실행 가능

## 주의사항

- 프로모션 지급 시 모든 트랜잭션은 payoutLogs에 기록
- 각 프로모션은 별도 ID 부여 및 추적
- 실행 전 미리보기로 대상/금액 재확인
- 추후 돌발 승인 프로세스 추가 권장
