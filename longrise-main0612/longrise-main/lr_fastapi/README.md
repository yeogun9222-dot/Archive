# Longrise FastAPI Server

Longrise AI Crypto Investment Platform의 백엔드 API 서버입니다.

## 🚀 기술 스택
- **FastAPI** - 현대적이고 빠른 웹 프레임워크
- **SQLModel** - SQL 데이터베이스와의 타입 안전한 상호작용
- **PostgreSQL** - 메인 데이터베이스 (asyncpg 드라이버)
- **Alembic** - 데이터베이스 마이그레이션
- **UV** - 빠른 Python 패키지 관리자
- **Pydantic** - 데이터 검증 및 설정 관리

## 🏗️ 프로젝트 구조
```
lr_fastapi/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # 인증 엔드포인트
│   │       └── users.py         # 사용자 CRUD 엔드포인트
│   ├── core/
│   │   ├── config.py            # 설정 관리
│   │   ├── database.py          # 데이터베이스 연결
│   │   └── security.py          # 보안 유틸리티
│   ├── models/
│   │   └── user.py              # SQLModel 모델들
│   └── services/
│       └── user_service.py      # 비즈니스 로직
├── alembic/                     # 데이터베이스 마이그레이션
├── main.py                      # FastAPI 앱 진입점
├── pyproject.toml              # 프로젝트 설정
└── .env.local                  # 환경 변수
```

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# UV 설치 (없는 경우)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 프로젝트 디렉터리로 이동
cd lr_fastapi

# Python 환경 생성 및 의존성 설치
uv sync

# 개발 의존성도 함께 설치
uv sync --dev
```

### 2. 환경 변수 설정
`.env.local` 파일이 이미 생성되어 있습니다. 필요에 따라 수정하세요:
```bash
DATABASE_URL=postgresql+asyncpg://longrise:longrise123!@localhost:5432/longrise
SECRET_KEY=your-super-secret-key-change-in-production-longrise-2024
API_PORT=8000
ENVIRONMENT=development
```

### 3. 데이터베이스 준비
데이터베이스가 실행 중인지 확인하세요:
```bash
# 데이터베이스 컨테이너 시작 (lr_database 폴더에서)
cd ../lr_database
docker-compose up -d
cd ../lr_fastapi
```

### 4. 데이터베이스 마이그레이션
```bash
# 첫 번째 마이그레이션 생성
uv run alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 적용
uv run alembic upgrade head
```

### 5. 서버 실행
```bash
# 개발 서버 시작
uv run python main.py

# 또는
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## 🔐 API 엔드포인트

### 인증 (Authentication)
- `POST /api/v1/auth/login` - 로그인 (OAuth2)
- `POST /api/v1/auth/login/json` - 로그인 (JSON)
- `POST /api/v1/auth/test-token` - 토큰 테스트
- `POST /api/v1/auth/logout` - 로그아웃
- `POST /api/v1/auth/refresh` - 토큰 갱신

### 사용자 (Users)
- `POST /api/v1/users/` - 사용자 생성
- `GET /api/v1/users/` - 사용자 목록 조회
- `GET /api/v1/users/me` - 현재 사용자 정보
- `GET /api/v1/users/{user_id}` - 특정 사용자 조회
- `PUT /api/v1/users/me` - 현재 사용자 정보 수정
- `PUT /api/v1/users/{user_id}` - 사용자 정보 수정
- `DELETE /api/v1/users/{user_id}` - 사용자 삭제
- `GET /api/v1/users/count/total` - 사용자 수 조회

### 기타
- `GET /` - 루트 엔드포인트
- `GET /health` - 헬스 체크

## 🔧 개발 도구

### 코드 포맷팅
```bash
# Black으로 코드 포맷팅
uv run black .

# isort로 import 정렬
uv run isort .
```

### 타입 체킹
```bash
# MyPy로 타입 체크
uv run mypy .
```

### 테스트
```bash
# pytest로 테스트 실행
uv run pytest

# 커버리지와 함께 테스트
uv run pytest --cov=app
```

## 🗄️ 데이터베이스 관리

### 마이그레이션
```bash
# 새 마이그레이션 생성
uv run alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
uv run alembic upgrade head

# 마이그레이션 롤백
uv run alembic downgrade -1

# 마이그레이션 히스토리 확인
uv run alembic history
```

### 데이터베이스 접속
```bash
# PostgreSQL 클라이언트로 직접 접속
psql -h localhost -p 5432 -U longrise -d longrise
```

## 🎯 사용 예시

### 1. 사용자 생성
```bash
curl -X POST "http://localhost:8000/api/v1/users/" \
     -H "Content-Type: application/json" \
     -d '{
       "nickname": "testuser",
       "email": "test@example.com",
       "password": "testpass123",
       "name": "Test User"
     }'
```

### 2. 로그인
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123"
     }'
```

### 3. 인증된 요청
```bash
# 토큰을 받은 후
curl -X GET "http://localhost:8000/api/v1/users/me" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## ⚠️ 주의사항

### 보안
- 프로덕션에서는 반드시 `SECRET_KEY`를 변경하세요
- HTTPS를 사용하세요
- 데이터베이스 비밀번호를 변경하세요

### 성능
- 프로덕션에서는 Gunicorn + Uvicorn workers 사용 권장
- PostgreSQL 연결 풀 설정 최적화
- Redis를 활용한 세션/캐시 관리 고려

### 모니터링
- 로그 레벨 적절히 설정
- 헬스 체크 엔드포인트 활용
- 메트릭스 수집 도구 연동 고려

## 🔗 관련 링크
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLModel 공식 문서](https://sqlmodel.tiangolo.com/)
- [Alembic 공식 문서](https://alembic.sqlalchemy.org/)
- [UV 공식 문서](https://docs.astral.sh/uv/)