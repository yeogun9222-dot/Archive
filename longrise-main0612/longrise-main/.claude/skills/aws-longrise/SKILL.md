---
name: aws-longrise
description: AWS Longrise 계정의 리소스(EC2, S3, RDS, ECS, Lambda 등) 관리. 모든 AWS CLI 명령어 실행 시 반드시 'source AWS_switch-to-longrise.sh &&' 접두어를 사용하여 계정을 전환해야 합니다.
---

# AWS Longrise Management Skill

## 🚨 CRITICAL RULES (절대 준수)

모든 AWS 관련 명령은 반드시 아래 형식을 엄수해야 합니다. 환경 변수 유지를 위해 `;` 대신 `&&`를, 실행 권한을 위해 `source`를 사용합니다.

- **✅ 올바른 형식**: `source AWS_switch-to-longrise.sh && aws [명령어]`
- **❌ 금지 사항**:
  - `aws [명령어]` (직접 실행 금지)
  - `source AWS_switch-to-longrise.sh; aws ...` (세미콜론 금지)
  - `./AWS_switch-to-longrise.sh && aws ...` (서브쉘 실행 금지)

## 🛠 주요 서비스별 실행 예시

### 1. EC2 & RDS (컴퓨팅/DB)
- **인스턴스 확인**: `source AWS_switch-to-longrise.sh && aws ec2 describe-instances --output table`
- **RDS 상태 조회**: `source AWS_switch-to-longrise.sh && aws rds describe-db-instances`
- **EC2 인스턴스 시작**: `source AWS_switch-to-longrise.sh && aws ec2 start-instances --instance-ids i-xxxxxxxxx`
- **RDS 스냅샷 생성**: `source AWS_switch-to-longrise.sh && aws rds create-db-snapshot --db-instance-identifier longrise-db --db-snapshot-identifier longrise-db-backup-$(date +%Y%m%d)`

### 2. S3 (스토리지)
- **버킷 목록**: `source AWS_switch-to-longrise.sh && aws s3 ls`
- **파일 업로드**: `source AWS_switch-to-longrise.sh && aws s3 cp [파일명] s3://longrise-data/`
- **버킷 동기화**: `source AWS_switch-to-longrise.sh && aws s3 sync ./backup/ s3://longrise-backup/`

### 3. ECS & Lambda (서버리스/컨테이너)
- **ECS 서비스 재배포**: `source AWS_switch-to-longrise.sh && aws ecs update-service --cluster longrise-cluster --service longrise-api --force-new-deployment`
- **Lambda 함수 목록**: `source AWS_switch-to-longrise.sh && aws lambda list-functions`
- **Lambda 함수 업데이트**: `source AWS_switch-to-longrise.sh && aws lambda update-function-code --function-name longrise-processor --zip-file fileb://function.zip`

### 4. CloudWatch & Logs
- **로그 그룹 확인**: `source AWS_switch-to-longrise.sh && aws logs describe-log-groups`
- **최근 로그 조회**: `source AWS_switch-to-longrise.sh && aws logs tail /aws/lambda/longrise-function --follow`

## 🔒 안전 확인 절차 (Pre-flight Check)

1. **계정 검증**: 작업 전 `source AWS_switch-to-longrise.sh && aws sts get-caller-identity`를 통해 올바른 계정인지 확인합니다.
2. **리전 확인**: 모든 작업은 `ap-northeast-2` (서울) 리전을 기본으로 합니다.
3. **권한 검증**: 작업 전 해당 리소스에 대한 권한이 있는지 확인합니다.

## 💼 Longrise 전용 리소스 명명 규칙

### EC2 인스턴스
- `longrise-api-prod`: 프로덕션 API 서버
- `longrise-api-dev`: 개발 API 서버
- `longrise-web-prod`: 프로덕션 웹 서버
- `longrise-db-prod`: 데이터베이스 서버

### S3 버킷
- `longrise-static-assets`: 정적 파일 저장
- `longrise-user-uploads`: 사용자 업로드 파일
- `longrise-backup`: 백업 데이터
- `longrise-logs`: 로그 저장소

### RDS 인스턴스
- `longrise-main-db`: 메인 PostgreSQL 데이터베이스
- `longrise-analytics-db`: 분석용 데이터베이스

## 🔍 일반적인 Longrise 운영 작업

### 데이터베이스 백업
```bash
# RDS 스냅샷 생성
source AWS_switch-to-longrise.sh && aws rds create-db-snapshot \
  --db-instance-identifier longrise-main-db \
  --db-snapshot-identifier longrise-backup-$(date +%Y%m%d-%H%M%S)
```

### 로그 모니터링
```bash
# API 서버 로그 실시간 확인
source AWS_switch-to-longrise.sh && aws logs tail /aws/ec2/longrise-api --follow

# 에러 로그 검색
source AWS_switch-to-longrise.sh && aws logs filter-log-events \
  --log-group-name /aws/ec2/longrise-api \
  --filter-pattern "ERROR"
```

### 배포 및 업데이트
```bash
# ECS 서비스 업데이트
source AWS_switch-to-longrise.sh && aws ecs update-service \
  --cluster longrise-prod \
  --service longrise-api-service \
  --force-new-deployment
```

## 🔍 트러블슈팅
- 명령어가 권한 오류를 뱉을 경우, 세션이 만료되었을 수 있으므로 다시 `source` 명령을 포함하여 실행합니다.
- 모든 로그와 결과는 Longrise 프로젝트 기준임을 명심하십시오.
- 계정 ID와 리전이 올바른지 항상 확인하세요.

## ⚠️ 보안 주의사항
- AWS 자격 증명이 노출되지 않도록 주의하세요.
- 프로덕션 환경 작업 시 반드시 백업을 먼저 수행하세요.
- 중요한 변경 사항은 팀과 공유 후 진행하세요.