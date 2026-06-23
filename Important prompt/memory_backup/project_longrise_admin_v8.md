---
name: LONGRISE AI Admin V8.01 프로젝트
description: React + TypeScript 기반 관리자 대시보드, 32개 모듈, 현재 개발 중
type: project
originSessionId: 19f05971-ef65-48c9-bd06-4a0ffbf3ec7e
---
## 프로젝트 정보
- **프로젝트명**: LONGRISE AI Admin
- **현재 버전**: V8.01
- **저장 위치**: C:\Users\YG\Desktop\LONGRISE_A_ADMIN_V8.01
- **프레임워크**: React 19 + TypeScript + Vite
- **개발 서버**: localhost:3000 (npm run dev)

## 기술 스택
- React 19, TypeScript 5.8
- Tailwind CSS 4.1, Motion (애니메이션)
- Lucide React (아이콘), Recharts (차트)
- Google Gemini API 연동
- Vite 빌드 도구

## 핵심 모듈 (32개)
### 구현 완료 (19개)
dashboard, users, products, tokens, payouts, withdrawals, referrals, reconciliation, board, settings, p2p_market, approvals, fds_monitoring, admin_mgmt, p2p_disputes, circuit_breaker, news, auth, security

### 플레이스홀더 (13개)
fe_profile, fe_my_wealth, fe_hero, fe_features, fe_whyus, fe_ranks, fe_invite, fe_faq_footer, fe_crypto_ai, fe_wall_of_fame, fe_team, fe_tree 등

## 주요 데이터 모델
- User (드래곤 직급, 지갑, 권한, 로그인 기록)
- WithdrawalRequest (출금 관리)
- PayoutLog (수당 정산)
- SupportTicket (CS 티켓)
- P2PLog (P2P 거래)

## 프로젝트 구조
```
src/
├── App.tsx (메인 라우팅, 32개 뷰)
├── components/ (32개 모듈)
├── types/index.ts (데이터 타입)
├── lib/ (mockData.ts, utils.ts)
└── index.css (글로벌 스타일)
```

## 개발 명령어
- `npm run dev` - 개발 서버 실행 (포트 3000)
- `npm run build` - 프로덕션 빌드
- `npm run lint` - TypeScript 체크
