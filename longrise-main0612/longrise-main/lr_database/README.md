# Longrise Database

PostgreSQL 15 기반 Longrise AI 플랫폼 데이터베이스 설정

## 🚀 빠른 시작

### 1. 데이터베이스 시작
```bash
# 데이터베이스 컨테이너 시작
cd lr_database
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 2. 데이터베이스 연결 확인
```bash
# PostgreSQL 클라이언트로 연결 테스트
docker exec -it longrise_database_postgres psql -U longrise -d longrise

# 또는 외부에서 연결
psql -h localhost -p 5432 -U longrise -d longrise
```

### 3. 중지 및 정리
```bash
# 컨테이너 중지
docker-compose down

# 데이터까지 완전 삭제 (주의!)
docker-compose down -v
```

## 📋 설정 정보

### 환경 변수 (.env.local)
```bash
DB_PORT=5432                    # 외부 포트
POSTGRES_DB=longrise           # 데이터베이스 이름
POSTGRES_USER=longrise         # 사용자명
POSTGRES_PASSWORD=longrise123! # 비밀번호
CONTAINER_NAME=longrise_database_postgres
```

### 연결 문자열
```
postgresql://longrise:longrise123!@localhost:5432/longrise
```

## 📊 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `admin_users` - 관리자 정보
- `transactions` - 거래 내역
- `member_packages` - 투자 패키지
- `m13_exit_settlements` - M13 EXIT 정산
- `support_tickets` - 고객 지원
- `audit_logs` - 감사 로그

### 초기 데이터
- 기본 패키지 정책 (Flexible, Basic, Standard, Premium, VIP)
- 관리자 계정 (username: admin, password: admin123!)
- 시스템 설정값

## 🔧 유지보수

### 백업
```bash
# 전체 데이터베이스 백업
docker exec longrise_database_postgres pg_dump -U longrise longrise > backup.sql

# 특정 테이블만 백업
docker exec longrise_database_postgres pg_dump -U longrise -t users longrise > users_backup.sql
```

### 복원
```bash
# 백업 파일에서 복원
docker exec -i longrise_database_postgres psql -U longrise -d longrise < backup.sql
```

### 스키마 업데이트
새로운 마이그레이션 파일을 `schema/` 폴더에 추가하면 컨테이너 재시작 시 자동 적용됩니다.

### 트러블슈팅
```bash
# 컨테이너 상태 확인
docker ps | grep longrise

# 로그 확인
docker logs longrise_database_postgres

# 데이터베이스 프로세스 확인
docker exec longrise_database_postgres ps aux

# 포트 확인
lsof -i :5432
```

## ⚠️ 주의사항
- 프로덕션에서는 환경 변수와 비밀번호를 변경하세요
- 정기적으로 데이터베이스를 백업하세요
- 컨테이너 삭제 시 볼륨도 함께 삭제되므로 주의하세요