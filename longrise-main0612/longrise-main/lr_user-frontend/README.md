# Longrise User Frontend

Longrise AI Crypto Investment Platform의 사용자 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택
- **React 19** - 최신 React 버전
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Motion** - 애니메이션 라이브러리
- **Axios** - HTTP 클라이언트
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

## 🏗️ 프로젝트 구조
```
lr_user-frontend/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── LoginPage.tsx    # 로그인 페이지
│   │   ├── HomePage.tsx     # 홈 페이지
│   │   ├── WalletPage.tsx   # 지갑 페이지
│   │   └── ...             # 기타 페이지 컴포넌트
│   ├── contexts/           # React Contexts
│   │   └── AuthContext.tsx # 인증 컨텍스트
│   ├── hooks/              # 커스텀 훅
│   │   └── useAuth.ts      # 인증 훅
│   ├── services/           # API 서비스
│   │   └── api.ts          # API 클라이언트
│   ├── types/              # TypeScript 타입
│   │   └── api.ts          # API 타입 정의
│   ├── shared/             # 공유 타입 및 데이터
│   ├── utils/              # 유틸리티 함수
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── AppWrapper.tsx      # 인증 래퍼
│   └── main.tsx           # 엔트리 포인트
├── .env.local             # 환경 변수
├── package.json           # 의존성
├── vite.config.ts         # Vite 설정
└── README.md              # 이 파일
```

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
cd lr_user-frontend
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일이 이미 설정되어 있습니다:
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENVIRONMENT=development
VITE_APP_NAME="Longrise AI"
```

### 3. 백엔드 서버 실행
FastAPI 서버가 실행 중인지 확인하세요:
```bash
cd ../lr_fastapi
uv run python main.py
```

### 4. 프론트엔드 개발 서버 시작
```bash
npm run dev
```

애플리케이션이 http://localhost:5173 에서 실행됩니다.

## 📋 주요 기능

### 🔐 인증 시스템
- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 로그인/로그아웃 기능
- 보호된 라우트

### 👤 사용자 관리
- 사용자 프로필 조회/수정
- 계정 정보 관리
- KYC 상태 확인

### 💰 지갑 기능
- USDT/CNYT 잔액 조회
- 거래 내역 확인
- 입출금 관리

### 📦 투자 패키지
- 패키지 정보 조회
- 투자 신청
- ROI 모니터링

### 📱 반응형 디자인
- 모바일 최적화
- 다크 테마 지원
- 애니메이션 효과

## 🔧 API 연동

### API 서비스 사용
```typescript
import apiService from '@/services/api';

// 로그인
const loginResult = await apiService.login({
  email: 'user@example.com',
  password: 'password'
});

// 현재 사용자 조회
const userData = await apiService.getCurrentUser();

// 사용자 정보 업데이트
const updatedUser = await apiService.updateUser({
  name: 'New Name'
});
```

### 인증 훅 사용
```typescript
import { useAuthContext } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext();
  
  // 컴포넌트 로직...
}
```

## 🎨 스타일링

### Tailwind CSS
모든 스타일링은 Tailwind CSS를 사용합니다:
```typescript
<div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
    버튼
  </button>
</div>
```

### 애니메이션
Motion 라이브러리를 사용한 애니메이션:
```typescript
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  애니메이션 컨텐츠
</motion.div>
```

## 📱 개발 도구

### 타입 체크
```bash
npm run type-check
```

### 린팅
```bash
npm run lint
```

### 코드 포맷팅
```bash
npm run format
```

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

## 🔗 환경별 설정

### 개발 환경
- HMR 활성화
- 소스맵 생성
- API 프록시 설정

### 프로덕션 환경
- 코드 최적화
- 청크 분할
- 에셋 압축

## ⚠️ 주의사항

### 보안
- API 토큰은 localStorage에 저장됩니다
- HTTPS 사용 권장
- 환경 변수로 민감한 정보 관리

### 성능
- 컴포넌트 지연 로딩
- 이미지 최적화
- 번들 크기 모니터링

### 브라우저 지원
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 🐛 트러블슈팅

### 일반적인 문제들

#### API 연결 오류
```bash
# 백엔드 서버 상태 확인
curl http://localhost:8000/health

# 환경 변수 확인
echo $VITE_API_BASE_URL
```

#### 빌드 오류
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 타입 오류 확인
npm run type-check
```

#### 개발 서버 오류
```bash
# 포트 충돌 확인
lsof -i :5173

# Vite 캐시 클리어
rm -rf node_modules/.vite
```

## 📚 참고 링크
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Motion 공식 문서](https://motion.dev/)

## 🤝 기여하기
1. 개발 환경 설정
2. 기능 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성