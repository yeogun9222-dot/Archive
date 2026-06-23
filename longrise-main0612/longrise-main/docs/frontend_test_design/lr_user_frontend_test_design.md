# LONGRISE AI 사용자 프론트엔드 Playwright 테스트 설계 문서

## 1. 문서 목적

이 문서는 RumbleSurge Generator Agent가 `lr_user-frontend/` 프론트엔드에 대한 Playwright TypeScript 테스트 코드를 생성하기 위한 설계서입니다.

**테스트 범위**: 사용자 프론트엔드의 모든 주요 사용자 경험 시나리오
**제외 범위**: 관리자 프론트엔드, 실제 금융 거래 처리, 외부 서비스 연동

## 2. 대상 프론트엔드 정보

- **프론트엔드 경로**: `lr_user-frontend/`
- **실행 URL**: 
  - 배포: `http://43.201.76.192:5173/`
  - 로컬: `http://localhost:5173/`
- **프레임워크**: React 19.0.0 + TypeScript + Vite 6.2.0
- **라우팅 방식**: 뷰 기반 상태 라우팅 (`currentView` 상태)
- **상태 관리**: React Context API + useState
- **API 클라이언트**: `src/services/api.ts` (Axios 기반)
- **주요 entry 파일**: 
  - `src/main.tsx` (메인 엔트리)
  - `src/App.tsx` (앱 컴포넌트)

## 3. 코드 기반 구조 분석

### 주요 페이지 컴포넌트
- `src/components/HomePage.tsx` - 메인 대시보드
- `src/components/PackagesPage.tsx` - 투자 패키지 선택
- `src/components/WalletPage.tsx` - 지갑 관리
- `src/components/RewardsPage.tsx` - 팀 보상
- `src/components/ProfilePage.tsx` - 사용자 프로필
- `src/components/CryptoAIPage.tsx` - AI 트레이딩
- `src/components/SecurityPage.tsx` - 보안 센터
- `src/components/SupportPage.tsx` - 고객 지원

### 주요 모달 컴포넌트
- `src/components/VIPEntranceModal.tsx` - 로그인/가입 모달
- `InvestmentModal` (App.tsx 내부) - 투자 확인 모달

### 인증 관련
- `src/contexts/AuthContext.tsx` - 인증 컨텍스트
- `src/hooks/useAuth.ts` - 인증 훅
- `src/utils/devUtils.ts` - 개발 모드 유틸리티

### API 서비스
- `src/services/api.ts` - 중앙화된 API 클라이언트

### 타입 정의
- `src/shared/types.ts` - 공통 타입
- `src/types/api.ts` - API 타입

### 테스트에 중요한 데이터
- `src/shared/mockData.ts` - SHARED_MOCK_USERS
- `src/utils/devUtils.ts` - DEV_TEST_ACCOUNTS
- `PACKAGE_POLICY` (App.tsx 내부) - 패키지 정책

## 4. 테스트 전제 조건

### 실행 전 조건
- 로컬 개발 서버 실행: `npm run dev` (port 5173)
- API 서버가 `VITE_API_BASE_URL`에서 실행 중이어야 함
- 브라우저: Chromium, Firefox, Safari 지원
- 뷰포트: Desktop (1280x720), Mobile (375x667)

### 테스트 계정
```typescript
// src/utils/devUtils.ts에 정의됨
DEV_TEST_ACCOUNTS = {
  vip1: { email: 'vip1@longrise.dev', displayName: 'VIP Tester 1', role: 'Red Dragon' },
  vip2: { email: 'vip2@longrise.dev', displayName: 'VIP Tester 2', role: 'Black Dragon' }
}
DEV_VERIFICATION_CODE = '123456'
```

### 필요한 상태
- localStorage 초기화
- 개발 모드 활성화 (`isDevelopment()` true)
- 네트워크 응답 대기 전략: 30초 타임아웃

### 브라우저 조건
- JavaScript 활성화
- 로컬 스토리지 사용 가능
- CSS 애니메이션 비활성화 (테스트 안정성)

## 5. 테스트 대상 사용자 흐름

### P0: 반드시 검증할 핵심 흐름
1. 앱 초기 렌더링
2. 로그인 프로세스 (VIP 모달)
3. 메인 네비게이션
4. 패키지 선택 및 투자 모달

### P1: 주요 기능 흐름
1. 지갑 페이지 접근
2. 프로필 페이지 접근
3. 로그아웃
4. 모바일 네비게이션

### P2: 보조/회귀 테스트 흐름
1. 언어 선택
2. 알림 드롭다운
3. 브라우저 새로고침 상태 유지
4. 에러 상태 처리

## 6. 테스트 케이스 목록 요약

| ID | 우선순위 | 이름 | 대상 화면 | 로그인 | 목적 |
|---|---|---|---|---|---|
| TC-001 | P0 | 앱 초기 렌더링 | home | 불필요 | 기본 UI 로딩 검증 |
| TC-002 | P0 | 로그인 모달 열기 | home | 불필요 | 로그인 진입점 검증 |
| TC-003 | P0 | VIP1 원클릭 로그인 | VIPEntranceModal | 진행 중 | 인증 플로우 검증 |
| TC-004 | P0 | 로그인 후 홈 대시보드 | home | 필요 | 인증된 상태 검증 |
| TC-005 | P0 | 상단 네비게이션 이동 | 전체 | 필요 | 주요 페이지 접근 |
| TC-006 | P0 | 패키지 선택 | packages | 필요 | 투자 시작점 검증 |
| TC-007 | P0 | 투자 모달 플로우 | InvestmentModal | 필요 | 투자 프로세스 검증 |
| TC-008 | P1 | 지갑 페이지 로딩 | wallet | 필요 | 자산 정보 표시 |
| TC-009 | P1 | 프로필 페이지 접근 | profile | 필요 | 사용자 정보 관리 |
| TC-010 | P1 | 로그아웃 기능 | 전체 | 필요 | 세션 종료 검증 |
| TC-011 | P1 | 모바일 하단 탭 | 전체 | 불필요 | 모바일 네비게이션 |
| TC-012 | P2 | 언어 선택 드롭다운 | 전체 | 불필요 | 국제화 기능 |
| TC-013 | P2 | 알림 드롭다운 | 전체 | 필요 | 알림 시스템 |
| TC-014 | P2 | 페이지 새로고침 유지 | 전체 | 필요 | 상태 지속성 |
| TC-015 | P0 | 콘솔 에러 없음 | 전체 | 불필요 | 기본 품질 검증 |

## 7. 상세 테스트 케이스

### TC-001 앱 초기 렌더링

- **우선순위**: P0
- **대상 화면/라우트**: `http://localhost:5173/`
- **관련 파일**: `src/main.tsx`, `src/App.tsx`, `src/components/HomePage.tsx`
- **선행 조건**: 브라우저에서 앱 URL 접속
- **테스트 데이터**: 없음
- **실행 단계**:
  1. 브라우저에서 `http://localhost:5173/` 접속
  2. 5초 내 페이지 로딩 완료 대기
  3. 주요 UI 요소 표시 확인
- **기대 결과**:
  - LONGRISE 로고 표시
  - 상단 네비게이션 바 표시
  - LOGIN 버튼 표시
  - 하단 탭바 표시 (모바일)
- **주요 Playwright assertion**:
  - `await expect(page.getByText('LONGRISE')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible()`
  - `await expect(page.getByText('CRYPTO AI')).toBeVisible()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: 'LOGIN' })`
  - text 기반: `page.getByText('LONGRISE')`
  - CSS fallback: `.font-serif:has-text("LONGRISE")`
- **실패 시 수집할 정보**:
  - screenshot
  - console error
  - network failure
  - trace
- **비고/리스크**: 애니메이션으로 인한 요소 로딩 지연 가능

### TC-002 로그인 모달 열기

- **우선순위**: P0
- **대상 화면/라우트**: `http://localhost:5173/`
- **관련 파일**: `src/App.tsx`, `src/components/VIPEntranceModal.tsx`
- **선행 조건**: 앱 초기 렌더링 완료
- **테스트 데이터**: 없음
- **실행 단계**:
  1. LOGIN 버튼 클릭
  2. VIP Entrance 모달 표시 대기
  3. 모달 내부 요소 확인
- **기대 결과**:
  - VIPEntranceModal 표시
  - "VIP Entrance" 제목 표시
  - 개발자 모드 섹션 표시 (개발 환경)
  - 닫기 버튼 표시
- **주요 Playwright assertion**:
  - `await expect(page.getByText('VIP Entrance')).toBeVisible()`
  - `await expect(page.getByText('개발자 모드')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: 'VIP1 즉시로그인' })).toBeVisible()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: 'LOGIN' })`
  - text 기반: `page.getByText('VIP Entrance')`
  - CSS fallback: `.fixed.inset-0.z-\\[200\\]`
- **실패 시 수집할 정보**:
  - screenshot
  - console error
  - modal backdrop 상태
- **비고/리스크**: 모달 애니메이션 완료 대기 필요

### TC-003 VIP1 원클릭 로그인

- **우선순위**: P0
- **대상 화면/라우트**: VIPEntranceModal
- **관련 파일**: `src/components/VIPEntranceModal.tsx`, `src/utils/devUtils.ts`
- **선행 조건**: VIP Entrance 모달 열림
- **테스트 데이터**: `vip1@longrise.dev`, 인증코드 `123456`
- **실행 단계**:
  1. "VIP1 즉시로그인" 버튼 클릭
  2. 자동 로그인 처리 대기 (1.5초)
  3. 모달 닫힘 확인
  4. 로그인 상태 확인
- **기대 결과**:
  - VIP Entrance 모달 닫힘
  - 상단 프로필 영역에 사용자 정보 표시
  - LOGIN 버튼이 사용자 프로필로 변경
- **주요 Playwright assertion**:
  - `await expect(page.getByText('VIP Entrance')).not.toBeVisible()`
  - `await expect(page.getByText('VIP Tester 1')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: 'LOGIN' })).not.toBeVisible()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: 'VIP1 즉시로그인' })`
  - text 기반: `page.getByText('VIP Tester 1')`
  - CSS fallback: `.bg-green-600\\/80`
- **실패 시 수집할 정보**:
  - screenshot
  - localStorage 상태
  - API 요청 로그
  - 인증 토큰 저장 여부
- **비고/리스크**: 네트워크 지연으로 인한 로그인 실패 가능

### TC-004 로그인 후 홈 대시보드

- **우선순위**: P0
- **대상 화면/라우트**: home view
- **관련 파일**: `src/components/HomePage.tsx`
- **선행 조건**: VIP1 로그인 완료
- **테스트 데이터**: 로그인된 사용자 데이터
- **실행 단계**:
  1. 홈 화면 로딩 확인
  2. 개인화된 컨텐츠 표시 확인
  3. 실시간 메트릭 표시 확인
- **기대 결과**:
  - 사용자별 맞춤 대시보드 표시
  - Counter 애니메이션 동작
  - MetricCard 컴포넌트들 표시
- **주요 Playwright assertion**:
  - `await expect(page.locator('.text-7xl.font-mono')).toBeVisible()`
  - `await expect(page.getByText('Dragon Wealth Packages')).toBeVisible()`
- **selector 후보**:
  - CSS fallback: `.glass-panel`
  - text 기반: `page.getByText('Dragon Wealth Packages')`
- **실패 시 수집할 정보**:
  - screenshot
  - API 응답 데이터
  - 카운터 애니메이션 상태
- **비고/리스크**: 실시간 데이터 업데이트로 인한 값 변동

### TC-005 상단 네비게이션 이동

- **우선순위**: P0
- **대상 화면/라우트**: 전체
- **관련 파일**: `src/App.tsx` Navbar 컴포넌트
- **선행 조건**: 로그인 완료
- **테스트 데이터**: 없음
- **실행 단계**:
  1. "CRYPTO AI" 버튼 클릭
  2. CryptoAIPage 로딩 확인
  3. "PACKAGES" 버튼 클릭
  4. PackagesPage 로딩 확인
  5. 각 주요 네비게이션 항목 테스트
- **기대 결과**:
  - 각 페이지 고유 컨텐츠 표시
  - 네비게이션 버튼 활성 상태 변경
  - URL 변경 없음 (뷰 기반 라우팅)
- **주요 Playwright assertion**:
  - `await expect(page.getByText('AI Trading Intelligence')).toBeVisible()`
  - `await expect(page.getByText('Dragon Wealth Packages')).toBeVisible()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: 'CRYPTO AI' })`
  - text 기반: `page.getByText('PACKAGES')`
- **실패 시 수집할 정보**:
  - screenshot
  - 현재 뷰 상태
  - 네비게이션 버튼 상태
- **비고/리스크**: 애니메이션 전환 중 요소 접근 불가

### TC-006 패키지 선택

- **우선순위**: P0
- **대상 화면/라우트**: packages view
- **관련 파일**: `src/components/PackagesPage.tsx`, `src/components/PackageSection.tsx`
- **선행 조건**: 로그인 완료, packages 페이지 접근
- **테스트 데이터**: PACKAGE_POLICY 데이터
- **실행 단계**:
  1. "PACKAGES" 네비게이션 클릭
  2. 5개 패키지 카드 표시 확인
  3. "Standard" 패키지 (POPULAR) 클릭
  4. InvestmentModal 열림 확인
- **기대 결과**:
  - 5개 패키지 카드 모두 표시
  - Standard 패키지에 "POPULAR" 배지 표시
  - 각 패키지의 가격, ROI, 기간 정보 표시
- **주요 Playwright assertion**:
  - `await expect(page.getByText('Dragon Wealth Packages')).toBeVisible()`
  - `await expect(page.getByText('POPULAR')).toBeVisible()`
  - `await expect(page.getByText('$500')).toBeVisible()`
- **selector 후보**:
  - text 기반: `page.getByText('Standard')`
  - CSS fallback: `.border-luxury-gold.shadow-\\[0_0_30px_rgba\\(234,179,8,0\\.2\\)\\]`
- **실패 시 수집할 정보**:
  - screenshot
  - 패키지 데이터 로딩 상태
  - 클릭 이벤트 처리
- **비고/리스크**: 패키지 카드 hover 효과 중 클릭 이슈

### TC-007 투자 모달 플로우

- **우선순위**: P0
- **대상 화면/라우트**: InvestmentModal
- **관련 파일**: `src/App.tsx` InvestmentModal 컴포넌트
- **선행 조건**: 패키지 선택 완료, 투자 모달 열림
- **테스트 데이터**: Standard 패키지 ($500, 9% USDT, 4% CNYT)
- **실행 단계**:
  1. 투자 요약 정보 확인 (1단계)
  2. "INVEST NOW" 버튼 클릭
  3. 취소 정책 확인 (2단계)
  4. 동의 체크박스 클릭
  5. "CONFIRM" 버튼 클릭
  6. 모달 닫힘 및 지갑 페이지 이동 확인
- **기대 결과**:
  - 1단계: 투자 금액 $500, 월 USDT 수익 표시
  - 2단계: 조기 출금 수수료 정책 표시
  - 동의 후 CONFIRM 버튼 활성화
  - 완료 후 지갑 페이지로 자동 이동
- **주요 Playwright assertion**:
  - `await expect(page.getByText('STANDARD PACKAGE')).toBeVisible()`
  - `await expect(page.getByText('$500')).toBeVisible()`
  - `await expect(page.getByRole('checkbox')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: 'CONFIRM' })).toBeEnabled()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: 'INVEST NOW' })`
  - role 기반: `page.getByRole('checkbox')`
  - text 기반: `page.getByText('V7.2 asset management policy')`
- **실패 시 수집할 정보**:
  - screenshot
  - 모달 단계 상태
  - 체크박스 상태
  - 버튼 활성화 상태
- **비고/리스크**: 2단계 플로우에서 상태 관리 복잡성

### TC-008 지갑 페이지 로딩

- **우선순위**: P1
- **대상 화면/라우트**: wallet view
- **관련 파일**: `src/components/WalletPage.tsx`
- **선행 조건**: 로그인 완료
- **테스트 데이터**: 사용자 잔액 정보
- **실행 단계**:
  1. "WALLET" 네비게이션 클릭
  2. 지갑 페이지 로딩 확인
  3. USDT/CNYT 잔액 표시 확인
  4. 거래 내역 섹션 확인
- **기대 결과**:
  - USDT 잔액 표시
  - CNYT 잔액 표시
  - 입금/출금 버튼 표시
  - 거래 내역 테이블 표시
- **주요 Playwright assertion**:
  - `await expect(page.getByText('USDT')).toBeVisible()`
  - `await expect(page.getByText('CNYT')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: /Deposit|입금/ })).toBeVisible()`
- **selector 후보**:
  - text 기반: `page.getByText('USDT')`
  - role 기반: `page.getByRole('button', { name: /Withdraw|출금/ })`
- **실패 시 수집할 정보**:
  - screenshot
  - API 잔액 요청
  - 거래 내역 데이터
- **비고/리스크**: 실시간 잔액 업데이트

### TC-009 프로필 페이지 접근

- **우선순위**: P1
- **대상 화면/라우트**: profile view
- **관련 파일**: `src/components/ProfilePage.tsx`
- **선행 조건**: 로그인 완료
- **테스트 데이터**: 사용자 프로필 정보
- **실행 단계**:
  1. 상단 프로필 아이콘 클릭
  2. 프로필 드롭다운 메뉴 표시
  3. "My Profile" 항목 클릭
  4. 프로필 페이지 로딩 확인
- **기대 결과**:
  - 사용자 정보 표시
  - KYC 상태 표시
  - 보안 설정 링크 표시
- **주요 Playwright assertion**:
  - `await expect(page.getByText('My Profile')).toBeVisible()`
  - `await expect(page.getByText('VIP Tester 1')).toBeVisible()`
- **selector 후보**:
  - text 기반: `page.getByText('My Profile')`
  - CSS fallback: `.w-9.h-9.rounded-full`
- **실패 시 수집할 정보**:
  - screenshot
  - 드롭다운 상태
  - 프로필 데이터 로딩
- **비고/리스크**: 드롭다운 클릭 타이밍

### TC-010 로그아웃 기능

- **우선순위**: P1
- **대상 화면/라우트**: 전체
- **관련 파일**: `src/App.tsx`, `src/hooks/useAuth.ts`
- **선행 조건**: 로그인 완료
- **테스트 데이터**: 없음
- **실행 단계**:
  1. 상단 프로필 아이콘 클릭
  2. 드롭다운에서 "Logout" 클릭
  3. 로그아웃 처리 확인
  4. 로그인 버튼 재표시 확인
- **기대 결과**:
  - 프로필 영역이 LOGIN 버튼으로 변경
  - localStorage에서 토큰 제거
  - 홈 화면으로 이동
- **주요 Playwright assertion**:
  - `await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible()`
  - `await expect(page.getByText('VIP Tester 1')).not.toBeVisible()`
- **selector 후보**:
  - text 기반: `page.getByText('Logout')`
  - role 기반: `page.getByRole('button', { name: 'Logout' })`
- **실패 시 수집할 정보**:
  - screenshot
  - localStorage 상태
  - API 로그아웃 요청
- **비고/리스크**: 세션 정리 타이밍

### TC-011 모바일 하단 탭

- **우선순위**: P1
- **대상 화면/라우트**: 전체 (mobile viewport)
- **관련 파일**: `src/App.tsx` BottomTabBar 컴포넌트
- **선행 조건**: 모바일 뷰포트 (375x667), 로그인 불필요
- **테스트 데이터**: 없음
- **실행 단계**:
  1. 모바일 뷰포트로 설정
  2. 하단 탭바 표시 확인
  3. 각 탭 클릭 테스트
  4. 해당 페이지 이동 확인
- **기대 결과**:
  - HOME, INVEST, WALLET, TEAM, MY 탭 표시
  - 탭 클릭 시 해당 뷰로 이동
  - 활성 탭 스타일 변경
- **주요 Playwright assertion**:
  - `await expect(page.getByText('HOME')).toBeVisible()`
  - `await expect(page.getByText('INVEST')).toBeVisible()`
- **selector 후보**:
  - text 기반: `page.getByText('HOME')`
  - CSS fallback: `.lg\\:hidden.fixed.bottom-0`
- **실패 시 수집할 정보**:
  - screenshot
  - 뷰포트 크기
  - 탭바 표시 상태
- **비고/리스크**: 뷰포트 변경 시 레이아웃 리플로우

### TC-012 언어 선택 드롭다운

- **우선순위**: P2
- **대상 화면/라우트**: 전체
- **관련 파일**: `src/App.tsx` Navbar 컴포넌트
- **선행 조건**: 데스크톱 뷰포트, 로그인 불필요
- **테스트 데이터**: LANGUAGES 배열 (7개 언어)
- **실행 단계**:
  1. 상단 언어 선택 버튼 클릭
  2. 언어 드롭다운 표시 확인
  3. 다른 언어 선택
  4. 드롭다운 닫힘 확인
- **기대 결과**:
  - 7개 언어 플래그 표시
  - 언어 선택 시 상단 플래그 변경
  - 드롭다운 자동 닫힘
- **주요 Playwright assertion**:
  - `await expect(page.getByText('🇲🇴')).toBeVisible()`
  - `await expect(page.getByText('🇺🇸')).toBeVisible()`
- **selector 후보**:
  - text 기반: 플래그 이모지
  - CSS fallback: `.w-16.bg-black.border-luxury-gold\\/50`
- **실패 시 수집할 정보**:
  - screenshot
  - 드롭다운 상태
  - 언어 변경 상태
- **비고/리스크**: 플래그 이모지 렌더링 차이

### TC-013 알림 드롭다운

- **우선순위**: P2
- **대상 화면/라우트**: 전체
- **관련 파일**: `src/App.tsx` MOCK_NOTIFICATIONS
- **선행 조건**: 로그인 완료
- **테스트 데이터**: MOCK_NOTIFICATIONS (4개 알림)
- **실행 단계**:
  1. 상단 알림 아이콘 클릭
  2. 알림 드롭다운 표시 확인
  3. 미읽은 알림 배지 확인
  4. 개별 알림 항목 확인
- **기대 결과**:
  - 4개 알림 항목 표시
  - 미읽은 알림 빨간 점 표시
  - "Mark all as read" 버튼 표시
- **주요 Playwright assertion**:
  - `await expect(page.getByText('Deposit Successful')).toBeVisible()`
  - `await expect(page.getByText('Mark all as read')).toBeVisible()`
- **selector 후보**:
  - role 기반: `page.getByRole('button', { name: /Bell|알림/ })`
  - text 기반: `page.getByText('Messages')`
- **실패 시 수집할 정보**:
  - screenshot
  - 알림 데이터
  - 배지 상태
- **비고/리스크**: 동적 알림 업데이트

### TC-014 페이지 새로고침 유지

- **우선순위**: P2
- **대상 화면/라우트**: 전체
- **관련 파일**: `src/hooks/useAuth.ts`, localStorage
- **선행 조건**: 로그인 완료, 특정 페이지 이동
- **테스트 데이터**: 저장된 인증 토큰
- **실행 단계**:
  1. 로그인 후 "PACKAGES" 페이지 이동
  2. 브라우저 새로고침 실행
  3. 로그인 상태 유지 확인
  4. 현재 페이지 유지 확인
- **기대 결과**:
  - 로그인 상태 유지
  - 마지막 페이지 유지 (home으로 리셋)
  - 사용자 정보 재로딩
- **주요 Playwright assertion**:
  - `await expect(page.getByText('VIP Tester 1')).toBeVisible()`
  - `await expect(page.getByRole('button', { name: 'LOGIN' })).not.toBeVisible()`
- **selector 후보**:
  - localStorage: `longrise_token`
  - text 기반: 사용자명 표시
- **실패 시 수집할 정보**:
  - screenshot
  - localStorage 상태
  - API checkAuth 요청
- **비고/리스크**: 토큰 만료 시 자동 로그아웃

### TC-015 콘솔 에러 없음

- **우선순위**: P0
- **대상 화면/라우트**: 전체
- **관련 파일**: 전체 애플리케이션
- **선행 조건**: 앱 실행
- **테스트 데이터**: 없음
- **실행 단계**:
  1. 앱 로딩부터 주요 액션까지 전체 플로우
  2. 콘솔 에러/경고 모니터링
  3. 네트워크 실패 모니터링
- **기대 결과**:
  - JavaScript 에러 없음
  - 404 네트워크 에러 없음
  - React warnings 없음
- **주요 Playwright assertion**:
  - 콘솔 메시지 필터링
  - 치명적 에러 없음
- **selector 후보**: 해당없음
- **실패 시 수집할 정보**:
  - console error logs
  - network failure logs
  - stack trace
- **비고/리스크**: 개발 모드 경고 제외

## 8. API 검증 포인트

| 기능 | Method | Path | 호출 위치 | 성공 기대 | 실패 기대 |
|---|---|---|---|---|---|
| 로그인 | POST | /auth/login/json | api.ts:117 | 200, access_token | 401, 에러 메시지 |
| 로그아웃 | POST | /auth/logout | api.ts:128 | 200 | - |
| 토큰 검증 | POST | /auth/test-token | api.ts:147 | 200, UserData | 401, 토큰 만료 |
| 사용자 정보 | GET | /users/me | api.ts:153 | 200, UserData | 401, 인증 실패 |
| 헬스체크 | GET | /health | api.ts:111 | 200 | 503, 서버 오류 |

## 9. 인증/세션 테스트 전략

### 로그인 상태 생성 방법
1. **원클릭 로그인**: VIP1/VIP2 즉시로그인 버튼 사용
2. **수동 로그인**: 이메일/인증코드 입력 플로우
3. **localStorage 직접 설정**: 테스트 토큰 주입

### 세션 저장 위치
- localStorage: `longrise_token` 키
- 토큰 타입: JWT Bearer Token

### 테스트 간 세션 재사용
- 가능: localStorage 토큰으로 재인증
- 권장: 각 테스트 전에 로그아웃 후 새 로그인

### 인증 실패/만료 처리
- 401 응답 시 자동 로그아웃
- `/login` 리다이렉트 처리 확인

## 10. 반응형 테스트 전략

### Desktop viewport (1280x720)
- 전체 상단 네비게이션 표시
- 사이드바/드롭다운 메뉴 동작
- 마우스 호버 효과

### Mobile viewport (375x667)
- 하단 탭바 표시
- 햄버거 메뉴 동작
- 터치 최적화 UI

### 모바일 전용 요소
- `BottomTabBar` 컴포넌트
- 모바일 드로어 메뉴
- 터치 제스처

### 레이아웃 깨짐 확인 지점
- 뷰포트 변경 시 네비게이션 전환
- 모달 크기 조정
- 텍스트 오버플로우

## 11. 안정성 규칙

### Selector 우선순위
1. `page.getByRole()` - 접근성 기반
2. `page.getByText()` - 텍스트 기반
3. `page.getByTestId()` - 테스트 ID (현재 미사용)
4. CSS selector - 마지막 수단

### 동적 컨텐츠 처리
- Counter 애니메이션: 최대 3초 대기
- API 응답: 30초 타임아웃
- 모달 애니메이션: 1초 대기

### API 응답 대기
```typescript
await page.waitForResponse(response => 
  response.url().includes('/auth/login') && response.status() === 200
);
```

### Flaky 방지 전략
- 애니메이션 비활성화: `prefers-reduced-motion`
- 안정적 요소 대기: `waitForSelector`
- 네트워크 idle 대기

## 12. 테스트 실행 산출물

### 실패 시 RumbleSurge 이슈 정보
- **현재 URL**: `page.url()`
- **Viewport**: 뷰포트 크기
- **브라우저**: Chromium/Firefox/Safari
- **Console log**: `page.locator('').evaluateAll()`
- **Network failure**: API 실패 로그
- **Screenshot**: 전체 페이지 캡처
- **Trace**: Playwright 추적 파일
- **실패 assertion**: 구체적 검증 실패 내용
- **관련 파일**: 해당 컴포넌트 경로
- **관련 API**: 실패한 API 엔드포인트

## 13. 확인 필요 항목

### 실제 테스트 환경 설정
- API 서버 URL 및 상태 확인
- 네트워크 정책 (CORS, 프록시)
- 데이터베이스 시드 데이터
- 외부 서비스 목킹 필요성

### 테스트 계정 관리
- VIP1/VIP2 계정의 실제 백엔드 존재 여부
- 테스트용 인증코드 정책
- 계정 초기화/복구 방법

### Selector 보강 필요 컴포넌트
- `data-testid` 속성 추가 고려
- 동적 CSS 클래스 대체 방안
- 애니메이션 중 안정적 접근 방법

### 성능 및 안정성
- 실시간 업데이트 비활성화 방법
- 애니메이션 제어 환경 변수
- 네트워크 지연 시뮬레이션

---
*생성일: 2026-04-30*  
*대상: lr_user-frontend/*  
*테스트 케이스: 15개*