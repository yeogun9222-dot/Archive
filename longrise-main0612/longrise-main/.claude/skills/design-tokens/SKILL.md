---
name: design-tokens
description: Longrise 프로젝트의 디자인 토큰 시스템을 관리하고 일관성 있는 디자인을 유지합니다. 색상, 타이포그래피, 간격, 컴포넌트별 디자인 토큰을 중앙집중식으로 관리하며, 하드코딩된 스타일 값 사용을 방지합니다. 각 프론트엔드마다 디자인토큰 확인용 HTML 파일을 자동 생성합니다.
argument-hint: [token-type] [value] [--generate-demo]
allowed-tools: Read, Edit, Write, Bash
user-invocable: true
---

# Design Tokens Management Skill

## 🎨 설명
Longrise 프로젝트의 디자인 토큰 시스템을 관리하고 일관성 있는 디자인을 유지하기 위한 Claude 스킬입니다. 각 프론트엔드에 디자인토큰 확인용 HTML 데모 파일을 자동 생성하는 기능이 포함되어 있습니다.

## 🚨 사용 시점
- 새로운 색상, 타이포그래피, 간격 등 디자인 요소를 추가할 때
- 기존 디자인 토큰을 수정하거나 업데이트할 때
- 컴포넌트에서 일관된 디자인 토큰 사용을 확인할 때
- 디자인 시스템의 전체적인 일관성을 검토할 때
- 새로운 테마나 브랜딩 변경을 적용할 때
- 디자인토큰 시각적 확인이 필요할 때 (--generate-demo 옵션)

## ⭐ 주요 기능
1. **색상 관리**: 브랜드 컬러, 의미별 색상, 상태별 색상 관리
2. **타이포그래피 관리**: 폰트 패밀리, 크기, 두께, 행간 관리
3. **간격 시스템**: 일관된 spacing scale 관리
4. **컴포넌트 토큰**: 버튼, 카드, 입력 필드 등 컴포넌트별 디자인 토큰
5. **테마 관리**: 라이트/다크 테마, 브랜드 테마 관리
6. **🆕 HTML 데모 생성**: 각 프론트엔드에 디자인토큰 확인용 HTML 파일 자동 생성

## 📐 Longrise 디자인 토큰 원칙
- **단일 진실 공급원**: 모든 디자인 값은 design-tokens.ts에서 관리
- **의미적 명명**: 색상은 용도에 따라 명명 (primary, success, error, crypto 등)
- **계층적 구조**: 기본 토큰 → 의미적 토큰 → 컴포넌트 토큰
- **일관성 유지**: 모든 컴포넌트는 디자인 토큰을 통해서만 스타일링
- **Crypto/Finance 특화**: 투자, 수익, 손실 등 금융 특화 색상 토큰

## 📁 파일 구조
```
src/styles/
├── design-tokens.ts          # 메인 디자인 토큰 정의
├── tokens.css               # CSS 커스텀 프로퍼티
├── main.css                 # 글로벌 스타일
└── design-tokens-demo.html  # 🆕 디자인토큰 시각적 확인용 HTML
```

## 🎨 Longrise 전용 디자인 토큰

### 색상 토큰 (Crypto/Finance 특화)
```typescript
export const longriseColors = {
  // 브랜드 컬러
  brand: {
    primary: '#1a365d',      // 딥 블루 (신뢰성)
    secondary: '#2d3748',    // 차콜 그레이
    accent: '#3182ce',       // 브라이트 블루
    gold: '#f6e05e',         // 골드 (프리미엄)
  },
  
  // 암호화폐 특화 컬러
  crypto: {
    bitcoin: '#f7931a',      // 비트코인 오렌지
    ethereum: '#627eea',     // 이더리움 블루
    usdt: '#26a17b',         // USDT 그린
    profit: '#38a169',       // 수익 그린
    loss: '#e53e3e',         // 손실 레드
    stable: '#4a5568',       // 안정 그레이
  },
  
  // 상태 컬러
  status: {
    success: '#38a169',      // 성공
    warning: '#d69e2e',      // 경고
    error: '#e53e3e',        // 오류
    info: '#3182ce',         // 정보
    pending: '#ed8936',      // 대기중
  },
  
  // 레벨/등급 컬러
  rank: {
    basic: '#4a5568',        // 베이직
    standard: '#3182ce',     // 스탠다드
    premium: '#805ad5',      // 프리미엄
    vip: '#d69e2e',          // VIP
    diamond: '#e53e3e',      // 다이아몬드
  }
}
```

### 타이포그래피 토큰
```typescript
export const longriseTypography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'Monaco, "Roboto Mono", monospace',
    display: 'Inter, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    hero: '3rem',
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
}
```

## ✅ 사용 예시

### Vue 컴포넌트에서 사용
```vue
<template>
  <div class="investment-card">
    <h3 class="title">{{ packageName }}</h3>
    <div class="profit-rate">+{{ profitRate }}%</div>
    <button class="invest-btn">투자하기</button>
  </div>
</template>

<style scoped>
.investment-card {
  background-color: var(--color-brand-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-lg);
}

.title {
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.profit-rate {
  color: var(--color-crypto-profit);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
}

.invest-btn {
  background-color: var(--color-brand-accent);
  color: var(--color-text-inverse);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-colors);
}

.invest-btn:hover {
  background-color: var(--color-brand-accent-dark);
}
</style>
```

### TypeScript에서 사용
```typescript
import { longriseDesignTokens } from '@/styles/design-tokens'

// 색상 가져오기
const profitColor = longriseDesignTokens.colors.crypto.profit
const lossColor = longriseDesignTokens.colors.crypto.loss

// 수익률에 따른 색상 결정
const getProfitLossColor = (value: number) => {
  return value >= 0 ? longriseDesignTokens.colors.crypto.profit : longriseDesignTokens.colors.crypto.loss
}

// 사용자 등급에 따른 색상
const getRankColor = (rank: string) => {
  const rankColors = longriseDesignTokens.colors.rank
  return rankColors[rank as keyof typeof rankColors] || rankColors.basic
}
```

## 🖥️ HTML 데모 파일 자동 생성

### 데모 파일 생성 명령어
```bash
# 모든 프론트엔드에 데모 파일 생성
/design-tokens --generate-demo

# 특정 프론트엔드만 생성
/design-tokens --generate-demo lr_user-frontend
```

### 생성되는 HTML 데모 파일 위치
- `lr_user-frontend/src/styles/design-tokens-demo.html`
- `lr_admin-frontend/src/styles/design-tokens-demo.html`

### 데모 파일 내용 (자동 생성)
각 HTML 파일에는 다음 내용이 포함됩니다:
- 모든 색상 토큰 시각적 표시
- 타이포그래피 스케일 샘플
- 간격 시스템 시각적 가이드
- 컴포넌트 토큰 예시
- 암호화폐/금융 특화 색상 팔레트
- 사용자 등급별 색상 시스템

## 🚫 금지 사항
- 컴포넌트에서 하드코딩된 색상/크기 사용 금지
- 디자인 토큰을 거치지 않고 직접 스타일 값 사용 금지
- 일회성 스타일을 위한 임의의 값 사용 금지
- 암호화폐 관련 색상을 일반 상태 색상과 혼용 금지

## ✅ 검증 체크리스트
- [ ] 모든 색상이 디자인 토큰에서 관리되는가?
- [ ] 하드코딩된 spacing 값이 없는가?
- [ ] 일관된 타이포그래피가 사용되고 있는가?
- [ ] 암호화폐 특화 색상이 올바르게 적용되었는가?
- [ ] 새로운 토큰이 기존 시스템과 조화롭게 통합되는가?
- [ ] CSS 변수가 올바르게 생성되었는가?
- [ ] 데모 HTML 파일이 최신 토큰을 반영하는가?
- [ ] 사용자 등급별 색상 구분이 명확한가?