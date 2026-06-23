-- ============================================================
-- LONGRISE AI — 정적 데이터 INSERT
-- 10개 주계정 + 22개 패키지 구매 이력
-- ※ Gmail 교체 시 email 컬럼만 수정하세요
-- ============================================================

-- ============================================================
-- SECTION 1: 10개 주계정 (users)
-- ============================================================
-- 계산 기준 (V8.9 최종):
--   플랫폼 시작일: 2025-01-01 / 금일: 2026-06-01
--   Kim: Premium $1,000(2025-01-01) + Standard $500(2025-08-01) + Premium 재투자(2026-01-02) = $1,500 LOCKED
--   Blue Dragon (Kim/Lee/Park): 일일수익 + 직추천수당($160) + 롤업수당($1,000)
--   White Dragon (Choi~Ko):     일일수익 + 직추천수당($60~110) / 롤업 없음
--   CNYT = (USDT 수익 x CNYT율) / $0.02
--   거래비밀번호 = Longrise1! (전 계정 통일)
--   Line2 = 중국 지인 (일본 아님)
-- ============================================================

INSERT INTO users (
  id, email, nickname,
  rank, status,
  balance_usdt, platform_usdt, locked_usdt, balance_cnyt,
  current_package, current_investment,
  sponsor_id, direct_referrals, team_size, team_sales, body_value,
  trading_password, has_trading_password, otp_enabled,
  kyc_level, kyc_status, pageface, mobile_binding,
  distributor_code, distributor_status,
  join_date, last_login_at
) VALUES

-- 01. Kim_Dragon88 — 히어로 계정 (2025-03-23 가입 / 95명 / Premium $1,000)
-- USDT: $3,957 (인출2회$1,530 후 현재) / LOCKED: $0 (만기완료, 재투자없음)
-- CNYT: 초기보너스500 + 월330×12 = 4,460개
('LR-KIM-001', 'kim88@gmail.com', 'Kim_Dragon88',
 'Blue Dragon', 'active',
 3957.00, 0.00, 0.00, 4460.00,
 'Premium', 1000.00,
 NULL, 5, 95, 28500.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'KIM-DR-001', 'approved',
 '2025-03-23', '2026-06-05 18:30:00'),

-- 02. Lee_Profit99 (Blue Dragon, 35명 / 1개 Blue Dragon 라인)
('LR-LEE-002', 'lee99@gmail.com', 'Lee_Profit99',
 'Blue Dragon', 'active',
 2157.00, 162.00, 1000.00, 4824.00,
 'Premium', 1000.00,
 NULL, 5, 35, 10200.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'LEE-DR-002', 'approved',
 '2025-02-10', '2026-05-21 14:20:00'),

-- 03. Park_Alpha77 (Blue Dragon, 22명 / 1개 Blue Dragon 라인)
('LR-PAR-003', 'park77@gmail.com', 'Park_Alpha77',
 'Blue Dragon', 'active',
 2100.00, 155.00, 1000.00, 4771.00,
 'Premium', 1000.00,
 NULL, 5, 22, 6400.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'PAR-DR-003', 'approved',
 '2025-02-15', '2026-05-20 09:45:00'),

-- 04. Choi_Rise12 (White Dragon, 17명 / Blue Dragon 달성 중)
('LR-CHO-004', 'choi12@gmail.com', 'Choi_Rise12',
 'White Dragon', 'active',
 1564.00, 112.00, 1000.00, 4714.00,
 'Premium', 1000.00,
 NULL, 4, 17, 4200.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'CHO-DR-004', 'approved',
 '2025-02-18', '2026-05-20 16:10:00'),

-- 05. Han_Node34 (White Dragon, 12명)
('LR-HAN-005', 'han34@gmail.com', 'Han_Node34',
 'White Dragon', 'active',
 1549.00, 105.00, 1000.00, 4664.00,
 'Premium', 1000.00,
 NULL, 4, 12, 3000.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'HAN-DR-005', 'approved',
 '2025-02-22', '2026-05-19 11:30:00'),

-- 06. Jung_Bull56 (White Dragon, 8명)
('LR-JUN-006', 'jung56@gmail.com', 'Jung_Bull56',
 'White Dragon', 'active',
 1481.00, 98.00, 1000.00, 4611.00,
 'Premium', 1000.00,
 NULL, 3, 8, 2000.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'JUN-DR-006', 'approved',
 '2025-02-26', '2026-05-18 20:00:00'),

-- 07. Yoon_Gold78 (White Dragon, 6명)
('LR-YOO-007', 'yoon78@gmail.com', 'Yoon_Gold78',
 'White Dragon', 'active',
 1462.00, 92.00, 1000.00, 4551.00,
 'Premium', 1000.00,
 NULL, 3, 6, 1500.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'YOO-DR-007', 'approved',
 '2025-03-02', '2026-05-17 13:15:00'),

-- 08. Song_Wave90 (White Dragon, 5명)
('LR-SON-008', 'song90@gmail.com', 'Song_Wave90',
 'White Dragon', 'active',
 1445.00, 88.00, 1000.00, 4498.00,
 'Premium', 1000.00,
 NULL, 3, 5, 1250.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'SON-DR-008', 'approved',
 '2025-03-07', '2026-05-16 08:45:00'),

-- 09. Lim_Eagle23 (White Dragon, 4명)
('LR-LIM-009', 'lim23@gmail.com', 'Lim_Eagle23',
 'White Dragon', 'active',
 1426.00, 82.00, 1000.00, 4442.00,
 'Premium', 1000.00,
 NULL, 3, 4, 900.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'LIM-DR-009', 'approved',
 '2025-03-12', '2026-05-15 17:00:00'),

-- 10. Ko_Titan45 (White Dragon, 3명 / 가장 신생 계정 / 직추천만 있음)
('LR-KOT-010', 'ko45@gmail.com', 'Ko_Titan45',
 'White Dragon', 'active',
 1407.00, 78.00, 1000.00, 4386.00,
 'Premium', 1000.00,
 NULL, 3, 3, 600.00, 1000.00,
 'Longrise1!', TRUE, TRUE,
 2, 'verified', TRUE, TRUE,
 'KOT-DR-010', 'approved',
 '2025-03-17', '2026-05-14 10:30:00');


-- ============================================================
-- SECTION 2: 패키지 구매 이력 (packages)
-- 각 계정 2건: Standard $500 → Premium $1,000 업그레이드
-- ============================================================

INSERT INTO packages (
  id, user_id, package_type, investment_amount,
  purchase_date, maturity_date, status,
  usdt_monthly_rate, cnyt_rate
) VALUES

-- ── KIM (3패키지: Premium 최초 → Standard 추가 → Premium 재투자) ─────────
-- PKG-KIM-001: Premium $1,000 (2025-01-01 가입, 만기 2026-01-01, 완료)
('PKG-KIM-001', 'LR-KIM-001', 'Premium', 1000.00,
 '2025-01-01', '2026-01-01', 'completed', 11.00, 6.00),
-- PKG-KIM-002: Standard $500 추가투자 (2025-08-01, 만기 2026-08-01, 활성)
('PKG-KIM-002', 'LR-KIM-001', 'Standard', 500.00,
 '2025-08-01', '2026-08-01', 'active',    9.00, 4.00),
-- PKG-KIM-003: Premium $1,000 재투자 (만기 후 즉시 재가입, 2026-01-02, 활성)
('PKG-KIM-003', 'LR-KIM-001', 'Premium', 1000.00,
 '2026-01-02', '2027-01-02', 'active',   11.00, 6.00),

-- ── LEE ────────────────────────────────────────────────
('PKG-LEE-001', 'LR-LEE-002', 'Standard',  500.00,
 '2025-02-10', '2026-02-10', 'completed', 9.00, 4.00),
('PKG-LEE-002', 'LR-LEE-002', 'Premium', 1000.00,
 '2025-05-17', '2026-05-17', 'active',   11.00, 6.00),

-- ── PARK ───────────────────────────────────────────────
('PKG-PAR-001', 'LR-PAR-003', 'Standard',  500.00,
 '2025-02-15', '2026-02-15', 'completed', 9.00, 4.00),
('PKG-PAR-002', 'LR-PAR-003', 'Premium', 1000.00,
 '2025-05-22', '2026-05-22', 'active',   11.00, 6.00),

-- ── CHOI ───────────────────────────────────────────────
('PKG-CHO-001', 'LR-CHO-004', 'Standard',  500.00,
 '2025-02-18', '2026-02-18', 'completed', 9.00, 4.00),
('PKG-CHO-002', 'LR-CHO-004', 'Premium', 1000.00,
 '2025-05-28', '2026-05-28', 'active',   11.00, 6.00),

-- ── HAN ────────────────────────────────────────────────
('PKG-HAN-001', 'LR-HAN-005', 'Standard',  500.00,
 '2025-02-22', '2026-02-22', 'completed', 9.00, 4.00),
('PKG-HAN-002', 'LR-HAN-005', 'Premium', 1000.00,
 '2025-06-03', '2026-06-03', 'active',   11.00, 6.00),

-- ── JUNG ───────────────────────────────────────────────
('PKG-JUN-001', 'LR-JUN-006', 'Standard',  500.00,
 '2025-02-26', '2026-02-26', 'completed', 9.00, 4.00),
('PKG-JUN-002', 'LR-JUN-006', 'Premium', 1000.00,
 '2025-06-08', '2026-06-08', 'active',   11.00, 6.00),

-- ── YOON ───────────────────────────────────────────────
('PKG-YOO-001', 'LR-YOO-007', 'Standard',  500.00,
 '2025-03-02', '2026-03-02', 'completed', 9.00, 4.00),
('PKG-YOO-002', 'LR-YOO-007', 'Premium', 1000.00,
 '2025-06-14', '2026-06-14', 'active',   11.00, 6.00),

-- ── SONG ───────────────────────────────────────────────
('PKG-SON-001', 'LR-SON-008', 'Standard',  500.00,
 '2025-03-07', '2026-03-07', 'completed', 9.00, 4.00),
('PKG-SON-002', 'LR-SON-008', 'Premium', 1000.00,
 '2025-06-19', '2026-06-19', 'active',   11.00, 6.00),

-- ── LIM ────────────────────────────────────────────────
('PKG-LIM-001', 'LR-LIM-009', 'Standard',  500.00,
 '2025-03-12', '2026-03-12', 'completed', 9.00, 4.00),
('PKG-LIM-002', 'LR-LIM-009', 'Premium', 1000.00,
 '2025-06-24', '2026-06-24', 'active',   11.00, 6.00),

-- ── KO ─────────────────────────────────────────────────
('PKG-KOT-001', 'LR-KOT-010', 'Standard',  500.00,
 '2025-03-17', '2026-03-17', 'completed', 9.00, 4.00),
('PKG-KOT-002', 'LR-KOT-010', 'Premium', 1000.00,
 '2025-06-29', '2026-06-29', 'active',   11.00, 6.00);


-- ============================================================
-- SECTION 3: USDT 이체 내역 (usdt_transfers)
-- 각 계정당 3건 (해외 지인 방향 거래)
-- ============================================================

INSERT INTO usdt_transfers (
  id, user_id, direction, counterpart_nickname,
  counterpart_country, amount, status, created_at
) VALUES

-- KIM
('TRF-KIM-001','LR-KIM-001','RECEIVE','CN_Wei_Dragon',     'CN',  500.00,'COMPLETED','2026-03-23 14:22:00'),
('TRF-KIM-002','LR-KIM-001','SELL',   'CN_Zhang_Rise',     'CN',  250.00,'COMPLETED','2026-03-22 10:15:00'),
('TRF-KIM-003','LR-KIM-001','RECEIVE','VN_Nguyen_Pro',     'VN', 1000.00,'COMPLETED','2026-03-21 16:45:00'),

-- LEE
('TRF-LEE-001','LR-LEE-002','RECEIVE','CN_Li_Network',     'CN',  400.00,'COMPLETED','2026-03-20 11:00:00'),
('TRF-LEE-002','LR-LEE-002','SELL',   'JP_Sato_Trade',     'JP',  300.00,'COMPLETED','2026-03-19 09:30:00'),
('TRF-LEE-003','LR-LEE-002','RECEIVE','CN_Zhang_Group',    'CN',  800.00,'COMPLETED','2026-03-18 15:20:00'),

-- PARK
('TRF-PAR-001','LR-PAR-003','RECEIVE','CN_Wu_Network',     'CN',  350.00,'COMPLETED','2026-03-17 13:40:00'),
('TRF-PAR-002','LR-PAR-003','SELL',   'JP_Yamamoto',       'JP',  200.00,'COMPLETED','2026-03-16 10:00:00'),
('TRF-PAR-003','LR-PAR-003','RECEIVE','KR_Seoul_Team',     'KR',  600.00,'COMPLETED','2026-03-15 14:30:00'),

-- CHOI
('TRF-CHO-001','LR-CHO-004','RECEIVE','CN_Beijing_Node',   'CN',  450.00,'COMPLETED','2026-03-14 12:00:00'),
('TRF-CHO-002','LR-CHO-004','SELL',   'JP_Osaka_Rise',     'JP',  150.00,'COMPLETED','2026-03-13 09:00:00'),
('TRF-CHO-003','LR-CHO-004','RECEIVE','VN_Hanoi_Net',      'VN',  700.00,'COMPLETED','2026-03-12 16:00:00'),

-- HAN
('TRF-HAN-001','LR-HAN-005','RECEIVE','CN_Shenzhen_V',     'CN',  300.00,'COMPLETED','2026-03-11 11:30:00'),
('TRF-HAN-002','LR-HAN-005','SELL',   'JP_Tokyo_Alpha',    'JP',  200.00,'COMPLETED','2026-03-10 08:45:00'),
('TRF-HAN-003','LR-HAN-005','RECEIVE','CN_Guangzhou_Net',  'CN',  500.00,'COMPLETED','2026-03-09 15:00:00'),

-- JUNG
('TRF-JUN-001','LR-JUN-006','RECEIVE','CN_Dragon_East',    'CN',  250.00,'COMPLETED','2026-03-08 14:00:00'),
('TRF-JUN-002','LR-JUN-006','SELL',   'JP_Kyoto_Node',     'JP',  180.00,'COMPLETED','2026-03-07 10:20:00'),
('TRF-JUN-003','LR-JUN-006','RECEIVE','KR_Busan_Rise',     'KR',  400.00,'COMPLETED','2026-03-06 16:40:00'),

-- YOON
('TRF-YOO-001','LR-YOO-007','RECEIVE','CN_Shanghai_Net',   'CN',  300.00,'COMPLETED','2026-03-05 13:00:00'),
('TRF-YOO-002','LR-YOO-007','SELL',   'JP_Nagoya_Alpha',   'JP',  120.00,'COMPLETED','2026-03-04 09:30:00'),
('TRF-YOO-003','LR-YOO-007','RECEIVE','CN_Wuhan_Dragon',   'CN',  450.00,'COMPLETED','2026-03-03 14:50:00'),

-- SONG
('TRF-SON-001','LR-SON-008','RECEIVE','CN_Chengdu_Node',   'CN',  200.00,'COMPLETED','2026-03-02 11:00:00'),
('TRF-SON-002','LR-SON-008','SELL',   'JP_Sapporo_Rise',   'JP',  150.00,'COMPLETED','2026-03-01 08:00:00'),
('TRF-SON-003','LR-SON-008','RECEIVE','VN_Hcm_Network',    'VN',  350.00,'COMPLETED','2026-02-28 16:00:00'),

-- LIM
('TRF-LIM-001','LR-LIM-009','RECEIVE','CN_Nanjing_Net',    'CN',  180.00,'COMPLETED','2026-02-27 14:00:00'),
('TRF-LIM-002','LR-LIM-009','SELL',   'JP_Yokohama_V',     'JP',  100.00,'COMPLETED','2026-02-26 10:00:00'),
('TRF-LIM-003','LR-LIM-009','RECEIVE','KR_Incheon_Rise',   'KR',  280.00,'COMPLETED','2026-02-25 15:30:00'),

-- KO
('TRF-KOT-001','LR-KOT-010','RECEIVE','CN_Tianjin_Node',  'CN',  150.00,'COMPLETED','2026-02-24 13:00:00'),
('TRF-KOT-002','LR-KOT-010','SELL',   'JP_Fukuoka_Net',   'JP',   80.00,'COMPLETED','2026-02-23 09:00:00'),
('TRF-KOT-003','LR-KOT-010','RECEIVE','CN_Xian_Dragon',   'CN',  200.00,'COMPLETED','2026-02-22 14:00:00');


