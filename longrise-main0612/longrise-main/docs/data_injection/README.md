# LONGRISE AI V8.9 Rev.2 운영 DB 주입 가이드

이 문서는 V8.9 Rev.2 정책을 실제 백엔드/DB/API에 반영하기 위한 기준 문서다. 프론트엔드는 목업 파일을 복사하지 않고, FastAPI가 DB에서 읽은 값만 표시해야 한다.

## 기준 문서

| 파일 | 역할 |
|------|------|
| `../master_plan/LONGRISE_MasterPlan_V8_9_KO.html` | 전체 정책, 패키지, 수익, 조직/직급 기준 |
| `시나리오_서사_점검.txt` | Kim_Dragon88 서사, 타임라인, 시연 검증 항목 |
| `PREVIEW.html` | 화면/데이터 확인용 미리보기 |
| `OPERATIONAL_SEED_MANIFEST.md` | 실제 주입 데이터와 보강 생성 데이터의 구분 명세 |
| `../../lr_fastapi/seed_operational_data.py` | 실제 DB 주입 스크립트 |
| `../../lr_database/schema/03-v89-operational-verification.sql` | V8.9 운영 검증 보강 스키마 |

## 실행 순서

```bash
cd lr_fastapi
uv run python seed_operational_data.py
```

스크립트는 현재 `.env.local`의 DB 연결 정보를 사용한다. 재실행 가능해야 하며, `V89-` 식별자가 붙은 검증 거래/투자/P2P/출금 데이터는 교체하고 사용자/패키지/가격 정책은 갱신한다.

## 생성되는 데이터 규모

| 영역 | 기준 |
|------|------|
| 주계정 | 10개 확정 계정 |
| Kim 조직 | Kim_Dragon88 포함 46개 |
| 플랫폼 운영 검증 계정 | 총 108개 기준 충족 |
| 패키지 이력 | 주계정의 최초 구매/재구매 이력 |
| 일일 수익 | 기준일 `2026-06-05`까지 생성 |
| 지갑 이력 | 입금, 일일 ROI, CNYT, 추천/롤업, 인출 |
| 잠금 지갑 | 원금 잠금 상태를 `locked_wallet`과 `users.locked_usdt`에 반영 |
| P2P/시세 | CNYT 기준가 `$0.02`, API 검증용 활성 주문 |

## 10개 계정 스펙

| # | 닉네임 | 직급 | USDT | LOCKED | CNYT | 팀인원 | 팀매출 |
|---|--------|------|-----:|-------:|-----:|------:|------:|
| 1 | Kim_Dragon88 | Blue Dragon | 3,139 | 1,000 | 104,927 | 45 | 28,500 |
| 2 | Lee_Profit99 | Blue Dragon | 2,680 | 1,000 | 104,732 | 3 | 1,500 |
| 3 | Park_Alpha77 | Blue Dragon | 2,540 | 1,000 | 104,653 | 3 | 1,500 |
| 4 | Choi_Rise12 | White Dragon | 1,564 | 1,000 | 129,431 | 17 | 4,200 |
| 5 | Han_Node34 | White Dragon | 1,549 | 1,000 | 129,167 | 12 | 3,000 |
| 6 | Jung_Bull56 | White Dragon | 1,481 | 1,000 | 129,068 | 8 | 2,000 |
| 7 | Yoon_Gold78 | White Dragon | 1,462 | 1,000 | 129,299 | 6 | 1,500 |
| 8 | Song_Wave90 | White Dragon | 1,445 | 1,000 | 129,233 | 5 | 1,250 |
| 9 | Lim_Eagle23 | White Dragon | 1,426 | 1,000 | 128,969 | 4 | 900 |
| 10 | Ko_Titan45 | White Dragon | 1,407 | 1,000 | 128,847 | 3 | 600 |

공통 로그인 비밀번호는 `Longrise!2026`, 거래 비밀번호는 4자리 숫자 PIN `0000`이다.

## Kim_Dragon88 검증 기준

| 항목 | 값 |
|------|----|
| 이메일 | `kim88@gmail.com` |
| 추천 코드 | `DRAGON88` |
| 가입일 | `2025-03-23` |
| 현재 가용 USDT | `3,139` |
| 현재 잠금 USDT | `1,000` |
| 현재 CNYT | `104,927` |
| 팀 인원 | `45` |
| 팀 매출 | `28,500` |
| 인출 이력 | `1,150` + `380` = `1,530` |

## 정책 반영 기준

| 정책 | 코드/DB 반영 |
|------|-------------|
| 이메일 인증 후 비밀번호 설정 | `/api/v1/auth/signup/*` |
| 가입 시 추천 코드 필수 | 추천 코드 미입력/형식 오류 시 가입 거절 |
| 추천 코드 형식 | 대문자 영문+숫자 8자리, `users.referral_code` UNIQUE |
| 공유 링크 | `https://longrise.ai/join?ref=DRAGON88` 형식, 프론트 자동 입력 |
| 직접추천 수당 | 패키지 구매 건당 10% |
| 롤업 수당 | 하부 일일수익의 10% |
| CNYT 단가 | `$0.02` 고정 |
| CNYT 구매/재구매 보너스 | 구매금액 / `$0.02` |
| 만기 원금 반환 | 100%, 수수료 0% |
| 팀 인원 표시 | 직추천 수가 아니라 `users.team_size` 전체 조직 규모 |

## 보강 생성 데이터 원칙

문서에 모든 108명의 이름/거래값이 완전 열거되어 있지는 않다. 부족분은 `OPERATIONAL_SEED_MANIFEST.md`의 규칙에 따라 deterministic 운영 검증 데이터로 생성한다. 생성 계정은 `Ops_Node_001` 같은 고정 닉네임과 이메일 규칙을 사용해 확정 문서 계정과 구분한다.

## 검증 명령

```bash
cd lr_fastapi
uv run python seed_operational_data.py
python3 -m py_compile seed_operational_data.py app/services/signup_service.py app/services/user_service.py app/services/operations_service.py
```

```bash
cd lr_user-frontend
npm run build
```

```bash
cd lr_admin-frontend
npm run build
```

운영 검증의 핵심은 프론트/백엔드가 목업, fallback 숫자, 하드코딩 사용자 인덱스 없이 DB/API 결과만 표시하는 것이다.
