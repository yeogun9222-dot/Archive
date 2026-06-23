-- ============================================================
-- LONGRISE AI — 조직도 INSERT (referral_tree)
-- 총 ~207명 (V8.9 확정 — 主계정 10 + 하부 197명)
--
-- 구조 설명:
-- ┌ Line1 (중국, 폭발적 성장): Blue Dragon 척추 + White 자격자
-- ├ Line2 (해외, 우연히 성장): 얕은 Blue Dragon (5레벨)
-- ├ Line3 (개발 중): White Dragon, Blue Dragon 직전
-- ├ Line4 (거의 비활성): White Dragon, 소규모
-- └ Line5 (거의 비활성): White Dragon, 최소 구성
-- ============================================================

-- ============================================================
-- KIM_DRAGON88 (LR-KIM-001) — 95명
-- ============================================================

-- ── LINE 1: 중국 라인 (86명, 23레벨, Blue Dragon 척추) ─────────

-- [척추 Level 1] Kim의 직접추천 (Level 1)
INSERT INTO referral_tree VALUES
('KIM-L1-B01','CN_Wei_Dragon',  'LR-KIM-001','LR-KIM-001', 1,1,'Blue Dragon','Standard', 500.00,'2025-02-28','CN',NOW()),

-- [Level 2] Wei의 직접 하부: White×3 + 척추Blue×1 + 보조White×2
('KIM-L1-W02-1','CN_Fang_Rong',  'LR-KIM-001','KIM-L1-B01', 2,1,'White Dragon','Basic',   200.00,'2025-03-05','CN',NOW()),
('KIM-L1-W02-2','CN_Liu_Mei',    'LR-KIM-001','KIM-L1-B01', 2,1,'White Dragon','Basic',   200.00,'2025-03-07','CN',NOW()),
('KIM-L1-W02-3','CN_Huang_Bo',   'LR-KIM-001','KIM-L1-B01', 2,1,'White Dragon','Basic',   200.00,'2025-03-10','CN',NOW()),
('KIM-L1-B02',  'CN_Chen_Wei',   'LR-KIM-001','KIM-L1-B01', 2,1,'Blue Dragon','Standard', 500.00,'2025-03-08','CN',NOW()),
('KIM-L1-X02-1','CN_Wang_Lei',   'LR-KIM-001','KIM-L1-W02-1',3,1,'White Dragon','Basic',  200.00,'2025-03-15','CN',NOW()),
('KIM-L1-X02-2','CN_Xu_Dan',     'LR-KIM-001','KIM-L1-W02-1',3,1,'White Dragon','Basic',  200.00,'2025-03-20','CN',NOW()),

-- [Level 3] Chen_Wei(B02) 하부: White×3 + 척추Blue×1 + 보조×1
('KIM-L1-W03-1','CN_Sun_Qi',     'LR-KIM-001','KIM-L1-B02', 3,1,'White Dragon','Basic',   200.00,'2025-03-18','CN',NOW()),
('KIM-L1-W03-2','CN_Lin_Xia',    'LR-KIM-001','KIM-L1-B02', 3,1,'White Dragon','Basic',   200.00,'2025-03-20','CN',NOW()),
('KIM-L1-W03-3','CN_Zhao_Peng',  'LR-KIM-001','KIM-L1-B02', 3,1,'White Dragon','Basic',   200.00,'2025-03-22','CN',NOW()),
('KIM-L1-B03',  'CN_Wu_Hao',     'LR-KIM-001','KIM-L1-B02', 3,1,'Blue Dragon','Standard', 500.00,'2025-03-19','CN',NOW()),
('KIM-L1-X03-1','CN_Ye_Jun',     'LR-KIM-001','KIM-L1-W03-1',4,1,'White Dragon','Basic',  200.00,'2025-03-28','CN',NOW()),

-- [Level 4] Wu_Hao(B03) 하부: White×3 + 척추Blue×1
('KIM-L1-W04-1','CN_Gao_Min',    'LR-KIM-001','KIM-L1-B03', 4,1,'White Dragon','Basic',   200.00,'2025-04-01','CN',NOW()),
('KIM-L1-W04-2','CN_Ma_Ling',    'LR-KIM-001','KIM-L1-B03', 4,1,'White Dragon','Basic',   200.00,'2025-04-03','CN',NOW()),
('KIM-L1-W04-3','CN_He_Fei',     'LR-KIM-001','KIM-L1-B03', 4,1,'White Dragon','Basic',   200.00,'2025-04-05','CN',NOW()),
('KIM-L1-B04',  'CN_Zheng_Yu',   'LR-KIM-001','KIM-L1-B03', 4,1,'Blue Dragon','Standard', 500.00,'2025-04-02','CN',NOW()),

-- [Level 5] Zheng_Yu(B04) 하부
('KIM-L1-W05-1','CN_Luo_Tao',    'LR-KIM-001','KIM-L1-B04', 5,1,'White Dragon','Basic',   200.00,'2025-04-10','CN',NOW()),
('KIM-L1-W05-2','CN_Song_Hua',   'LR-KIM-001','KIM-L1-B04', 5,1,'White Dragon','Basic',   200.00,'2025-04-12','CN',NOW()),
('KIM-L1-W05-3','CN_Tang_Bo',    'LR-KIM-001','KIM-L1-B04', 5,1,'White Dragon','Basic',   200.00,'2025-04-14','CN',NOW()),
('KIM-L1-B05',  'CN_Xiao_Gang',  'LR-KIM-001','KIM-L1-B04', 5,1,'Blue Dragon','Standard', 500.00,'2025-04-11','CN',NOW()),

-- [Level 6~10] 척추 패턴 반복 (White×3 + Blue×1 per level)
('KIM-L1-W06-1','CN_Jiang_Hao',  'LR-KIM-001','KIM-L1-B05', 6,1,'White Dragon','Basic',   200.00,'2025-04-18','CN',NOW()),
('KIM-L1-W06-2','CN_Peng_Li',    'LR-KIM-001','KIM-L1-B05', 6,1,'White Dragon','Basic',   200.00,'2025-04-20','CN',NOW()),
('KIM-L1-W06-3','CN_Fan_Mei',    'LR-KIM-001','KIM-L1-B05', 6,1,'White Dragon','Basic',   200.00,'2025-04-22','CN',NOW()),
('KIM-L1-B06',  'CN_Han_Zhen',   'LR-KIM-001','KIM-L1-B05', 6,1,'Blue Dragon','Standard', 500.00,'2025-04-19','CN',NOW()),

('KIM-L1-W07-1','CN_Dong_Wei',   'LR-KIM-001','KIM-L1-B06', 7,1,'White Dragon','Basic',   200.00,'2025-04-28','CN',NOW()),
('KIM-L1-W07-2','CN_Bai_Xue',    'LR-KIM-001','KIM-L1-B06', 7,1,'White Dragon','Basic',   200.00,'2025-04-30','CN',NOW()),
('KIM-L1-W07-3','CN_Shao_Ping',  'LR-KIM-001','KIM-L1-B06', 7,1,'White Dragon','Basic',   200.00,'2025-05-02','CN',NOW()),
('KIM-L1-B07',  'CN_Meng_Kai',   'LR-KIM-001','KIM-L1-B06', 7,1,'Blue Dragon','Standard', 500.00,'2025-04-29','CN',NOW()),

('KIM-L1-W08-1','CN_Yin_Jie',    'LR-KIM-001','KIM-L1-B07', 8,1,'White Dragon','Basic',   200.00,'2025-05-06','CN',NOW()),
('KIM-L1-W08-2','CN_Fu_Long',    'LR-KIM-001','KIM-L1-B07', 8,1,'White Dragon','Basic',   200.00,'2025-05-08','CN',NOW()),
('KIM-L1-W08-3','CN_Cai_Na',     'LR-KIM-001','KIM-L1-B07', 8,1,'White Dragon','Basic',   200.00,'2025-05-10','CN',NOW()),
('KIM-L1-B08',  'CN_Pan_Hao',    'LR-KIM-001','KIM-L1-B07', 8,1,'Blue Dragon','Standard', 500.00,'2025-05-07','CN',NOW()),

('KIM-L1-W09-1','CN_Yuan_Bo',    'LR-KIM-001','KIM-L1-B08', 9,1,'White Dragon','Basic',   200.00,'2025-05-14','CN',NOW()),
('KIM-L1-W09-2','CN_Tang_Wei',   'LR-KIM-001','KIM-L1-B08', 9,1,'White Dragon','Basic',   200.00,'2025-05-16','CN',NOW()),
('KIM-L1-W09-3','CN_Lu_Fang',    'LR-KIM-001','KIM-L1-B08', 9,1,'White Dragon','Basic',   200.00,'2025-05-18','CN',NOW()),
('KIM-L1-B09',  'CN_Gu_Zhi',     'LR-KIM-001','KIM-L1-B08', 9,1,'Blue Dragon','Standard', 500.00,'2025-05-15','CN',NOW()),

('KIM-L1-W10-1','CN_Ren_Xiu',    'LR-KIM-001','KIM-L1-B09',10,1,'White Dragon','Basic',   200.00,'2025-05-22','CN',NOW()),
('KIM-L1-W10-2','CN_Deng_Hao',   'LR-KIM-001','KIM-L1-B09',10,1,'White Dragon','Basic',   200.00,'2025-05-24','CN',NOW()),
('KIM-L1-W10-3','CN_Mo_Yan',     'LR-KIM-001','KIM-L1-B09',10,1,'White Dragon','Basic',   200.00,'2025-05-26','CN',NOW()),
('KIM-L1-B10',  'CN_Qiu_Gang',   'LR-KIM-001','KIM-L1-B09',10,1,'Blue Dragon','Standard', 500.00,'2025-05-23','CN',NOW()),

-- [Level 11~15]
('KIM-L1-W11-1','CN_Ao_Ming',    'LR-KIM-001','KIM-L1-B10',11,1,'White Dragon','Basic',   200.00,'2025-06-01','CN',NOW()),
('KIM-L1-W11-2','CN_Bi_Lian',    'LR-KIM-001','KIM-L1-B10',11,1,'White Dragon','Basic',   200.00,'2025-06-03','CN',NOW()),
('KIM-L1-W11-3','CN_Ci_Hao',     'LR-KIM-001','KIM-L1-B10',11,1,'White Dragon','Basic',   200.00,'2025-06-05','CN',NOW()),
('KIM-L1-B11',  'CN_Di_Long',    'LR-KIM-001','KIM-L1-B10',11,1,'Blue Dragon','Standard', 500.00,'2025-06-02','CN',NOW()),

('KIM-L1-W12-1','CN_Ei_Fang',    'LR-KIM-001','KIM-L1-B11',12,1,'White Dragon','Basic',   200.00,'2025-06-10','CN',NOW()),
('KIM-L1-W12-2','CN_Fi_Yue',     'LR-KIM-001','KIM-L1-B11',12,1,'White Dragon','Basic',   200.00,'2025-06-12','CN',NOW()),
('KIM-L1-W12-3','CN_Gi_Xian',    'LR-KIM-001','KIM-L1-B11',12,1,'White Dragon','Basic',   200.00,'2025-06-14','CN',NOW()),
('KIM-L1-B12',  'CN_Hi_Nan',     'LR-KIM-001','KIM-L1-B11',12,1,'Blue Dragon','Standard', 500.00,'2025-06-11','CN',NOW()),

('KIM-L1-W13-1','CN_Ii_Ping',    'LR-KIM-001','KIM-L1-B12',13,1,'White Dragon','Basic',   200.00,'2025-06-18','CN',NOW()),
('KIM-L1-W13-2','CN_Ji_Qing',    'LR-KIM-001','KIM-L1-B12',13,1,'White Dragon','Basic',   200.00,'2025-06-20','CN',NOW()),
('KIM-L1-W13-3','CN_Ki_Rui',     'LR-KIM-001','KIM-L1-B12',13,1,'White Dragon','Basic',   200.00,'2025-06-22','CN',NOW()),
('KIM-L1-B13',  'CN_Li_Sen',     'LR-KIM-001','KIM-L1-B12',13,1,'Blue Dragon','Standard', 500.00,'2025-06-19','CN',NOW()),

('KIM-L1-W14-1','CN_Mi_Tao',     'LR-KIM-001','KIM-L1-B13',14,1,'White Dragon','Basic',   200.00,'2025-06-26','CN',NOW()),
('KIM-L1-W14-2','CN_Ni_Uo',      'LR-KIM-001','KIM-L1-B13',14,1,'White Dragon','Basic',   200.00,'2025-06-28','CN',NOW()),
('KIM-L1-W14-3','CN_Oi_Vei',     'LR-KIM-001','KIM-L1-B13',14,1,'White Dragon','Basic',   200.00,'2025-06-30','CN',NOW()),
('KIM-L1-B14',  'CN_Pi_Wei',     'LR-KIM-001','KIM-L1-B13',14,1,'Blue Dragon','Standard', 500.00,'2025-06-27','CN',NOW()),

('KIM-L1-W15-1','CN_Qi_Xiu',     'LR-KIM-001','KIM-L1-B14',15,1,'White Dragon','Basic',   200.00,'2025-07-04','CN',NOW()),
('KIM-L1-W15-2','CN_Ri_Yao',     'LR-KIM-001','KIM-L1-B14',15,1,'White Dragon','Basic',   200.00,'2025-07-06','CN',NOW()),
('KIM-L1-W15-3','CN_Si_Zhu',     'LR-KIM-001','KIM-L1-B14',15,1,'White Dragon','Basic',   200.00,'2025-07-08','CN',NOW()),
('KIM-L1-B15',  'CN_Ti_An',      'LR-KIM-001','KIM-L1-B14',15,1,'Blue Dragon','Standard', 500.00,'2025-07-05','CN',NOW()),

-- [Level 16~20]
('KIM-L1-W16-1','CN_Ui_Bo',      'LR-KIM-001','KIM-L1-B15',16,1,'White Dragon','Basic',   200.00,'2025-07-12','CN',NOW()),
('KIM-L1-W16-2','CN_Vi_Cao',     'LR-KIM-001','KIM-L1-B15',16,1,'White Dragon','Basic',   200.00,'2025-07-14','CN',NOW()),
('KIM-L1-W16-3','CN_Wi_Dan',     'LR-KIM-001','KIM-L1-B15',16,1,'White Dragon','Basic',   200.00,'2025-07-16','CN',NOW()),
('KIM-L1-B16',  'CN_Xi_En',      'LR-KIM-001','KIM-L1-B15',16,1,'Blue Dragon','Standard', 500.00,'2025-07-13','CN',NOW()),

('KIM-L1-W17-1','CN_Yi_Fan',     'LR-KIM-001','KIM-L1-B16',17,1,'White Dragon','Basic',   200.00,'2025-07-20','CN',NOW()),
('KIM-L1-W17-2','CN_Zi_Gao',     'LR-KIM-001','KIM-L1-B16',17,1,'White Dragon','Basic',   200.00,'2025-07-22','CN',NOW()),
('KIM-L1-W17-3','CN_Aa_Hua',     'LR-KIM-001','KIM-L1-B16',17,1,'White Dragon','Basic',   200.00,'2025-07-24','CN',NOW()),
('KIM-L1-B17',  'CN_Bb_Jing',    'LR-KIM-001','KIM-L1-B16',17,1,'Blue Dragon','Standard', 500.00,'2025-07-21','CN',NOW()),

('KIM-L1-W18-1','CN_Cc_Kuan',    'LR-KIM-001','KIM-L1-B17',18,1,'White Dragon','Basic',   200.00,'2025-07-28','CN',NOW()),
('KIM-L1-W18-2','CN_Dd_Liao',    'LR-KIM-001','KIM-L1-B17',18,1,'White Dragon','Basic',   200.00,'2025-07-30','CN',NOW()),
('KIM-L1-W18-3','CN_Ee_Mian',    'LR-KIM-001','KIM-L1-B17',18,1,'White Dragon','Basic',   200.00,'2025-08-01','CN',NOW()),
('KIM-L1-B18',  'CN_Ff_Nuo',     'LR-KIM-001','KIM-L1-B17',18,1,'Blue Dragon','Standard', 500.00,'2025-07-29','CN',NOW()),

('KIM-L1-W19-1','CN_Gg_Ou',      'LR-KIM-001','KIM-L1-B18',19,1,'White Dragon','Basic',   200.00,'2025-08-05','CN',NOW()),
('KIM-L1-W19-2','CN_Hh_Pu',      'LR-KIM-001','KIM-L1-B18',19,1,'White Dragon','Basic',   200.00,'2025-08-07','CN',NOW()),
('KIM-L1-W19-3','CN_Ii_Qiu',     'LR-KIM-001','KIM-L1-B18',19,1,'White Dragon','Basic',   200.00,'2025-08-09','CN',NOW()),
('KIM-L1-B19',  'CN_Jj_Ran',     'LR-KIM-001','KIM-L1-B18',19,1,'Blue Dragon','Standard', 500.00,'2025-08-06','CN',NOW()),

('KIM-L1-W20-1','CN_Kk_Shao',    'LR-KIM-001','KIM-L1-B19',20,1,'White Dragon','Basic',   200.00,'2025-08-13','CN',NOW()),
('KIM-L1-W20-2','CN_Ll_Tong',    'LR-KIM-001','KIM-L1-B19',20,1,'White Dragon','Basic',   200.00,'2025-08-15','CN',NOW()),
('KIM-L1-W20-3','CN_Mm_Ubo',     'LR-KIM-001','KIM-L1-B19',20,1,'White Dragon','Basic',   200.00,'2025-08-17','CN',NOW()),
('KIM-L1-B20',  'CN_Nn_Vei',     'LR-KIM-001','KIM-L1-B19',20,1,'Blue Dragon','Standard', 500.00,'2025-08-14','CN',NOW()),

-- [Level 21~23] 꼬리 구간 (depth 완성)
('KIM-L1-T21-1','CN_Oo_Wan',     'LR-KIM-001','KIM-L1-B20',21,1,'White Dragon','Basic',   200.00,'2025-08-20','CN',NOW()),
('KIM-L1-T21-2','CN_Pp_Xian',    'LR-KIM-001','KIM-L1-B20',21,1,'White Dragon','Basic',   200.00,'2025-08-22','CN',NOW()),
('KIM-L1-T21-3','CN_Qq_Yan',     'LR-KIM-001','KIM-L1-B20',21,1,'White Dragon','Basic',   200.00,'2025-08-24','CN',NOW()),
('KIM-L1-T22-1','CN_Rr_Zao',     'LR-KIM-001','KIM-L1-T21-1',22,1,'White Dragon','Basic', 200.00,'2025-08-28','CN',NOW()),
('KIM-L1-T22-2','CN_Ss_Abei',    'LR-KIM-001','KIM-L1-T21-2',22,1,'White Dragon','Basic', 200.00,'2025-08-30','CN',NOW()),
('KIM-L1-T23-1','CN_Tt_Bchu',    'LR-KIM-001','KIM-L1-T22-1',23,1,'White Dragon','Basic', 200.00,'2025-09-03','CN',NOW());

-- ── LINE 2: 중국 라인 (9명, 5레벨, 얕은 Blue Dragon / 우연히 성장) ─
INSERT INTO referral_tree VALUES
('KIM-L2-B01', 'CN_Zhang_Rise',  'LR-KIM-001','LR-KIM-001', 1,2,'Blue Dragon','Standard', 500.00,'2025-01-20','CN',NOW()),
('KIM-L2-W02-1','CN_Zhao_Hao',   'LR-KIM-001','KIM-L2-B01', 2,2,'White Dragon','Basic',   200.00,'2025-02-05','CN',NOW()),
('KIM-L2-W02-2','CN_Qian_Xin',   'LR-KIM-001','KIM-L2-B01', 2,2,'White Dragon','Basic',   200.00,'2025-02-08','CN',NOW()),
('KIM-L2-W02-3','CN_Sun_Ming',   'LR-KIM-001','KIM-L2-B01', 2,2,'White Dragon','Basic',   200.00,'2025-02-11','CN',NOW()),
('KIM-L2-W02-4','CN_Li_Fang',    'LR-KIM-001','KIM-L2-B01', 2,2,'White Dragon','Basic',   200.00,'2025-02-14','CN',NOW()),
('KIM-L2-W02-5','CN_Zhou_Bo',    'LR-KIM-001','KIM-L2-B01', 2,2,'White Dragon','Basic',   200.00,'2025-02-17','CN',NOW()),
('KIM-L2-W03-1','CN_Wu_Jing',    'LR-KIM-001','KIM-L2-W02-1',3,2,'White Dragon','Basic',  200.00,'2025-02-25','CN',NOW()),
('KIM-L2-W04-1','CN_Zheng_Hui',  'LR-KIM-001','KIM-L2-W03-1',4,2,'White Dragon','Basic',  200.00,'2025-03-05','CN',NOW()),
('KIM-L2-W05-1','CN_Wang_Shuo',  'LR-KIM-001','KIM-L2-W04-1',5,2,'White Dragon','Basic',  200.00,'2025-03-15','CN',NOW());

-- ── LINE 3: 한국 라인 (8명, White Dragon, Blue 직전) ──────────
INSERT INTO referral_tree VALUES
('KIM-L3-01',  'KR_Choi_Star',   'LR-KIM-001','LR-KIM-001', 1,3,'White Dragon','Basic',   200.00,'2025-03-05','KR',NOW()),
('KIM-L3-W02-1','KR_Park_Hoon',  'LR-KIM-001','KIM-L3-01',  2,3,'White Dragon','Basic',   200.00,'2025-03-15','KR',NOW()),
('KIM-L3-W02-2','KR_Kim_Soo',    'LR-KIM-001','KIM-L3-01',  2,3,'White Dragon','Basic',   200.00,'2025-03-18','KR',NOW()),
('KIM-L3-W02-3','KR_Lee_Jae',    'LR-KIM-001','KIM-L3-01',  2,3,'White Dragon','Basic',   200.00,'2025-03-21','KR',NOW()),
('KIM-L3-W02-4','KR_Yoon_Min',   'LR-KIM-001','KIM-L3-01',  2,3,'White Dragon','Basic',   200.00,'2025-03-24','KR',NOW()),
('KIM-L3-W03-1','KR_Jang_Woo',   'LR-KIM-001','KIM-L3-W02-1',3,3,'White Dragon','Basic',  200.00,'2025-04-01','KR',NOW()),
('KIM-L3-W03-2','KR_Shin_Gi',    'LR-KIM-001','KIM-L3-W02-2',3,3,'White Dragon','Basic',  200.00,'2025-04-05','KR',NOW()),
('KIM-L3-W04-1','KR_Kwon_Tae',   'LR-KIM-001','KIM-L3-W03-1',4,3,'White Dragon','Basic',  200.00,'2025-04-15','KR',NOW());

-- ── LINE 4: 베트남 라인 (3명, 거의 비활성) ────────────────────
INSERT INTO referral_tree VALUES
('KIM-L4-01',  'VN_Nguyen_Pro',  'LR-KIM-001','LR-KIM-001', 1,4,'White Dragon','Basic',   200.00,'2025-03-08','VN',NOW()),
('KIM-L4-02-1','VN_Tran_Duc',    'LR-KIM-001','KIM-L4-01',  2,4,'White Dragon','Basic',   200.00,'2025-04-10','VN',NOW()),
('KIM-L4-02-2','VN_Le_Van',      'LR-KIM-001','KIM-L4-01',  2,4,'White Dragon','Basic',   200.00,'2025-04-18','VN',NOW());

-- ── LINE 5: 중국2 라인 (2명, 거의 비활성) ─────────────────────
INSERT INTO referral_tree VALUES
('KIM-L5-01',  'CN_Liu_Rise',    'LR-KIM-001','LR-KIM-001', 1,5,'White Dragon','Basic',   200.00,'2025-03-12','CN',NOW()),
('KIM-L5-02-1','CN_Chen_Bo',     'LR-KIM-001','KIM-L5-01',  2,5,'White Dragon','Basic',   200.00,'2025-05-20','CN',NOW());



-- ============================================================
-- 나머지 9개 계정 조직도 (V8.8 현실감 재설계)
-- ============================================================
-- 핵심 서사: 모든 하부 Blue Dragon들은 Standard $500 보유
--           → Purple Dragon 패키지 조건($1,000+) 미달
--           → 아무리 활발해도 Blue Dragon 이상 승급 불가
--           → 주계정 중 Kim/Lee/Park만 Premium으로 가장 앞선 위치
-- ============================================================

-- ============================================================
-- LEE_PROFIT99 (Blue Dragon, 35명 / 1개 Blue Dragon 라인)
-- ============================================================
-- Line1: 중국 라인, Blue Dragon 척추 5레벨, 총 16명
INSERT INTO referral_tree VALUES
('LEE-L1-B01','CN_Hong_Da',     'LR-LEE-002','LR-LEE-002', 1,1,'Blue Dragon','Standard',500.00,'2025-02-18','CN',NOW()),
('LEE-L1-W02-1','CN_Liang_Xi', 'LR-LEE-002','LEE-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-02-26','CN',NOW()),
('LEE-L1-W02-2','CN_Qian_Yu',  'LR-LEE-002','LEE-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-02-28','CN',NOW()),
('LEE-L1-W02-3','CN_Sheng_Ao', 'LR-LEE-002','LEE-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-03-02','CN',NOW()),
('LEE-L1-B02',  'CN_Teng_Hui', 'LR-LEE-002','LEE-L1-B01', 2,1,'Blue Dragon','Standard',500.00,'2025-02-27','CN',NOW()),
('LEE-L1-W03-1','CN_Wan_Bo',   'LR-LEE-002','LEE-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-06','CN',NOW()),
('LEE-L1-W03-2','CN_Xue_Da',   'LR-LEE-002','LEE-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-08','CN',NOW()),
('LEE-L1-W03-3','CN_Yan_Gao',  'LR-LEE-002','LEE-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-10','CN',NOW()),
('LEE-L1-B03',  'CN_Zao_Hui',  'LR-LEE-002','LEE-L1-B02', 3,1,'Blue Dragon','Standard',500.00,'2025-03-07','CN',NOW()),
('LEE-L1-W04-1','CN_Ab_Jing',  'LR-LEE-002','LEE-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-14','CN',NOW()),
('LEE-L1-W04-2','CN_Bc_Kai',   'LR-LEE-002','LEE-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-16','CN',NOW()),
('LEE-L1-W04-3','CN_Cd_Lan',   'LR-LEE-002','LEE-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-18','CN',NOW()),
('LEE-L1-B04',  'CN_De_Min',   'LR-LEE-002','LEE-L1-B03', 4,1,'Blue Dragon','Standard',500.00,'2025-03-15','CN',NOW()),
('LEE-L1-T05-1','CN_Ef_Nan',   'LR-LEE-002','LEE-L1-B04', 5,1,'White Dragon','Basic',  200.00,'2025-03-22','CN',NOW()),
('LEE-L1-T05-2','CN_Fg_Ou',    'LR-LEE-002','LEE-L1-B04', 5,1,'White Dragon','Basic',  200.00,'2025-03-24','CN',NOW()),
('LEE-L1-T05-3','CN_Gh_Ping',  'LR-LEE-002','LEE-L1-B04', 5,1,'White Dragon','Basic',  200.00,'2025-03-26','CN',NOW());

-- Line2: 일본 라인, White Dragon, 5명
INSERT INTO referral_tree VALUES
('LEE-L2-01',  'JP_Mori_Hana',  'LR-LEE-002','LR-LEE-002', 1,2,'White Dragon','Basic',200.00,'2025-02-20','JP',NOW()),
('LEE-L2-W02-1','JP_Imai_Ken',  'LR-LEE-002','LEE-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-01','JP',NOW()),
('LEE-L2-W02-2','JP_Ogawa_Mei', 'LR-LEE-002','LEE-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-04','JP',NOW()),
('LEE-L2-W02-3','JP_Kimura_Ai', 'LR-LEE-002','LEE-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-07','JP',NOW()),
('LEE-L2-W02-4','JP_Hayashi_R', 'LR-LEE-002','LEE-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-10','JP',NOW());

-- Line3: 한국 라인, White Dragon, 5명
INSERT INTO referral_tree VALUES
('LEE-L3-01',  'KR_Son_Hyun',   'LR-LEE-002','LR-LEE-002', 1,3,'White Dragon','Basic',200.00,'2025-02-22','KR',NOW()),
('LEE-L3-W02-1','KR_Oh_Jin',    'LR-LEE-002','LEE-L3-01',  2,3,'White Dragon','Basic',200.00,'2025-03-05','KR',NOW()),
('LEE-L3-W02-2','KR_Seo_Bin',   'LR-LEE-002','LEE-L3-01',  2,3,'White Dragon','Basic',200.00,'2025-03-09','KR',NOW()),
('LEE-L3-W03-1','KR_Bae_Da',    'LR-LEE-002','LEE-L3-W02-1',3,3,'White Dragon','Basic',200.00,'2025-03-18','KR',NOW()),
('LEE-L3-W03-2','KR_Ahn_Chan',  'LR-LEE-002','LEE-L3-W02-2',3,3,'White Dragon','Basic',200.00,'2025-03-22','KR',NOW());

-- Line4: 베트남, 3명
INSERT INTO referral_tree VALUES
('LEE-L4-01',  'VN_Pham_Duc',   'LR-LEE-002','LR-LEE-002', 1,4,'White Dragon','Basic',200.00,'2025-02-24','VN',NOW()),
('LEE-L4-02-1','VN_Vu_Anh',     'LR-LEE-002','LEE-L4-01',  2,4,'White Dragon','Basic',200.00,'2025-04-10','VN',NOW()),
('LEE-L4-02-2','VN_Do_Minh',    'LR-LEE-002','LEE-L4-01',  2,4,'White Dragon','Basic',200.00,'2025-04-20','VN',NOW());

-- Line5: 중국2, 1명
INSERT INTO referral_tree VALUES
('LEE-L5-01',  'CN_Yang_Xin',   'LR-LEE-002','LR-LEE-002', 1,5,'White Dragon','Basic',200.00,'2025-02-28','CN',NOW());

-- ============================================================
-- PARK_ALPHA77 (Blue Dragon, 22명 / 1개 Blue Dragon 라인)
-- ============================================================
-- Line1: 중국 라인, Blue Dragon 척추 4레벨, 13명
INSERT INTO referral_tree VALUES
('PAR-L1-B01','CN_Chou_Da',    'LR-PAR-003','LR-PAR-003', 1,1,'Blue Dragon','Standard',500.00,'2025-02-25','CN',NOW()),
('PAR-L1-W02-1','CN_Dou_Er',   'LR-PAR-003','PAR-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-03-03','CN',NOW()),
('PAR-L1-W02-2','CN_Eou_Fa',   'LR-PAR-003','PAR-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-03-05','CN',NOW()),
('PAR-L1-W02-3','CN_Fou_Ga',   'LR-PAR-003','PAR-L1-B01', 2,1,'White Dragon','Basic',  200.00,'2025-03-07','CN',NOW()),
('PAR-L1-B02',  'CN_Gou_Ha',   'LR-PAR-003','PAR-L1-B01', 2,1,'Blue Dragon','Standard',500.00,'2025-03-04','CN',NOW()),
('PAR-L1-W03-1','CN_Hou_Ia',   'LR-PAR-003','PAR-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-10','CN',NOW()),
('PAR-L1-W03-2','CN_Iou_Ja',   'LR-PAR-003','PAR-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-12','CN',NOW()),
('PAR-L1-W03-3','CN_Jou_Ka',   'LR-PAR-003','PAR-L1-B02', 3,1,'White Dragon','Basic',  200.00,'2025-03-14','CN',NOW()),
('PAR-L1-B03',  'CN_Kou_La',   'LR-PAR-003','PAR-L1-B02', 3,1,'Blue Dragon','Standard',500.00,'2025-03-11','CN',NOW()),
('PAR-L1-T04-1','CN_Lou_Ma',   'LR-PAR-003','PAR-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-18','CN',NOW()),
('PAR-L1-T04-2','CN_Mou_Na',   'LR-PAR-003','PAR-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-20','CN',NOW()),
('PAR-L1-T04-3','CN_Nou_Oa',   'LR-PAR-003','PAR-L1-B03', 4,1,'White Dragon','Basic',  200.00,'2025-03-22','CN',NOW());

-- Line2: 일본, 4명
INSERT INTO referral_tree VALUES
('PAR-L2-01',  'JP_Nishida_K',  'LR-PAR-003','LR-PAR-003', 1,2,'White Dragon','Basic',200.00,'2025-02-22','JP',NOW()),
('PAR-L2-W02-1','JP_Ueda_Sho',  'LR-PAR-003','PAR-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-02','JP',NOW()),
('PAR-L2-W02-2','JP_Wada_Rei',  'LR-PAR-003','PAR-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-05','JP',NOW()),
('PAR-L2-W02-3','JP_Aoki_Rio',  'LR-PAR-003','PAR-L2-01',  2,2,'White Dragon','Basic',200.00,'2025-03-08','JP',NOW());

-- Line3: 한국, 3명
INSERT INTO referral_tree VALUES
('PAR-L3-01',  'KR_Im_Hyun',    'LR-PAR-003','LR-PAR-003', 1,3,'White Dragon','Basic',200.00,'2025-02-27','KR',NOW()),
('PAR-L3-W02-1','KR_Nam_Ji',    'LR-PAR-003','PAR-L3-01',  2,3,'White Dragon','Basic',200.00,'2025-03-10','KR',NOW()),
('PAR-L3-W02-2','KR_Yeo_Soo',   'LR-PAR-003','PAR-L3-01',  2,3,'White Dragon','Basic',200.00,'2025-03-14','KR',NOW());

-- Line4: 베트남, 2명
INSERT INTO referral_tree VALUES
('PAR-L4-01',  'VN_Hoang_Vu',   'LR-PAR-003','LR-PAR-003', 1,4,'White Dragon','Basic',200.00,'2025-03-01','VN',NOW()),
('PAR-L4-02-1','VN_Ngo_Quoc',   'LR-PAR-003','PAR-L4-01',  2,4,'White Dragon','Basic',200.00,'2025-04-15','VN',NOW());

-- Line5: 없음 (Park은 4개 라인만)

-- ============================================================
-- CHOI_RISE12 (White Dragon, 17명 / Blue Dragon 달성 중)
-- 직추천 4명, 팀매출 ~$4,200
-- ============================================================
INSERT INTO referral_tree VALUES
('CHO-L1-01',  'CN_Ai_Bo',      'LR-CHO-004','LR-CHO-004', 1,1,'White Dragon','Basic',200.00,'2025-02-28','CN',NOW()),
('CHO-L1-02',  'JP_Abe_Ken',    'LR-CHO-004','LR-CHO-004', 1,2,'White Dragon','Basic',200.00,'2025-03-02','JP',NOW()),
('CHO-L1-03',  'KR_Ryu_Ho',     'LR-CHO-004','LR-CHO-004', 1,3,'White Dragon','Basic',200.00,'2025-03-05','KR',NOW()),
('CHO-L1-04',  'VN_Trinh_Van',  'LR-CHO-004','LR-CHO-004', 1,4,'White Dragon','Basic',200.00,'2025-03-08','VN',NOW()),
-- L2 under CHO-L1-01 (CN): 5명
('CHO-W02-1',  'CN_Bi_Co',      'LR-CHO-004','CHO-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-15','CN',NOW()),
('CHO-W02-2',  'CN_Ci_Do',      'LR-CHO-004','CHO-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-18','CN',NOW()),
('CHO-W02-3',  'CN_Di_Eo',      'LR-CHO-004','CHO-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-21','CN',NOW()),
-- L2 under CHO-L1-02 (JP): 3명
('CHO-W02-4',  'JP_Kano_Mi',    'LR-CHO-004','CHO-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-12','JP',NOW()),
('CHO-W02-5',  'JP_Mori_Ai',    'LR-CHO-004','CHO-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-15','JP',NOW()),
-- L2 under CHO-L1-03 (KR): 3명
('CHO-W02-6',  'KR_Tak_Ji',     'LR-CHO-004','CHO-L1-03',  2,3,'White Dragon','Basic',200.00,'2025-03-14','KR',NOW()),
('CHO-W02-7',  'KR_Um_Soo',     'LR-CHO-004','CHO-L1-03',  2,3,'White Dragon','Basic',200.00,'2025-03-17','KR',NOW()),
-- L3: 5명
('CHO-W03-1',  'CN_Ei_Fo',      'LR-CHO-004','CHO-W02-1',  3,1,'White Dragon','Basic',200.00,'2025-04-05','CN',NOW()),
('CHO-W03-2',  'CN_Fi_Go',      'LR-CHO-004','CHO-W02-2',  3,1,'White Dragon','Basic',200.00,'2025-04-10','CN',NOW()),
('CHO-W03-3',  'JP_Noda_Ke',    'LR-CHO-004','CHO-W02-4',  3,2,'White Dragon','Basic',200.00,'2025-04-08','JP',NOW()),
('CHO-W03-4',  'KR_Wi_Jae',     'LR-CHO-004','CHO-W02-6',  3,3,'White Dragon','Basic',200.00,'2025-04-12','KR',NOW()),
('CHO-W03-5',  'KR_Ye_Min',     'LR-CHO-004','CHO-W02-7',  3,3,'White Dragon','Basic',200.00,'2025-04-16','KR',NOW());

-- ============================================================
-- HAN_NODE34 (White Dragon, 12명)
-- 직추천 4명
-- ============================================================
INSERT INTO referral_tree VALUES
('HAN-L1-01',  'CN_Fi_Go2',     'LR-HAN-005','LR-HAN-005', 1,1,'White Dragon','Basic',200.00,'2025-03-02','CN',NOW()),
('HAN-L1-02',  'JP_Wata_Nabe',  'LR-HAN-005','LR-HAN-005', 1,2,'White Dragon','Basic',200.00,'2025-03-05','JP',NOW()),
('HAN-L1-03',  'KR_Ha_Jin',     'LR-HAN-005','LR-HAN-005', 1,3,'White Dragon','Basic',200.00,'2025-03-08','KR',NOW()),
('HAN-L1-04',  'VN_Luong_An',   'LR-HAN-005','LR-HAN-005', 1,4,'White Dragon','Basic',200.00,'2025-03-11','VN',NOW()),
-- L2: 5명
('HAN-W02-1',  'CN_Gi_Ho',      'LR-HAN-005','HAN-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-20','CN',NOW()),
('HAN-W02-2',  'CN_Hi_Io',      'LR-HAN-005','HAN-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-24','CN',NOW()),
('HAN-W02-3',  'JP_Isobe_M',    'LR-HAN-005','HAN-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-18','JP',NOW()),
('HAN-W02-4',  'JP_Jingu_H',    'LR-HAN-005','HAN-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-22','JP',NOW()),
('HAN-W02-5',  'KR_In_Gu',      'LR-HAN-005','HAN-L1-03',  2,3,'White Dragon','Basic',200.00,'2025-03-25','KR',NOW()),
-- L3: 3명
('HAN-W03-1',  'CN_Ii_Jo',      'LR-HAN-005','HAN-W02-1',  3,1,'White Dragon','Basic',200.00,'2025-04-10','CN',NOW()),
('HAN-W03-2',  'JP_Kadota_Y',   'LR-HAN-005','HAN-W02-3',  3,2,'White Dragon','Basic',200.00,'2025-04-14','JP',NOW()),
('HAN-W03-3',  'KR_Ja_Yoon',    'LR-HAN-005','HAN-W02-5',  3,3,'White Dragon','Basic',200.00,'2025-04-18','KR',NOW());

-- ============================================================
-- JUNG_BULL56 (White Dragon, 8명)
-- 직추천 3명
-- ============================================================
INSERT INTO referral_tree VALUES
('JUN-L1-01',  'CN_Ao_Bei',     'LR-JUN-006','LR-JUN-006', 1,1,'White Dragon','Basic',200.00,'2025-03-05','CN',NOW()),
('JUN-L1-02',  'JP_Riku_San',   'LR-JUN-006','LR-JUN-006', 1,2,'White Dragon','Basic',200.00,'2025-03-08','JP',NOW()),
('JUN-L1-03',  'KR_Pa_Rin',     'LR-JUN-006','LR-JUN-006', 1,3,'White Dragon','Basic',200.00,'2025-03-11','KR',NOW()),
-- L2: 3명
('JUN-W02-1',  'CN_Bo_Ci',      'LR-JUN-006','JUN-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-03-22','CN',NOW()),
('JUN-W02-2',  'JP_Sota_Ha',    'LR-JUN-006','JUN-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-20','JP',NOW()),
('JUN-W02-3',  'KR_Qa_So',      'LR-JUN-006','JUN-L1-03',  2,3,'White Dragon','Basic',200.00,'2025-03-24','KR',NOW()),
-- L3: 2명
('JUN-W03-1',  'CN_Co_Di',      'LR-JUN-006','JUN-W02-1',  3,1,'White Dragon','Basic',200.00,'2025-04-08','CN',NOW()),
('JUN-W03-2',  'JP_Toma_Yu',    'LR-JUN-006','JUN-W02-2',  3,2,'White Dragon','Basic',200.00,'2025-04-12','JP',NOW());

-- ============================================================
-- YOON_GOLD78 (White Dragon, 6명)
-- 직추천 3명
-- ============================================================
INSERT INTO referral_tree VALUES
('YOO-L1-01',  'CN_Gp_Hr',      'LR-YOO-007','LR-YOO-007', 1,1,'White Dragon','Basic',200.00,'2025-03-10','CN',NOW()),
('YOO-L1-02',  'JP_Akagi_H',    'LR-YOO-007','LR-YOO-007', 1,2,'White Dragon','Basic',200.00,'2025-03-13','JP',NOW()),
('YOO-L1-03',  'KR_Xa_Yb',      'LR-YOO-007','LR-YOO-007', 1,3,'White Dragon','Basic',200.00,'2025-03-16','KR',NOW()),
-- L2: 3명
('YOO-W02-1',  'CN_Hp_Ir',      'LR-YOO-007','YOO-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-04-01','CN',NOW()),
('YOO-W02-2',  'JP_Bando_Y',    'LR-YOO-007','YOO-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-03-28','JP',NOW()),
('YOO-W02-3',  'KR_Ya_Zb',      'LR-YOO-007','YOO-L1-03',  2,3,'White Dragon','Basic',200.00,'2025-04-05','KR',NOW());

-- ============================================================
-- SONG_WAVE90 (White Dragon, 5명)
-- 직추천 3명
-- ============================================================
INSERT INTO referral_tree VALUES
('SON-L1-01',  'CN_Nr_Or',      'LR-SON-008','LR-SON-008', 1,1,'White Dragon','Basic',200.00,'2025-03-15','CN',NOW()),
('SON-L1-02',  'JP_Juso_Ha',    'LR-SON-008','LR-SON-008', 1,2,'White Dragon','Basic',200.00,'2025-03-18','JP',NOW()),
('SON-L1-03',  'KR_Fa_Gb',      'LR-SON-008','LR-SON-008', 1,3,'White Dragon','Basic',200.00,'2025-03-21','KR',NOW()),
-- L2: 2명
('SON-W02-1',  'CN_Or_Pr',      'LR-SON-008','SON-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-04-10','CN',NOW()),
('SON-W02-2',  'JP_Kiku_M',     'LR-SON-008','SON-L1-02',  2,2,'White Dragon','Basic',200.00,'2025-04-14','JP',NOW());

-- ============================================================
-- LIM_EAGLE23 (White Dragon, 4명)
-- 직추천 3명, 팀매출 $900
-- ============================================================
INSERT INTO referral_tree VALUES
('LIM-L1-01',  'CN_Ur_Vr',      'LR-LIM-009','LR-LIM-009', 1,1,'White Dragon','Basic',200.00,'2025-03-20','CN',NOW()),
('LIM-L1-02',  'JP_Suda_Ko',    'LR-LIM-009','LR-LIM-009', 1,2,'White Dragon','Basic',200.00,'2025-03-23','JP',NOW()),
('LIM-L1-03',  'KR_Na_Ob',      'LR-LIM-009','LR-LIM-009', 1,3,'White Dragon','Basic',200.00,'2025-03-26','KR',NOW()),
-- L2: 1명
('LIM-W02-1',  'CN_Vr_Wr',      'LR-LIM-009','LIM-L1-01',  2,1,'White Dragon','Basic',200.00,'2025-04-20','CN',NOW());

-- ============================================================
-- KO_TITAN45 (White Dragon, 3명 / 최신 가입 — 막 시작)
-- 직추천 3명, 서브 없음
-- ============================================================
INSERT INTO referral_tree VALUES
('KOT-L1-01',  'CN_Bs_Cs',      'LR-KOT-010','LR-KOT-010', 1,1,'White Dragon','Basic',200.00,'2025-04-02','CN',NOW()),
('KOT-L1-02',  'JP_Bundo_H',    'LR-KOT-010','LR-KOT-010', 1,2,'White Dragon','Basic',200.00,'2025-04-05','JP',NOW()),
('KOT-L1-03',  'KR_Va_Wb',      'LR-KOT-010','LR-KOT-010', 1,3,'White Dragon','Basic',200.00,'2025-04-08','KR',NOW());


