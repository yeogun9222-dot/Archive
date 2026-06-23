---
name: admin_v4.1 현재 개발 기준점
description: v4.1 최신 상태 (1980줄, 16개 view 함수, 완전 구현)
type: project
originSessionId: 4f14d8a1-ba17-4d72-a2d0-3b027b517502
---
# admin_v4.1 개발 기준점

**파일**: `C:\Users\YG\Desktop\admin_v4.1.html`
**백업**: `C:\Users\YG\Desktop\admin_v4.1_원본.html`

## 파일 상태
- **라인 수**: 1,980줄
- **생성 시간**: 2026-04-17 15:25
- **원본 v4.0**: 451줄 (기존 구조 100% 유지)
- **증가분**: +1,529줄 (+339%)

## 구현된 기능 (16개 섹션)

### Core Functions (3대 기능)
1. **이상 거래 감지 (Anomaly Detection)** - viewDashboard() 내 카드
2. **자산 변동 로그 (Asset Logs)** - viewUsers() 탭2
3. **관리자 승인 로직 (Approval Queue)** - viewWithdrawals() 탭1

### View Functions (16개)
1. viewDashboard() - 대시보드 + 이상거래 감지
2. viewAdminMgmt() - 관리자 계정 관리
3. viewUsers() - 회원 제어 + 벌크 작업 + 자산 로그
4. viewReferrals() - 조직도 및 추천인
5. viewRanks() - 드래곤 직급 관리
6. viewProducts() - 5종 상품 제어
7. viewP2PMarket() - CNYT P2P 및 내부 이체
8. viewTokens() - LR 토큰 풀 / 시세 조정
9. viewPayouts() - 수당 자동지급 & 에러 복구
10. viewWithdrawals() - 출금 승인/반려 데스크
11. viewSupport() - 고객센터 화면 제어
12. viewNews() - 공지사항 제어
13. viewSecurity() - 보안 센터 제어
14. viewWOF() - Wall of Fame 제어
15. viewTickets() - 고객 문의 관리
16. viewSettings() - 시스템 설정

## 유틸리티 함수 (6개)
- toggleUserSelection(userId) - 개별 회원 선택
- toggleSelectAll(checked) - 전체 선택
- updateBulkBar() - 벌크 바 갱신
- bulkApproveKYC() - KYC 일괄 승인
- bulkSetStatus(newStatus) - 상태 일괄 변경
- calculateAnomalyRisk(userId) - 위험도 자동 계산

## 핸들러 함수 (2개)
- approveWithdrawal(approvalId, note) - 출금 승인 + 자동 기록
- rejectWithdrawal(approvalId, note) - 출금 반려 + 이력 저장

## 데이터베이스 구조
### db.anomalyAlerts (5건 샘플)
- 이상 거래 5건 (critical/warning/info)

### db.assetLogs (6건 샘플)
- 자산 변동 로그 (Deposit/Withdrawal/Reward)

### db.approvalQueue (1건 대기)
- 출금 승인 대기 (WD-9921)

### db.approvalHistory (1건 완료)
- 승인 이력 (APH-001)

## 설계 원칙 (100% 준수)
✅ v4.0 코드 100% 보존 (삭제 0건)
✅ CSS/색상/레이아웃 일관성 유지
✅ 기존 메뉴 구조 유지 (15개 항목)
✅ 에러 바운더리 함수 유지
✅ 탭 네비게이션 추가 (비침투적)
✅ 벌크 작업 UI 추가 (display:none 기본값)

## 렌더링 구조
- render() → renderSidebar/renderTopbar/getViewContent/renderModals
- setupTabListeners() - 탭 클릭 핸들러
- setupDropdownListener() - 드롭다운 (기존)

## 다음 작업 지침
- admin_v4.1.html을 항상 최신 기준으로 사용
- 새로운 기능은 admin_v4.2.html로 분리 작업
- v4.1_원본.html과 비교하여 변경점 추적
- 코드 추가만 허용 (삭제 절대 금지)
