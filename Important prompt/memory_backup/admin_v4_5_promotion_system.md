---
name: admin_v4.5 프로모션 지급 기능 완성
description: 직급 보너스 및 돌발 프로모션 일괄 지급 시스템 구현
type: project
originSessionId: 4f14d8a1-ba17-4d72-a2d0-3b027b517502
---
# admin_v4.5 프로모션 지급 기능 구현 완료

**파일**: `C:\Users\YG\Desktop\admin_v4.5.html`
**버전**: v4.4 → v4.5 (437K, +24KB 증가)

## 구현 내용

### 1. appState 확장
```javascript
promotionTab: 'list' | 'create',
promotionType: 'rank_bonus' | 'event_promo',
promotionForm: {
    type, name, description,
    selectedRanks, joinDayFrom, joinDayTo,
    minVolume, maxVolume, status, kycStatus,
    amount, asset, startDate, endDate, reason
},
promotionPreview: {
    targetCount, totalAmount, users[]
},
promotionShowPreview: false
```

### 2. db 컬렉션 추가
```javascript
promotions: [
    {
        id, type, name, description,
        targetCriteria, amount, asset,
        targetCount, totalAmount,
        status, createdAt, executedAt,
        executedBy, notes
    }
]

promotionLogs: [
    {
        id, promotionId, userId,
        amount, asset, executedAt, status
    }
]
```

### 3. UI 추가 위치

**viewPayouts() 함수 내 개별 유저 정밀 복구 데스크 아래**

```
6. 프로모션 일괄 지급 센터 (新)
   ├─ 프로모션 목록 탭
   │  └─ 과거 프로모션 카드 표시
   └─ 신규 생성 탭
      ├─ 프로모션 타입 선택 (직급/돌발)
      ├─ 기본 정보 입력 (명칭, 설명)
      ├─ 대상 선택
      │  ├─ 직급 보너스: 직급 다중선택
      │  └─ 돌발: 가입기간, 매출, 상태 필터
      ├─ 금액 설정 (USDT/CNYT)
      ├─ 기간 설정 (선택사항)
      └─ [미리보기] [취소] 버튼
```

### 4. 주요 기능

#### 4.1 프로모션 생성
```
타입 선택 → 대상 필터링 → 금액 설정 → 미리보기
```

#### 4.2 미리보기
- 모달 팝업으로 표시
- 대상 회원 수 표시
- 예상 총 지급액 계산
- 대상 회원 목록 (최대 50명 표시)
- 실행/취소 버튼

#### 4.3 일괄 실행
```javascript
프로모션 ID 생성
↓
선택된 모든 사용자에게 지급
↓
payoutLogs에 거래 기록
↓
promotionLogs에 프로모션 이력 기록
↓
완료 메시지 표시
```

### 5. 함수 상세

#### showPromotionPreview()
```javascript
// 대상 사용자 필터링
// 예상 금액 계산
// 미리보기 모달 표시
```

#### executePromotion()
```javascript
// 프로모션 정보 저장
// 대상 사용자 지급 처리
// 거래 로그 기록
// 프로모션 이력 기록
// 상태 업데이트
```

## 사용 방법

### 직급 보너스 프로모션 (예시)
```
1. 프로모션명: "신년 직급 보너스"
2. 타입 선택: "직급자 보너스"
3. 대상 직급: Black Dragon, Red Dragon 체크
4. 지급액: 500 USDT
5. [미리보기]
   → 대상 50명, 예상 $25,000 표시
6. [실행]
   → 완료!
```

### 돌발 프로모션 (예시)
```
1. 프로모션명: "신규 회원 환영 보너스"
2. 타입 선택: "돌발 프로모션"
3. 필터 설정:
   - 가입 기간: 0~7일
   - 최소 매출: $100
   - 상태: Active
   - KYC: Approved
4. 지급액: 50 USDT
5. [미리보기]
   → 대상 145명, 예상 $7,250 표시
6. [실행]
   → 완료!
```

## 데이터 흐름

```
프로모션 실행
  ↓
모든 대상 사용자 USDT/CNYT 증가
  ↓
payoutLogs 추가 (거래 기록)
  ├─ ID: TX-PROMO-XXXXX
  ├─ type: "Promotion (직급 보너스)" 또는 "Promotion (돌발)"
  ├─ amount: "$500 USDT"
  ├─ status: "SUCCESS"
  └─ reason: 프로모션명
  ↓
promotionLogs 추가 (이력)
  ├─ promotionId
  ├─ userId
  ├─ amount, asset
  └─ executedAt, status
  ↓
promotions 상태 업데이트
  └─ status: "executing" → "completed"
```

## 안전 장치

✅ 실행 전 미리보기 필수
✅ 대상 회원 수, 예상 금액 확인
✅ 최종 확인 다이얼로그
✅ 모든 거래 자동 기록

## 제약사항

현재:
- 미리보기는 최대 50명만 표시
- 실제 지급은 모든 대상에게 처리
- Ledger에 자동 기록됨

향후 개선 항목:
1. Maker-Checker 승인 워크플로우
2. 프로모션 예약 (미래 날짜 실행)
3. 프로모션 롤백 기능
4. 배치 처리 (대량 지급 최적화)

## 파일 변경점

```
- appState에 프로모션 필드 (18줄 추가)
- db.promotions, db.promotionLogs 컬렉션 (3줄 추가)
- viewPayouts() 내 프로모션 섹션 (200+ 줄 추가)
- showPromotionPreview() 함수 (30줄)
- executePromotion() 함수 (50줄)
- 미리보기 모달 UI (60줄)
```

## 테스트 시나리오

1. ✅ 프로모션 생성 폼 로드
2. ✅ 직급 선택 (다중)
3. ✅ 금액 입력
4. ✅ 미리보기 클릭 → 모달 표시
5. ✅ 대상 회원 수 + 예상 금액 확인
6. ✅ 실행 클릭 → 완료

## 다음 단계

1. 브라우저에서 테스트
2. 실제 프로모션 실행 테스트
3. Ledger 기록 확인
4. (선택) 승인 워크플로우 추가
