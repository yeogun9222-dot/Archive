/**
 * LONGRISE AI — 전체 220명 조직도 + 수당 체계 CSV 생성기 (V8.8 현실감 재설계)
 * 실행: node generate_excel.js
 * 출력: EXCEL_05_전체220명_조직도및수당.csv
 */

const fs = require('fs');

// ============================================================
// 10개 주계정 설정
// ============================================================
// V8.8 현실감 재설계 — Blue Dragon 3개 / White Dragon 7개
// rank: 'blue'=Blue Dragon(롤업O), 'white'=White Dragon(롤업X)
// l1SpineCount: Blue Dragon 척추 수 (0이면 Line1 없음)
// totalTarget: 목표 하부 인원수
const MAIN_ACCOUNTS = [
  { id:'LR-KIM-001', nick:'Kim_Dragon88', prefix:'KIM', joinDate:'2025-02-05', upgradeDate:'2025-05-10', rank:'blue',  l1Depth:23, l1SpineCount:20, totalTarget:108 },
  { id:'LR-LEE-002', nick:'Lee_Profit99', prefix:'LEE', joinDate:'2025-02-10', upgradeDate:'2025-05-17', rank:'blue',  l1Depth:5,  l1SpineCount:4,  totalTarget:35  },
  { id:'LR-PAR-003', nick:'Park_Alpha77', prefix:'PAR', joinDate:'2025-02-15', upgradeDate:'2025-05-22', rank:'blue',  l1Depth:4,  l1SpineCount:3,  totalTarget:22  },
  { id:'LR-CHO-004', nick:'Choi_Rise12',  prefix:'CHO', joinDate:'2025-02-18', upgradeDate:'2025-05-28', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:17  },
  { id:'LR-HAN-005', nick:'Han_Node34',   prefix:'HAN', joinDate:'2025-02-22', upgradeDate:'2025-06-03', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:12  },
  { id:'LR-JUN-006', nick:'Jung_Bull56',  prefix:'JUN', joinDate:'2025-02-26', upgradeDate:'2025-06-08', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:8   },
  { id:'LR-YOO-007', nick:'Yoon_Gold78',  prefix:'YOO', joinDate:'2025-03-02', upgradeDate:'2025-06-14', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:6   },
  { id:'LR-SON-008', nick:'Song_Wave90',  prefix:'SON', joinDate:'2025-03-07', upgradeDate:'2025-06-19', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:5   },
  { id:'LR-LIM-009', nick:'Lim_Eagle23',  prefix:'LIM', joinDate:'2025-03-12', upgradeDate:'2025-06-24', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:4   },
  { id:'LR-KOT-010', nick:'Ko_Titan45',   prefix:'KOT', joinDate:'2025-03-17', upgradeDate:'2025-06-29', rank:'white', l1Depth:0,  l1SpineCount:0,  totalTarget:3   },
];

// 닉네임 소스
const CN_NAMES = ['Wei','Chen','Liu','Wang','Zhang','Li','Zhao','Huang','Sun','Lin','Tang','Xu','Han','Gao','Luo','Song','Yang','Zhu','Pan','Fu','Cao','Zeng','Qian','Ye','Dong','Bai','Yuan','Ren','Deng','Mo','Gu','Yin','Ai','Bi','Ci','Di','Ei','Fi','Gi','Hi','Ii','Ji','Ki','Li2','Mi','Ni','Oi','Pi','Qi','Ri','Si','Ti','Ui','Vi','Wi','Xi','Yi','Zi','Ao','Bo','Co','Do','Eo','Fo','Go','Ho','Io','Jo','Ko2','Lo'];
const JP_NAMES = ['Tanaka','Sato','Ito','Kato','Suzuki','Yamada','Kobayashi','Nakamura','Abe','Kimura','Mori','Hayashi','Imai','Ogawa','Okada','Saito','Kondo','Fujii','Nishida','Ueda','Wada','Aoki','Ikeda','Ono','Maeda','Fujita','Ohashi','Matsuda','Bando','Chiba'];
const KR_NAMES = ['Choi','Park','Kim','Lee','Yoon','Jang','Shin','Kwon','Ahn','Jeon','Lim','Han','Ryu','Oh','Seo','Bae','Nam','Gang','Do','Im'];
const VN_NAMES = ['Nguyen','Tran','Le','Pham','Vu','Do','Bui','Hoang','Cao','Vo','Luong','Trinh','Dang','Ngo','Duong','Ly'];

let cnIdx=0, jpIdx=0, krIdx=0, vnIdx=0;
const getCN = (sfx='') => `CN_${CN_NAMES[cnIdx++ % CN_NAMES.length]}${sfx}`;
const getJP = (sfx='') => `JP_${JP_NAMES[jpIdx++ % JP_NAMES.length]}${sfx}`;
const getKR = (sfx='') => `KR_${KR_NAMES[krIdx++ % KR_NAMES.length]}${sfx}`;
const getVN = (sfx='') => `VN_${VN_NAMES[vnIdx++ % VN_NAMES.length]}${sfx}`;

// 날짜 더하기
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

// 롤업 수당 계산
// Blue Dragon = 3레벨까지 하부 일일수익의 10% 수령
// 멤버 월 수익 = 투자금 × 9%(Standard) 또는 9%(Basic)
// 롤업 기여 = 멤버 월수익 × 10% (해당 레벨인 경우만)
function calcRollup(pkg, level) {
  const monthlyEarn = pkg === 'Standard' ? 500*0.09 : 200*0.09; // $45 or $18
  const rollupPct = 0.10;
  if (level <= 3) {
    const monthly = +(monthlyEarn * rollupPct).toFixed(2);
    const annual  = +(monthly * 12).toFixed(2);
    return { applicable:'YES', monthly, annual };
  }
  return { applicable:'NO (4레벨+)', monthly:0, annual:0 };
}

// ============================================================
// CSV 행 생성
// ============================================================
const rows = [];
let seq = 1;

// 헤더
rows.push([
  '번호','Root계정ID','Root닉네임','멤버ID','멤버닉네임','국가',
  '소속라인','Root로부터레벨','직접상위ID',
  '직급','패키지','투자금($)','가입일',
  '직접추천수당(1회/$)','롤업적용여부(BlueD=3레벨)','월롤업기여금($)','연롤업기여금($)',
  '비고'
].join(','));

for (const acc of MAIN_ACCOUNTS) {
  const P = acc.prefix;
  let dayOffset = 30;

  // ── White Dragon 계정 (Choi~Ko): 간단 구조 ────────────────
  if (acc.rank === 'white') {
    const directCount = Math.min(acc.totalTarget, 4);
    const subCount = acc.totalTarget - directCount;
    for (let d = 1; d <= directCount; d++) {
      const dId = `${P}-D${d}`;
      const dNick = d <= 2 ? getCN('_D') : d === 3 ? getKR('_D') : getVN('_D');
      const dJoin = addDays(acc.joinDate, 15 + d*5);
      const dRollup = calcRollup('Basic', 1);
      rows.push([
        seq++, acc.id, acc.nick, dId, dNick,
        d <= 2 ? '🇨🇳' : d === 3 ? '🇰🇷' : '🇻🇳',
        'Line'+d, 1, acc.id,
        'White Dragon', 'Basic', 200, dJoin,
        20, 'NO(White Dragon)', 0, 0, '직접추천'
      ].join(','));
    }
    for (let s = 1; s <= subCount; s++) {
      const sId = `${P}-S${s}`;
      const sNick = getCN('_S');
      const sJoin = addDays(acc.joinDate, 45 + s*7);
      rows.push([
        seq++, acc.id, acc.nick, sId, sNick, '🇨🇳',
        'Line1', 2, `${P}-D1`,
        'White Dragon', 'Basic', 200, sJoin,
        20, 'NO(White Dragon)', 0, 0, '하부 멤버'
      ].join(','));
    }
    continue;
  }

  // ── Blue Dragon 계정 (Kim/Lee/Park): 척추 구조 ────────────
  let prevId = acc.id;
  for (let lvl = 1; lvl <= acc.l1SpineCount; lvl++) {
    const memberId = `${P}-L1-B${String(lvl).padStart(2,'0')}`;
    const nick = getCN(`_${lvl < 10 ? '0'+lvl : lvl}`);
    const joinDate = addDays(acc.joinDate, dayOffset + (lvl-1)*8);
    const directBonus = +(500 * 0.10).toFixed(2); // Standard $500 × 10% = $50
    const rollup = calcRollup('Standard', lvl);

    rows.push([
      seq++, acc.id, acc.nick, memberId, nick, '🇨🇳',
      'Line1', lvl, prevId,
      'Blue Dragon', 'Standard', 500, joinDate,
      directBonus,
      rollup.applicable, rollup.monthly, rollup.annual,
      lvl===1 ? 'Kim 직접추천 / 중국라인 리더' : `척추 Blue Dragon L${lvl}`
    ].join(','));

    // 이 Blue Dragon의 White Dragon 자격자 3명 (다음 레벨)
    for (let w = 1; w <= 3; w++) {
      const wId = `${P}-L1-W${String(lvl+1).padStart(2,'0')}-${w}`;
      const wNick = getCN(`_W${lvl+1}_${w}`);
      const wJoin = addDays(joinDate, w * 3);
      const wBonus = +(200 * 0.10).toFixed(2); // Basic $200 × 10% = $20
      const wRollup = calcRollup('Basic', lvl+1);

      rows.push([
        seq++, acc.id, acc.nick, wId, wNick, '🇨🇳',
        'Line1', lvl+1, memberId,
        'White Dragon', 'Basic', 200, wJoin,
        wBonus,
        wRollup.applicable, wRollup.monthly, wRollup.annual,
        `L${lvl} Blue Dragon(${memberId})의 자격자 ${w}`
      ].join(','));
    }

    prevId = memberId;
    dayOffset += 8;
  }

  // 꼬리 구간 - 최대 깊이 달성용 (Kim=5, 나머지=4)
  const tailCount = acc.prefix === 'KIM' ? 5 : 4;
  const tailStart = acc.l1SpineCount + 1;
  let tailPrev = `${P}-L1-B${String(acc.l1SpineCount).padStart(2,'0')}`;
  for (let t = 0; t < tailCount; t++) {
    const tlvl = tailStart + t;
    const tId = `${P}-L1-T${String(tlvl).padStart(2,'0')}-1`;
    const tNick = getCN(`_T${tlvl}`);
    const tJoin = addDays(acc.joinDate, dayOffset + t*7);
    const tBonus = +(200*0.10).toFixed(2);
    const tRollup = calcRollup('Basic', tlvl);

    rows.push([
      seq++, acc.id, acc.nick, tId, tNick, '🇨🇳',
      'Line1', tlvl, tailPrev,
      'White Dragon', 'Basic', 200, tJoin,
      tBonus,
      tRollup.applicable, tRollup.monthly, tRollup.annual,
      `꼬리구간 L${tlvl} — 최대깊이 달성`
    ].join(','));
    tailPrev = tId;
  }

  // ── LINE 2: 일본 라인 (얕은 Blue Dragon 9명) ──────────────
  const l2BlueId = `${P}-L2-B01`;
  const l2BlueJoin = addDays(acc.joinDate, 20);
  const l2Rollup = calcRollup('Standard', 1);
  rows.push([
    seq++, acc.id, acc.nick, l2BlueId, getJP('_Rise'), '🇯🇵',
    'Line2', 1, acc.id,
    'Blue Dragon', 'Standard', 500, l2BlueJoin,
    50, l2Rollup.applicable, l2Rollup.monthly, l2Rollup.annual,
    '우연히 성장 / 얕은 Blue Dragon'
  ].join(','));

  // Line2 하부 5명 (White × 5 → 팀매출 $1,000 충족)
  for (let w = 1; w <= 5; w++) {
    const wId = `${P}-L2-W02-${w}`;
    const wNick = getJP(`_${w}`);
    const wJoin = addDays(l2BlueJoin, w*3);
    const wRollup = calcRollup('Basic', 2);
    rows.push([
      seq++, acc.id, acc.nick, wId, wNick, '🇯🇵',
      'Line2', 2, l2BlueId,
      'White Dragon', 'Basic', 200, wJoin,
      20, wRollup.applicable, wRollup.monthly, wRollup.annual,
      `L2-Blue 자격자 / 팀매출$1000 충족용`
    ].join(','));
  }

  // Line2 꼬리 3명 (L3~L5)
  let l2Prev = `${P}-L2-W02-1`;
  for (let t = 1; t <= 3; t++) {
    const tId = `${P}-L2-T0${t+2}-1`;
    const tNick = getJP(`_T${t}`);
    const tJoin = addDays(l2BlueJoin, 30 + t*10);
    const tRollup = calcRollup('Basic', t+2);
    rows.push([
      seq++, acc.id, acc.nick, tId, tNick, '🇯🇵',
      'Line2', t+2, l2Prev,
      'White Dragon', 'Basic', 200, tJoin,
      20, tRollup.applicable, tRollup.monthly, tRollup.annual,
      `Line2 꼬리 L${t+2}`
    ].join(','));
    l2Prev = tId;
  }

  // ── LINE 3: 한국 라인 (White Dragon / Blue Dragon 직전 8명) ─
  const l3Id = `${P}-L3-01`;
  const l3Join = addDays(acc.joinDate, 18);
  const l3Rollup = calcRollup('Basic', 1);
  rows.push([
    seq++, acc.id, acc.nick, l3Id, getKR('_Star'), '🇰🇷',
    'Line3', 1, acc.id,
    'White Dragon', 'Basic', 200, l3Join,
    20, l3Rollup.applicable, l3Rollup.monthly, l3Rollup.annual,
    '⭐ Blue Dragon 달성 목표 — 이 라인이 Blue되면 상위계정 Purple Dragon 달성'
  ].join(','));

  // Line3 L2: 4명 (White × 3 자격자 + 1 추가)
  for (let w = 1; w <= 4; w++) {
    const wId = `${P}-L3-W02-${w}`;
    const wNick = getKR(`_${w}`);
    const wJoin = addDays(l3Join, w*4);
    const wRollup = calcRollup('Basic', 2);
    rows.push([
      seq++, acc.id, acc.nick, wId, wNick, '🇰🇷',
      'Line3', 2, l3Id,
      'White Dragon', 'Basic', 200, wJoin,
      20, wRollup.applicable, wRollup.monthly, wRollup.annual,
      w <= 3 ? `L3 Blue Dragon 자격자 예비 ${w}` : '추가 멤버'
    ].join(','));
  }

  // Line3 L3~L5 (3명 — 깊이 강화)
  for (let d = 3; d <= 5; d++) {
    const dId = `${P}-L3-W0${d}-1`;
    const dNick = getKR(`_D${d}`);
    const dJoin = addDays(l3Join, 40 + d*10);
    const dRollup = calcRollup('Basic', d);
    rows.push([
      seq++, acc.id, acc.nick, dId, dNick, '🇰🇷',
      'Line3', d, `${P}-L3-W02-1`,
      'White Dragon', 'Basic', 200, dJoin,
      20, dRollup.applicable, dRollup.monthly, dRollup.annual,
      `Line3 L${d}`
    ].join(','));
  }

  // ── LINE 4: 베트남 라인 (4명) ──────────────────────────────
  const l4Id = `${P}-L4-01`;
  const l4Join = addDays(acc.joinDate, 22);
  const l4Rollup = calcRollup('Basic', 1);
  rows.push([
    seq++, acc.id, acc.nick, l4Id, getVN('_Pro'), '🇻🇳',
    'Line4', 1, acc.id,
    'White Dragon', 'Basic', 200, l4Join,
    20, l4Rollup.applicable, l4Rollup.monthly, l4Rollup.annual,
    '거의 비활성'
  ].join(','));

  for (let w = 1; w <= 3; w++) {
    const wId = `${P}-L4-02-${w}`;
    const wNick = getVN(`_${w}`);
    const wJoin = addDays(l4Join, w*20);
    const wRollup = calcRollup('Basic', 2);
    rows.push([
      seq++, acc.id, acc.nick, wId, wNick, '🇻🇳',
      'Line4', 2, l4Id,
      'White Dragon', 'Basic', 200, wJoin,
      20, wRollup.applicable, wRollup.monthly, wRollup.annual,
      '비활성 소규모'
    ].join(','));
  }

  // ── LINE 5: 중국2 라인 (2명) ───────────────────────────────
  const l5Id = `${P}-L5-01`;
  const l5Join = addDays(acc.joinDate, 25);
  const l5Rollup = calcRollup('Basic', 1);
  rows.push([
    seq++, acc.id, acc.nick, l5Id, getCN('_Rise2'), '🇨🇳',
    'Line5', 1, acc.id,
    'White Dragon', 'Basic', 200, l5Join,
    20, l5Rollup.applicable, l5Rollup.monthly, l5Rollup.annual,
    '거의 비활성'
  ].join(','));

  const l5Sub = `${P}-L5-02-1`;
  const l5SubJoin = addDays(l5Join, 60);
  const l5SubRollup = calcRollup('Basic', 2);
  rows.push([
    seq++, acc.id, acc.nick, l5Sub, getCN('_Sub'), '🇨🇳',
    'Line5', 2, l5Id,
    'White Dragon', 'Basic', 200, l5SubJoin,
    20, l5SubRollup.applicable, l5SubRollup.monthly, l5SubRollup.annual,
    '최소 구성'
  ].join(','));
}

// ============================================================
// 요약 섹션 추가
// ============================================================
rows.push('');
rows.push('=== 수당 체계 요약 ===');
rows.push('구분,내용,비고');
rows.push('직접추천수당,패키지금액 × 10% (1회성),하부가 가입할 때 즉시 지급');
rows.push('롤업수당,하부 일일수익 × 10%,Blue Dragon = 3레벨 / Purple = 7레벨 / Red = 15레벨 / Black = 25레벨');
rows.push('롤업 계산 예시 (Blue Dragon)');
rows.push('Level 1 Blue Dragon (Standard $500),월 수익 $45 × 10% = $4.50/월,연 $54');
rows.push('Level 2 White Dragon (Basic $200),월 수익 $18 × 10% = $1.80/월,연 $21.60');
rows.push('Level 3 White Dragon (Basic $200),월 수익 $18 × 10% = $1.80/월,연 $21.60');
rows.push('Level 4+ (Blue Dragon 미적용),$0/월,Purple Dragon부터 적용됨');
rows.push('');
rows.push('=== 전체 집계 (V8.8 현실감 재설계) ===');
rows.push(`총 생성 멤버 수,${seq-1}명 (주계정 제외 / 참고용 근사치)`);
rows.push('주계정 수,10개 (Blue Dragon 3개 + White Dragon 7개)');
rows.push(`전체 합계,${seq-1+10}개 계정`);
rows.push('※ 정확한 데이터,03_referral_tree.sql 기준 (220명),실제 DB 삽입은 SQL 파일 사용');
rows.push('직급 분포,Blue Dragon: Kim/Lee/Park / White Dragon: Choi~Ko,V8.8 현실감 방향A 채택');
rows.push('USDT 계산 근거,일일수익 + 직추천 + 롤업(Blue만) / White Dragon은 롤업 없음,인출 없음 기준');

// ============================================================
// 파일 저장
// ============================================================
const output = '﻿' + rows.join('\n'); // UTF-8 BOM for Excel Korean 표시
const filename = 'EXCEL_05_전체220명_조직도및수당.csv';
fs.writeFileSync(filename, output, 'utf8');
console.log(`✅ 생성 완료: ${filename}`);
console.log(`   총 조직도 멤버: ${seq-1}명`);
console.log(`   전체 계정: ${seq-1+10}개`);
