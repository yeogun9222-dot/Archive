import { User, PayoutLog, P2PLog, SupportTicket, WithdrawalRequest } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: 'LR-1001',
    nickname: 'CryptoWhale',
    email: 'user1@email.com',
    rank: 'Black Dragon',
    bodyValue: 60000,
    directs: 12,
    teamSize: 15420,
    teamVol: 6500000,
    vpx: 'VPX-9',
    usdt: 14500.50,
    cnyt: 250000,
    pageface: 'Approved',
    otp: true,
    mobileBinding: true,
    status: 'Active',
    joinDate: '2026-01-15',
    sponsorId: 'SYSTEM',
    packages: [{ type: 'VIP', price: 5000, date: '2026-01-15' }],
    permissions: { deposit: true, withdraw: true, swap: true },
    wallets: [{ type: 'TRC-20', label: 'Main', address: 'TJ9M...Rw8qL', isPrimary: true }],
    tradingPinSet: true,
    antiPhishingCode: 'WHALE',
    maxOutRatio: 4.2,
    isFrozen: false,
    totalEarnings: 252000,
    loginHistory: [{ device: 'Chrome / MacOS', location: 'SEOUL, KR', ip: '183.98.22.104', date: 'CURRENT SESSION' }]
  },
  {
    id: 'LR-1002',
    nickname: 'InvestJP',
    email: 'user2@email.com',
    rank: 'Purple Dragon',
    bodyValue: 12000,
    directs: 5,
    teamSize: 420,
    teamVol: 250000,
    vpx: 'VPX-5',
    usdt: 320.00,
    cnyt: 15000,
    pageface: 'Pending',
    otp: false,
    mobileBinding: true,
    status: 'Active',
    joinDate: '2026-02-10',
    sponsorId: 'LR-1001',
    packages: [{ type: 'Premium', price: 1000, date: '2026-02-10' }],
    permissions: { deposit: true, withdraw: true, swap: true },
    wallets: [],
    tradingPinSet: false,
    antiPhishingCode: '',
    maxOutRatio: 9.8,
    isFrozen: false,
    totalEarnings: 117600,
    loginHistory: [{ device: 'Edge / Windows', location: 'TOKYO, JP', ip: '210.15.82.11', date: '2026-04-15 11:20' }]
  },
  {
    id: 'LR-1003',
    nickname: 'Global_Max',
    email: 'max@gmail.com',
    rank: 'Red Dragon',
    bodyValue: 35000,
    directs: 8,
    teamSize: 1200,
    teamVol: 1500000,
    vpx: 'VPX-7',
    usdt: 4500.00,
    cnyt: 55000,
    pageface: 'Approved',
    otp: true,
    mobileBinding: true,
    status: 'Active',
    joinDate: '2026-01-20',
    sponsorId: 'LR-1001',
    packages: [{ type: 'VIP', price: 5000, date: '2026-01-20' }],
    permissions: { deposit: true, withdraw: true, swap: true },
    wallets: [],
    tradingPinSet: true,
    antiPhishingCode: 'MAX',
    maxOutRatio: 1.5,
    isFrozen: false,
    totalEarnings: 52500,
    loginHistory: []
  },
  {
    id: 'LR-1004',
    nickname: 'Newbie99',
    email: 'user3@email.com',
    rank: 'Investor',
    bodyValue: 500,
    directs: 2,
    teamSize: 20,
    teamVol: 800,
    vpx: 'VPX-1',
    usdt: 0.00,
    cnyt: 50,
    pageface: 'Rejected',
    otp: false,
    mobileBinding: false,
    status: 'Inactive',
    joinDate: '2026-03-01',
    sponsorId: 'LR-1002',
    packages: [{ type: 'Standard', price: 500, date: '2026-03-01' }],
    permissions: { deposit: true, withdraw: false, swap: false },
    wallets: [],
    tradingPinSet: false,
    antiPhishingCode: '',
    maxOutRatio: 0.1,
    isFrozen: true,
    totalEarnings: 50,
    loginHistory: []
  }
];

export const MOCK_PAYOUT_LOGS: PayoutLog[] = [
  { id: 'TX-PAY-0901', user: 'LR-1002', type: 'Daily ROI', amount: '18.00 USDT', status: 'FAILED', reason: 'DB Lock', date: '2026-04-16 00:00:05' },
  { id: 'TX-PAY-0902', user: 'LR-1004', type: 'Direct Bonus', amount: '50.00 USDT', status: 'FAILED', reason: 'Network Interrupt', date: '2026-04-16 00:00:12' },
  { id: 'TX-PAY-0904', user: 'LR-1001', type: 'Rollup Bonus', amount: '450.00 USDT', status: 'SUCCESS', reason: '-', date: '2026-04-16 00:01:10' }
];

export const MOCK_P2P_LOGS: P2PLog[] = [
  { txId: 'TRX-99012', sender: 'LR-1002', receiver: 'LR-1004', amount: '500 CNYT', status: 'COMPLETED', date: '2026-04-16 14:20' },
  { txId: 'TRX-99014', sender: 'LR-1001', receiver: 'LR-1004', amount: '25,000 CNYT', status: 'PENDING', date: '2026-04-16 16:11' }
];

export const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 'APQ-001', withdrawalId: 'WD-9921', userId: 'LR-1002', amount: 1500, asset: 'USDT', requestTime: '2026-04-17 15:20', status: 'pending', walletAddress: 'TJ9M...Rw8qL' },
  { id: 'APQ-002', withdrawalId: 'WD-9922', userId: 'LR-1001', amount: 5000, asset: 'USDT', requestTime: '2026-04-17 15:45', status: 'pending', walletAddress: 'TJ9M...Rw8qL' }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-8821', category: 'FINANCE', title: 'Deposit missing', author: 'LR-1001', date: '2026-03-23', status: 'RESOLVED', priority: 'high', assignedTo: 'Jane', content: '3월 20일 $1000 입금이 반영되지 않음', responses: [{ admin: 'Jane', message: '확인 후 수동 반영했습니다.', timestamp: '2026-03-23 15:30' }], resolvedAt: '2026-03-23 15:45', responseTime: 2220 },
  { id: 'TK-8845', category: 'GENERAL', title: '페이스인증 Verification issue', author: 'LR-1004', date: '2026-03-22', status: 'PENDING', priority: 'medium', assignedTo: null, content: '페이스인증 업로드 후 승인이 안 됨', responses: [], resolvedAt: null }
];
