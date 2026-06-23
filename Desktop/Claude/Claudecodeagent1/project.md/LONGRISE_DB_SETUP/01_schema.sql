-- ============================================================
-- LONGRISE AI — DB Schema
-- 쇼케이스 시연용 계정 세팅 V1.0
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS usdt_transfers;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS daily_returns;
DROP TABLE IF EXISTS referral_tree;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABLE 1: users (10개 주계정)
-- ============================================================
CREATE TABLE users (
  id                    VARCHAR(30)     PRIMARY KEY,              -- 'LR-KIM-001'
  email                 VARCHAR(255)    UNIQUE NOT NULL,          -- kim88@gmail.com
  nickname              VARCHAR(100)    NOT NULL,                 -- Kim_Dragon88
  name                  VARCHAR(100),                             -- 실명 (선택)

  -- 직급 및 상태
  rank                  VARCHAR(50)     NOT NULL DEFAULT 'White Dragon',
  status                VARCHAR(20)     NOT NULL DEFAULT 'active',

  -- 자산 (3가지 분리)
  balance_usdt          DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- 출금가능 USDT (수익분)
  platform_usdt         DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- 플랫폼 내부 USDT
  locked_usdt           DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- 원금 (잠금, 만기 시 해제)
  balance_cnyt          DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- CNYT 토큰 잔고

  -- 현재 패키지
  current_package       VARCHAR(20)     NOT NULL DEFAULT 'Standard',
  current_investment    DECIMAL(20,2)   NOT NULL DEFAULT 0,

  -- 조직 정보
  sponsor_id            VARCHAR(30)     DEFAULT NULL,             -- 상위 계정 (NULL = 최상위)
  direct_referrals      INT             NOT NULL DEFAULT 0,       -- 직접추천 수
  team_size             INT             NOT NULL DEFAULT 0,       -- 총 하부조직 수
  team_sales            DECIMAL(20,2)   NOT NULL DEFAULT 0,       -- 팀 총 투자금
  body_value            DECIMAL(20,2)   NOT NULL DEFAULT 0,       -- 본인 투자금 합산

  -- 보안
  trading_password      VARCHAR(255)    DEFAULT NULL,             -- 거래 비밀번호
  has_trading_password  BOOLEAN         NOT NULL DEFAULT FALSE,
  otp_enabled           BOOLEAN         NOT NULL DEFAULT FALSE,

  -- 인증
  kyc_level             TINYINT         NOT NULL DEFAULT 2,
  kyc_status            VARCHAR(20)     NOT NULL DEFAULT 'verified',
  pageface              BOOLEAN         NOT NULL DEFAULT TRUE,
  mobile_binding        BOOLEAN         NOT NULL DEFAULT TRUE,

  -- 디스트리뷰터
  distributor_code      VARCHAR(50)     DEFAULT NULL,
  distributor_status    VARCHAR(20)     NOT NULL DEFAULT 'approved',

  -- 날짜
  join_date             DATE            NOT NULL,
  last_login_at         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rank        (rank),
  INDEX idx_sponsor     (sponsor_id),
  INDEX idx_join_date   (join_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE 2: packages (패키지 구매 이력)
-- ============================================================
CREATE TABLE packages (
  id                    VARCHAR(50)     PRIMARY KEY,
  user_id               VARCHAR(30)     NOT NULL,

  package_type          VARCHAR(20)     NOT NULL,                 -- 'Standard' / 'Premium'
  investment_amount     DECIMAL(20,2)   NOT NULL,                 -- 500.00 / 1000.00
  purchase_date         DATE            NOT NULL,
  maturity_date         DATE            NOT NULL,                 -- 12개월 후
  status                VARCHAR(20)     NOT NULL DEFAULT 'active',-- 'active' / 'completed'

  -- 수익률 (패키지 약정)
  usdt_monthly_rate     DECIMAL(5,2)    NOT NULL,                 -- 9.00 / 11.00
  cnyt_rate             DECIMAL(5,2)    NOT NULL DEFAULT 0,       -- 4.00 / 6.00

  created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id     (user_id),
  INDEX idx_status      (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE 3: daily_returns (일일 수익 데이터 — 1년치)
-- ============================================================
CREATE TABLE daily_returns (
  id                    VARCHAR(60)     PRIMARY KEY,              -- 'DR-{user_id}-{date}'
  user_id               VARCHAR(30)     NOT NULL,
  date                  DATE            NOT NULL,

  -- 화면 표시용 (CryptoAI 대시보드)
  pool_rate             DECIMAL(6,4)    NOT NULL DEFAULT 0,       -- Pool 수익률 %
  betting_rate          DECIMAL(6,4)    NOT NULL DEFAULT 0,       -- Betting 수익률 %
  futures_rate          DECIMAL(6,4)    NOT NULL DEFAULT 0,       -- Futures 수익률 %
  displayed_rate        DECIMAL(6,4)    NOT NULL DEFAULT 0,       -- 합산 표시 수익률 %

  -- 실제 지급액
  investment_base       DECIMAL(20,2)   NOT NULL,                 -- 당일 기준 투자원금
  usdt_earned           DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- 실제 지급 USDT
  cnyt_earned           DECIMAL(20,4)   NOT NULL DEFAULT 0,       -- 실제 지급 CNYT

  -- 일자 유형
  day_type              VARCHAR(10)     NOT NULL DEFAULT 'profit', -- 'profit'/'defense'/'jackpot'

  created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date        (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE 4: transactions (지갑 활동 내역)
-- ============================================================
CREATE TABLE transactions (
  id                    VARCHAR(60)     PRIMARY KEY,
  user_id               VARCHAR(30)     NOT NULL,

  type                  VARCHAR(30)     NOT NULL,
  -- 'deposit'           : 최초 입금 / 추가 입금
  -- 'daily_roi'         : AI Performance Bonus (일일 수익)
  -- 'direct_referral'   : 직접추천 수당 (1회성)
  -- 'rollup'            : Matching Commission (롤업)
  -- 'global_pool'       : Global Pool Distribution
  -- 'cnyt_bonus'        : CNYT 초기 보너스

  amount                DECIMAL(20,4)   NOT NULL,
  currency              VARCHAR(10)     NOT NULL DEFAULT 'USDT',  -- 'USDT' / 'CNYT'
  description           VARCHAR(255)    NOT NULL,

  ref_user_id           VARCHAR(50)     DEFAULT NULL,             -- 수당 발생 하부 계정
  ref_level             TINYINT         DEFAULT NULL,             -- 몇 레벨 하부

  status                VARCHAR(20)     NOT NULL DEFAULT 'completed',
  created_at            TIMESTAMP       NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type   (user_id, type),
  INDEX idx_created     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE 5: referral_tree (조직도 — 총 ~638명)
-- ============================================================
CREATE TABLE referral_tree (
  id                    VARCHAR(50)     PRIMARY KEY,              -- 'KIM-L1-B01' 형식
  nickname              VARCHAR(100)    NOT NULL,

  -- 관계
  root_user_id          VARCHAR(30)     NOT NULL,                 -- 최상위 주계정
  sponsor_id            VARCHAR(50)     NOT NULL,                 -- 직접 상위

  -- 위치
  level_from_root       TINYINT         NOT NULL,                 -- 1 = root의 직추천
  line_number           TINYINT         NOT NULL,                 -- 1~5 (어느 라인)

  -- 기본 정보 (옵션A)
  rank                  VARCHAR(50)     NOT NULL DEFAULT 'White Dragon',
  package_type          VARCHAR(20)     NOT NULL,
  investment_amount     DECIMAL(20,2)   NOT NULL,
  join_date             DATE            NOT NULL,

  -- 국가 (시연 시 국기 표시용)
  country_code          VARCHAR(5)      DEFAULT 'CN',             -- 'CN'/'JP'/'KR'/'VN'

  created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_root        (root_user_id),
  INDEX idx_sponsor     (sponsor_id),
  INDEX idx_level       (root_user_id, level_from_root)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE 6: usdt_transfers (USDT 이체 내역)
-- ============================================================
CREATE TABLE usdt_transfers (
  id                    VARCHAR(50)     PRIMARY KEY,
  user_id               VARCHAR(30)     NOT NULL,

  direction             VARCHAR(10)     NOT NULL,                 -- 'RECEIVE' / 'SEND' / 'SELL'
  counterpart_nickname  VARCHAR(100)    NOT NULL,
  counterpart_country   VARCHAR(5)      DEFAULT 'CN',
  amount                DECIMAL(20,2)   NOT NULL,
  status                VARCHAR(20)     NOT NULL DEFAULT 'COMPLETED',

  created_at            TIMESTAMP       NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id     (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
