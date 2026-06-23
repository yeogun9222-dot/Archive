/**
 * Feature modules index - Centralized export for all feature modules
 * Each feature contains its own components, hooks, types, constants, and utils
 */

// User management feature
export * from './users/types';
export * from './users/hooks/useUsers';
export { userApi } from './users/api';

// Transaction management feature
export * from './transactions/types';
// export * from './transactions/hooks/useTransactions';  // TODO: Create hooks
// export { transactionApi } from './transactions/api';   // TODO: Create API

// Withdrawal management feature
export * from './withdrawals/types';
export * from './withdrawals/hooks/useWithdrawals';
export { withdrawalApi } from './withdrawals/api';

// Auth feature
// export * from './auth/types';       // TODO: Create auth types
// export * from './auth/hooks';       // TODO: Create auth hooks
// export { authApi } from './auth/api'; // TODO: Create auth API

// Dashboard feature
// export * from './dashboard/types';     // TODO: Create dashboard types
// export * from './dashboard/hooks';     // TODO: Create dashboard hooks

// Payout management feature
// export * from './payouts/types';       // TODO: Create payout types
// export * from './payouts/hooks';       // TODO: Create payout hooks
// export { payoutApi } from './payouts/api'; // TODO: Create payout API

// Investment management feature
// export * from './investments/types';   // TODO: Create investment types
// export * from './investments/hooks';   // TODO: Create investment hooks
// export { investmentApi } from './investments/api'; // TODO: Create investment API

// System administration feature
// export * from './system/types';        // TODO: Create system types
// export * from './system/hooks';        // TODO: Create system hooks
// export { systemApi } from './system/api'; // TODO: Create system API

// Audit feature
// export * from './audit/types';         // TODO: Create audit types
// export * from './audit/hooks';         // TODO: Create audit hooks
// export { auditApi } from './audit/api'; // TODO: Create audit API

// P2P trading feature
// export * from './p2p/types';           // TODO: Create p2p types
// export * from './p2p/hooks';           // TODO: Create p2p hooks
// export { p2pApi } from './p2p/api';     // TODO: Create p2p API

// Content management feature
// export * from './cms/types';           // TODO: Create cms types
// export * from './cms/hooks';           // TODO: Create cms hooks
// export { cmsApi } from './cms/api';     // TODO: Create cms API

// Reconciliation feature
// export * from './reconciliation/types'; // TODO: Create reconciliation types
// export * from './reconciliation/hooks'; // TODO: Create reconciliation hooks
// export { reconciliationApi } from './reconciliation/api'; // TODO: Create reconciliation API