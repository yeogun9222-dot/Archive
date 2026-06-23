# Database Connection Management Skill

## 🎯 핵심 원칙
**"FastAPI 서버에서는 데이터베이스 연결 정보를 오직 딱 한번 환경 변수를 통해서 주입받고, 단일 연결 객체만을 사용해야 한다"**

## 🚨 자동 호출 트리거
- 새로운 DB 모델이나 서비스를 추가할 때
- SQLAlchemy 세션을 직접 생성하려고 할 때 (금지)
- 데이터베이스 설정을 검토할 때
- DB 연결 구조를 수정할 때
- alembic 마이그레이션을 설정할 때

## 🏗️ 아키텍처 구조

### 1. 환경 변수 관리
```
.env.local
.env.staging.sample
.env.production.sample
```

**필수 환경 변수:**
- `DATABASE_URL`: 메인 데이터베이스 연결 문자열 (PostgreSQL)
- `DB_POOL_SIZE`: 연결 풀 크기 (선택적)
- `DB_MAX_OVERFLOW`: 최대 오버플로우 연결 (선택적)
- `DB_ECHO`: SQLAlchemy 로그 출력 여부 (선택적)

### 2. 데이터베이스 연결 계층
```
app/core/database.py
├── 환경 변수 검증
├── SQLAlchemy 엔진 생성
├── AsyncSession 팩토리
├── 연결 풀 설정
└── 의존성 주입 함수
```

## ✅ 올바른 사용 방법

```python
# 1. 표준 의존성 주입 사용
from app.core.database import get_session
from app.services.user_service import UserService

@router.get("/users/{user_id}")
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_session)
):
    user = await UserService.get_user_by_id(session, user_id)
    return user

# 2. 서비스 레이어에서의 사용
class UserService:
    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: UUID) -> User:
        result = await session.get(User, user_id)
        return result

# 3. 트랜잭션 관리
@router.post("/transactions")
async def create_transaction(
    transaction_data: TransactionCreate,
    session: AsyncSession = Depends(get_session)
):
    async with session.begin():
        # 트랜잭션 내에서 여러 작업 수행
        transaction = await TransactionService.create(session, transaction_data)
        await UserService.update_balance(session, transaction.user_id)
        return transaction

# 4. 대량 작업 처리
@router.post("/bulk-operations")
async def bulk_operations(
    operations: List[OperationData],
    session: AsyncSession = Depends(get_session)
):
    results = []
    for operation in operations:
        result = await OperationService.process(session, operation)
        results.append(result)
    await session.commit()
    return results
```

## ❌ 금지된 방법

```python
# 직접 연결 문자열 사용 (금지)
engine = create_async_engine("postgresql+asyncpg://user:pass@host/db")

# 하드코딩된 DB 호스트 (금지)
DB_HOST = "longrise-main-db.c726s6ksmvve.ap-northeast-2.rds.amazonaws.com"

# 직접 세션 생성 (금지)
session = AsyncSession(engine)

# 여러 개의 엔진 생성 (금지)
read_engine = create_async_engine(READ_DB_URL)
write_engine = create_async_engine(WRITE_DB_URL)
```

## 🏦 Longrise 전용 DB 연결 구조

### 1. 핵심 설정 (app/core/config.py)
```python
class Settings(BaseSettings):
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False
    
    class Config:
        env_file = ".env.local"
        case_sensitive = True
```

### 2. 데이터베이스 엔진 (app/core/database.py)
```python
# 단일 엔진 인스턴스
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_recycle=3600
)

# 단일 세션 팩토리
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```

### 3. 의존성 주입 (app/api/dependencies.py)
```python
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

## 🎯 Longrise 전용 DB 모델 패턴

### 사용자 관리
- `User`: 사용자 기본 정보
- `LoginHistory`: 로그인 이력
- `UserWallet`: 지갑 정보

### 거래 관리
- `Transaction`: 거래 내역
- `WithdrawalRequest`: 출금 요청
- `P2PTransaction`: P2P 거래

### 투자 관리
- `MemberPackage`: 회원 패키지
- `PackagePolicy`: 패키지 정책
- `ROISettings`: ROI 설정

### 시스템 관리
- `AuditLog`: 감사 로그
- `SystemSettings`: 시스템 설정
- `SupportTicket`: 고객 지원

## 🚫 금지 사항
- ❌ 모델이나 서비스에서 직접 엔진 생성
- ❌ 하드코딩된 DB 호스트/연결 문자열 사용
- ❌ 환경 변수 없이 DB 연결
- ❌ 세션 관리를 우회한 DB 접근
- ❌ 표준화되지 않은 트랜잭션 처리
- ❌ 직접적인 SQL 문자열 실행 (Raw SQL)

## ✅ 검증 체크리스트
- [ ] 모든 DB 접근이 get_session() 의존성을 통해 이루어지는가?
- [ ] DATABASE_URL 환경 변수가 올바르게 설정되었는가?
- [ ] 하드코딩된 DB 호스트나 연결 정보가 없는가?
- [ ] 단일 엔진 인스턴스만 사용하고 있는가?
- [ ] 세션 관리가 일관되게 처리되는가?
- [ ] 트랜잭션 처리가 표준화되어 있는가?
- [ ] 연결 풀 설정이 적절한가?
- [ ] Alembic 마이그레이션이 같은 DATABASE_URL을 사용하는가?

## 🔧 마이그레이션 관리

### Alembic 설정 (alembic.ini)
```ini
# 환경 변수에서 DATABASE_URL 주입
sqlalchemy.url = 
```

### 환경 설정 (alembic/env.py)
```python
from app.core.config import settings

# 단일 진실 공급원 원칙
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

## 🚨 보안 고려사항
- DATABASE_URL에 민감한 정보 포함 → 환경 변수로만 관리
- 연결 풀 크기 적절히 설정 → 리소스 낭비 방지
- 연결 타임아웃 설정 → 무한 대기 방지
- 연결 재사용 설정 → 성능 최적화

## 📊 모니터링 권장사항
- 연결 풀 상태 모니터링
- 느린 쿼리 로깅
- 데이터베이스 연결 에러 추적
- 트랜잭션 롤백 빈도 확인