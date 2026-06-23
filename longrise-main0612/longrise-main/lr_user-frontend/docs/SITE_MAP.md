# Longrise User Frontend — Site Map

> 새 세션에서 본 프론트엔드 작업 시 자동 주입되는 사전 지식 문서.
> **본 문서는 라우트/페이지/모달/주요 버튼에 대한 단일 진실 공급원의 인덱스 역할**을 한다.
> 코드와의 동기화 책임은 아래 "유지보수 규칙"을 따른다.

---

## 0. 유지보수 규칙 (필독)

다음 작업을 수행할 때는 **반드시 이 문서도 함께 업데이트**한다.

| 코드 변경 | 본 문서에서 갱신해야 할 섹션 |
|---|---|
| `src/App.tsx`의 `View` 유니언(App.tsx:83)에 항목 추가/삭제/이름변경 | §3 페이지 전체 목록 |
| 새 페이지 컴포넌트(`src/components/*Page.tsx`) 추가/제거 | §3 페이지 전체 목록 |
| 새 모달 컴포넌트 추가 또는 인라인 모달 분리 | §4 모달 |
| GNB / BottomTabBar 항목 변경 (App.tsx 내 `navItems`, `items`) | §2.1, §2.2 |
| 푸터 / 플로팅 버튼 / 네브바 보조 버튼 추가·제거 | §2.3, §2.4 |
| 인증·라우팅 게이트 로직 변경 (`handlePackageSelect` 등) | §5 인증/게이팅 |
| 디자인 토큰·환경변수·API 베이스 경로 등 핵심 참조 위치 변경 | §6 자주 쓰는 참조 위치 |

PR 설명 / 커밋 메시지에 페이지·모달·네비게이션 변경 사항이 있다면, 본 문서 갱신 여부를 자체 체크리스트로 확인할 것.

---

## 1. 기본 정보

- 로컬 dev URL: `http://localhost:5173/`
- 라우팅: react-router 미사용. `src/App.tsx`의 `currentView` state + `AnimatePresence` 단일 페이지 뷰 스위칭.
- 라우트(View) 유니언의 정의 위치: `src/App.tsx:83`
- 뷰 스위칭 블록: `src/App.tsx` 의 `<main>` 내부 (App.tsx:642~679 근방).
- 디자인 토큰: `src/index.css` (참조 스킬: `design-tokens`).
- API 클라이언트: `src/services/api.ts`, 타입 `src/types/api.ts` (참조 스킬: `api-endpoints`).
- 인증 컨텍스트: `src/contexts/AuthContext.tsx`, 훅 `src/hooks/useAuth.ts`.
- 공유 타입: `src/shared/types.ts`.
- 성능 토글: `src/utils/performanceFlags.ts`.

---

## 2. 레이아웃 / 네비게이션

### 2.1 데스크탑 GNB (Navbar — App.tsx:218)

| 라벨 | View ID | 이동 페이지 | 비고 |
|---|---|---|---|
| (LOGO) LONGRISE | `home` | HomePage | 좌측 로고 클릭 |
| CRYPTO AI | `crypto-ai` | CryptoAIPage | AI 트레이딩 대시보드 |
| PACKAGES  | `packages`  | PackagesPage | |
| REWARDS   | `rewards`   | RewardsPage | |
| MARKET    | `cnyt-market` | CNYTMarketPage | `USDTMarketPage.tsx`는 import되지 않은 고아 컴포넌트 |
| WALLET    | `wallet`    | WalletPage | |

**네브바 우측 보조 요소**
- `Connect Web3` 버튼 (미구현 — UI만)
- `LOGIN` 버튼 (비로그인 시) / 프로필 아바타+이름+랭크 (로그인 시)
- 프로필 드롭다운 항목: My Profile / Security Center / News & Updates / Support Tickets / Documentation / Platform Settings / Logout
- 알림 벨 + 드롭다운 (`App.tsx`)
- 언어 선택 (7개: MO / PH / VN / GE / EN / CN / KR, App.tsx:66)
- 모바일 햄버거 → 우측 슬라이드 드로어 (`lg:hidden`)

### 2.2 모바일 BottomTabBar (App.tsx:526, `lg:hidden`)

데스크탑 GNB와 **항목 구성이 다름**.

| 라벨 | View ID |
|---|---|
| HOME | `home` |
| INVEST | `packages` |
| WALLET | `wallet` |
| TEAM | `rewards` |
| MY | `profile` |

### 2.3 푸터 (App.tsx:694)

- Platform 컬럼: Crypto AI Trading(`crypto-ai`), VIP Packages(`packages`), Rewards Program(`rewards`)
- Support 컬럼: Help Center / Terms of Service / Privacy Policy (현재 미연결 placeholder)

### 2.4 HomePage 우하단 플로팅 버튼 3개 (HomePage.tsx:435)

| 순서 | 아이콘 | 동작 |
|---|---|---|
| 1 | Headphones | 고객지원 채팅 모달(HomePage 내부) 열기 |
| 2 | Send | 외부 링크 `https://t.me/longrise_ai` |
| 3 | BookOpen | `documentation` 뷰로 이동 (`onAboutClick`) |

### 2.5 히어로 섹션 CTA (HomePage.tsx)

- `JOIN THE EMPIRE` → `onLoginClick` (VIP Entrance Modal 열기)
- `WHAT IS LONGRISE AI?` → `onAboutClick` → `documentation`

---

## 3. 페이지 전체 목록

| 한글 | View ID | 비로그인 접근 | 진입 경로 | 코드 |
|---|---|---|---|---|
| 메인 | `home` | ✅ | `/` 진입, 로고 클릭, 모바일탭 HOME | `src/components/HomePage.tsx` |
| Crypto AI | `crypto-ai` | ✅ | GNB, 푸터 | `src/components/CryptoAIPage.tsx` |
| 패키지 선택 | `packages` | ✅ (단, 패키지 카드 클릭 시 비로그인이면 로그인 모달) | GNB, 푸터, 모바일탭 INVEST | `src/components/PackagesPage.tsx` (얇은 래퍼, 본체는 `PackageSection.tsx`) |
| 리워드 | `rewards` | ❌ | GNB, 푸터, 모바일탭 TEAM | `src/components/RewardsPage.tsx` |
| 마켓 (CNYT) | `cnyt-market` | ❌ | GNB MARKET | `src/components/CNYTMarketPage.tsx` |
| 월렛 | `wallet` | ❌ | GNB, 모바일탭 WALLET | `src/components/WalletPage.tsx` |
| 도큐먼트 | `documentation` | ✅ | 히어로 "WHAT IS LONGRISE AI?", 플로팅 BookOpen, 프로필 드롭다운 | `src/components/DocumentationPage.tsx` |
| About Longrise | `about` | ✅ | (현재 직접 네비 진입 경로 없음 — 코드만 보존) | `src/components/AboutLongrisePage.tsx` |
| 프로필 | `profile` | ❌ | 프로필 드롭다운 > My Profile, 모바일탭 MY | `src/components/ProfilePage.tsx` |
| 보안 센터 | `security` | ❌ | 프로필 드롭다운 > Security Center | `src/components/SecurityPage.tsx` |
| 뉴스 | `notices` | ❌ | 프로필 드롭다운 > News & Updates | `src/components/NoticesPage.tsx` |
| 서포트 | `support` | ❌ | 프로필 드롭다운 > Support Tickets | `src/components/SupportPage.tsx` |
| 세팅 | `settings` | ❌ | 프로필 드롭다운 > Platform Settings | `src/components/PlatformSettingsPage.tsx` |
| 레퍼럴 프로그램 | `referral-program` | ❌ | DocumentationPage 내부 섹션에서 노출 (App.tsx의 탑레벨 뷰로도 등록되어 있음) | `src/components/ReferralProgramPage.tsx` |
| USDT 온보딩 | `usdt-onboarding` | ❌ | 프로그래매틱 전환 위주 (현재 메인 네비 진입 경로 없음) | `src/components/USDTOnboardingPage.tsx` |
| USDT 사기 신고 | `usdt-fraud-report` | ❌ | 프로그래매틱 전환 위주 | `src/components/USDTFraudReportPage.tsx` |

기타 컴포넌트:
- `src/components/PackageSection.tsx` — 패키지 카드 그리드 (HomePage / PackagesPage 양쪽에서 사용)
- `src/components/AICoreAnimation.tsx`, `src/components/VisualEffects.tsx` — 시각 효과
- `src/components/GuidePage.tsx` — 정의되어 있으나 App.tsx에 미연결 (보존 컴포넌트)
- `src/components/USDTMarketPage.tsx` — App.tsx에 미연결 (고아 컴포넌트)

---

## 4. 모달

| 이름 | 위치 | 트리거 |
|---|---|---|
| VIP Entrance (로그인 / 회원가입) | `src/components/VIPEntranceModal.tsx` | 네브바 LOGIN, 히어로 JOIN, 보호 액션 시도 |
| Investment 확인 (2-step) | `src/App.tsx:97` **인라인** (`InvestmentModal`) | `handlePackageSelect` — 로그인 상태에서 패키지 클릭 |
| 고객지원 채팅 | `src/components/HomePage.tsx` 내부 | 플로팅 Headphones 버튼 |
| Transfer | `src/components/WalletPage.tsx` 내부 | 월렛 Transfer 버튼 |
| Requirement (Trading Password 필요 안내) | `src/components/WalletPage.tsx` 내부 (별도 RewardsPage에는 `TradingPasswordRequiredPrompt` 인라인) | 거래비번 미설정 사용자가 보호 기능 사용 시 |
| Notifications 드롭다운 | `src/App.tsx` Navbar | 벨 아이콘 |
| Profile 드롭다운 | `src/App.tsx` Navbar | 프로필 아바타 |
| Language 드롭다운 | `src/App.tsx` Navbar | 국기 버튼 |
| Mobile Drawer | `src/App.tsx` Navbar | 햄버거(`lg:hidden`) |

---

## 5. 인증 / 게이팅

- 로그인 상태: `App.tsx`의 `isLoggedIn` state (초기값 `false`).
- 사용자 정보: `App.tsx`의 `user` state.
- 로그인 트리거: `setIsLoginModalOpen(true)` → `VIPEntranceModal` 노출.
- 보호 액션 게이트 예시:
  - `handlePackageSelect` (App.tsx:616) — 비로그인이면 로그인 모달, 로그인이면 Investment 모달.
- 로그아웃: `handleLogout` (App.tsx:610) — state 리셋 + `home`으로 이동.
- 로그인/가입 진입점: `VIPEntranceModal`.

---

## 6. 자주 쓰는 참조 위치

- 새 페이지 추가 시 수정해야 할 곳:
  1. 컴포넌트 파일 `src/components/<Name>Page.tsx` 신규 작성
  2. `src/App.tsx`의 `View` 유니언(App.tsx:83)에 ID 추가
  3. 동일 파일 상단 import 추가
  4. `<main>` 스위칭 블록(App.tsx:642~)에 케이스 추가
  5. (해당 시) Navbar/BottomTabBar/푸터/플로팅에 진입 경로 연결
  6. **본 문서 §3에 행 추가**
- 디자인 토큰 일관성: `design-tokens` 스킬 우선 사용. `src/index.css` 직접 수정 시 토큰 우선.
- API 호출: `fetch`/`axios` 직접 사용 금지 — `api-endpoints` 스킬 가이드를 따른다.
- 서비스 재시작: 직접 `npm run dev` 금지. `service-restart` 스킬 또는 `./restart-user-frontend.sh --bf` 사용.

---

## 7. 외부 자원 / 링크

- Telegram 커뮤니티: `https://t.me/longrise_ai`
- 환경 변수 샘플: `lr_user-frontend/.env.stage.sample`
- 현재 로컬 env: `lr_user-frontend/.env.local`
