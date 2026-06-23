---
name: Admin Panel 최종 단순화 및 구현 계획 (확정)
description: 복잡성 제거, 메뉴 8개로 축소, 4주 로드맵 확정
type: project
originSessionId: c20b5c11-fb54-4367-ba96-1532ccbff5b3
---
# 🎯 LONGRISE Admin Panel - 최종 단순화 확정

## 최종 결정사항 (2026-04-24)

### 1. 공지 발송 시스템
- **결정:** C (Admin 페이지에서 제거)
- **이유:** CMS 도구에서 별도 관리 (업무 분리)
- **영향:** 메뉴 개수 감소, Admin 집중력 강화

### 2. 우선 구현 순서
```
Phase 1 (1주): Dashboard + Users 개선
Phase 2 (1주): UserDetailPanel + Approvals
Phase 3 (1주): Settings 페이지
Phase 4 (3-4일): UI 통일 + 감사로그
```

### 3. 디자인 색감 팔레트
- **상태:** 현재 팔레트 확정
- 배경: #0f172a, #1e293b
- 텍스트: #f8fafc, #94a3b8
- 강조: #38bdf8, #4ade80, #fbbf24, #dc2626

---

## 최종 메뉴 구조 (8개로 축소)

```
📊 핵심 운영
├─ Dashboard (Reserve + Alert + Pending)

👥 회원 관리
├─ Users (조회 + 기본 제어)
└─ Settings (정책 설정)

✅ 승인 센터
└─ Approvals (모든 승인 통합)

🔒 보안
└─ Audit Logs (자동 기록)

🎨 콘텐츠 관리
└─ (랜딩페이지 등 기존)
```

## 삭제 항목
- PayoutEngine
- WithdrawalDesk
- ReconciliationCenter
- TokenControl
- ProductControl (기본만)
- P2PMarket

---

## Phase별 구현 항목

### Phase 1: Dashboard + Users (1주)

**Dashboard:**
- Reserve 수치 카드 (큰 폰트)
- Alert 섹션 (🔴 위험 회원 수)
- Pending 섹션 (승인 대기 건수)
- 이달 주요 수치 (신규, 배당, 비활성)

**Users:**
- 상태 자동 색상 (🟢🟡🔴)
- 기본 필터 (검색, 직급, 상태)
- 테이블 정리 (회원명, 직급, 잔액, 상태만)

### Phase 2: UserDetailPanel + Approvals (1주)

**UserDetailPanel:**
- 기본 정보 (이름, 직급, Body Value, 가입일)
- 자산 정보 (USDT, CNYT, 배당, 락업)
- 제어 4개 (출금 차단, KYC 초기화, 거래비번 초기화, 정지)
- 감사 로그 (최근 5개)

**Approvals:**
- 출금 신청 표시
- 검증 팝업 ("정말 승인하시겠습니까?")
- 승인/거부 버튼
- 승인 이력

### Phase 3: Settings (1주)

**Settings 페이지:**
- CNYT 가격 설정
- 락업 기간 설정
- 배당 규칙 설정
- 경고 규칙 설정 (자동 색상 규칙)

### Phase 4: UI 통일 + 감사로그 (3-4일)

**UI/UX:**
- Dark Mode 색감 일관성 (모든 모달, 팝업)
- 기본 필터만 노출 (고급 필터 숨김)
- 호버 효과, 아이콘 정렬

**감사로그:**
- Admin 작업 자동 기록
- 조회 기능

---

## 기술 정책

### 자동화 원칙
1. **Backend 계산:** CNYT, 직급, 색상은 Backend에서 자동
2. **Admin 설정:** Settings 페이지에서만 수정 가능
3. **자동 기록:** 모든 작업 자동 로깅

### UI 원칙
1. **한눈에:** Dashboard 3-5개 카드만
2. **최소 제어:** 승인 센터에서만 승인/거부
3. **상태 조회:** Users에서만 조회, 상태 색상 자동

---

## 예상 결과

| 항목 | 이전 | 이후 | 개선도 |
|------|------|------|--------|
| 메뉴 수 | 18개 | 8개 | ↓ 56% |
| Dashboard 항목 | 9개+ | 3개 | ↓ 67% |
| Admin 매일 봐야 할 것 | 많음 | 3가지 | ↓ 85% |
| 사용자 만족도 | 낮음 | 높음 | ↑ |
