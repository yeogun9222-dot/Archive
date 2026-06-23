# 에이전트 팀 가이드

에이전트 팀을 사용하여 여러 Claude Code 인스턴스를 조율하고 병렬 작업을 수행하는 방법을 설명합니다.

## 목차

1. [에이전트 팀이란?](#에이전트-팀이란)
2. [활성화 방법](#활성화-방법)
3. [첫 팀 만들기](#첫-팀-만들기)
4. [팀 제어하기](#팀-제어하기)
5. [사용 사례](#사용-사례)
6. [모범 사례](#모범-사례)
7. [문제 해결](#문제-해결)

---

## 에이전트 팀이란?

**에이전트 팀**은 함께 작동하는 여러 Claude Code 인스턴스를 조율하는 시스템입니다:

- **팀 리더**: 팀을 관리하고 작업을 조율하는 메인 세션
- **팀원들**: 할당된 작업을 독립적으로 수행하는 별도의 인스턴스들
- **공유 작업 목록**: 모든 팀원이 접근할 수 있는 중앙 작업 목록
- **메시징 시스템**: 팀원들 간의 직접 통신

### Subagents와의 차이점

| 특성 | Subagents | 에이전트 팀 |
|------|-----------|-----------|
| 컨텍스트 | 메인 세션 내에서 실행 | 자신의 독립적 컨텍스트 |
| 통신 | 메인에게만 결과 보고 | 팀원들이 직접 통신 |
| 조율 | 메인이 모든 작업 관리 | 자체 조율, 공유 작업 목록 |
| 최적 용도 | 빠른 도우미 작업 | 복잡한 협력 작업 |
| 토큰 비용 | 낮음 | 높음 (각 팀원이 개별 컨텍스트) |

**선택 가이드:**
- **Subagents**: 순차적 작업, 동일 파일 편집, 많은 종속성
- **에이전트 팀**: 병렬 탐색, 독립적인 모듈, 논의가 필요한 작업

---

## 활성화 방법

### 1. 환경 변수 설정

`.claude/settings.json` 파일에 다음을 추가합니다:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

또는 쉘 환경에서:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 2. 버전 확인

Claude Code v2.1.32 이상이 필요합니다:

```bash
claude --version
```

---

## 첫 팀 만들기

### 기본 팀 생성

Claude에게 자연어로 팀을 만들도록 요청합니다:

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```

Claude가 이에 따라 팀을 생성하고:
1. 팀원들을 만듭니다
2. 공유 작업 목록을 생성합니다
3. 각 팀원에게 작업을 할당합니다
4. 팀원들이 독립적으로 작동합니다

### 팀 구조 지정

팀원의 수와 역할을 명시적으로 지정할 수 있습니다:

```
Create a team with 4 teammates to refactor these modules in parallel:
- Database layer expert
- API layer expert
- Frontend integration expert
- Testing specialist
Use Sonnet for each teammate.
```

---

## 팀 제어하기

### 표시 모드 선택

#### In-process 모드 (기본값)
- 모든 팀원이 메인 터미널에서 실행
- 추가 설정 불필요
- 모든 터미널에서 작동
- **단축키:**
  - `Shift+Down`: 팀원들 순환
  - `Enter`: 팀원의 세션 보기
  - `Escape`: 현재 턴 중단
  - `Ctrl+T`: 작업 목록 전환

#### 분할 창 모드
- 각 팀원이 자신의 창에서 실행
- 모든 사람의 출력을 동시에 볼 수 있음
- tmux 또는 iTerm2 필요
- **설정:**

```json
{
  "teammateMode": "tmux"
}
```

또는 명령줄에서:

```bash
claude --teammate-mode tmux
```

### 팀원과 직접 소통

특정 팀원에게 메시지 보내기:

```
Ask the architect teammate to explain their approach to the database schema.
```

모든 팀원에게 같은 메시지는 순회하면서 각각 보냅니다:

```
Tell each teammate to summarize their progress so far.
```

### 계획 승인 요구

복잡한 작업의 경우, 팀원들이 구현하기 전에 계획을 승인받도록 할 수 있습니다:

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

팀원이 계획을 마치면:
1. 계획 승인 요청을 리더에게 보냅니다
2. 리더가 검토하고 승인/거부합니다
3. 거부되면 팀원이 계획을 수정합니다
4. 승인되면 구현을 시작합니다

### 작업 관리

#### 공유 작업 목록 이해

- **대기**: 할당 준비 완료
- **진행 중**: 팀원이 현재 작업 중
- **완료됨**: 작업 완료됨
- **종속성**: 다른 작업이 완료되어야 실행 가능

#### 작업 할당

리더가 팀원에게 작업을 할당:

```
Assign the database refactoring task to the backend expert.
```

또는 팀원들이 자동으로 다음 미할당 작업을 요청:

```
Let teammates request their own tasks.
```

### 팀원 종료

개별 팀원 종료:

```
Ask the researcher teammate to shut down.
```

팀원이 승인하면 우아하게 종료합니다.

### 팀 정리

모든 작업 완료 후 팀 정리:

```
Clean up the team.
```

⚠️ **중요**: 항상 **리더**를 통해 정리합니다. 팀원이 정리를 실행하면 안 됩니다.

---

## 사용 사례

### 1. 병렬 코드 검토

여러 검토자가 다른 관점에서 동시에 검토:

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

**장점:**
- 보안, 성능, 테스트가 모두 동시에 철저히 검토됨
- 검토 시간 단축

### 2. 경쟁하는 가설로 디버깅

근본 원인이 불명확할 때 여러 이론을 병렬로 검증:

```
Users report the app exits after one message. Spawn 5 teammates to investigate
different hypotheses. Have them talk to each other to try to disprove each
other's theories, like a scientific debate.
```

**장점:**
- 앵커링 편향 제거
- 더 빠른 근본 원인 파악

### 3. 새로운 모듈 개발

각 팀원이 다른 부분을 소유하면서 병렬로 개발:

```
Create an agent team to build the user dashboard feature.
- One teammate on the API endpoints
- One on the React components
- One on the database schema
- One on the integration tests
Have them coordinate through the shared task list.
```

**장점:**
- 개발 속도 향상
- 팀원들이 간섭하지 않음

### 4. 교차 계층 조율

프론트엔드, 백엔드, 테스트에 걸친 변경:

```
Create an agent team to refactor authentication across the stack.
- Backend: Update auth endpoints and token management
- Frontend: Update login/logout UI and token handling
- Tests: Update and add integration tests
```

---

## 모범 사례

### 1. 팀원에게 충분한 컨텍스트 제공

팀원들은 CLAUDE.md와 프로젝트 설정을 자동으로 로드하지만, 리더의 대화 기록은 전달되지 않습니다.

좋은 예:

```
Spawn a security reviewer teammate with the prompt: "Review the authentication
module at src/auth/ for security vulnerabilities. Focus on token handling,
session management, and input validation. The app uses JWT tokens stored in
httpOnly cookies. Report any issues with severity ratings."
```

### 2. 적절한 팀 크기 선택

- **최적 범위**: 3-5명의 팀원
- **팀원당 작업**: 5-6개의 작업 유지
- **확장**: 작업이 실제로 병렬 처리의 이점이 있을 때만

```
// 적절: 3명의 팀원, 15개의 작업
// 부적절: 7명의 팀원, 5개의 작업 (조율 오버헤드 > 이점)
```

### 3. 작업 크기 조정

**너무 작은 작업:**
- 조율 오버헤드가 이점을 초과

**너무 큰 작업:**
- 팀원들이 체크인 없이 오래 작동
- 낭비된 노력의 위험 증가

**적절한 크기:**
- 함수, 테스트 파일, 검토 같은 명확한 결과물
- 자체 포함된 단위

### 4. 파일 충돌 피하기

두 팀원이 동일 파일을 편집하면 덮어쓰기 발생:

```
// ❌ 나쁜 예: 같은 파일을 두 팀원이 편집
- Teammate A: Refactor src/auth.ts
- Teammate B: Add logging to src/auth.ts

// ✅ 좋은 예: 각자 다른 파일 소유
- Teammate A: Refactor src/auth/tokens.ts
- Teammate B: Refactor src/auth/sessions.ts
```

### 5. 모니터링과 조율

팀을 무인으로 너무 오래 실행하지 마세요:

```
Check in with your teammates periodically. See what they've accomplished,
discuss any blockers, and adjust tasks as needed.
```

### 6. 리더가 작업 완료 대기

리더가 팀원들을 기다리지 않고 작업을 시작하려고 하면:

```
Wait for your teammates to complete their tasks before proceeding.
```

---

## 문제 해결

### 팀원이 나타나지 않음

**확인 사항:**
1. In-process 모드에서 이미 실행 중인지 확인
   ```bash
   # Shift+Down 키를 눌러 팀원들 순환
   ```

2. Claude에게 준 작업이 팀을 보증할 만큼 복잡한지 확인
   - Claude는 작업의 복잡도에 따라 팀 생성 여부를 판단합니다

3. 분할 창 모드인 경우, tmux 설치 확인
   ```bash
   which tmux
   ```

4. iTerm2의 경우, Python API 활성화 확인
   - Settings → General → Magic → Enable Python API

### 너무 많은 권한 프롬프트

권한 설정에서 일반적인 작업을 미리 승인합니다:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Edit",
      "Read",
      "Write"
    ]
  }
}
```

### 팀원이 오류에서 중지됨

팀원의 출력 확인 후 직접 지시:

```
Check on the backend teammate. If they hit an error, help them debug it.
```

또는 새 팀원으로 작업 계속:

```
Spawn a new database expert to continue the refactoring.
```

### 작업이 차단됨

팀원이 작업을 완료로 표시하지 못했을 수 있습니다:

```
Check if the authentication task is actually complete. Update its status if needed.
```

### 고아 tmux 세션

팀 종료 후 tmux 세션이 남아있으면:

```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## 알려진 제한 사항

- **In-process 팀원과의 세션 재개 불가**: `/resume`은 팀원을 복원하지 않음
- **작업 상태 지연 가능**: 때때로 완료 상태가 지연될 수 있음
- **종료가 느릴 수 있음**: 현재 작업 완료 후 종료됨
- **세션당 한 팀**: 새 팀 시작 전 현재 팀 정리 필요
- **중첩된 팀 불가**: 팀원들은 팀을 만들 수 없음
- **리더가 고정됨**: 팀을 만드는 세션이 수명 동안 리더임
- **분할 창 제한**: VS Code 통합 터미널, Windows Terminal에서는 지원 안됨

---

## 팁

✅ **CLAUDE.md는 정상 작동**: 팀원들이 자동으로 읽음

✅ **프롬프트에 컨텍스트 포함**: 각 팀원의 생성 프롬프트에 상세한 지시 포함

✅ **작은 크기로 시작**: 3명의 팀원으로 시작해 필요시 확장

✅ **토큰 비용 고려**: 각 팀원이 독립적으로 토큰 소비 (단일 세션의 배수)

---

## 추가 리소스

- [Claude Code 공식 문서](https://code.claude.com/docs/ko/agent-teams)
- [Subagents 가이드](https://code.claude.com/docs/ko/sub-agents)
- [Git Worktrees](https://code.claude.com/docs/ko/worktrees)
