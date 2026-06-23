# LONGRISE AI 사용자 프론트엔드 설계문서

## 1. 대상 프론트엔드

**경로**: `lr_user-frontend/`
**플랫폼**: React 19.0.0 + TypeScript 기반 싱글 페이지 애플리케이션 (SPA)
**빌드 도구**: Vite 6.2.0
**스타일링**: TailwindCSS v4 + 커스텀 CSS 애니메이션

## 2. 목표와 범위

### 목표
- 암호화폐 투자 플랫폼의 사용자 대시보드 제공
- VIP 패키지 기반 투자 시스템 관리
- 실시간 자산 추적 및 보상 관리
- 모바일 우선 반응형 UI/UX 구현

### 범위
- 사용자 인증 및 프로필 관리
- 5단계 투자 패키지 시스템 (Flexible~VIP)
- USDT/CNYT 지갑 관리
- 팀 보상 시스템
- 실시간 거래 데이터 표시
- 보안 센터 및 KYC 인증

## 3. 현재 구조 분석

### 아키텍처 패턴
- **뷰 기반 라우팅**: `currentView` 상태로 페이지 전환 관리
- **컨테이너-프레젠테이션 패턴**: App.tsx가 상태 관리, 각 페이지는 UI 렌더링
- **컨텍스트 기반 상태 관리**: AuthContext로 인증 상태 전역 관리
- **성능 최적화**: 조건부 애니메이션 및 실시간 업데이트 제어

### 주요 디렉토리 구조
```
src/
├── components/          # 페이지 컴포넌트들
├── contexts/           # React Context (AuthContext)
├── hooks/              # 커스텀 훅 (useAuth)
├── services/           # API 서비스 (Axios 기반)
├── shared/             # 공통 타입 및 목 데이터
├── types/              # API 타입 정의
└── utils/              # 유틸리티 함수들
```

## 4. 핵심 사용자 흐름

### 비로그인 사용자
1. **홈페이지 접근** → 플랫폼 소개 및 실시간 메트릭 확인
2. **패키지 둘러보기** → 5단계 투자 플랜 정보 확인
3. **로그인/가입 모달** → VIPEntranceModal을 통한 인증

### 로그인 사용자
1. **대시보드 접근** → 개인화된 홈 화면
2. **투자 실행** → 패키지 선택 → InvestmentModal → 투자 확인
3. **자산 관리** → 지갑 페이지에서 USDT/CNYT 관리
4. **팀 관리** → 추천 시스템 및 보상 확인
5. **프로필 관리** → 보안 설정 및 KYC 인증

## 5. 화면 구조

### 공통 레이아웃
- **Navbar**: 상단 네비게이션 (데스크톱)
  - 브랜딩 영역: LONGRISE 로고
  - 메인 네비게이션: CRYPTO AI, PACKAGES, REWARDS, MARKET, WALLET
  - 사용자 영역: 알림, 언어선택, 프로필 드롭다운
- **BottomTabBar**: 하단 탭 (모바일)
- **Footer**: 플랫폼 정보 및 링크

### 메인 페이지들
- **HomePage**: 실시간 메트릭, 패키지 섹션, AI 트레이딩 데모
- **PackagesPage**: 5단계 투자 패키지 그리드
- **WalletPage**: 자산 현황, 거래 내역, 입출금 인터페이스
- **RewardsPage**: 팀 구조, 보상 내역, 추천 시스템
- **CryptoAIPage**: AI 트레이딩 인터페이스 및 성과
- **ProfilePage**: 개인 정보, KYC 상태, 계정 설정

### 보조 페이지들
- **SecurityPage**: 보안 설정, 2FA, 거래 비밀번호
- **SupportPage**: 고객 지원, 티켓 시스템
- **NoticesPage**: 공지사항 및 업데이트
- **DocumentationPage**: 플랫폼 가이드 및 문서

## 6. 상태 / 데이터 모델

### 전역 상태 (App.tsx)
```typescript
- currentView: View              // 현재 활성 페이지
- isLoggedIn: boolean           // 로그인 상태
- user: UserData                // 사용자 정보
- selectedPkg: string | null    // 선택된 투자 패키지
```

### 사용자 데이터 모델 (UserData)
```typescript
interface UserData {
  id: string;                   // 고유 ID
  nickname: string;             // 사용자명
  email: string;                // 이메일
  rank: string;                 // 등급 (Dragon 시리즈)
  balanceUSDT: number;          // USDT 잔액
  balanceCNYT: number;          // CNYT 토큰
  package: string;              // 투자 패키지
  initialInvestment: number;    // 초기 투자액
  teamSize: number;             // 팀 크기
  teamVol: number;              // 팀 볼륨
  kycLevel: number;             // KYC 레벨 (0-3)
  hasSetTradingPassword: boolean; // 거래 비밀번호 설정 여부
}
```

## 7. 필요한 API 목록

### 인증 관련
- `POST /auth/login/json` - 로그인
- `POST /auth/logout` - 로그아웃  
- `POST /auth/refresh` - 토큰 갱신
- `POST /auth/test-token` - 토큰 검증

### 사용자 관리
- `GET /users/me` - 현재 사용자 정보
- `PUT /users/me` - 사용자 정보 업데이트
- `POST /users/` - 사용자 생성
- `GET /users/count/total` - 사용자 통계

### 투자 및 지갑 (추정)
- `GET /wallet/balance` - 지갑 잔액
- `POST /investment/create` - 투자 생성
- `GET /transactions` - 거래 내역
- `POST /withdrawal/request` - 출금 요청

## 8. 컴포넌트 / 라우팅 매핑

### 라우팅 구조 (뷰 기반)
```typescript
type View = 'home' | 'crypto-ai' | 'packages' | 'rewards' | 
           'wallet' | 'profile' | 'security' | 'support' | 
           'notices' | 'settings' | 'cnyt-market' | 'about' | 
           'documentation' | 'referral-program' | 
           'usdt-onboarding' | 'usdt-fraud-report';
```

### 컴포넌트 매핑
- `home` → `HomePage`
- `packages` → `PackagesPage` → `PackageSection`
- `wallet` → `WalletPage`
- `profile` → `ProfilePage`
- `crypto-ai` → `CryptoAIPage`
- `rewards` → `RewardsPage`

### 모달 컴포넌트들
- `VIPEntranceModal`: 로그인/가입 모달
- `InvestmentModal`: 투자 확인 모달 (2단계 프로세스)

## 9. 예외 상황 / 엣지 케이스

### 인증 관련
- **토큰 만료**: 자동 로그아웃 및 로그인 페이지 리다이렉트
- **네트워크 오류**: 에러 메시지 표시 및 재시도 옵션
- **권한 부족**: 적절한 안내 메시지 및 요구사항 안내

### 투자 프로세스
- **투자 전 요구사항**: KYC 미인증, 거래 비밀번호 미설정 시 RequirementModal 표시
- **잔액 부족**: 투자 금액 검증 및 충전 안내
- **패키지 제한**: 사용자 등급별 접근 가능 패키지 제한

### UI/UX
- **성능 모드**: 저사양 디바이스를 위한 애니메이션 비활성화
- **모바일 최적화**: 터치 인터페이스 및 반응형 레이아웃
- **로딩 상태**: 데이터 로딩 중 스켈레톤 UI 표시
- **빈 상태**: 거래 내역, 팀 목록 등 데이터 없을 때 적절한 안내

## 10. 구현 순서

### Phase 1: 핵심 인프라 (완료됨)
1. ✅ 프로젝트 설정 및 빌드 환경
2. ✅ 기본 라우팅 시스템
3. ✅ AuthContext 및 API 서비스
4. ✅ 공통 레이아웃 (Navbar, BottomTabBar)

### Phase 2: 주요 페이지 (완료됨)  
1. ✅ HomePage - 메트릭 및 패키지 소개
2. ✅ PackagesPage - 투자 플랜 선택
3. ✅ WalletPage - 자산 관리
4. ✅ ProfilePage - 사용자 정보 관리

### Phase 3: 고급 기능 (완료됨)
1. ✅ 실시간 데이터 업데이트
2. ✅ 애니메이션 및 시각 효과
3. ✅ 모바일 최적화
4. ✅ 성능 최적화 설정

### Phase 4: 추가 최적화 (진행 가능)
1. 🔄 API 에러 핸들링 강화
2. 🔄 오프라인 지원
3. 🔄 PWA 기능 추가
4. 🔄 접근성 개선

## 11. 수용 기준

### 기능적 요구사항
- ✅ 사용자 인증 (로그인/로그아웃) 정상 동작
- ✅ 5단계 투자 패키지 선택 및 투자 프로세스 완료
- ✅ 실시간 자산 잔액 표시
- ✅ 팀 구조 및 보상 시스템 표시
- ✅ 모든 주요 페이지 네비게이션 동작

### 비기능적 요구사항  
- ✅ 모바일/데스크톱 반응형 지원
- ✅ 3초 이내 초기 로딩 완료
- ✅ 부드러운 페이지 전환 애니메이션
- ✅ WCAG 2.1 AA 접근성 기준 준수
- ✅ 크로스 브라우저 호환성 (Chrome, Safari, Firefox)

### 보안 요구사항
- ✅ JWT 토큰 기반 인증 구현
- ✅ API 요청 시 자동 토큰 첨부
- ✅ 토큰 만료 시 자동 로그아웃
- ✅ 민감 정보 localStorage 저장 최소화

---

*생성일: 2026-04-30*  
*대상 프론트엔드: lr_user-frontend/*  
*문서 버전: v1.0*