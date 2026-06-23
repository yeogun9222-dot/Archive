/**
 * LONGRISE AI — 프론트엔드 거래이력 Mock 데이터 생성기
 *
 * 실행: node 06_generate_mockTransactions.js
 * 출력: 06_mockTransactions.ts  (src/shared/에 복사)
 *
 * 용도:
 *   WalletPage.tsx의 hardcoded `activities` 배열을
 *   실제 1년치 거래 이력으로 교체할 수 있는 TypeScript 파일 생성.
 *   DB 연동 전까지 프론트엔드에서 즉시 사용 가능.
 */

const fs = require('fs');

// ============================================================
// 10개 계정 설정
// ============================================================
// Kim: Premium $1,000 최초(2025-01-01) → Standard $500 추가(upgradeDate) → Premium 재투자(reinvestDate)
const ACCOUNTS = [
  { id:'LR-KIM-001', nick:'Kim_Dragon88',  joinDate:'2025-01-01', upgradeDate:'2025-08-01',
    reinvestDate:'2026-01-02', initPkg:'Premium', initAmt:1000 },
  { id:'LR-LEE-002', nick:'Lee_Profit99',  joinDate:'2025-02-10', upgradeDate:'2025-05-17' },
  { id:'LR-PAR-003', nick:'Park_Alpha77',  joinDate:'2025-02-15', upgradeDate:'2025-05-22' },
  { id:'LR-CHO-004', nick:'Choi_Rise12',   joinDate:'2025-02-18', upgradeDate:'2025-05-28' },
  { id:'LR-HAN-005', nick:'Han_Node34',    joinDate:'2025-02-22', upgradeDate:'2025-06-03' },
  { id:'LR-JUN-006', nick:'Jung_Bull56',   joinDate:'2025-02-26', upgradeDate:'2025-06-08' },
  { id:'LR-YOO-007', nick:'Yoon_Gold78',   joinDate:'2025-03-02', upgradeDate:'2025-06-14' },
  { id:'LR-SON-008', nick:'Song_Wave90',   joinDate:'2025-03-07', upgradeDate:'2025-06-19' },
  { id:'LR-LIM-009', nick:'Lim_Eagle23',   joinDate:'2025-03-12', upgradeDate:'2025-06-24' },
  { id:'LR-KOT-010', nick:'Ko_Titan45',    joinDate:'2025-03-17', upgradeDate:'2025-06-29' },
];

const PACKAGES = {
  Standard: { rate: 0.09, cnytRate: 0.04, amount: 500 },
  Premium:  { rate: 0.11, cnytRate: 0.06, amount: 1000 },
};
const CNYT_PRICE = 0.02;
const END_DATE   = '2026-06-01'; // ⚠️ 오픈 지연 시 2026-07-31 또는 2026-08-31로 변경

// ============================================================
// 유틸
// ============================================================
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
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

function formatDate(dateStr, timeStr = '00:10:00') {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()} ${timeStr}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// 거래 이력 생성
// ============================================================
function generateTransactionHistory(account) {
  const txs = [];
  const rng  = seededRandom(account.id.charCodeAt(3) * 997 + 42);

  const isKim = !!account.initPkg;
  const initAmt  = isKim ? account.initAmt : 500;
  const initPkg  = isKim ? account.initPkg : 'Standard';
  const initCnyt = Math.round(initAmt * 0.01 / CNYT_PRICE);

  // 1. 초기 입금
  txs.push({
    id: `TX-${account.id}-00001`,
    type: 'deposit',
    amount: initAmt,
    currency: 'USDT',
    label: `${initPkg} Package 가입 입금 $${initAmt}`,
    date: formatDate(account.joinDate, '10:00:00'),
    dateRaw: `${account.joinDate} 10:00:00`,
    uiType: 'DEPOSIT',
    uiColor: 'text-green-400',
  });

  // 2. 초기 CNYT 보너스
  txs.push({
    id: `TX-${account.id}-00002`,
    type: 'cnyt_bonus',
    amount: initCnyt,
    currency: 'CNYT',
    label: `가입 CNYT 보너스 (${initCnyt}개 — 락업)`,
    date: formatDate(account.joinDate, '10:01:00'),
    dateRaw: `${account.joinDate} 10:01:00`,
    uiType: 'CNYT BONUS',
    uiColor: 'text-purple-400',
  });

  // 3. 직접추천 수당 × 5명 (Line2 → CN_Zhang_Rise로 통일)
  const directs = [
    { days: 14, nick:'CN_Wei_Dragon',   pkg:'Standard', amount: 50 },
    { days: 19, nick:'CN_Zhang_Rise',   pkg:'Standard', amount: 50 },
    { days: 24, nick:'KR_Choi_Star',    pkg:'Basic',    amount: 20 },
    { days: 29, nick:'VN_Nguyen_Pro',   pkg:'Basic',    amount: 20 },
    { days: 35, nick:'CN_Liu_Rise',     pkg:'Basic',    amount: 20 },
  ];
  let seq = 3;
  for (const d of directs) {
    const dt = addDays(account.joinDate, d.days);
    txs.push({
      id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
      type: 'direct_referral',
      amount: d.amount,
      currency: 'USDT',
      label: `직접추천 수당 — ${d.nick} (${d.pkg} ×10%)`,
      date: formatDate(dt, '12:00:00'),
      dateRaw: `${dt} 12:00:00`,
      uiType: 'DIRECT',
      uiColor: 'text-luxury-gold',
    });
  }

  // 4. 일일 ROI (Standard 기간)
  const allDates = dateRange(account.joinDate, END_DATE);
  for (const date of allDates) {
    const pkg  = date < account.upgradeDate ? PACKAGES.Standard : PACKAGES.Premium;
    const roll = rng();
    let dayType, usdtEarned, cnytEarned, displayRate;

    if (roll < 0.15) {
      // 방어일 → 지급 없음, transactions에 미포함
      continue;
    } else if (roll < 0.20) {
      dayType     = 'jackpot';
      usdtEarned  = +((pkg.amount * pkg.rate) / (30 * 0.85) * 1.4).toFixed(2);
      displayRate = +(2.0 + rng() * 2.0).toFixed(2);
    } else {
      dayType     = 'profit';
      usdtEarned  = +((pkg.amount * pkg.rate) / (30 * 0.85)).toFixed(2);
      displayRate = +(0.4 + rng() * 1.1).toFixed(2);
    }
    cnytEarned = +((usdtEarned * pkg.cnytRate) / CNYT_PRICE).toFixed(0);

    txs.push({
      id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
      type: 'daily_roi',
      amount: usdtEarned,
      currency: 'USDT',
      label: `AI Performance Bonus${dayType === 'jackpot' ? ' 🔥' : ''} (+${displayRate}%)`,
      date: formatDate(date, '00:10:00'),
      dateRaw: `${date} 00:10:00`,
      uiType: dayType === 'jackpot' ? 'JACKPOT' : 'PERFORMANCE',
      uiColor: dayType === 'jackpot' ? 'text-yellow-400' : 'text-green-500',
      cnytAmount: cnytEarned,
    });
  }

  // 5. 추가 패키지 입금 (+$500)
  const upgLabel = isKim ? 'Standard $500 추가 투자 (총 $1,500)' : 'Premium 업그레이드 추가 입금 $500 (총 $1,000)';
  txs.push({
    id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
    type: 'deposit',
    amount: 500,
    currency: 'USDT',
    label: upgLabel,
    date: formatDate(account.upgradeDate, '11:00:00'),
    dateRaw: `${account.upgradeDate} 11:00:00`,
    uiType: 'DEPOSIT',
    uiColor: 'text-green-400',
  });

  // 6. 추가 CNYT 보너스 (250)
  txs.push({
    id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
    type: 'cnyt_bonus',
    amount: 250,
    currency: 'CNYT',
    label: '추가투자 CNYT 보너스 (250개 — 락업)',
    date: formatDate(account.upgradeDate, '11:01:00'),
    dateRaw: `${account.upgradeDate} 11:01:00`,
    uiType: 'CNYT BONUS',
    uiColor: 'text-purple-400',
  });

  // 6-1. Kim 전용: Premium 재투자 (2026-01-02)
  if (isKim && account.reinvestDate) {
    txs.push({
      id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
      type: 'deposit',
      amount: 1000,
      currency: 'USDT',
      label: 'Premium $1,000 만기 후 즉시 재투자 (2026-01-01 만기 확인)',
      date: formatDate(account.reinvestDate, '09:00:00'),
      dateRaw: `${account.reinvestDate} 09:00:00`,
      uiType: 'REINVEST',
      uiColor: 'text-blue-400',
    });
    txs.push({
      id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
      type: 'cnyt_bonus',
      amount: 500,
      currency: 'CNYT',
      label: '재투자 CNYT 보너스 (500개 — 락업)',
      date: formatDate(account.reinvestDate, '09:01:00'),
      dateRaw: `${account.reinvestDate} 09:01:00`,
      uiType: 'CNYT BONUS',
      uiColor: 'text-purple-400',
    });
  }

  // 7. 월별 롤업 수당
  let rollupDate = new Date(account.joinDate);
  rollupDate.setDate(rollupDate.getDate() + 30);
  const rollupRng = seededRandom(account.id.charCodeAt(5) * 1337 + 99);
  while (rollupDate.toISOString().slice(0, 10) <= END_DATE) {
    const dateStr = rollupDate.toISOString().slice(0, 10);
    const isPremium = dateStr >= account.upgradeDate;
    const amount = +(isPremium ? 15 + rollupRng() * 50 : 8 + rollupRng() * 20).toFixed(2);
    txs.push({
      id: `TX-${account.id}-${String(seq++).padStart(5,'0')}`,
      type: 'rollup',
      amount,
      currency: 'USDT',
      label: `Matching Commission — 하부조직 롤업 수당`,
      date: formatDate(dateStr, '01:00:00'),
      dateRaw: `${dateStr} 01:00:00`,
      uiType: 'MATCHING',
      uiColor: 'text-luxury-gold',
    });
    rollupDate.setDate(rollupDate.getDate() + 30);
  }

  // 최신순 정렬
  txs.sort((a, b) => (a.dateRaw > b.dateRaw ? -1 : 1));

  return txs;
}

// ============================================================
// TypeScript 파일 생성
// ============================================================
const allData = {};
let totalTxCount = 0;

for (const acc of ACCOUNTS) {
  const txs = generateTransactionHistory(acc);
  allData[acc.id] = txs;
  totalTxCount += txs.length;
  console.log(`✅ ${acc.nick}: ${txs.length}건`);
}

// TypeScript 파일 작성
let tsContent = `/**
 * LONGRISE AI — 프론트엔드 거래 이력 Mock 데이터
 * 자동 생성: ${new Date().toISOString().slice(0, 10)}
 * 총 거래 건수: ${totalTxCount}건 (10개 계정 합산)
 *
 * 사용법 (WalletPage.tsx):
 *   import { getMockTransactions } from './mockTransactions';
 *   const activities = getMockTransactions('LR-KIM-001').slice(0, 20); // 최근 20건
 *
 * DB 연동 후에는 이 파일 대신 API에서 조회:
 *   GET /api/transactions?userId=LR-KIM-001&limit=50&offset=0
 */

export interface MockTransaction {
  id: string;
  type: 'deposit' | 'daily_roi' | 'direct_referral' | 'rollup' | 'cnyt_bonus';
  amount: number;
  currency: 'USDT' | 'CNYT';
  label: string;
  date: string;
  dateRaw: string;
  uiType: string;
  uiColor: string;
  cnytAmount?: number;
}

const MOCK_TRANSACTIONS: Record<string, MockTransaction[]> = {
`;

for (const [userId, txs] of Object.entries(allData)) {
  tsContent += `\n  '${userId}': [\n`;
  for (const tx of txs) {
    tsContent += `    { id:'${tx.id}', type:'${tx.type}', amount:${tx.amount}, currency:'${tx.currency}', label:"${tx.label}", date:'${tx.date}', dateRaw:'${tx.dateRaw}', uiType:'${tx.uiType}', uiColor:'${tx.uiColor}'${tx.cnytAmount ? `, cnytAmount:${tx.cnytAmount}` : ''} },\n`;
  }
  tsContent += `  ],\n`;
}

tsContent += `};

/**
 * 특정 계정의 거래 이력 조회
 * @param userId - 계정 ID (예: 'LR-KIM-001')
 * @param limit  - 최근 N건 (기본값: 전체)
 */
export function getMockTransactions(userId: string, limit?: number): MockTransaction[] {
  const txs = MOCK_TRANSACTIONS[userId] || [];
  return limit ? txs.slice(0, limit) : txs;
}

/**
 * WalletPage activities 형식으로 변환
 * WalletPage의 activities 배열과 동일한 형태로 반환
 */
export function getWalletActivities(userId: string, limit = 20) {
  return getMockTransactions(userId, limit).map(tx => ({
    label: tx.label,
    date:  tx.date,
    value: tx.currency === 'USDT'
      ? (tx.amount >= 0 ? '+' : '') + tx.amount.toFixed(2)
      : '+' + tx.amount.toFixed(0) + ' CNYT',
    type:  tx.uiType,
    color: tx.uiColor,
  }));
}

export default MOCK_TRANSACTIONS;
`;

fs.writeFileSync('06_mockTransactions.ts', tsContent, 'utf8');
console.log(`\n✅ 생성 완료: 06_mockTransactions.ts`);
console.log(`   총 거래 건수: ${totalTxCount}건`);
console.log(`\n📌 사용법:`);
console.log(`   1. 06_mockTransactions.ts → src/shared/ 폴더에 복사`);
console.log(`   2. WalletPage.tsx에서 import { getWalletActivities } 사용`);
console.log(`   3. const activities = getWalletActivities(user.id, 20);`);
