/**
 * LONGRISE AI — 시드 데이터 생성기
 * 일일 수익 (daily_returns) + 주요 트랜잭션 (transactions) 자동 생성
 *
 * 실행 방법:
 *   node 04_seed_generator.js > output_seed.sql
 *   mysql -u root -p longrise < output_seed.sql
 *
 * 알고리즘 기준: LONGRISE 마스터플랜 V8.9 Page 11
 * 플랫폼 시작일: 2025-01-01
 *
 * ⚠️  END_DATE 주의사항 (개발자 필독):
 *   현재 END_DATE = '2026-06-01' (기준일)
 *   개발/오픈이 지연될 경우 아래 END_DATE를 실제 오픈일로 변경하세요.
 *   예: 2026-07-31 또는 2026-08-31 로 수정 후 재실행
 */

// ============================================================
// 계정 설정
// ============================================================
// Kim은 특별 구조: Premium $1,000 최초 → Standard $500 추가(upgradeDate) → Premium 재투자(reinvestDate)
const ACCOUNTS = [
  { id: 'LR-KIM-001', joinDate: '2025-01-01', upgradeDate: '2025-08-01', reinvestDate: '2026-01-02',
    nickname: 'Kim_Dragon88', initPkg: 'Premium', initAmt: 1000 },
  { id: 'LR-LEE-002', joinDate: '2025-02-10', upgradeDate: '2025-05-17', nickname: 'Lee_Profit99' },
  { id: 'LR-PAR-003', joinDate: '2025-02-15', upgradeDate: '2025-05-22', nickname: 'Park_Alpha77' },
  { id: 'LR-CHO-004', joinDate: '2025-02-18', upgradeDate: '2025-05-28', nickname: 'Choi_Rise12'  },
  { id: 'LR-HAN-005', joinDate: '2025-02-22', upgradeDate: '2025-06-03', nickname: 'Han_Node34'   },
  { id: 'LR-JUN-006', joinDate: '2025-02-26', upgradeDate: '2025-06-08', nickname: 'Jung_Bull56'  },
  { id: 'LR-YOO-007', joinDate: '2025-03-02', upgradeDate: '2025-06-14', nickname: 'Yoon_Gold78'  },
  { id: 'LR-SON-008', joinDate: '2025-03-07', upgradeDate: '2025-06-19', nickname: 'Song_Wave90'  },
  { id: 'LR-LIM-009', joinDate: '2025-03-12', upgradeDate: '2025-06-24', nickname: 'Lim_Eagle23'  },
  { id: 'LR-KOT-010', joinDate: '2025-03-17', upgradeDate: '2025-06-29', nickname: 'Ko_Titan45'   },
];

// 패키지 설정
const PACKAGES = {
  Standard: { usdtMonthlyRate: 0.09, cnytRate: 0.04, investment: 500 },
  Premium:  { usdtMonthlyRate: 0.11, cnytRate: 0.06, investment: 1000 },
};

const CNYT_PRICE   = 0.02;   // $0.02 고정
// ⚠️ END_DATE: 오픈이 늦어질 경우 2026-07-31 또는 2026-08-31로 수정 후 재실행
const END_DATE     = '2026-06-01'; // 기준일 (변경 가능)

// ============================================================
// 유틸리티
// ============================================================

// 시드 기반 의사난수 (동일 실행마다 같은 결과)
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateRange(startStr, endStr) {
  const dates = [];
  let cur = new Date(startStr);
  const end = new Date(endStr);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// 일일 수익 생성 (Page 11 알고리즘)
// ============================================================
function generateDailyReturns(account) {
  const rows = [];
  const rng  = seededRandom(account.id.charCodeAt(3) * 997 + 42);

  const allDates = dateRange(account.joinDate, END_DATE);

  // 월별 누적을 추적하여 14%~22% 범위 보정
  let monthlyAccum     = 0;
  let monthlyDayCount  = 0;
  let currentMonth     = allDates[0].slice(0, 7);

  for (const date of allDates) {
    const month = date.slice(0, 7);

    // 월 전환 시 누적 리셋
    if (month !== currentMonth) {
      monthlyAccum    = 0;
      monthlyDayCount = 0;
      currentMonth    = month;
    }
    monthlyDayCount++;

    // 현재 패키지 판단
    const pkg = date < account.upgradeDate ? PACKAGES.Standard : PACKAGES.Premium;
    const investment = pkg.investment;

    // 일자 유형 결정 (Page 11 확률)
    const roll = rng();
    let dayType;
    if (roll < 0.15) {
      dayType = 'defense'; // 15%
    } else if (roll < 0.20) {
      dayType = 'jackpot'; // 5%
    } else {
      dayType = 'profit';  // 80%
    }

    // 표시용 수익률 (화면 대시보드)
    let poolRate, bettingRate, futuresRate, displayedRate;
    if (dayType === 'defense') {
      poolRate = bettingRate = futuresRate = displayedRate = 0;
    } else if (dayType === 'jackpot') {
      poolRate     = +(0.0600 + rng() * 0.0200).toFixed(4);
      bettingRate  = +(0.0900 + rng() * 0.0300).toFixed(4); // 특별히 높음
      futuresRate  = +(0.0300 + rng() * 0.0100).toFixed(4);
      displayedRate = +(poolRate + bettingRate + futuresRate).toFixed(4);
    } else {
      poolRate     = +(0.0550 + rng() * 0.0100).toFixed(4);
      bettingRate  = +(0.0700 + rng() * 0.0300).toFixed(4);
      futuresRate  = +(0.0100 + rng() * 0.0300).toFixed(4);
      displayedRate = +(poolRate + bettingRate + futuresRate).toFixed(4);
    }

    // 실제 지급액 (계약 기반)
    // 비방어일: 월 약정 수익 / (30 × 0.85) 로 배분 → 월 합산이 약정률에 수렴
    let usdtEarned = 0;
    let cnytEarned = 0;

    if (dayType !== 'defense') {
      // 역전일은 1.4배 보너스, 일반 수익일은 1.0배
      const multiplier = dayType === 'jackpot' ? 1.4 : 1.0;
      const dailyBase = (investment * pkg.usdtMonthlyRate) / (30 * 0.85);
      usdtEarned = +(dailyBase * multiplier).toFixed(4);
      cnytEarned = +((usdtEarned * pkg.cnytRate) / CNYT_PRICE).toFixed(4);
    }

    // 월별 누적 보정 (14%~22% 범위)
    monthlyAccum += usdtEarned;
    const projectedMonthly = (monthlyAccum / monthlyDayCount) * 30;
    const maxMonthlyReturn = investment * 0.22;
    const minMonthlyReturn = investment * 0.14;

    if (projectedMonthly > maxMonthlyReturn && usdtEarned > 0) {
      // 초과 시 하향 보정
      usdtEarned = +(usdtEarned * 0.85).toFixed(4);
      cnytEarned = +((usdtEarned * pkg.cnytRate) / CNYT_PRICE).toFixed(4);
      monthlyAccum = monthlyAccum - usdtEarned / 0.85 + usdtEarned;
    } else if (projectedMonthly < minMonthlyReturn && dayType !== 'defense') {
      // 부족 시 상향 보정
      usdtEarned = +(usdtEarned * 1.15).toFixed(4);
      cnytEarned = +((usdtEarned * pkg.cnytRate) / CNYT_PRICE).toFixed(4);
      monthlyAccum = monthlyAccum - usdtEarned / 1.15 + usdtEarned;
    }

    const rowId = `DR-${account.id}-${date}`;
    rows.push(
      `('${rowId}','${account.id}','${date}',` +
      `${poolRate},${bettingRate},${futuresRate},${displayedRate},` +
      `${investment},${usdtEarned},${cnytEarned},'${dayType}',` +
      `'${date} 00:05:00')`
    );
  }

  return rows;
}

// ============================================================
// 트랜잭션 생성
// ============================================================
function generateTransactions(account) {
  const txs = [];
  let txSeq = 1;

  const mkId = () => {
    const id = `TX-${account.id}-${String(txSeq).padStart(5, '0')}`;
    txSeq++;
    return id;
  };

  // Kim 여부 확인
  const isKim = !!account.initPkg;
  const initPkg = isKim ? account.initPkg : 'Standard';
  const initAmt = isKim ? account.initAmt : 500;
  const initCnyt = +(initAmt * 0.01 / CNYT_PRICE).toFixed(0); // $amt×1%÷$0.02

  // 1. 초기 입금
  txs.push(
    `('${mkId()}','${account.id}','deposit',${initAmt}.0000,'USDT',` +
    `'${initPkg} Package 구매 — 초기 투자 $${initAmt}',NULL,NULL,'completed','${account.joinDate} 10:00:00')`
  );

  // 2. 초기 CNYT 보너스
  txs.push(
    `('${mkId()}','${account.id}','cnyt_bonus',${initCnyt}.0000,'CNYT',` +
    `'가입 CNYT 보너스 (${initPkg} $${initAmt}×1%÷$0.02 = ${initCnyt}개)',NULL,NULL,'completed','${account.joinDate} 10:01:00')`
  );

  // 3. 직접추천 수당 × 5명 (가입 후 1~8일 이내)
  const refLines = [
    { days: 3, ref: 'CN-Line1', pkg: 'Standard', amount: 50.00 },
    { days: 5, ref: 'CN-Line2', pkg: 'Standard', amount: 50.00 },
    { days: 8, ref: 'KR-Line3', pkg: 'Basic',    amount: 20.00 },
    { days: 10,ref: 'VN-Line4', pkg: 'Basic',    amount: 20.00 },
    { days: 13,ref: 'CN-Line5', pkg: 'Basic',    amount: 20.00 },
  ];

  for (const ref of refLines) {
    const refDate = new Date(account.joinDate);
    refDate.setDate(refDate.getDate() + ref.days);
    const refDateStr = refDate.toISOString().slice(0, 10);
    txs.push(
      `('${mkId()}','${account.id}','direct_referral',${ref.amount.toFixed(4)},'USDT',` +
      `'직접추천 수당 — ${ref.ref} (${ref.pkg} $${ref.pkg === 'Standard' ? 500 : 200}×10%)',` +
      `'${ref.ref}',1,'completed','${refDateStr} 12:00:00')`
    );
  }

  // 4. 추가 패키지 입금 (+$500)
  const upgLabel = isKim
    ? 'Standard $500 추가 투자 (총 $1,500)'
    : 'Premium 업그레이드 — 추가 입금 $500 (총 $1,000)';
  txs.push(
    `('${mkId()}','${account.id}','deposit',500.0000,'USDT',` +
    `'${upgLabel}',NULL,NULL,'completed','${account.upgradeDate} 11:00:00')`
  );

  // 5. 추가 CNYT 보너스 (+250 CNYT)
  txs.push(
    `('${mkId()}','${account.id}','cnyt_bonus',250.0000,'CNYT',` +
    `'추가투자 CNYT 보너스 ($500×1%÷$0.02 = 250개)',NULL,NULL,'completed','${account.upgradeDate} 11:01:00')`
  );

  // 5-1. Kim 전용: Premium 재투자 (2026-01-02)
  if (isKim && account.reinvestDate) {
    txs.push(
      `('${mkId()}','${account.id}','deposit',1000.0000,'USDT',` +
      `'Premium $1,000 만기 후 즉시 재투자 (2026-01-01 만기 → 2026-01-02 재가입)',NULL,NULL,'completed','${account.reinvestDate} 09:00:00')`
    );
    txs.push(
      `('${mkId()}','${account.id}','cnyt_bonus',500.0000,'CNYT',` +
      `'재투자 CNYT 보너스 ($1,000×1%÷$0.02 = 500개)',NULL,NULL,'completed','${account.reinvestDate} 09:01:00')`
    );
  }

  // 6. 일일 ROI 트랜잭션 (daily_returns와 연동 — 매월 월말 합산 방식)
  // (개별 일자별 너무 많으면 월별 합산으로 대체 가능)
  const allDates = dateRange(account.joinDate, END_DATE);
  const rng = seededRandom(account.id.charCodeAt(5) * 1337 + 99);

  for (const date of allDates) {
    const pkg = date < account.upgradeDate ? PACKAGES.Standard : PACKAGES.Premium;
    const roll = rng();
    if (roll < 0.15) continue; // defense day — skip

    const multiplier = roll < 0.20 ? 1.4 : 1.0;
    const dailyBase  = (pkg.investment * pkg.usdtMonthlyRate) / (30 * 0.85);
    const usdtEarned = +(dailyBase * multiplier).toFixed(4);

    txs.push(
      `('${mkId()}','${account.id}','daily_roi',${usdtEarned},'USDT',` +
      `'AI Performance Bonus — ${date}',NULL,NULL,'completed','${date} 00:10:00')`
    );
  }

  // 7. 롤업 수당 (월별 소규모 수당 — 하부조직 활동 반영)
  // Standard 기간: 월 $8~15 / Premium 기간: 월 $15~30
  let rollupDate = new Date(account.joinDate);
  rollupDate.setDate(rollupDate.getDate() + 30); // 첫 월 이후부터

  while (rollupDate.toISOString().slice(0, 10) <= END_DATE) {
    const dateStr = rollupDate.toISOString().slice(0, 10);
    const isPremiumPeriod = dateStr >= account.upgradeDate;
    const baseAmount = isPremiumPeriod ? 15 + rng() * 15 : 8 + rng() * 7;
    const rollupAmount = +baseAmount.toFixed(4);

    txs.push(
      `('${mkId()}','${account.id}','rollup',${rollupAmount},'USDT',` +
      `'Matching Commission — ${dateStr} (하부조직 배당 수당)',NULL,2,'completed','${dateStr} 01:00:00')`
    );

    rollupDate.setDate(rollupDate.getDate() + 30);
  }

  return txs;
}

// ============================================================
// SQL 출력
// ============================================================
console.log('-- ============================================================');
console.log('-- LONGRISE AI — 시드 데이터 (daily_returns + transactions)');
console.log('-- 자동 생성: ' + new Date().toISOString());
console.log('-- ============================================================');
console.log('');
console.log('SET FOREIGN_KEY_CHECKS = 0;');
console.log('TRUNCATE TABLE daily_returns;');
console.log('TRUNCATE TABLE transactions;');
console.log('SET FOREIGN_KEY_CHECKS = 1;');
console.log('');

// --- daily_returns ---
console.log('-- ── DAILY RETURNS ────────────────────────────────────────');
console.log('INSERT INTO daily_returns');
console.log('(id,user_id,date,pool_rate,betting_rate,futures_rate,displayed_rate,investment_base,usdt_earned,cnyt_earned,day_type,created_at)');
console.log('VALUES');

let allReturnRows = [];
for (const account of ACCOUNTS) {
  allReturnRows = allReturnRows.concat(generateDailyReturns(account));
}
console.log(allReturnRows.join(',\n') + ';');
console.log('');

// --- transactions ---
console.log('-- ── TRANSACTIONS ─────────────────────────────────────────');
console.log('INSERT INTO transactions');
console.log('(id,user_id,type,amount,currency,description,ref_user_id,ref_level,status,created_at)');
console.log('VALUES');

let allTxRows = [];
for (const account of ACCOUNTS) {
  allTxRows = allTxRows.concat(generateTransactions(account));
}
console.log(allTxRows.join(',\n') + ';');
console.log('');

console.log('-- ============================================================');
console.log('-- 생성 완료');
console.log('-- daily_returns: ' + allReturnRows.length + '행');
console.log('-- transactions:  ' + allTxRows.length + '행');
console.log('-- ============================================================');
