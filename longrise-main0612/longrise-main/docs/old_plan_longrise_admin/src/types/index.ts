export type DragonRank = 'Investor' | 'White Dragon' | 'Blue Dragon' | 'Purple Dragon' | 'Red Dragon' | 'Black Dragon';
export type PagefaceStatus = 'Approved' | 'Pending' | 'Rejected' | 'None';
export type UserStatus = 'Active' | 'Inactive';
export type PayoutStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RECOVERED';
export type PayoutType = 'Daily ROI' | 'Direct Bonus' | 'Rollup Bonus' | 'Rank Share' | 'CNYT Airdrop' | 'Promotion';

export interface UserWallet {
  type: string;
  label: string;
  address: string;
  isPrimary: boolean;
}

export interface UserPackage {
  type: string;
  price: number;
  date: string;
  qty?: number;
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  rank: DragonRank;
  bodyValue: number;
  directs: number;
  teamSize: number;
  teamVol: number;
  vpx: string;
  usdt: number;
  cnyt: number;
  pageface: PagefaceStatus;
  otp: boolean;
  mobileBinding: boolean;
  status: UserStatus;
  joinDate: string;
  sponsorId: string;
  packages: UserPackage[];
  permissions: {
    deposit: boolean;
    withdraw: boolean;
    swap: boolean;
  };
  wallets: UserWallet[];
  tradingPinSet: boolean;
  antiPhishingCode: string;
  maxOutRatio: number; // 0 to 10.0 (1000%)
  isFrozen: boolean;
  totalEarnings: number;
  loginHistory: {
    device: string;
    location: string;
    ip: string;
    date: string;
  }[];
}

export interface PayoutLog {
  id: string;
  user: string;
  type: PayoutType;
  amount: string; // e.g. "120.00 USDT"
  status: string;
  reason: string;
  date: string;
}

export interface P2PLog {
  txId: string;
  sender: string;
  receiver: string;
  amount: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  withdrawalId: string;
  amount: number;
  asset: string;
  requestTime: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SupportTicket {
  id: string;
  category: 'FINANCE' | 'TECHNICAL' | 'GENERAL';
  title: string;
  author: string;
  date: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  content: string;
  responses: {
    admin: string;
    message: string;
    timestamp: string;
  }[];
  resolvedAt: string | null;
  responseTime?: number; // minutes
}
