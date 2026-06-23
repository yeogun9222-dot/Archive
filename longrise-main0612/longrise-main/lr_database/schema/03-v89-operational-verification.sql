-- V8.9 Rev.2 operational verification support.
-- This migration keeps the existing operational schema intact and adds only
-- columns/tables required by the master plan data-injection package.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8),
    ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(8);

WITH normalized_users AS (
    SELECT
        id,
        UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 8)) AS generated_code
    FROM users
    WHERE referral_code IS NULL
       OR referral_code !~ '^[A-Z0-9]{8}$'
)
UPDATE users
SET referral_code = normalized_users.generated_code
FROM normalized_users
WHERE users.id = normalized_users.id;

UPDATE users AS child
SET referred_by_code = sponsor.referral_code
FROM users AS sponsor
WHERE child.sponsor_id = sponsor.id
  AND (
      child.referred_by_code IS NULL
      OR child.referred_by_code !~ '^[A-Z0-9]{8}$'
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code_unique
    ON users(referral_code)
    WHERE referral_code IS NOT NULL;

ALTER TABLE users
    ALTER COLUMN referral_code SET NOT NULL;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_referral_code_format_check;

ALTER TABLE users
    ADD CONSTRAINT users_referral_code_format_check CHECK (referral_code ~ '^[A-Z0-9]{8}$');

CREATE INDEX IF NOT EXISTS idx_users_referred_by_code
    ON users(referred_by_code);

CREATE TABLE IF NOT EXISTS daily_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    return_date DATE NOT NULL,
    package_type VARCHAR(20) NOT NULL,
    pool_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
    betting_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
    futures_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
    displayed_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
    usdt_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
    cnyt_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
    day_type VARCHAR(20) NOT NULL,
    proof_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, return_date, package_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_returns_user_date
    ON daily_returns(user_id, return_date DESC);

CREATE TABLE IF NOT EXISTS referral_tree (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    root_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES users(id),
    level_from_root INTEGER NOT NULL DEFAULT 0,
    line_number INTEGER NOT NULL DEFAULT 0,
    rank VARCHAR(30) NOT NULL DEFAULT 'Investor',
    package_type VARCHAR(20) NOT NULL DEFAULT 'Flexible',
    investment_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
    team_sales DECIMAL(18, 8) NOT NULL DEFAULT 0,
    join_date DATE NOT NULL,
    proof_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (root_user_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_tree_root_level
    ON referral_tree(root_user_id, level_from_root, line_number);

CREATE TABLE IF NOT EXISTS usdt_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL,
    counterpart_nickname VARCHAR(80) NOT NULL,
    counterpart_country VARCHAR(40) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    transfer_date DATE NOT NULL,
    proof_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usdt_transfers_user_date
    ON usdt_transfers(user_id, transfer_date DESC);

CREATE TABLE IF NOT EXISTS locked_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    locked_principal DECIMAL(18, 8) NOT NULL DEFAULT 0,
    locked_bonus DECIMAL(18, 8) NOT NULL DEFAULT 0,
    package_ref VARCHAR(80) NOT NULL,
    lock_start DATE NOT NULL,
    lock_until DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    proof_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, package_ref)
);

CREATE INDEX IF NOT EXISTS idx_locked_wallet_user_status
    ON locked_wallet(user_id, status);
