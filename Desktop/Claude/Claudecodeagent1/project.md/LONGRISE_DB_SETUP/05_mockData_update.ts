/**
 * LONGRISE AI — 업데이트된 Shared Mock Data
 *
 * 사용법:
 *   이 파일의 내용으로 아래 경로의 파일을 교체하세요:
 *   src/shared/mockData.ts
 *
 * 백엔드 DB 연동 전까지 프론트엔드에서 즉시 사용 가능합니다.
 * App.tsx에서 SHARED_MOCK_USERS[0] ~ [9]로 각 시연 계정 선택 가능.
 */

import { UserData, PackagePolicy, AdminUser } from './types';

// ============================================================
// 10개 시연용 계정 데이터
// ============================================================
export const SHARED_MOCK_USERS: UserData[] = [

  // ── 01. Kim_Dragon88 — 히어로 계정 ──────────────────────────
  // 투자: Premium $1,000(2025-01-01) → Standard $500 추가(2025-08-01) → Premium 재투자(2026-01-02)
  // USDT: 일일$2,320 + 직추천$160 + 롤업$1,000 = $3,480 / LOCKED: $1,500 / CNYT: 7,760
  {
    id: 'LR-KIM-001',
    nickname: 'Kim_Dragon88',
    name: 'Kim Dragon',
    email: 'kim88@gmail.com',
    phone: '+82 10-1234-5678',
    rank: 'Blue Dragon',
    status: 'active',
    joinDate: '2025-01-01',
    balanceUSDT: 3480.00,
    lockedUSDT: 1500.00,
    balanceCNYT: 7760.00,
    totalAssets: 5135.00,
    package: 'Premium',
    initialInvestment: 1500,
    investmentDate: '2026-01-02',
    sponsorId: '',
    teamSize: 108,
    teamVol: 28500,
    bodyValue: 1500,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-22 18:30:00',
    distributorStatus: 'approved',
    distributorCode: 'KIM-DR-001',
    distributorApprovedAt: '2025-03-01',
    createdAt: '2025-02-05',
    updatedAt: '2026-05-22',
  },

  // ── 02. Lee_Profit99 ─────────────────────────────────────────
  {
    id: 'LR-LEE-002',
    nickname: 'Lee_Profit99',
    name: 'Lee Profit',
    email: 'lee99@gmail.com',
    phone: '+82 10-2345-6789',
    rank: 'Blue Dragon',
    status: 'active',
    joinDate: '2025-02-10',
    balanceUSDT: 2157.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4824.00,
    totalAssets: 3255.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-05-17',
    sponsorId: '',
    teamSize: 35,
    teamVol: 10200,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-21 14:20:00',
    distributorStatus: 'approved',
    distributorCode: 'LEE-DR-002',
    distributorApprovedAt: '2025-03-05',
    createdAt: '2025-02-10',
    updatedAt: '2026-05-21',
  },

  // ── 03. Park_Alpha77 ─────────────────────────────────────────
  {
    id: 'LR-PAR-003',
    nickname: 'Park_Alpha77',
    name: 'Park Alpha',
    email: 'park77@gmail.com',
    phone: '+82 10-3456-7890',
    rank: 'Blue Dragon',
    status: 'active',
    joinDate: '2025-02-15',
    balanceUSDT: 2100.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4771.00,
    totalAssets: 3195.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-05-22',
    sponsorId: '',
    teamSize: 22,
    teamVol: 6400,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-20 09:45:00',
    distributorStatus: 'approved',
    distributorCode: 'PAR-DR-003',
    distributorApprovedAt: '2025-03-10',
    createdAt: '2025-02-15',
    updatedAt: '2026-05-20',
  },

  // ── 04. Choi_Rise12 ──────────────────────────────────────────
  {
    id: 'LR-CHO-004',
    nickname: 'Choi_Rise12',
    name: 'Choi Rise',
    email: 'choi12@gmail.com',
    phone: '+82 10-4567-8901',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-02-18',
    balanceUSDT: 1564.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4714.00,
    totalAssets: 2658.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-05-28',
    sponsorId: '',
    teamSize: 17,
    teamVol: 4200,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-20 16:10:00',
    distributorStatus: 'approved',
    distributorCode: 'CHO-DR-004',
    distributorApprovedAt: '2025-03-12',
    createdAt: '2025-02-18',
    updatedAt: '2026-05-20',
  },

  // ── 05. Han_Node34 ───────────────────────────────────────────
  {
    id: 'LR-HAN-005',
    nickname: 'Han_Node34',
    name: 'Han Node',
    email: 'han34@gmail.com',
    phone: '+82 10-5678-9012',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-02-22',
    balanceUSDT: 1549.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4664.00,
    totalAssets: 2642.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-03',
    sponsorId: '',
    teamSize: 12,
    teamVol: 3000,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-19 11:30:00',
    distributorStatus: 'approved',
    distributorCode: 'HAN-DR-005',
    distributorApprovedAt: '2025-03-15',
    createdAt: '2025-02-22',
    updatedAt: '2026-05-19',
  },

  // ── 06. Jung_Bull56 ──────────────────────────────────────────
  {
    id: 'LR-JUN-006',
    nickname: 'Jung_Bull56',
    name: 'Jung Bull',
    email: 'jung56@gmail.com',
    phone: '+82 10-6789-0123',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-02-26',
    balanceUSDT: 1481.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4611.00,
    totalAssets: 2573.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-08',
    sponsorId: '',
    teamSize: 8,
    teamVol: 2000,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-18 20:00:00',
    distributorStatus: 'approved',
    distributorCode: 'JUN-DR-006',
    distributorApprovedAt: '2025-03-18',
    createdAt: '2025-02-26',
    updatedAt: '2026-05-18',
  },

  // ── 07. Yoon_Gold78 ──────────────────────────────────────────
  {
    id: 'LR-YOO-007',
    nickname: 'Yoon_Gold78',
    name: 'Yoon Gold',
    email: 'yoon78@gmail.com',
    phone: '+82 10-7890-1234',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-03-02',
    balanceUSDT: 1462.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4551.00,
    totalAssets: 2553.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-14',
    sponsorId: '',
    teamSize: 6,
    teamVol: 1500,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-17 13:15:00',
    distributorStatus: 'approved',
    distributorCode: 'YOO-DR-007',
    distributorApprovedAt: '2025-03-22',
    createdAt: '2025-03-02',
    updatedAt: '2026-05-17',
  },

  // ── 08. Song_Wave90 ──────────────────────────────────────────
  {
    id: 'LR-SON-008',
    nickname: 'Song_Wave90',
    name: 'Song Wave',
    email: 'song90@gmail.com',
    phone: '+82 10-8901-2345',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-03-07',
    balanceUSDT: 1445.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4498.00,
    totalAssets: 2535.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-19',
    sponsorId: '',
    teamSize: 5,
    teamVol: 1250,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-16 08:45:00',
    distributorStatus: 'approved',
    distributorCode: 'SON-DR-008',
    distributorApprovedAt: '2025-03-26',
    createdAt: '2025-03-07',
    updatedAt: '2026-05-16',
  },

  // ── 09. Lim_Eagle23 ──────────────────────────────────────────
  {
    id: 'LR-LIM-009',
    nickname: 'Lim_Eagle23',
    name: 'Lim Eagle',
    email: 'lim23@gmail.com',
    phone: '+82 10-9012-3456',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-03-12',
    balanceUSDT: 1426.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4442.00,
    totalAssets: 2515.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-24',
    sponsorId: '',
    teamSize: 4,
    teamVol: 900,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-15 17:00:00',
    distributorStatus: 'approved',
    distributorCode: 'LIM-DR-009',
    distributorApprovedAt: '2025-03-30',
    createdAt: '2025-03-12',
    updatedAt: '2026-05-15',
  },

  // ── 10. Ko_Titan45 — 가장 신생 계정 ─────────────────────────
  {
    id: 'LR-KOT-010',
    nickname: 'Ko_Titan45',
    name: 'Ko Titan',
    email: 'ko45@gmail.com',
    phone: '+82 10-0123-4567',
    rank: 'White Dragon',
    status: 'active',
    joinDate: '2025-03-17',
    balanceUSDT: 1407.00,
    lockedUSDT: 1000.00,
    balanceCNYT: 4386.00,
    totalAssets: 2496.00,
    package: 'Premium',
    initialInvestment: 1000,
    investmentDate: '2025-06-29',
    sponsorId: '',
    teamSize: 3,
    teamVol: 600,
    bodyValue: 1000,
    kycLevel: 2,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    tradingPassword: 'Longrise1!',
    hasSetTradingPassword: true,
    isTradingPasswordVerified: true,
    otp: true,
    lastLoginAt: '2026-05-14 10:30:00',
    distributorStatus: 'approved',
    distributorCode: 'KOT-DR-010',
    distributorApprovedAt: '2025-04-02',
    createdAt: '2025-03-17',
    updatedAt: '2026-05-14',
  },
];

// ============================================================
// 관리자 계정 (기존 유지)
// ============================================================
export const SHARED_MOCK_ADMINS: AdminUser[] = [
  {
    id: 'admin_001',
    username: 'jake_admin',
    email: 'jake@longrise.com',
    name: '제이크 (총괄 관리자)',
    role: 'super',
    permissions: ['*'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
    lastLogin: '2026-05-22 18:00:00',
  },
];

// ============================================================
// 패키지 정책 (기존과 동일)
// ============================================================
export const SHARED_PACKAGE_POLICIES: PackagePolicy[] = [
  {
    id: 'pkg_flexible',
    name: 'Flexible Package',
    label: 'Flexible',
    usdtDaily: 4,
    cnytDaily: 0,
    minInvestment: 100,
    maturityMonths: 0,
    earlyWithdrawalPenalty: {},
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
  },
  {
    id: 'pkg_basic',
    name: 'Basic Package',
    label: 'Basic',
    usdtDaily: 7,
    cnytDaily: 2,
    minInvestment: 200,
    maturityMonths: 12,
    earlyWithdrawalPenalty: { '1-6': 30, '7-9': 20, '10-11': 15 },
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
  },
  {
    id: 'pkg_standard',
    name: 'Standard Package',
    label: 'Standard',
    usdtDaily: 9,
    cnytDaily: 4,
    minInvestment: 500,
    maturityMonths: 12,
    earlyWithdrawalPenalty: { '1-6': 30, '7-9': 20, '10-11': 15 },
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
  },
  {
    id: 'pkg_premium',
    name: 'Premium Package',
    label: 'Premium',
    usdtDaily: 11,
    cnytDaily: 6,
    minInvestment: 1000,
    maturityMonths: 12,
    earlyWithdrawalPenalty: { '1-6': 30, '7-9': 20, '10-11': 15 },
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
  },
  {
    id: 'pkg_vip',
    name: 'VIP Package',
    label: 'VIP',
    usdtDaily: 18,
    cnytDaily: 10,
    minInvestment: 5000,
    maturityMonths: 12,
    earlyWithdrawalPenalty: { '1-6': 30, '7-9': 20, '10-11': 15 },
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2026-05-22',
  },
];

// ============================================================
// Helper 함수
// ============================================================
export function getUserById(userId: string): UserData | undefined {
  return SHARED_MOCK_USERS.find(u => u.id === userId);
}

export function getAdminById(adminId: string): AdminUser | undefined {
  return SHARED_MOCK_ADMINS.find(a => a.id === adminId);
}

export function getPackagePolicy(packageLabel: string): PackagePolicy | undefined {
  return SHARED_PACKAGE_POLICIES.find(p => p.label === packageLabel);
}

// ============================================================
// App.tsx 연동 가이드
// ============================================================
// App.tsx의 558번째 줄에서 원하는 계정 인덱스로 변경:
// (V8.9 확정 — Blue Dragon 3개 / White Dragon 7개)
//
//   SHARED_MOCK_USERS[0]  → Kim_Dragon88  ★Blue Dragon  95명 / 23레벨 (히어로 / Premium$1,000)
//   SHARED_MOCK_USERS[1]  → Lee_Profit99  ★Blue Dragon   35명 /  5레벨
//   SHARED_MOCK_USERS[2]  → Park_Alpha77  ★Blue Dragon   22명 /  4레벨
//   SHARED_MOCK_USERS[3]  → Choi_Rise12   ○White Dragon  17명 /  3레벨
//   SHARED_MOCK_USERS[4]  → Han_Node34    ○White Dragon  12명 /  3레벨
//   SHARED_MOCK_USERS[5]  → Jung_Bull56   ○White Dragon   8명 /  2레벨
//   SHARED_MOCK_USERS[6]  → Yoon_Gold78   ○White Dragon   6명 /  2레벨
//   SHARED_MOCK_USERS[7]  → Song_Wave90   ○White Dragon   5명 /  2레벨
//   SHARED_MOCK_USERS[8]  → Lim_Eagle23   ○White Dragon   4명 /  1레벨
//   SHARED_MOCK_USERS[9]  → Ko_Titan45    ○White Dragon   3명 /  직추천만 (신생)


