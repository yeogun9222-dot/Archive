# LONGRISE V8.9 Rev.2 운영 검증 초기 데이터 명세

이 파일은 `lr_fastapi/seed_operational_data.py`가 실제 DB에 삽입하는 데이터의 근거와 생성 규칙을 설명한다. 목적은 운영 시나리오 점검, API 연동 검증, 지갑/패키지/추천조직/수익 데이터 증명이다.

## 기준 문서

- `docs/master_plan/LONGRISE_MasterPlan_V8_9_KO.html`
- `docs/data_injection/README.md`
- `docs/data_injection/시나리오_서사_점검.txt`
- `docs/data_injection/PREVIEW.html`

## 확정 정책 반영

- 플랫폼 기준일: `2026-06-05`
- CNYT 기준가: `$0.02`
- 거래 비밀번호: `Longrise1!` (10개 운영 검증 주계정 공통)
- 추천코드: 대문자 영문/숫자 8자리, UNIQUE
- 직접추천 수당: 패키지 구매금액의 `10%`, 구매 건당 지급
- 롤업 수당: 하부 일일수익의 `10%`
- 롤업 깊이: Blue 3대, Purple 7대, Red 15대, Black 25대
- CNYT 초기 보너스: 구매금액 / `$0.02`
- CNYT 일일 지급률: Basic 2%, Standard 4%, Premium 6%, VIP 10%
- 원금 분리: `users.balance_usdt`와 `users.locked_usdt`, `locked_wallet`로 구분
- 만기 원금 반환: 100%, 수수료 0%
- 일일수익: 수익일 80%, 방어일 15%, 역전일 5%

## 확정 주계정 10개

| 닉네임 | 이메일 | 직급 | USDT | LOCKED | CNYT | 팀인원 | 팀매출 |
|---|---|---:|---:|---:|---:|---:|---:|
| Kim_Dragon88 | kim88@gmail.com | Blue Dragon | 3,139 | 1,000 | 104,927 | 45 | 28,500 |
| Lee_Profit99 | lee99@gmail.com | Blue Dragon | 2,680 | 1,000 | 104,732 | 3 | 1,500 |
| Park_Alpha77 | park77@gmail.com | Blue Dragon | 2,540 | 1,000 | 104,653 | 3 | 1,500 |
| Choi_Rise12 | choi12@gmail.com | White Dragon | 1,564 | 1,000 | 129,431 | 17 | 4,200 |
| Han_Node34 | han34@gmail.com | White Dragon | 1,549 | 1,000 | 129,167 | 12 | 3,000 |
| Jung_Bull56 | jung56@gmail.com | White Dragon | 1,481 | 1,000 | 129,068 | 8 | 2,000 |
| Yoon_Gold78 | yoon78@gmail.com | White Dragon | 1,462 | 1,000 | 129,299 | 6 | 1,500 |
| Song_Wave90 | song90@gmail.com | White Dragon | 1,445 | 1,000 | 129,233 | 5 | 1,250 |
| Lim_Eagle23 | lim23@gmail.com | White Dragon | 1,426 | 1,000 | 128,969 | 4 | 900 |
| Ko_Titan45 | ko45@gmail.com | White Dragon | 1,407 | 1,000 | 128,847 | 3 | 600 |

## 확정 Kim 조직 핵심 구조

- Kim_Dragon88: Blue Dragon, Premium, 가입일 2025-03-23
- Kim L1 직접 하부:
  - CN_Wei_Dragon: Purple Dragon, VIP, 가입일 2025-03-23
  - KR_Choi_Star: White Dragon, Premium x3, 가입일 2025-03-23
  - VN_Nguyen_Pro: White Dragon, Basic, 가입일 2025-03-23
  - CN_Liu_Rise: White Dragon, Basic, 가입일 2025-03-23
  - Lee_Profit99: Blue Dragon, Premium, 가입일 2025-03-25
  - Park_Alpha77: Blue Dragon, Premium, 가입일 2025-03-26
- Wei 하부 핵심:
  - CN_Wang_Golden: Blue Dragon, VIP
  - CN_Li_Bull: Blue Dragon, VIP
  - CN_Zhao_Star: Blue Dragon, Premium x2
  - CN_Feng_Rise: White Dragon, Premium
  - CN_Tang_Gold: White Dragon, Premium

## 정책상 보강 생성 데이터

문서는 플랫폼 전체 약 108개 계정과 Kim 조직 46개 계정을 요구하지만, 모든 하부 계정의 개별 닉네임/이메일/거래값을 완전 열거하지 않는다. 따라서 운영 검증을 위해 아래 규칙으로 보강 데이터를 생성한다.

- Kim 조직 보강분:
  - 목표: Kim 조직 총 46개 계정 충족
  - 닉네임 규칙: 확정 부모 닉네임 기반 `*_L2_XX`, `*_L3_XX`, `Kim_Auto_L3_XX`
  - 패키지: 대부분 Standard 또는 Flexible
  - 목적: Purple 승급 조건, Blue Dragon 카운트 정책, 3대 롤업 범위 검증
- 독립 운영 검증 조직:
  - 목표: 플랫폼 총 108개 계정 충족
  - 구성: 7개 White Dragon 주계정 + 보강 생성 계정 55개 = 62개
  - 닉네임 규칙: `Ops_Node_001`부터 `Ops_Node_055`
  - 이메일 규칙: `ops.node.XXX@longrise.ai`
  - 스폰서: 10개 주계정 중 White Dragon 계정에 분산
  - 목적: 관리자 회원목록, 팀 규모, 패키지 분포, 전체 지표 검증

보강 생성 계정은 운영 검증 데이터이며, 문서 확정 계정과 구분하기 위해 닉네임/이메일 규칙을 고정한다. 생성 규칙은 deterministic 하므로 재실행 시 같은 계정으로 갱신된다.

## 삽입/갱신 대상

- `users`: 주계정, Kim 조직, 독립 운영 검증 계정
- `investment_packages`: V8.9 패키지 정책
- `user_investments`: 계정별 패키지 이력
- `member_packages`: 레거시 패키지 조회 호환 이력
- `daily_returns`: 일일 수익 검증 데이터
- `transactions`: 지갑 활동 이력
- `withdrawals`: Kim 인출 이력
- `referral_tree`: Kim 조직 구조 검증
- `locked_wallet`: 원금 잠금 검증
- `usdt_transfers`: USDT 이체 내역 검증
- `token_prices`: CNYT/USDT 기준가
- `p2p_trades`: 실제 P2P API 검증용 활성 주문
- `cms_contents`, `news_articles`: 운영 검증 안내 컨텐츠

## 재실행 정책

- `V89-` 식별자를 가진 생성 거래/투자/P2P/출금 데이터는 재실행 시 교체된다.
- 사용자와 패키지는 이메일/패키지 ID 기준으로 갱신된다.
- 임의 난수 없이 동일 입력에서 동일 데이터가 생성된다.
