---
name: LONGRISE AI Main — 모바일 UI 작업 최종 상태
description: 현재 진행 중인 모바일 뷰 재설계 핵심 결정사항 및 파일 구조
type: project
originSessionId: 2475b735-32bb-442b-ac09-459b296e846e
---
## 프로젝트 위치
- 로컬: `C:\Users\YG\Desktop\LONGRISE-AI-MAIN-main (2)\LONGRISE-AI-MAIN-main\LONGRISE-AI-MAIN-main`
- GitHub: `https://github.com/yeogun9222-dot/LONGRISE-AI-MAIN`
- 배포: Vercel (진행 중)
- 기술스택: React + TypeScript + Vite + Tailwind CSS + Framer Motion

## 핵심 설계 원칙
- PC/모바일 완전 분리: `useIsMobile()` (window.innerWidth < 1024) 분기
- 모바일 기준 디자인: JazzCash 앱 스타일 참고
- 50~60대 가독성: 큰 숫자(text-5xl), 큰 버튼(py-5), 정보 단순화
- 아이콘 그리드: 3열(grid-cols-3) 통일 — 아이콘 size=26, py-5, rounded-2xl

## 모바일 전용 파일 목록
| 파일 | 탭 | 상태 |
|------|----|------|
| HomeMobilePage.tsx | HOME | ✅ 완료 |
| InvestMobilePage.tsx | INVEST | ✅ 완료 |
| WalletMobilePage.tsx | WALLET | ✅ 완료 |
| TeamMobilePage.tsx | TEAM | ✅ 완료 |
| MyMobilePage.tsx | MY | ✅ 완료 |
| MobileTopBar.tsx | 공통 상단바 | ✅ 완료 |
| SupportMobilePage.tsx | 지원 | ✅ 완료 |
| SettingsMobilePage.tsx | 설정 | ✅ 완료 |

## 공통 디자인 패턴 (HOME/WALLET 기준)
```
히어로 카드: rounded-3xl p-6, gradient(#4a0808→#2d0505→#1a0000), border gold/20
CTA 2버튼: grid-cols-2, 왼쪽=gradient red-gold/text-black, 오른쪽=white/10
아이콘 그리드: grid-cols-3 gap-3, py-5, size=26, text-[11px] font-black
섹션 타이틀: text-white font-black text-base mb-3
숫자: text-5xl font-mono font-black text-white
탑바 높이: h-[72px], 컨텐츠 pt-[76px]
active 효과: active:scale-[0.93] transition-all
```

## App.tsx 핵심 변경사항
- `useIsMobile()`: useSyncExternalStore로 반응형 감지
- `navigateTo()`: prevView 추적으로 뒤로가기 정확히 동작
- 모바일: Navbar/Footer/NetworkOverlay 숨김, MobileTopBar + BottomTabBar 표시

## 제거된 것 (모바일)
- PC 상단 Navbar (햄버거 포함)
- 웹 Footer
- NetworkOverlay 애니메이션
- 각 페이지 개별 헤더 → MobileTopBar 공통화

## MobileTopBar 구성
- 왼쪽: LONGRISE 로고 (w-10 h-10 gold icon + text-2xl)
- 오른쪽: 언어선택(7개국 국기 드롭다운) + 알림벨(size=24)
- 드롭다운: top-[78px] right-4

## WalletMobilePage 구조
HOME뷰: 히어로카드(잔액/유저/CTA) → My Assets 2×2 → Quick Actions 3×2 그리드
서브뷰: Deposit / Withdraw / Send / History(3탭) / Address

## TeamMobilePage 특이사항
- 비밀번호 게이트 (Trading Password 확인)
- Team Tree: 가로 스크롤 조직도 (카드+연결선)
- 6개 그리드: Honor·My Team·Team Tree / Rank·Invite·My Rank

## 버그 수정 완료
- active:scale-93 → active:scale-[0.93] (3개 파일)
- TeamMobilePage hidden div 잔재 제거
- onBack 하드코딩 → prevView 기반 복귀
