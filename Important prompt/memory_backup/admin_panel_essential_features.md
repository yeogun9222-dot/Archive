---
name: LONGRISE Admin Panel 필수 관리 기능 (회원 제어 기반)
description: LONGRISE-AI-MAIN 회원 데이터 흐름 분석 → LONGRISE-AI-ADMIN 필수 제어 기능
type: project
originSessionId: c20b5c11-fb54-4367-ba96-1532ccbff5b3
---
# 🎯 LONGRISE Admin Panel - 필수 기능 분석 & 구조 개선

## 📊 분석 대상

### **LONGRISE-AI-MAIN (회원용 웹앱)**
회원이 생성하는 데이터 흐름:
```
회원 가입 → KYC 인증 → 패키지 투자 → 배당 수령 → 지갑 관리 → 출금 신청
```

### **LONGRISE-AI-ADMIN (관리자용 패널)**
현재 구현된 30+개 뷰:
- Dashboard, UserManagement, PayoutEngine, WithdrawalDesk, ProductControl 등

---

## 🔍 LONGRISE-AI-MAIN 회원 데이터 구조

### **회원이 보유한 데이터**
```typescript
interface UserData {
  // 기본 정보
  name: string;              // GoldenDragon
  rank: string;              // Blue Dragon
  package: string;           // Platinum
  memberType: string;        // Distributor
  email: string;
  phone: string;
  walletAddress: string;
  
  // 자산 정보
  balanceUSDT: number;       // 142500.50
  balanceCNYT: number;       // 85000.00
  joinDate: string;
  initialInvestment: number; // $1000
  
  // KYC 정보
  kycLevel: number;          // 0-2
  kycProgress: number;       // 0-100%
  
  // 거래 비밀번호
  tradingPassword: string;
  hasSetTradingPassword: boolean;
  isTradingPasswordVerified: boolean;
  
  // 디스트리뷰터 상태
  distributorStatus: 'none' | 'pending' | 'approved';
  distributorCode: string | null;
}
```

### **패키지 체계**
```typescript
const PACKAGE_POLICY = {
  flexible:  { usdt: 4%,   cnyt: 0%,  min: $100 },
  basic:     { usdt: 7%,   cnyt: 2%,  min: $200 },
  standard:  { usdt: 9%,   cnyt: 4%,  min: $500 },
  premium:   { usdt: 11%,  cnyt: 6%,  min: $1000 },
  vip:       { usdt: 18%,  cnyt: 10%, min: $5000 },
};
```

---

## ✅ LONGRISE-AI-ADMIN 현재 구현 상태

### **구현됨 (19개)**
✅ Dashboard - 종합 대시보드
✅ UserManagement - 회원 관리
✅ PayoutEngine - 수당 정산
✅ WithdrawalDesk - 출금 승인
✅ ProductControl - 상품 제어
✅ TokenControl - 토큰 시세
✅ ReferralTree - 조직도
✅ ReconciliationCenter - 회계 대사
✅ SupportBoard - CS 데스크
✅ SystemSettings - 환경설정
✅ P2PMarket - P2P 이체
✅ Approvals - 승인 센터
✅ FDSMonitoring - 이상거래 탐지
✅ P2PDisputes - P2P 분쟁
✅ AdminManagement - 관리자 계정
✅ NewsManagement - 공지사항
✅ PolicySecurity - 정책/보안
✅ FrontEndControl - 프론트엔드 제어
✅ MemberDashboard - 회원 자산 대시보드

### **부분 구현/필요한 것들**
⚠️ KYCVerification - 얼굴인증 상태 관리
⚠️ LandingPageControl - 랜딩 페이지
⚠️ AuthPolicyControl - 인증 정책
⚠️ 기타 FrontEnd 컨트롤

---

## 🚨 **필수로 추가/개선해야 할 기능**

### **1️⃣ 회원 실시간 모니터링 (핵심)**

#### **1.1 회원 자산 변동 감시**
```
필요한 기능:
- 회원별 USDT 변동 로그
- 회원별 CNYT 변동 로그
- 일일 변동액 통계
- 의심거래 플래그 (FDS 연동)
```

**현재 상태**: PayoutEngine, FDSMonitoring이 있지만 통합 모니터링 부족

**개선안**:
- Dashboard에 "회원 자산 변동 TOP 10" 섹션
- UserManagement에 개별 회원의 자산 변동 그래프
- 실시간 알림 (대액 출금, 비정상 수익률 등)

---

### **2️⃣ KYC 상태 관리 (필수)**

#### **2.1 얼굴인증 진행도 추적**
```
필요한 정보:
- kycLevel (0 = 미인증, 1 = 단계1, 2 = 완료)
- kycProgress (0-100%)
- 인증 날짜
- 인증 상태 (pending/approved/rejected)
- 재인증 필요 여부
```

**현재 상태**: KYCVerification 컴포넌트 미구현

**개선안**:
```
KYCVerification 탭:
├─ 대기 중 (Pending) - 검토 필요한 사용자
├─ 승인됨 (Approved) - 인증 완료
├─ 거부됨 (Rejected) - 재제출 필요
├─ 검색/필터 기능
└─ 일괄 승인/거부 버튼
```

---

### **3️⃣ 거래 비밀번호 관리 (필수)**

#### **3.1 거래 비밀번호 설정 추적**
```
필요한 정보:
- hasSetTradingPassword (boolean)
- isTradingPasswordVerified (boolean)
- 설정 날짜
- 마지막 변경일
- 초기화 필요 여부
```

**현재 상태**: UserManagement에 없음

**개선안**:
```
UserManagement에 추가 컬럼:
- 거래 비밀번호 상태 (설정됨/미설정/검증필요)
- 개별 회원 상세보기에서 "비밀번호 초기화" 버튼
- 비밀번호 설정 미완료 회원 목록
```

---

### **4️⃣ 디스트리뷰터 관리 (신규)**

#### **4.1 디스트리뷰터 신청 관리**
```
필요한 정보:
- distributorStatus ('none' | 'pending' | 'approved')
- distributorCode (자동 생성)
- 신청 날짜
- 승인 날짜
```

**현재 상태**: 없음

**개선안**:
```
새 탭: "👥 디스트리뷰터 관리"
├─ 신청 대기 (Pending) - 승인/거부
├─ 승인됨 (Approved) - 코드 관리
├─ 거부됨 - 사유 관리
└─ 통계 (활성 디스트리뷰터 수, 수수료 현황)
```

---

### **5️⃣ 배당 분배 투명성 (개선)**

#### **5.1 회원별 배당 상세 내역**
```
필요한 정보:
- 투자 패키지별 배당 계산 상세
- USDT 배당 (월별)
- CNYT 배당 (월별)
- 추천 수당
- 롤업 수당
- 배당 지급 히스토리
```

**현재 상태**: PayoutEngine에 있지만 회원 입장에서 확인 불가

**개선안**:
```
UserManagement > 상세보기 > "배당 내역" 탭:
├─ 월별 배당 내역
├─ 패키지별 배당률 표시
├─ 수당 계산 상세 (추천, 롤업, 글로벌풀)
└─ CSV 내보내기
```

---

### **6️⃣ P2P 이체 관리 (강화)**

#### **6.1 P2P 거래 추적**
```
필요한 정보:
- 송금자/수신자
- 금액 (USDT/CNYT)
- 거래 시간
- 상태 (대기/완료/거절)
- 분쟁 여부
```

**현재 상태**: P2PMarket, P2PDisputes가 있음

**개선안**:
- P2P 거래 실시간 모니터링 (Dashboard에 추가)
- 자동 분쟁 탐지 (FDS 연동)
- 빠른 분쟁 해결 도구

---

### **7️⃣ 출금 프로세스 강화 (현재 기본 수준)**

#### **7.1 출금 신청 상세 관리**
```
필요한 정보:
- 신청 시간
- 지갑 주소
- 금액
- 수수료
- 예상 도착 시간
- 트랜잭션 ID (승인 후)
- 실패 사유 (거부 시)
```

**현재 상태**: WithdrawalDesk 기본 구현

**개선안**:
- 자동 검증 규칙 (이상거래 탐지)
- 빠른 승인 경로 (소액은 자동 승인)
- 거부 이유 템플릿
- 출금 통계 (일일/주간/월간)

---

### **8️⃣ 회원 생명주기 관리 (신규)**

#### **8.1 회원 상태 추적**
```
가능한 상태:
- 신규: 가입 후 KYC 미완료
- 활성: KYC 완료, 정상 거래
- 거래정지: 이상거래 탐지
- 휴면: 30일 이상 활동 없음
- 탈퇴: 계정 삭제
```

**현재 상태**: 없음

**개선안**:
```
Dashboard 또는 UserManagement에 추가:
├─ 회원 상태별 현황 (수/%)
├─ 상태 변경 이력
├─ 자동 휴면 처리
└─ 상태별 액션 버튼
```

---

### **9️⃣ 패키지 수명주기 관리 (개선)**

#### **9.1 패키지별 만기 관리**
```
필요한 정보:
- 투자 날짜
- 만기 날짜
- 남은 기간
- 상태 (활성/만기근임/만료)
- 자동 갱신 여부
```

**현재 상태**: ProductControl에 있지만 회원별 패키지 상태 추적 미흡

**개선안**:
```
ProductControl 강화:
├─ 활성 패키지 현황 (종류별, 금액별)
├─ 만기 예정 패키지 (2주 내 만기)
├─ 만료된 패키지
└─ 자동 갱신 정책 설정
```

---

### **🔟 보안 이벤트 로깅 (필수)**

#### **10.1 모든 관리 작업 감사 로그**
```
필수 기록:
- 누가 (adminId, adminName)
- 언제 (timestamp)
- 무엇을 (action: 잔액조정, 출금승인 등)
- 어떤 회원에게 (userId)
- 변경 전/후 (changes)
- IP 주소
```

**현재 상태**: AdminManagement, AuditLog 타입 정의됨

**개선안**:
```
새 탭: "📋 감사 로그"
├─ 관리자별 작업 이력
├─ 회원별 변경 이력
├─ 날짜/시간 필터
├─ 작업 유형별 필터
├─ 조회/내보내기
└─ 이상 활동 자동 플래그
```

---

## 🎯 **우선순위별 구현 순서**

### **PHASE 1: 즉시 필수 (1주)**
1. ✅ KYC 관리 완전 구현
2. ✅ 거래 비밀번호 상태 추적 (UserManagement 강화)
3. ✅ 배당 내역 상세 조회 (AdminUserDetailPanel 확장)
4. ✅ 감사 로그 대시보드 추가

### **PHASE 2: 중요 (2주)**
5. ✅ 디스트리뷰터 관리 섹션
6. ✅ 회원 생명주기 관리
7. ✅ 출금 자동화 강화
8. ✅ 실시간 모니터링 (Dashboard)

### **PHASE 3: 최적화 (3주)**
9. ✅ 패키지 수명주기 관리
10. ✅ 성능 최적화
11. ✅ UI/UX 개선

---

## 📁 **구조 개선안**

### **현재 구조**
```
App.tsx
├─ Sidebar (30+ 뷰)
├─ TopBar
└─ Main Content (각 뷰)
```

### **개선된 구조**
```
App.tsx
├─ Sidebar (35+ 뷰로 확장)
├─ TopBar (개선: 검색, 알림, 필터)
├─ GlobalMonitoring (실시간 대시보드)
└─ Main Content
    ├─ Dashboard (강화: 회원 모니터링, 이상거래)
    ├─ Member Management (회원 생명주기)
    │  ├─ UserManagement
    │  ├─ KYCVerification
    │  ├─ DistributorManagement
    │  └─ MemberLifecycle
    ├─ Financial (배당/출금)
    │  ├─ PayoutEngine (상세 내역 추가)
    │  ├─ WithdrawalDesk (자동화 강화)
    │  └─ P2PMarket
    ├─ Compliance (보안/감시)
    │  ├─ FDSMonitoring (강화)
    │  ├─ AuditLog (신규)
    │  └─ SecurityEvents (신규)
    └─ Configuration
       ├─ Products
       ├─ AdminManagement
       └─ SystemSettings
```

---

## 🔧 **기술 구현 체크리스트**

### **필수 컴포넌트**
- [ ] KYCVerification (완전)
- [ ] DistributorManagement (신규)
- [ ] MemberLifecycle (신규)
- [ ] AuditLogViewer (신규)
- [ ] SecurityEventMonitoring (신규)
- [ ] EnhancedPayoutDetail (신규)

### **필수 데이터 모델 추가**
- [ ] 회원 생명주기 상태
- [ ] KYC 상태 상세
- [ ] 거래 비밀번호 상태
- [ ] 디스트리뷰터 정보
- [ ] 감사 로그 상세

### **필수 기능 강화**
- [ ] AdminUserDetailPanel (배당 내역 추가)
- [ ] Dashboard (실시간 모니터링 추가)
- [ ] UserManagement (회원 생명주기 표시)
- [ ] FDSMonitoring (더 똑똑한 탐지)

---

