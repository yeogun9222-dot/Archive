-- ============================================================================
-- LONGRISE AI Database Schema Design
-- PostgreSQL 15+
-- 분석된 plan_longrise_admin, plan_longrise_user 기반 설계
-- ============================================================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. 사용자 관련 테이블
-- ============================================================================

-- 사용자 등급 enum
CREATE TYPE dragon_rank AS ENUM ('Investor', 'White Dragon', 'Blue Dragon', 'Purple Dragon', 'Red Dragon', 'Black Dragon');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned', 'suspended');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE distributor_status AS ENUM ('none', 'pending', 'approved', 'rejected');

-- 메인 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(20),

    -- 계정 상태
    rank dragon_rank DEFAULT 'Investor',
    status user_status DEFAULT 'active',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 자산 정보
    balance_usdt DECIMAL(18, 8) DEFAULT 0.00,
    locked_usdt DECIMAL(18, 8) DEFAULT 0.00,
    balance_cnyt DECIMAL(18, 8) DEFAULT 0.00,
    total_assets DECIMAL(18, 8) GENERATED ALWAYS AS (balance_usdt + locked_usdt) STORED,

    -- 투자 정보
    package VARCHAR(20) DEFAULT 'Flexible',
    initial_investment DECIMAL(18, 8) DEFAULT 0.00,
    investment_date DATE,

    -- 팀/조직 정보
    sponsor_id UUID REFERENCES users(id),
    team_size INTEGER DEFAULT 0,
    team_vol DECIMAL(18, 8) DEFAULT 0.00,
    body_value DECIMAL(18, 8) DEFAULT 0.00,

    -- 인증 정보
    kyc_level INTEGER DEFAULT 0 CHECK (kyc_level BETWEEN 0 AND 3),
    kyc_status kyc_status DEFAULT 'pending',
    kyc_updated_at TIMESTAMP,
    pageface BOOLEAN DEFAULT false,
    mobile_binding BOOLEAN DEFAULT false,

    -- 보안 정보
    password_hash VARCHAR(255) NOT NULL,
    trading_password_hash VARCHAR(255),
    has_set_trading_password BOOLEAN DEFAULT false,
    is_trading_password_verified BOOLEAN DEFAULT false,
    otp_enabled BOOLEAN DEFAULT false,
    otp_secret VARCHAR(512),
    otp_pending_secret VARCHAR(512),
    otp_pending_created_at TIMESTAMP,
    otp_backup_codes_hash TEXT,
    last_login_at TIMESTAMP,
    anti_phishing_code VARCHAR(10),

    -- 디스트리뷰터 정보
    distributor_status distributor_status DEFAULT 'none',
    distributor_code VARCHAR(10),
    distributor_approved_at TIMESTAMP,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_commission DECIMAL(18, 8) DEFAULT 0.00,
    referred_count INTEGER DEFAULT 0,

    -- 제한 조건
    is_withdrawal_blocked BOOLEAN DEFAULT false,
    is_account_locked BOOLEAN DEFAULT false,
    is_frozen BOOLEAN DEFAULT false,
    block_reason TEXT,
    block_expires_at TIMESTAMP,
    max_out_ratio DECIMAL(4, 1) DEFAULT 10.0,

    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 지갑 정보
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'USDT', 'BTC', 'ETH', etc.
    label VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 로그인 이력
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device VARCHAR(100),
    location VARCHAR(100),
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. 관리자 관련 테이블
-- ============================================================================

CREATE TYPE admin_role AS ENUM ('super', 'finance', 'community', 'content');

-- 관리자 사용자
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role NOT NULL,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 감사 로그
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'approve', etc.
    resource VARCHAR(50) NOT NULL, -- 'user', 'withdrawal', 'product', etc.
    resource_id VARCHAR(255) NOT NULL,
    changes JSONB,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. 투자 패키지 관련 테이블
-- ============================================================================

CREATE TYPE package_type AS ENUM ('Flexible', 'Basic', 'Standard', 'Premium', 'VIP');
CREATE TYPE package_status AS ENUM ('active', 'early_termination_pending', 'early_terminated', 'matured');

-- 패키지 정책
CREATE TABLE package_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    label package_type UNIQUE NOT NULL,
    usdt_daily DECIMAL(8, 6) NOT NULL, -- 일일 수익률 (%)
    cnyt_daily DECIMAL(8, 6) NOT NULL, -- CNYT 일일 수익률 (%)
    min_investment DECIMAL(18, 8) NOT NULL,
    maturity_months INTEGER NOT NULL,
    early_withdrawal_penalty JSONB DEFAULT '{}', -- 조기 출금 수수료 정책
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 회원 투자 패키지 (사용자가 실제로 구매한 패키지)
CREATE TABLE member_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_type package_type NOT NULL,
    principal DECIMAL(18, 8) NOT NULL, -- 원금
    join_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    current_balance DECIMAL(18, 8) DEFAULT 0.00,
    current_roi DECIMAL(8, 4) DEFAULT 0.00, -- 현재까지 ROI (%)
    expected_roi DECIMAL(8, 4) NOT NULL, -- 예상 최종 ROI (%)
    status package_status DEFAULT 'active',
    expected_refund DECIMAL(18, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. 거래 관련 테이블
-- ============================================================================

CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'reward', 'commission', 'adjustment', 'swap', 'daily_roi', 'direct_bonus', 'rollup_bonus', 'rank_share', 'cnyt_airdrop', 'promotion');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE currency_type AS ENUM ('USDT', 'CNYT', 'BTC', 'ETH');

-- 거래 내역
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    currency currency_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    description TEXT NOT NULL,
    hash VARCHAR(255), -- 블록체인 해시 (해당하는 경우)
    fee DECIMAL(18, 8) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 출금 요청
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    currency currency_type NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    status transaction_status DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES admin_users(id),
    rejection_reason TEXT,
    transaction_hash VARCHAR(255)
);

-- P2P 거래 로그
CREATE TABLE p2p_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(100) UNIQUE NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(18, 8) NOT NULL,
    currency currency_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================================================
-- 5. M13 EXIT 시스템 테이블
-- ============================================================================

CREATE TYPE m13_exit_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- M13 EXIT 정산
CREATE TABLE m13_exit_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id),
    member_package_id UUID NOT NULL REFERENCES member_packages(id),
    join_date DATE NOT NULL,
    m13_date DATE NOT NULL,
    principal DECIMAL(18, 8) NOT NULL,
    package package_type NOT NULL,

    -- 지출 항목
    usdt_spent DECIMAL(18, 8) DEFAULT 0.00,
    cnyt_spent DECIMAL(18, 8) DEFAULT 0.00,
    direct_bonus DECIMAL(18, 8) DEFAULT 0.00,
    rollup_bonus DECIMAL(18, 8) DEFAULT 0.00,
    global_pool DECIMAL(18, 8) DEFAULT 0.00,
    total_expense DECIMAL(18, 8) DEFAULT 0.00,

    -- 정산 결과
    basic_refund DECIMAL(18, 8) DEFAULT 0.00,
    minimum_refund DECIMAL(18, 8) DEFAULT 0.00, -- 15% 보장
    final_refund DECIMAL(18, 8) DEFAULT 0.00,
    floor_applied BOOLEAN DEFAULT false,
    company_loss DECIMAL(18, 8) DEFAULT 0.00,

    -- 상태
    status m13_exit_status DEFAULT 'pending',
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- M13 EXIT 큐
CREATE TABLE m13_exit_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id),
    member_package_id UUID NOT NULL REFERENCES member_packages(id),
    join_date DATE NOT NULL,
    m13_date DATE NOT NULL,
    principal DECIMAL(18, 8) NOT NULL,
    package package_type NOT NULL,
    final_refund DECIMAL(18, 8),
    status m13_exit_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- M13 EXIT 알림
CREATE TABLE m13_exit_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- 'SMS', 'EMAIL', 'PUSH', 'IN_APP'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    recipient VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. 고객 지원 테이블
-- ============================================================================

CREATE TYPE ticket_category AS ENUM ('FINANCE', 'TECHNICAL', 'GENERAL');
CREATE TYPE ticket_status AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');

-- 지원 티켓
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category ticket_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    author_name VARCHAR(100) NOT NULL,
    status ticket_status DEFAULT 'PENDING',
    priority ticket_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES admin_users(id),
    content TEXT NOT NULL,
    responses JSONB DEFAULT '[]',
    resolved_at TIMESTAMP,
    response_time INTEGER, -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. 시스템 설정 및 기타 테이블
-- ============================================================================

-- ROI 설정 (동적 ROI 관리)
CREATE TABLE roi_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_type package_type NOT NULL,
    usdt_daily_rate DECIMAL(8, 6) NOT NULL,
    cnyt_daily_rate DECIMAL(8, 6) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 설정
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. 인덱스 생성
-- ============================================================================

-- 사용자 관련 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_users_sponsor_id ON users(sponsor_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_users_join_date ON users(join_date);

-- 거래 관련 인덱스
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- 패키지 관련 인덱스
CREATE INDEX idx_member_packages_user_id ON member_packages(user_id);
CREATE INDEX idx_member_packages_status ON member_packages(status);
CREATE INDEX idx_member_packages_maturity_date ON member_packages(maturity_date);

-- M13 EXIT 관련 인덱스
CREATE INDEX idx_m13_settlements_member_id ON m13_exit_settlements(member_id);
CREATE INDEX idx_m13_settlements_m13_date ON m13_exit_settlements(m13_date);
CREATE INDEX idx_m13_settlements_status ON m13_exit_settlements(status);

-- 감사 로그 인덱스
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- 9. 트리거 및 함수
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_package_policies_updated_at BEFORE UPDATE ON package_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_packages_updated_at BEFORE UPDATE ON member_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. 기본 데이터 삽입
-- ============================================================================

-- 기본 패키지 정책
INSERT INTO package_policies (name, label, usdt_daily, cnyt_daily, min_investment, maturity_months) VALUES
('Flexible Package', 'Flexible', 0.002000, 0.001000, 100.00, 1),
('Basic Package', 'Basic', 0.002500, 0.001200, 500.00, 6),
('Standard Package', 'Standard', 0.003000, 0.001500, 1000.00, 12),
('Premium Package', 'Premium', 0.003500, 0.001800, 5000.00, 24),
('VIP Package', 'VIP', 0.004000, 0.002000, 10000.00, 36);

-- 기본 관리자 계정 (비밀번호: admin123!)
INSERT INTO admin_users (username, email, name, password_hash, role, permissions) VALUES
('admin', 'admin@longrise.ai', 'System Administrator',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', -- admin123!
 'super',
 '["user.read", "user.write", "finance.read", "finance.write", "admin.read", "admin.write"]'::jsonb
);

-- 기본 시스템 설정
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'System maintenance mode'),
('registration_enabled', 'true', 'User registration enabled'),
('withdrawal_enabled', 'true', 'Withdrawal functionality enabled'),
('min_withdrawal_amount', '{"USDT": 50, "CNYT": 100}', 'Minimum withdrawal amounts'),
('max_withdrawal_amount', '{"USDT": 50000, "CNYT": 100000}', 'Maximum withdrawal amounts'),
('daily_roi_enabled', 'true', 'Daily ROI calculation enabled');

-- ============================================================================
-- 완료
-- ============================================================================

-- 스키마 생성 완료
COMMENT ON DATABASE postgres IS 'LONGRISE AI - Crypto Investment Platform Database';
