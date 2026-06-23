---
name: Phase 3 제이크의 M13 EXIT 타임라인 자동화
description: 13개월 만기 자동 정산, M13 EXIT 규칙 자동 실행, 회원 자동 알림
type: project
originSessionId: c20b5c11-fb54-4367-ba96-1532ccbff5b3
---
# ⏰ Phase 3: 제이크의 M13 EXIT 타임라인 자동화

**담당**: 제이크 (PM) | **목표**: 만기 도달 회원 자동 정산 및 알림

---

## 🎯 M13 EXIT 핵심 개념

V7.4/V7.5 마스터 플랜의 핵심: **13개월 만기 자동 정산**

```
회원 여정 (Member Journey):
┌─────────────┬─────────────────┬──────────────┬──────────┐
│  M0 진입    │  M1~M12 수익    │   M13 도달   │  M13+   │
├─────────────┼─────────────────┼──────────────┼──────────┤
│ 원금 입금   │ USDT배당 + CNYT │ 자동 정산    │ 환급액  │
│             │ 직추 + 롤업 + GP │ 15% 보장 적용│ 인출    │
│             │                 │ 프로그램 종료│        │
└─────────────┴─────────────────┴──────────────┴──────────┘

특징:
- 고정 13개월 만기 (변동 없음)
- 자동 정산 (관리자 미개입)
- 15% 최소보장 적용
- 프로그램 자동 종료 (재진입 가능)
```

---

## 📋 M13 EXIT 자동화 플로우

### Step 1: 만기 도달 모니터링 (자동)

```javascript
// 매일 자정 UTC 기준 실행
@Cron('0 0 * * *')  // 매일 00:00
function checkM13ExitSchedule() {
  // 1️⃣ 모든 활성 회원 조회
  const activeMembers = await db.members.find({ status: 'active' });
  
  // 2️⃣ M13 도달 회원 필터링
  const m13Members = activeMembers.filter(member => {
    const entryDate = new Date(member.joinDate);
    const m13Date = new Date(entryDate.setMonth(entryDate.getMonth() + 13));
    return new Date() >= m13Date && member.status !== 'completed';
  });
  
  // 3️⃣ 자동 정산 트리거
  for (const member of m13Members) {
    await triggerM13Exit(member);
  }
  
  // 4️⃣ 로그 기록
  console.log(`🔔 M13 EXIT 처리: ${m13Members.length}건`);
}
```

### Step 2: 자동 정산 실행 (자동)

```javascript
async function triggerM13Exit(member) {
  try {
    // 1️⃣ 최종 정산 계산
    const settlement = calculateFinalSettlement(member);
    
    // 2️⃣ M13 EXIT 규칙 적용
    // - 기간별 수수료: 0% (만기 도달이므로 추가 수수료 없음)
    // - 15% 최소보장: 자동 적용
    const finalRefund = Math.max(settlement.basicRefund, settlement.minimumRefund);
    
    // 3️⃣ 정산 기록 저장
    await db.settlements.create({
      memberId: member.id,
      type: 'M13_EXIT',
      status: 'COMPLETED',
      timestamp: new Date(),
      basicRefund: settlement.basicRefund,
      minimumRefund: settlement.minimumRefund,
      finalRefund: finalRefund,
      floorApplied: finalRefund > settlement.basicRefund
    });
    
    // 4️⃣ 회원 상태 업데이트
    await db.members.update(
      { id: member.id },
      { 
        status: 'completed',
        exitDate: new Date(),
        exitType: 'M13_NATURAL'
      }
    );
    
    // 5️⃣ 회원에게 자동 알림 발송
    await sendM13ExitNotification(member, finalRefund);
    
    // 6️⃣ 관리자에게 로그 전송
    await logM13Exit(member, finalRefund);
    
  } catch (error) {
    console.error(`❌ M13 EXIT 오류 [${member.id}]: ${error.message}`);
    await logM13ExitError(member, error);
  }
}
```

### Step 3: 회원 자동 알림 (자동)

```javascript
async function sendM13ExitNotification(member, finalRefund) {
  // 1️⃣ SMS/이메일 알림
  const message = `
    🎉 축하합니다! LONGRISE 프로그램 ${13}개월 만기 도달
    
    💰 최종 환급액: $${finalRefund.toFixed(2)}
    📅 정산일: ${new Date().toLocaleDateString('ko-KR')}
    
    🔄 다음 단계:
    1. 본인 대시보드에서 출금 신청하기
    2. 관리자 검증 (1-2영업일)
    3. 환급액 입금
    
    ❓ 궁금한 점: support@longrise.com
  `;
  
  await sendSMS(member.phone, message);
  await sendEmail(member.email, '🎉 M13 EXIT 정산 완료', message);
  
  // 2️⃣ 인앱 알림
  await createInAppNotification(member.id, {
    type: 'M13_EXIT_COMPLETED',
    title: 'M13 EXIT 정산 완료',
    amount: finalRefund
  });
  
  // 3️⃣ 푸시 알림
  await sendPushNotification(member.deviceToken, {
    title: 'M13 EXIT 정산 완료',
    body: `$${finalRefund.toFixed(2)} 환급액이 준비되었습니다`
  });
}
```

### Step 4: 관리자 대시보드 업데이트 (자동)

```javascript
// Dashboard에 M13 EXIT 큐 표시
function M13ExitQueue() {
  const [m13Queue, setM13Queue] = useState([]);
  
  // 30분마다 자동 갱신
  useEffect(() => {
    const interval = setInterval(async () => {
      const queue = await fetchM13ExitPendingList();
      setM13Queue(queue);
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="dashboard-card">
      <h3>🔔 M13 EXIT 처리 큐</h3>
      
      {m13Queue.length === 0 ? (
        <p className="text-text-muted">진행 중인 M13 EXIT 없음</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>회원</th>
              <th>진입일</th>
              <th>M13 도달일</th>
              <th>환급액</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {m13Queue.map(item => (
              <tr key={item.id}>
                <td>{item.memberId}</td>
                <td>{formatDate(item.joinDate)}</td>
                <td>{formatDate(item.m13Date)}</td>
                <td className="font-bold text-accent-green">
                  ${item.finalRefund.toFixed(2)}
                </td>
                <td>
                  <span className="badge badge-success">
                    ✅ 자동정산 완료
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm">상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 📅 M13 EXIT 타임라인 예시

### 예시 1: 기본 시나리오 (Standard $500)

```
입금일: 2026-01-01 (M0 진입)
M13 도달: 2027-02-01 (13개월 후)

타임라인:
┌─────────────────────────────────────────┐
│ 2027-02-01 자정                        │
├─────────────────────────────────────────┤
│ 🤖 시스템 자동 체크                     │
│   → M13 도달 회원 감지                  │
│                                         │
│ 🧮 자동 정산 계산                      │
│   → USDT배당: $405 (9% × 12 × $500)   │
│   → CNYT 매입: $240 (4% × 12 × $500)  │
│   → 직추: $60, 롤업: $45, GP: $13     │
│   → 총지출: $763                       │
│   → 수수료: $0 (만기 도달)              │
│   → 기본계산: $500 - $763 = -$263      │
│   → 최소보장: $500 × 15% = $75        │
│   → 최종환급: max(-$263, $75) = $75   │
│                                         │
│ 📧 회원 알림 발송                      │
│   → SMS: "M13 정산 완료, $75 환급"    │
│   → 이메일: 상세 정산 내역              │
│   → 인앱: 출금 신청 버튼                │
│                                         │
│ 📝 관리자 로그                          │
│   → Dashboard M13 EXIT 큐 업데이트     │
│   → 정산 기록 자동 생성                  │
│                                         │
│ ✅ 프로그램 종료                       │
│   → 회원 상태: 'completed'             │
│   → 재진입 가능                         │
└─────────────────────────────────────────┘
```

### 예시 2: VIP 대액 시나리오 ($5,000)

```
입금일: 2026-01-01
M13 도달: 2027-02-01

자동 정산:
  - 기본계산: -$15,463.87 (엄청난 손실)
  - 최소보장: $5,000 × 15% = $750
  - 최종환급: $750 ✅
  - 회사손실: -$16,213.87 (15% 보장으로 통제)

회원 상태:
  - 즉시: '💰 환급액 대기 중'
  - 알림: SMS + 이메일 + 푸시 3채널
  - 다음: 본인 대시보드에서 출금 신청
```

---

## 🛡️ M13 EXIT 안전 장치

### 1️⃣ 중복 처리 방지

```javascript
// 멱등성 보장
async function triggerM13ExitSafely(member) {
  // 이미 정산되었는지 확인
  const existing = await db.settlements.findOne({
    memberId: member.id,
    type: 'M13_EXIT'
  });
  
  if (existing) {
    console.log(`⚠️  이미 정산됨: ${member.id}`);
    return existing;
  }
  
  // 새로운 정산 생성
  return await triggerM13Exit(member);
}
```

### 2️⃣ 오류 복구

```javascript
// 실패한 M13 EXIT 자동 재시도
@Cron('0 2 * * *')  // 매일 02:00 (재시도)
async function retryFailedM13Exits() {
  const failed = await db.m13ExitErrors.find({ status: 'failed' });
  
  for (const error of failed) {
    try {
      await triggerM13Exit(error.member);
      await db.m13ExitErrors.updateOne(
        { id: error.id },
        { status: 'recovered', timestamp: new Date() }
      );
    } catch (err) {
      console.error(`🔴 재시도 실패: ${error.memberId}`);
    }
  }
}
```

### 3️⃣ 감사 로그

```javascript
// 모든 M13 EXIT 기록 유지
async function logM13Exit(member, finalRefund) {
  await db.auditLog.create({
    action: 'M13_EXIT_PROCESSED',
    timestamp: new Date(),
    memberId: member.id,
    package: member.package,
    joinDate: member.joinDate,
    exitDate: new Date(),
    finalRefund: finalRefund,
    executedBy: 'SYSTEM_AUTO',
    ipAddress: '127.0.0.1'
  });
}
```

---

## 📊 M13 EXIT 모니터링

### 실시간 대시보드 지표

```
📈 M13 EXIT 통계 (월간)

월: 2026-05월
├─ 만기 도달 회원: 1,240명
├─ 자동 정산 완료: 1,240명 (100%)
├─ 환급액 총합: $156.2M
├─ 보장 적용: 868명 (70%)
├─ 평균 환급액: $125,968
└─ 처리 오류: 0건 (100% 성공)

누적 (누적):
├─ 총 만기 도달: 4,560명
├─ 총 환급액: $567.3M
├─ 보장 총합: $42.1M
└─ 시스템 오류: 0건
```

### 예측 분석

```
🔮 다음 30일 M13 EXIT 예측

2026-05-01 ~ 2026-06-01 예상:
├─ 예상 만기 도달: 1,150명
├─ 예상 환급액: $145.2M
├─ 보장 적용 예상: 65%
└─ 예상 회사손실: $9.4M (통제 범위)
```

---

## 🔄 M13 EXIT 이후 프로세스

### 회원 재진입 (Optional)

```
M13 EXIT 후:
┌──────────────────────────────────┐
│ 환급액 수령                       │
├──────────────────────────────────┤
│ ✅ 재진입 가능 (선택사항)          │
│                                  │
│ 옵션 1: 추가 투자 (같은 패키지)   │
│ → "M0 2차 진입"으로 시작          │
│                                  │
│ 옵션 2: 상위 등급 업그레이드      │
│ → Flexible → Basic 로 재진입      │
│                                  │
│ 옵션 3: 프로그램 종료             │
│ → 최종 환급액 인출                 │
└──────────────────────────────────┘
```

---

## 📅 구현 로드맵

```
Phase 3-2 (2026-05-01~05-15)
├─ [ ] M13 EXIT 자동화 알고리즘 개발
├─ [ ] 크론 작업 설정 (일일 00:00)
├─ [ ] 알림 시스템 통합
├─ [ ] Dashboard M13 EXIT 큐 표시
└─ [ ] QA 테스트 (재시뮬레이션 10회)

Phase 3-3 (2026-05-16~05-31)
├─ [ ] 실제 데이터로 스트레스 테스트
├─ [ ] 오류 복구 메커니즘 검증
├─ [ ] 감사 로그 완성
└─ [ ] 본격 운영 시작
```

---

**담당자**: 제이크 (PM) | **우선순위**: Phase 3-2 | **예상 완료**: 2026-05-31
