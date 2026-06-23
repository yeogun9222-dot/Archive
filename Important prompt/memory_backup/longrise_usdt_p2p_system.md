---
name: LONGRISE USDT P2P 거래 시스템 설계
description: USDT P2P 거래 플랫폼의 전체 메커니즘, Red Dragon의 역할, 5가지 핵심 기능 상세 설계
type: project
originSessionId: 794b68b3-3f30-4167-905c-a3fd4dd3a0bb
---
## **USDT P2P 거래 시스템 핵심 목적**

일반 회원(Purple, Blue, White Dragon)이 코인/거래소 사용 없이 쉽게 USDT를 사고팔 수 있게 하되, Red Dragon 직급자들이 20% 차익을 얻으면서 동시에 하부 회원들의 USDT 접근성을 높이는 이중 목적 시스템.

---

## **참여자별 역할**

### **Red Dragon (리더)**
- USDT 구매 환율: 0.9 (고정)
- USDT 판매 환율: 자유 (암묵적 1.1 권장)
- 차익: 20% (0.9 → 1.1)
- 역할: 신규회원에게 USDT 제공, 기존 회원의 수익 인출 중개
- 수익: 차익 + 판매자 수수료

### **신규회원 (New User)**
- 현금 입금 → Red Dragon 통장
- Red Dragon으로부터 USDT 내부이체 받음
- 패키지 구매 가능

### **기존 회원 (Purple/Blue/White Dragon)**
- AI 수익 → USDT 인출
- USDT Trading Floor에서 판매 등록 (0.9 환율)
- Red Dragon이 구매
- 같은 국가: 통장 입금
- 다른 국가: Binance/개인지갑 이체

---

## **5가지 핵심 기능**

### **1. 내부이체 기능 (Internal Transfer)**
```
Red Dragon → 회원 USDT 이체
- Red Dragon 잔액에서 차감
- 수령자 잔액에 추가
- 이체 이력 기록
- 즉시 반영
```

### **2. USDT 잔액 관리 (Balance System)**
```
각 회원의 플랫폼 내 USDT 보유액 관리
- 지갑 페이지에서 확인
- 내부이체로 인한 실시간 변동
- 거래로 인한 증감
- 거래 이력 표시
```

### **3. 신규회원 온보딩 (Onboarding Process)**
```
신규회원 패키지 구매 흐름:

1. Red Dragon 선택 페이지
   - Red Dragon 리스트 표시 (신뢰도별)
   - 평점, 거래 이력 표시

2. 입금 정보 표시
   - 선택된 Red Dragon의 계좌 정보
   - 입금 금액 명시
   - 입금 지시사항

3. 입금 확인
   - 입금 완료 버튼
   - 타임스탬프 기록

4. USDT 이체 요청
   - "Request USDT Transfer" 버튼
   - Red Dragon 알림 받음
   - Red Dragon이 내부이체 실행

5. 이체 완료 확인
   - 회원 지갑에 USDT 반영
```

### **4. 신뢰도 평판 시스템 (Reputation System)**
```
초기 상태: ⭐⭐ (2개 부여)

⚠️ 경고 안내문:
"You have 2 chances.
First fraud: -1 star (⭐)
Second fraud: Account Locked Forever (🔒)"

단계별 변화:
⭐⭐ (Good - 모든 거래 가능)
   ↓ 첫 번째 사기 발생
⭐ (Warning - 거래 가능하지만 신뢰도 낮음)
   ↓ 두 번째 사기 발생
🔒 (Locked - 계정 영구 잠금, 거래 불가)

표시 정보:
- 별점 (2.0/5.0, 1.0/5.0, Locked)
- 완료된 거래 수
- 분쟁 거래 수 및 비율
- 평균 응답 시간
- 최근 리뷰 (없음/있음)
```

### **5. 사기 신고 기능 (Fraud Report - 회원용)**
```
사기 당한 회원이 신고하는 기능:

신고 페이지:
1. 사기꾼 UID 입력 (예: USER_12345)
2. 증거 이미지 첨부 (최대 3-5개)
   - 거래 기록 스크린샷
   - 채팅 증거
   - 입금 증명
3. 사기 사유 선택
   - USDT 미이체
   - 잘못된 금액 이체
   - 거짓 거래
4. 상세 설명 입력
5. 제출

신고 이후:
- "Fraud Report Submitted" 알림
- 신고 상태 추적 가능
- Admin은 나중에 처리

처리 방식 (Admin이 나중에):
- 승인: 피신고자 별 1개 깎임
- 승인 2번: 피신고자 계정 잠금
- 기각: 신고자에게 알림
```

---

## **거래 흐름 예시**

### **신규회원이 패키지를 구매하고 싶을 때**
```
1. 신규회원 → Red Dragon 선택 (신뢰도 4.9)
2. Red Dragon 계좌로 현금 입금
3. Red Dragon 입금 확인
4. 신규회원 "Request USDT Transfer" 클릭
5. Red Dragon이 내부이체 실행
6. 신규회원 지갑에 USDT 반영
7. 신규회원 패키지 구매
```

### **기존 회원이 AI 수익을 인출할 때**
```
1. 수익 → USDT 변환
2. USDT Trading Floor에서 판매 등록 (0.9 환율)
3. Red Dragon이 구매
4. 같은 국가면: 통장 입금
5. 다른 국가면: Binance/개인지갑 이체
6. Red Dragon 20% 차익 획득
```

---

## **구현 우선순위**

| 순위 | 기능 | 상태 | 시작일 |
|------|------|------|--------|
| 1 | 내부이체 | 시작 전 | TBD |
| 2 | USDT 잔액 관리 | 시작 전 | TBD |
| 3 | 신규회원 온보딩 | 시작 전 | TBD |
| 4 | 신뢰도 평판 | 시작 전 | TBD |
| 5 | 사기 신고 (회원용) | 시작 전 | TBD |

**Admin 페이지는 별도로 나중에 구현**

---

## **중요한 설계 결정**

- ✅ 차익은 완전히 암묵적 (차익 계산 표시 X)
- ✅ 환율도 암묵적 시장의 룰 (1.1 권장이지만 강제X)
- ✅ 통장 정보는 온보딩 단계에서만 표시
- ✅ Red Dragon 평판은 공개 정보 (회원 선택에 필수)
- ✅ 신뢰도는 2번 기회만 제공 (엄격한 정책)
