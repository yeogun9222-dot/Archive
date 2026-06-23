---
name: Phase 3 실제 DB 연결 - Mock to Production 마이그레이션
description: Mock 데이터 → Production DB 전환, 데이터 동기화, 트랜잭션 처리
type: project
originSessionId: c20b5c11-fb54-4367-ba96-1532ccbff5b3
---
# 🗄️ Phase 3: Mock to Production DB 마이그레이션

**담당**: 제인 (웹기획) + 제이크 (PM) | **목표**: 안정적인 DB 전환

---

## 📊 현재 상태 (Mock 데이터 기반)

### 현재 데이터 소스

```typescript
// Dashboard.tsx에서 사용 중인 Mock 데이터
const currentRevenue = 235_000_000;  // 하드코딩
const revenueCapTarget = 300_000_000; // 하드코딩
const withdrawals = [...];  // Mock 배열
const users = [...];  // Mock 배열
```

### Mock 데이터 구조

```
Members (회원)
├─ id: string
├─ userId: string
├─ balance: number (USDT)
├─ package: 'Flexible' | 'Basic' | 'Standard' | 'Premium' | 'VIP'
├─ joinDate: Date
├─ status: 'active' | 'completed'
└─ rank: string

Withdrawals (출금)
├─ id: string
├─ userId: string
├─ amount: number
├─ status: 'pending' | 'approved' | 'rejected'
├─ requestDate: Date
└─ walletAddress: string

Settlements (정산)
├─ id: string
├─ memberId: string
├─ type: 'EARLY_EXIT' | 'M13_EXIT'
├─ basicRefund: number
├─ finalRefund: number
└─ timestamp: Date
```

---

## 🔄 마이그레이션 전략 (3단계)

### Phase 1: 데이터베이스 설계 (준비)

```sql
-- 1. Members 테이블
CREATE TABLE members (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  balance DECIMAL(20, 2) NOT NULL,
  package VARCHAR(50) NOT NULL,
  join_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  rank VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Withdrawals 테이블
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  amount DECIMAL(20, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  request_date TIMESTAMP NOT NULL,
  wallet_address VARCHAR(255),
  network VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 3. Settlements 테이블
CREATE TABLE settlements (
  id UUID PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  settlement_type VARCHAR(50) NOT NULL,
  principal DECIMAL(20, 2),
  basic_refund DECIMAL(20, 2),
  minimum_refund DECIMAL(20, 2),
  final_refund DECIMAL(20, 2),
  floor_applied BOOLEAN,
  months_elapsed INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 4. Daily Revenue 테이블 (캡 추적용)
CREATE TABLE daily_revenue (
  id UUID PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_revenue DECIMAL(20, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Audit Log 테이블
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  member_id UUID,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_settlements_member_id ON settlements(member_id);
CREATE INDEX idx_daily_revenue_date ON daily_revenue(date);
```

### Phase 2: API 레이어 개발

```typescript
// src/api/members.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Member {
  id: string;
  userId: string;
  balance: number;
  package: string;
  joinDate: Date;
  status: string;
}

// 조회
export async function fetchAllMembers(): Promise<Member[]> {
  try {
    const response = await axios.get(`${API_BASE}/members`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
}

export async function fetchMemberById(id: string): Promise<Member> {
  const response = await axios.get(`${API_BASE}/members/${id}`);
  return response.data;
}

// 생성/수정
export async function createMember(data: Omit<Member, 'id'>): Promise<Member> {
  const response = await axios.post(`${API_BASE}/members`, data);
  return response.data;
}

export async function updateMember(id: string, data: Partial<Member>): Promise<Member> {
  const response = await axios.patch(`${API_BASE}/members/${id}`, data);
  return response.data;
}

// 정산
export async function fetchMemberSettlements(memberId: string) {
  const response = await axios.get(`${API_BASE}/members/${memberId}/settlements`);
  return response.data;
}
```

```typescript
// src/api/revenue.ts

export async function fetchDailyRevenue(date?: string): Promise<number> {
  try {
    const response = await axios.get(`${API_BASE}/revenue/daily`, {
      params: { date: date || new Date().toISOString().split('T')[0] }
    });
    return response.data.total_revenue;
  } catch (error) {
    console.error('Failed to fetch daily revenue:', error);
    return 0;
  }
}

export async function fetchCumulativeRevenue(): Promise<number> {
  const response = await axios.get(`${API_BASE}/revenue/cumulative`);
  return response.data.total;
}

export async function fetchRevenueHistory(days: number): Promise<any[]> {
  const response = await axios.get(`${API_BASE}/revenue/history`, {
    params: { days }
  });
  return response.data;
}
```

### Phase 3: 컴포넌트 마이그레이션

```typescript
// Dashboard.tsx - Mock → API 전환
import { useEffect, useState } from 'react';
import { fetchCumulativeRevenue, fetchDailyRevenue } from '../api/revenue';
import { fetchAllMembers, fetchWithdrawals } from '../api/members';

export function Dashboard() {
  const [currentRevenue, setCurrentRevenue] = useState<number>(0);
  const [members, setMembers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 병렬 데이터 로드
        const [revenue, membersList, withdrawalsList] = await Promise.all([
          fetchCumulativeRevenue(),
          fetchAllMembers(),
          fetchWithdrawals()
        ]);

        setCurrentRevenue(revenue);
        setMembers(membersList);
        setWithdrawals(withdrawalsList);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    
    // 30초마다 자동 갱신
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const revenueCapTarget = 340_000_000;
  const revenueCapPercent = (currentRevenue / revenueCapTarget) * 100;
  const isRedAlert = revenueCapPercent >= 80;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 기존 UI 그대로 유지, 데이터만 API에서 로드 */}
      {isRedAlert && (
        <div className="mx-6 p-4 bg-red-500/20 rounded-lg">
          현재 수익: ${(currentRevenue / 1_000_000).toFixed(0)}M / 목표: $340M
          <div className="mt-2 w-full h-2 bg-gray-700 rounded">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${Math.min(revenueCapPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 데이터 마이그레이션 절차

### Step 1: 백업 및 검증

```bash
# 1. 기존 Mock 데이터 내보내기
npm run export-mock-data

# 2. 데이터 검증
npm run validate-export

# 3. Production DB 백업
pg_dump longrise_prod > backup_2026-05-01.sql
```

### Step 2: 데이터 동기화

```typescript
// src/scripts/migrate-data.ts
import { connectDB, importMembers, importWithdrawals } from '../db';

async function migrateData() {
  try {
    console.log('🔄 데이터 마이그레이션 시작...');
    
    // 1. Mock 데이터 로드
    const mockData = await loadMockData();
    
    // 2. 검증
    const validated = await validateData(mockData);
    console.log(`✅ ${validated.members.length}명 회원 검증 완료`);
    
    // 3. 동기화 (트랜잭션)
    const result = await db.transaction(async (trx) => {
      await trx('members').insert(validated.members);
      await trx('withdrawals').insert(validated.withdrawals);
      await trx('settlements').insert(validated.settlements);
    });
    
    console.log(`✅ 데이터 동기화 완료`);
    
    // 4. 무결성 검사
    await verifyMigration();
    console.log(`✅ 무결성 검사 통과`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  }
}

// 실행
migrateData()
  .then(() => console.log('🎉 완료!'))
  .catch(err => process.exit(1));
```

### Step 3: 검증 및 롤백 계획

```typescript
// 무결성 검사
async function verifyMigration() {
  const errors: string[] = [];
  
  // 1. 회원 수 검증
  const memberCount = await db('members').count('* as count');
  if (memberCount[0].count !== EXPECTED_MEMBER_COUNT) {
    errors.push(`회원 수 불일치: ${memberCount[0].count} != ${EXPECTED_MEMBER_COUNT}`);
  }
  
  // 2. 정산 데이터 검증
  const settlements = await db('settlements').select('*');
  for (const settlement of settlements) {
    if (settlement.final_refund < settlement.minimum_refund) {
      errors.push(`정산액 오류: ${settlement.id}`);
    }
  }
  
  // 3. 외래키 검증
  const orphanedWithdrawals = await db('withdrawals')
    .whereNotIn('member_id', db('members').select('id'));
  if (orphanedWithdrawals.length > 0) {
    errors.push(`고아 출금 기록: ${orphanedWithdrawals.length}건`);
  }
  
  if (errors.length > 0) {
    console.log('🔴 검증 오류:');
    errors.forEach(e => console.log(`  - ${e}`));
    throw new Error('마이그레이션 검증 실패');
  }
  
  console.log('✅ 모든 검증 통과');
}

// 롤백 계획
async function rollbackMigration() {
  console.log('⏮️  롤백 시작...');
  
  const backup = 'backup_2026-05-01.sql';
  const cmd = `psql longrise_prod < ${backup}`;
  
  await executeCommand(cmd);
  console.log('✅ 롤백 완료 (Mock 데이터 복원됨)');
}
```

---

## 📋 마이그레이션 체크리스트

### 사전 준비
- [ ] DB 설계 문서 작성 완료
- [ ] API 엔드포인트 정의 완료
- [ ] 인덱스 설계 완료
- [ ] 백업 전략 수립 완료

### 실행
- [ ] Production DB 스키마 생성
- [ ] API 레이어 개발 완료
- [ ] Mock 데이터 export/validate 완료
- [ ] 데이터 마이그레이션 실행
- [ ] 무결성 검사 통과
- [ ] 컴포넌트 API 통합 완료

### 검증
- [ ] Dashboard 실시간 데이터 표시 확인
- [ ] 출금 데이터 동기화 확인
- [ ] 정산 데이터 일치 확인
- [ ] 성능 테스트 (1,000명+ 회원)
- [ ] 부하 테스트 (동시 요청 100+)
- [ ] 보안 감사 (SQL injection, 인증 등)

### 모니터링
- [ ] 실시간 에러 로그 모니터링
- [ ] API 응답시간 모니터링
- [ ] DB 연결 풀 모니터링
- [ ] 쿼리 성능 프로파일링

---

## 🚨 위험 요소 및 대응

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| 데이터 마이그레이션 중 손실 | 낮음 | 치명 | 백업 3배, 트랜잭션 원자성 |
| API 성능 저하 | 중간 | 높음 | 캐싱, 페이지네이션, 인덱스 |
| DB 연결 실패 | 낮음 | 중간 | 재시도 로직, 폴백 |
| 데이터 불일치 | 낮음 | 높음 | 검증 스크립트, 무결성 감사 |

---

## 📅 타임라인

```
2026-05-01~05-05: DB 설계 + 스키마 생성
2026-05-06~05-10: API 레이어 개발
2026-05-11~05-15: 데이터 마이그레이션 + 검증
2026-05-16~05-20: 컴포넌트 통합 + 성능 테스트
2026-05-21~05-25: 보안 감사 + QA 검증
2026-05-26: 프로덕션 배포 (Go/No-Go 검토)
```

---

**담당**: 제인 + 제이크 | **우선순위**: Phase 3-3 | **예상 완료**: 2026-05-26
