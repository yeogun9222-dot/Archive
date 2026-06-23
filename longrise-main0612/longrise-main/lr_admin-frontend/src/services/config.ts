/**
 * 환경 변수 검증 및 설정
 * api-endpoints 스킬 원칙: 단일 진실 공급원
 */

interface ApiConfig {
  baseURL: string;
  wsURL?: string;
  environment: string;
  buildUID: string;
  tokenStorageKey: string;
  sessionTimeout: number;
  logLevel: string;
}

// 필수 환경 변수 검증
function validateEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// baseURL 결정 로직 - 배포 환경 강제 감지
function getBaseURL(): string {
  const configuredURL = import.meta.env.VITE_ADMIN_API_BASE_URL;
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // 디버깅을 위한 로깅
  console.log('🔧 Admin Frontend Environment Variables:', {
    VITE_ADMIN_API_BASE_URL: configuredURL,
    VITE_ENVIRONMENT: environment,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    hostname: hostname
  });

  // 🚨 배포 환경 강제 감지: localhost가 아닌 호스트에서 실행 중인 경우
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const deployURL = `http://${hostname}:8000/api/v1`;
    console.log('🚀 Deployment environment detected! Using deployment API URL:', deployURL);
    return deployURL;
  }

  // 환경변수가 상대 경로로 설정된 경우 (배포 환경)
  if (configuredURL?.startsWith('/')) {
    console.log('🚀 Using relative API URL from environment:', configuredURL);
    return configuredURL;
  }

  // 환경변수가 절대 경로로 설정된 경우 (로컬 개발)
  if (configuredURL && configuredURL.startsWith('http')) {
    console.log('🔧 Using absolute API URL from environment:', configuredURL);
    return configuredURL;
  }

  throw new Error('VITE_ADMIN_API_BASE_URL environment variable is required');
}

// 환경 변수 설정 및 검증
export const apiConfig: ApiConfig = {
  baseURL: getBaseURL(),
  wsURL: import.meta.env.VITE_WS_URL,
  environment: validateEnvVar('VITE_ENVIRONMENT'),
  buildUID: validateEnvVar('VITE_BUILD_UID'),
  tokenStorageKey: validateEnvVar('VITE_TOKEN_STORAGE_KEY'),
  sessionTimeout: parseInt(import.meta.env.VITE_ADMIN_SESSION_TIMEOUT || '3600000', 10),
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// 개발 환경에서 설정 출력
if (apiConfig.environment === 'development' && apiConfig.logLevel === 'debug') {
  console.log('🔧 API Configuration:', apiConfig);
}
