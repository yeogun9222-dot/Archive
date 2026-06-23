# 🚀 API Endpoints Management

## ✅ api-endpoints 스킬 적용 완료

이 프로젝트는 **api-endpoints 스킬**의 모든 원칙을 준수하여 개발되었습니다.

## 🏗️ 아키텍처 구조

```
src/services/
├── config.ts          # 환경 변수 검증 및 설정
├── tokenManager.ts     # 중앙집중화된 토큰 관리
├── api.ts             # 메인 API 클라이언트 (axios 기반)
└── index.ts           # Services 모듈 진입점
```

## ✅ 준수된 원칙

### 1. 🔒 **하드코딩된 URL 완전 제거**
- ❌ `fetch('http://localhost:5000/api/users')`
- ✅ `api.getUsers()` (환경 변수 사용)

### 2. 🛡️ **fetch/axios 직접 사용 금지**
- ❌ 컴포넌트에서 직접 `fetch()` 호출
- ✅ 중앙집중화된 API 클라이언트 사용

### 3. 🔑 **토큰 관리 자동화**
- 요청 인터셉터를 통한 자동 토큰 첨부
- 401 에러 시 자동 토큰 만료 처리
- 로컬스토리지 기반 안전한 토큰 저장

### 4. 📊 **표준화된 에러 처리**
```typescript
try {
  const users = await api.getUsers();
} catch (error) {
  if (isApiError(error)) {
    console.error('API Error:', error.code, error.message);
  }
}
```

### 5. 🌍 **환경 변수 단일 진실 공급원**
```typescript
// .env.local
VITE_ADMIN_API_BASE_URL=http://localhost:5000/api
VITE_TOKEN_STORAGE_KEY=longrise_admin_token
VITE_ENVIRONMENT=development
```

## 📚 사용법

### ✅ 올바른 사용 방법

```typescript
import { api, isApiError } from '@/services';

// 1. 사용자 목록 조회
const users = await api.getUsers({ page: 1, search: 'john' });

// 2. 사용자 상세 정보
const user = await api.getUserById('user_001');

// 3. 관리자 작업 (자동 토큰 첨부)
await api.adjustUserBalance('user_001', 'USDT', 1000);

// 4. 에러 처리
try {
  const result = await api.banUser('user_001');
} catch (error) {
  if (isApiError(error)) {
    if (error.code === 'AUTH_EXPIRED') {
      // 로그인 페이지로 리다이렉트
    } else {
      toast.error(error.message);
    }
  }
}
```

### ❌ 금지된 방법

```typescript
// ❌ 직접 fetch 사용
fetch('/api/users', { method: 'GET' })

// ❌ 직접 axios 사용  
axios.get('http://localhost:5000/api/users')

// ❌ 하드코딩된 URL
const API_URL = 'http://localhost:5000'
```

## 🎯 API 엔드포인트 목록

### 인증 관리
- `POST /auth/login` - 관리자 로그인
- `POST /auth/logout` - 로그아웃
- `GET /admin/current` - 현재 관리자 정보

### 사용자 관리
- `GET /users` - 사용자 목록 (페이징, 검색)
- `GET /users/{id}` - 사용자 상세 정보
- `PUT /users/{id}/balance` - 잔액 조정
- `PUT /users/{id}/restrictions` - 제한 설정
- `PUT /users/{id}/kyc` - KYC 재설정
- `PUT /users/{id}/ban` - 사용자 차단

### 감사 로그
- `GET /users/{id}/audit-logs` - 사용자별 감사 로그
- `GET /admin/audit-logs` - 시스템 감사 로그

### 시스템
- `GET /health` - 헬스체크

## 🔧 설정

### 환경 변수
```bash
# 필수 환경 변수
VITE_ADMIN_API_BASE_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development
VITE_BUILD_UID=dev-admin-001
VITE_TOKEN_STORAGE_KEY=longrise_admin_token

# 선택적 환경 변수
VITE_WS_URL=ws://localhost:5000/ws
VITE_LOG_LEVEL=debug
VITE_ADMIN_SESSION_TIMEOUT=3600000
```

### 개발 환경 설정 확인
```typescript
import { apiConfig } from '@/services';

console.log('API Base URL:', apiConfig.baseURL);
console.log('Environment:', apiConfig.environment);
```

## 🚨 자동 기능

### 1. 요청 인터셉터
- 모든 요청에 자동으로 Bearer 토큰 첨부
- Build UID 및 Environment 헤더 자동 설정
- 개발 환경에서 요청/응답 로깅

### 2. 응답 인터셉터  
- 401 에러 시 자동 토큰 제거 및 로그아웃 처리
- 표준화된 에러 객체 변환
- 네트워크 에러 자동 감지

### 3. 토큰 관리
- 자동 만료 확인
- 로컬스토리지 기반 영구 저장
- 세션 타임아웃 관리

## ✅ 검증 체크리스트

- [x] 모든 API 호출이 api 객체를 통해 이루어짐
- [x] 환경 변수가 올바르게 설정됨
- [x] 하드코딩된 URL 없음
- [x] 토큰 관리가 일관되게 처리됨
- [x] 에러 처리가 표준화됨
- [x] 타입 안전성 보장
- [x] Longrise 비즈니스 로직 올바르게 구현

## 🎉 결과

**api-endpoints 스킬**의 모든 원칙을 준수하여 안전하고 확장 가능한 API 관리 시스템을 구축했습니다!