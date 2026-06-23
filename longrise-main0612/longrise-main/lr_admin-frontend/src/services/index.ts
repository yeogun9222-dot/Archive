/**
 * Services 모듈 진입점
 * api-endpoints 스킬 원칙에 따른 중앙집중화된 서비스 관리
 */

// 메인 API 클라이언트
export { default as api } from './api';

// 개별 API 그룹 (기존 코드 호환성)
export {
  userApi,
  adminApi,
  withdrawalApi,
  payoutApi,
  investmentApi,
  transactionApi,
  auditApi,
  systemApi,
  reconciliationApi,
  p2pApi,
  cmsApi,
  healthCheck
} from './api';

// API 타입 및 에러
export type { ApiResponse } from './api';
export { ApiError } from './api';

// 토큰 관리자
export { tokenManager } from './tokenManager';

// 설정
export { apiConfig } from './config';

// 편의 함수들
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error && error.name === 'ApiError';
};