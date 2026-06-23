const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '공금정산보고서.xlsx');
const wb = XLSX.readFile(filePath, { cellStyles: true, sheetStubs: true });
const ws = wb.Sheets['베트남 2차 (5.2~)'];

// ── 헬퍼 ────────────────────────────────────────────────
function getCell(r, c) {
  return ws[XLSX.utils.encode_cell({ r, c })];
}
function setCell(r, c, value, style) {
  const addr = XLSX.utils.encode_cell({ r, c });
  const existing = ws[addr];
  if (existing) {
    existing.v = value;
    existing.w = String(value);
    if (existing.t !== undefined) existing.t = typeof value === 'number' ? 'n' : 's';
  } else {
    ws[addr] = { v: value, w: String(value), t: typeof value === 'number' ? 'n' : 's' };
  }
}

// 행 아래로 밀기 (insertAfterRow 다음부터 끝까지 count행 아래로)
function shiftRowsDown(insertAfterRow, count) {
  const range = XLSX.utils.decode_range(ws['!ref']);
  // 아래에서 위로 올라오며 복사
  for (let r = range.e.r; r > insertAfterRow; r--) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const srcAddr = XLSX.utils.encode_cell({ r, c });
      const dstAddr = XLSX.utils.encode_cell({ r: r + count, c });
      if (ws[srcAddr]) {
        ws[dstAddr] = JSON.parse(JSON.stringify(ws[srcAddr]));
      } else {
        delete ws[dstAddr];
      }
    }
  }
  // 삽입 위치 행들 비우기
  for (let ri = insertAfterRow + 1; ri <= insertAfterRow + count; ri++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      delete ws[XLSX.utils.encode_cell({ r: ri, c })];
    }
  }
  // ref 범위 확장
  range.e.r += count;
  ws['!ref'] = XLSX.utils.encode_range(range);

  // 행 높이(row metadata) 밀기
  if (ws['!rows']) {
    const newRows = [...ws['!rows']];
    for (let r = range.e.r; r > insertAfterRow; r--) {
      newRows[r + count] = newRows[r];
    }
    for (let ri = insertAfterRow + 1; ri <= insertAfterRow + count; ri++) {
      newRows[ri] = { hpt: 18 };
    }
    ws['!rows'] = newRows;
  }

  // 머지 셀 조정
  if (ws['!merges']) {
    ws['!merges'] = ws['!merges'].map(m => {
      if (m.s.r > insertAfterRow) {
        return { s: { r: m.s.r + count, c: m.s.c }, e: { r: m.e.r + count, c: m.e.c } };
      } else if (m.e.r > insertAfterRow) {
        return { s: m.s, e: { r: m.e.r + count, c: m.e.c } };
      }
      return m;
    });
  }
}

// ── 삽입 위치: 현재 Row 31 (index 30) = 05-30 식대비 다음, Row 32 (index 31) = 합계 앞 ──
const insertAfterRowIndex = 30; // 0-based: row 31 in sheet

// 2행 삽입
shiftRowsDown(insertAfterRowIndex, 2);

// 새 행 데이터 작성 (0-based)
const newRow1 = insertAfterRowIndex + 1; // index 31
const newRow2 = insertAfterRowIndex + 2; // index 32

// 기존 데이터 행 형식 참고 (col B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
function addDataRow(rowIdx, date, gubun, detail, amount, note) {
  setCell(rowIdx, 1, date);           // B: 날짜
  setCell(rowIdx, 2, gubun);          // C: 구분
  setCell(rowIdx, 3, detail);         // D: 상세 지출 내용
  setCell(rowIdx, 4, amount + ' 동'); // E: 금액
  setCell(rowIdx, 5, '—');            // F: —
  setCell(rowIdx, 6, amount + ' 동'); // G: 합계
  setCell(rowIdx, 7, '✓  완료');      // H: 상태
  setCell(rowIdx, 8, note);           // I: 비고
}

addDataRow(newRow1, '06-01', '생활비', '카사미어 숙소 청소/빨래/설거지 관리비 (6월 1주차)', 1000000, '공금 동 지출');
addDataRow(newRow2, '06-01', '생필품', '생수 1.5L 4BOX 구매 (박스당 145,000동)', 580000, '공금 동 지출');

// ── 합계 행 업데이트 (이제 index 33) ──
const totalRowIdx = insertAfterRowIndex + 3; // index 33
const totalCell = getCell(totalRowIdx, 1);
if (totalCell) {
  // 합계 값: 7,642,000 + 1,000,000 + 580,000 = 9,222,000
  const amountCell = getCell(totalRowIdx, 7);
  if (amountCell) {
    amountCell.v = '9,222,000 동';
    amountCell.w = '9,222,000 동';
  }
  totalCell.v = '공금 동 지출 합계  (이월 150,000동 → 잔액 -9,072,000동)';
  totalCell.w = '공금 동 지출 합계  (이월 150,000동 → 잔액 -9,072,000동)';
}

// ── 공금 보유 동 업데이트 (요약 카드): 4,508,000 → 2,928,000 ──
// 요약 카드는 row 6 (index 5), col D (index 3)
const dongCell = getCell(5, 3);
if (dongCell) {
  dongCell.v = '2,928,000 동';
  dongCell.w = '2,928,000 동';
  console.log('공금 동 잔액 업데이트: 4,508,000 → 2,928,000');
}

// 공금 총 현황 칸 (col H, index 7)
const totalCard = getCell(5, 7);
if (totalCard) {
  totalCard.v = '$650 + 2,928,000동 + ₩260,500';
  totalCard.w = '$650 + 2,928,000동 + ₩260,500';
}

// ── 저장 ──
XLSX.writeFile(wb, filePath);
console.log('✅ 완료! 저장됨:', filePath);
console.log('추가된 항목:');
console.log('  06-01 | 생활비 | 카사미어 청소/빨래/설거지 1주차 | 1,000,000동');
console.log('  06-01 | 생필품 | 생수 1.5L 4BOX | 580,000동');
console.log('공금 동 잔액: 4,508,000 → 2,928,000동');
