---
name: rumble-issue-resolver
description: RumbleSurge API를 통해 이슈 컨텍스트를 조회하고 타겟 레포지토리의 코드를 수정하여 이슈를 해결하는 에이전트 스킬
argument-hint: [issue-uuid]
allowed-tools: Read, Edit, Write, Bash, WebFetch
user-invocable: true
---

# RumbleSurge Issue Resolver Skill

## 🎯 목적

Claude Code를 사용하여 RumbleSurge 이슈를 자동으로 분석하고, 현재 작업 중인 레포지토리의 코드를 수정하여 해결하는 스킬입니다.

## ⚠️ 보안 및 통신 규칙 (CRITICAL)

- **절대 데이터베이스(RDS, PostgreSQL)에 직접 연결을 시도하거나 SQL 쿼리를 작성하지 마십시오.**
- 모든 이슈 정보는 반드시 내장된 `query-issue.js` 스크립트(API 클라이언트)를 통해서만 조회해야 합니다.

## 🛠️ 작업 워크플로우 (Execution Steps)

당신은 최고 수준의 시니어 프론트엔드/백엔드 개발자로서 아래 순서대로 작업합니다.

### Step 1: 이슈 데이터 확보

주어진 `issue-uuid`를 사용하여 아래 명령어를 실행하고 출력되는 결과를 꼼꼼히 분석하십시오.

```bash
node ./.claude/skills/rumble-issue-resolver/query-issue.js <issue-uuid>
```

### Step 2: 원인 분석

명령어 출력 결과에서 다음을 파악하십시오:

- `pageUrl` 및 `currentPath`: 에러가 발생한 라우팅 지점
- `componentFilePath`: 타겟 컴포넌트 위치
- `첨부 파일 및 선택된 요소`: UI/UX 버그일 경우 요소의 `tag`, `classes`, `path`를 활용

### Step 3: 코드 탐색 및 수정

- 파악한 단서를 바탕으로 현재 프로젝트의 코드를 탐색(`Read`)하십시오.
- 기존 아키텍처와 코딩 컨벤션을 준수하여 가장 안전하고 우아한 방법으로 코드를 수정(`Edit`)하십시오.

### Step 4: 자체 검증

- 수정을 완료한 후, 터미널 명령어를 통해 린트(Lint)나 빌드가 정상적으로 통과하는지 확인하십시오.
- 작업 완료 후, 무엇을 어떻게 수정했는지 간결하게 보고하십시오.
