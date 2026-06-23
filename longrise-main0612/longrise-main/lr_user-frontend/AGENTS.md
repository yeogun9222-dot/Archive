# Longrise User Frontend — Agent Guide

이 디렉터리(`lr_user-frontend/`)는 사용자용 프론트엔드(React + Vite, dev: `http://localhost:5173/`)다.

본 가이드는 Codex CLI 등 `AGENTS.md`를 읽는 에이전트용 진입점이다. Claude Code 사용자는 동일 디렉터리의 `CLAUDE.md`를 참조한다. **두 파일은 동일한 내용을 가리키며, 사이트맵 본문은 한 곳에서만 관리한다.**

## 사이트맵 — 항상 먼저 참조
페이지/모달/네비게이션 구조, 라우트 ID, 인증 게이팅 규칙은 모두 다음 문서에 정리되어 있다.

→ `docs/SITE_MAP.md`

새 작업을 시작하기 전에 위 문서를 우선 검토하라.

## 변경 시 동기화 의무
다음 코드 변경을 수행하는 경우, **반드시 `docs/SITE_MAP.md`를 함께 업데이트**한다.

- `src/App.tsx`의 `View` 유니언(App.tsx:83) 항목 추가/삭제/이름변경
- 새 `*Page.tsx` 컴포넌트 추가 또는 기존 페이지 제거
- 새 모달 컴포넌트 추가 / 인라인 모달 분리·통합
- 데스크탑 GNB(`navItems`) / 모바일 BottomTabBar(`items`) / 푸터 / 플로팅 버튼 / 네브바 보조 요소 변경
- 인증·라우팅 게이트 로직(`handlePackageSelect` 등) 변경
- 디자인 토큰·환경 변수·API 베이스 등 핵심 참조 위치 변경

PR/커밋에 위 변경이 포함되면 본 문서 동기화 여부를 자체 점검 체크리스트로 확인할 것. 동기화하지 않은 변경은 머지하지 않는다.
