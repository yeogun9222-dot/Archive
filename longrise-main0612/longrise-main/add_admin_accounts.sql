-- Add 5 admin accounts to RDS admin_users table
-- Password for all accounts: '1234' (bcrypt hashed with rounds=12)

-- Real bcrypt hashes for password '1234' (generated with $2b$12$ rounds)
INSERT INTO admin_users (username, email, name, password_hash, role, permissions, is_active) VALUES
-- JeongM - Content Manager
('JeongM', 'jeong@longrise.com', '정민수 (컨텐츠 관리자)',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', 'content',
 '["content:read", "content:write", "system:read"]'::jsonb, true),

-- YeoK - Community Manager
('YeoK', 'yeo@longrise.com', '여경호 (커뮤니티 관리자)',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', 'community',
 '["users:read", "users:write", "community:manage"]'::jsonb, true),

-- KimS - Finance Manager
('KimS', 'kims@longrise.com', '김석민 (재정 관리자)',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', 'finance',
 '["finance:read", "finance:write", "reports:access"]'::jsonb, true),

-- KimH - System Manager
('KimH', 'kimh@longrise.com', '김현우 (시스템 관리자)',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', 'super',
 '["*"]'::jsonb, true),

-- AhnD - Super Admin
('AhnD', 'ahn@longrise.com', '안동현 (총괄 관리자)',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwJSPLgIEOv/IPO', 'super',
 '["*"]'::jsonb, true);

-- Verify the inserted accounts
SELECT username, email, name, role, permissions, is_active, created_at
FROM admin_users
WHERE username IN ('JeongM', 'YeoK', 'KimS', 'KimH', 'AhnD')
ORDER BY username;

-- Show total admin count
SELECT role, COUNT(*) as count
FROM admin_users
WHERE is_active = true
GROUP BY role
ORDER BY role;