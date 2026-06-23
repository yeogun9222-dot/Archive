---
name: api-endpoints
description: Longrise 프로젝트의 API endpoint 관리 원칙을 유지하고 일관된 서버 통신을 보장합니다. 환경 변수를 통한 단일 진실 공급원 원칙을 강제하며, fetch/axios 직접 사용을 금지합니다.
argument-hint: [api-method] [endpoint-path]
allowed-tools: Read, Edit, Bash, Grep
user-invocable: true
---

# API Endpoints Management Skill

## 🎯 핵심 원칙
**"하나의 프론트엔드에서는 API endpoint를 비롯한 외부 경로는 오직 딱 한번 환경 변수 파일을 통해서 주입 받아야 한다"**

## 🚨 자동 호출 트리거
- 새로운 API 호출을 추가할 때
- fetch나 axios를 직접 사용하려고 할 때 (금지)
- 환경 변수 설정을 검토할 때
- API 클라이언트 구조를 수정할 때

## 🏗️ 아키텍처 구조

### 1. 환경 변수 관리
```
.env.development
.env.staging.sample
.env.production.sample
```

**필수 환경 변수:**
- `VITE_API_BASE_URL`: 메인 API 서버 주소 (FastAPI)
- `VITE_WS_URL`: WebSocket 서버 주소
- `VITE_ENVIRONMENT`: 환경 구분자
- `VITE_BUILD_UID`: 빌드 식별자

### 2. API 클라이언트 계층
```
src/services/api.ts
├── 환경 변수 검증
├── Axios 인스턴스 생성
├── 인터셉터 설정 (토큰, 에러 처리)
├── 토큰 관리자
└── API 서비스 클래스
```

## ✅ 올바른 사용 방법

```typescript
// 1. API 서비스 import
import api from '@/services/api'

// 2. 타입 안전한 API 호출 (Longrise 예시)
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await api.login({ email, password })
    return response.user
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// 3. 유저 데이터 조회
const fetchUserData = async (userId: string) => {
  try {
    const response = await api.getUserData(userId)
    return response.userData
  } catch (error) {
    console.error('User data fetch failed:', error)
    throw error
  }
}

// 4. 투자 패키지 관리
const createInvestment = async (packageData: PackageData) => {
  try {
    const response = await api.createInvestment(packageData)
    return response.investment
  } catch (error) {
    console.error('Investment creation failed:', error)
    throw error
  }
}
```

## ❌ 금지된 방법

```typescript
// 직접 fetch 사용 (금지)
fetch('http://localhost:8000/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// 직접 axios 사용 (금지)
axios.post('/api/users', { userData })

// 하드코딩된 URL (금지)
const API_URL = 'http://localhost:8000/api'
```

## 🏦 Longrise 전용 API 엔드포인트

### 인증 관련
- `POST /auth/login` - 사용자 로그인
- `POST /auth/logout` - 로그아웃
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/me` - 현재 사용자 정보

### 사용자 관리
- `GET /users/{id}` - 사용자 정보 조회
- `PUT /users/{id}` - 사용자 정보 업데이트
- `GET /users/{id}/balance` - 잔액 조회
- `GET /users/{id}/transactions` - 거래 내역

### 투자 패키지
- `GET /packages` - 투자 패키지 목록
- `POST /packages/{id}/invest` - 패키지 투자
- `GET /investments` - 투자 내역 조회

### 거래 관리
- `POST /transactions/deposit` - 입금 요청
- `POST /transactions/withdrawal` - 출금 요청
- `GET /transactions` - 거래 내역

## 🚫 금지 사항
- ❌ 컴포넌트에서 fetch/axios 직접 사용
- ❌ 하드코딩된 API URL 사용
- ❌ 환경 변수 없이 외부 서비스 호출
- ❌ 토큰 관리를 우회한 인증 처리
- ❌ 표준화되지 않은 에러 처리

## ✅ 검증 체크리스트
- [ ] 모든 API 호출이 api 객체를 통해 이루어지는가?
- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] 하드코딩된 URL이 없는가?
- [ ] 토큰 관리가 일관되게 처리되는가?
- [ ] 에러 처리가 표준화되어 있는가?
- [ ] 타입 안전성이 보장되는가?
- [ ] Longrise 비즈니스 로직이 올바르게 구현되었는가?