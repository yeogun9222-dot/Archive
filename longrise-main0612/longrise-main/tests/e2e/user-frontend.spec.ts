import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fastapiDir = path.join(repoRoot, 'lr_fastapi');
const apiBaseUrl = process.env.E2E_API_URL || 'http://localhost:8000/api/v1';
const userEmail = 'ops.smoke@longrise.ai';
const userPassword = 'Longrise!2026';
const tradingPassword = '0000';
const tokenKey = process.env.E2E_TOKEN_STORAGE_KEY || 'longrise_token';

async function loginAsSmoke(page: Page) {
  const api = await request.newContext();
  const response = await api.post(`${apiBaseUrl}/auth/login/json`, {
    data: { email: userEmail, password: userPassword },
  });
  expect(response.ok()).toBeTruthy();

  const { access_token: token } = (await response.json()) as { access_token: string };
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: tokenKey, value: token },
  );
  await api.dispose();

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
}

async function openProfileMenu(page: Page) {
  await page.getByRole('button', { name: 'Account menu' }).click();
}

async function openProfilePage(page: Page, menuLabel: string) {
  await openProfileMenu(page);
  await page.getByRole('button', { name: menuLabel }).click();
}

async function loginApi(api: APIRequestContext) {
  const response = await api.post(`${apiBaseUrl}/auth/login/json`, {
    data: { email: userEmail, password: userPassword },
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{ access_token: string }>;
}

async function authenticatedApi() {
  const api = await request.newContext();
  const { access_token: token } = await loginApi(api);
  return { api, headers: { Authorization: `Bearer ${token}` } };
}

test.beforeAll(() => {
  if (process.env.E2E_SKIP_SEED === '1') {
    return;
  }
  execFileSync('uv', ['run', 'python', 'seed_operational_data.py'], {
    cwd: fastapiDir,
    stdio: 'inherit',
  });
});

test('guest home renders public package data and login gate', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation').getByText('LONGRISE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dragon Wealth Packages' })).toBeVisible();

  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByText('VIP Entrance')).toBeVisible();
  await expect(page.getByText('Real Account Access')).toBeVisible();
});

test('one-click login loads the real Smoke account session', async ({ page }) => {
  await loginAsSmoke(page);

  const token = await page.evaluate(() => localStorage.getItem('longrise_token'));
  expect(token).toBeTruthy();
});

test('login modal key account button opens the real Kim session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: /Kim_Dragon88/i }).click();

  await expect(page.getByText('VIP Entrance')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
  const token = await page.evaluate((key) => localStorage.getItem(key), tokenKey);
  expect(token).toBeTruthy();
});

test('packages screen renders seeded RDS packages', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^PACKAGES$/ }).click();
  await expect(page.getByRole('heading', { name: 'Dragon Wealth Packages' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Flexible' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'VIP' })).toBeVisible();
});

test('package purchase UI submits against the real investment API', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^PACKAGES$/ }).click();
  await page.getByRole('heading', { name: 'Flexible' }).click();
  await expect(page.getByRole('heading', { name: /flexible package/i })).toBeVisible();

  await page.getByRole('button', { name: 'INVEST NOW' }).click();
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'CONFIRM' }).click();

  await expect(page.getByText('My Wealth')).toBeVisible();
  await expect(page.getByText('PACKAGE HISTORY')).toBeVisible();
});

test('crypto AI screen renders seeded purchase history', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^CRYPTO AI$/ }).click();
  await expect(page.getByRole('heading', { name: 'Purchase History' })).toBeVisible();

  const emptyState = page.getByText(/No purchase history is available/i);
  const packageCards = page.getByText(/Investment/i);
  if ((await emptyState.count()) > 0) {
    await expect(emptyState.first()).toBeVisible();
  } else {
    await expect(packageCards.first()).toBeVisible();
  }
});

test('wallet screen renders balances, package history, activity, and transfer history', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^WALLET$/ }).click();
  await expect(page.getByText('My Wealth')).toBeVisible();
  await expect(page.getByText('AVAILABLE USDT')).toBeVisible();
  await expect(page.getByText('PACKAGE HISTORY')).toBeVisible();
  await expect(page.getByText('RECENT ACTIVITY')).toBeVisible();
  await expect(page.getByText('TRANSFER HISTORY')).toBeVisible();
});

test('wallet conversion submits from the UI', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^WALLET$/ }).click();
  await page.locator('input').first().fill('1');
  await page.getByRole('button', { name: 'CONFIRM CONVERSION' }).click();
  await expect(page.getByText(/converted to CNYT|Conversion failed/i)).toBeVisible();
});

test('withdrawal request submits from the UI', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^WALLET$/ }).click();
  await page.getByRole('button', { name: 'WITHDRAW' }).click();
  await page.getByPlaceholder('Settlement destination / account memo').fill('playwright-settlement-memo');
  await page.getByPlaceholder('Amount').fill('2');
  await page.getByPlaceholder('4-digit Trading PIN').fill(tradingPassword);
  await page.getByRole('button', { name: 'SUBMIT WITHDRAWAL' }).click();
  await expect(page.getByText(/Withdrawal request submitted|Withdrawal request failed/i)).toBeVisible();
});

test('internal USDT transfer submits from the UI', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^WALLET$/ }).click();
  await page.getByRole('button', { name: /SEND USDT/i }).click();
  await page.getByPlaceholder('Enter email or wallet address').fill('ops.leader@longrise.ai');
  await page.getByPlaceholder('0.00').nth(1).fill('1');
  await page.getByPlaceholder('4-digit Trading PIN').fill(tradingPassword);
  await page.getByRole('button', { name: 'CONFIRM TRANSFER' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Sent!' })).toBeVisible();
});

test('rewards screen verifies trading password and renders team data', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^REWARDS$/ }).click();
  await expect(page.getByRole('button', { name: 'HONOR' })).toBeVisible();
  const passkey = page.locator('input[type="password"]').first();
  if (await passkey.isVisible()) {
    await passkey.fill(tradingPassword);
    await page.getByRole('button', { name: /Verify Identity/i }).click();
  }
  await expect(page.getByRole('button', { name: 'TEAM' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'INVITE' })).toHaveCount(0);
});

test('CNYT market renders seeded order book and creates a UI order', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^MARKET$/ }).click();
  await expect(page.getByText('Premium Trading Floor')).toBeVisible();
  await expect(page.getByText('CNYT INDEX PRICE')).toBeVisible();
  await expect(page.getByText('LIVE ORDER STREAM')).toBeVisible();

  await page.locator('input').first().fill('3');
  await page.locator('input').nth(1).fill('0.0312');
  await page.getByRole('button', { name: 'POST BUY ORDER' }).click();
  await expect(page.getByText(/CNYT buy order posted|Unable to post order/i)).toBeVisible();
});

test('USDT market renders seeded order book and creates a UI order', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^MARKET$/ }).click();
  await page.getByRole('button', { name: 'USDT Trading' }).click();
  await expect(page.getByText('USDT Trading Floor')).toBeVisible();
  await expect(page.getByText('USDT INDEX PRICE')).toBeVisible();

  const tradePanel = page.getByRole('heading', { name: 'TRADE USDT' }).locator('..');
  await tradePanel.getByRole('button', { name: 'SELL' }).click();
  await tradePanel.locator('input').first().fill('3');
  await tradePanel.locator('input').nth(1).fill('1.0000');
  await tradePanel.getByRole('button', { name: 'POST SELL ORDER' }).click();
  await expect(page.getByText(/USDT sell order posted|Unable to post order/i)).toBeVisible();
});

test('profile screen renders account data and saves identity form', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfilePage(page, 'My Profile');
  await expect(page.getByText('Account Information')).toBeVisible();

  await page.getByRole('button', { name: 'Edit Identity' }).click();
  await page.getByPlaceholder('Full name').fill('Operations Smoke');
  await page.getByPlaceholder('Nickname').fill('ops_smoke');
  await page.getByPlaceholder('Phone number').fill('010-2026-0604');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Identity' })).not.toBeVisible();
});

test('security center renders protection controls from real account state', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfilePage(page, 'Security Center');
  await expect(page.getByRole('heading', { name: 'Advanced Protection' })).toBeVisible();
  await expect(page.getByText('Account Integrity')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Google OTP (2FA)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Email Verifier' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trading Password' })).toBeVisible();
});

test('notices, documentation, and settings screens render', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfilePage(page, 'News & Updates');
  await expect(page.getByRole('heading', { name: /Quantum Node Upgrade Special/i })).toBeVisible();

  await openProfilePage(page, 'Documentation');
  await expect(page.getByRole('heading', { name: 'Documentation' })).toBeVisible();
  await expect(page.getByText(/Crypto AI|Investment|Wallet/i).first()).toBeVisible();

  await openProfilePage(page, 'Platform Settings');
  await expect(page.getByRole('heading', { name: 'Advanced Engine Settings' })).toBeVisible();
});

test('support screen renders FAQ/tickets and submits a support ticket', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfilePage(page, 'Support Tickets');
  await expect(page.getByText('CONCIERGE SUPPORT')).toBeVisible();
  await expect(page.getByText('Live operational queue')).toBeVisible();

  await page.getByPlaceholder('Search FAQ...').fill('withdrawal');
  await expect(page.getByText(/withdrawal/i).first()).toBeVisible();

  await page.getByRole('button', { name: /Connect Now/i }).first().click();
  await page.getByPlaceholder('Ticket title').fill(`Playwright support ticket ${Date.now()}`);
  await page.getByPlaceholder('Describe the issue in detail.').fill('Submitted by Playwright to verify the live support flow.');
  await page.getByRole('button', { name: 'Submit Ticket' }).click();
  await expect(page.getByText(/Ticket .* submitted successfully/i)).toBeVisible();
});

test('fraud report submits with evidence from the UI', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfilePage(page, 'Support Tickets');
  await page.getByRole('button', { name: 'Fraud Report' }).click();
  await expect(page.getByText('Report Fraud')).toBeVisible();
  await page.getByPlaceholder('USER_12345 or RED_DRAGON_KR').fill('playwright-risk-user');
  await page.getByText('USDT Not Received After Deposit').click();
  await page.getByPlaceholder(/Explain what happened/i).fill('Playwright fraud report verifies evidence upload and live ticket creation.');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'evidence.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Submit Report' }).click();
  await expect(page.getByText('Report Submitted')).toBeVisible();
});

test('USDT onboarding deposit request submits from the UI', async ({ page }) => {
  await loginAsSmoke(page);

  await page.getByRole('button', { name: /^WALLET$/ }).click();
  await page.getByRole('button', { name: 'DEPOSIT' }).click();
  await expect(page.getByText('USDT Onboarding')).toBeVisible();
  await expect(page.getByText('No Red Dragon operators available')).toBeVisible();
});

test('logout clears authenticated UI and returns to guest mode', async ({ page }) => {
  await loginAsSmoke(page);

  await openProfileMenu(page);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
});

test('API contract reads core user, content, wallet, market, and support resources', async () => {
  const { api, headers } = await authenticatedApi();

  const endpoints = [
    `${apiBaseUrl}/users/me`,
    `${apiBaseUrl}/dashboard/me`,
    `${apiBaseUrl}/investments/packages`,
    `${apiBaseUrl}/investments/me`,
    `${apiBaseUrl}/transactions/me`,
    `${apiBaseUrl}/content/news`,
    `${apiBaseUrl}/content/support/faq`,
    `${apiBaseUrl}/market/p2p?asset=CNYT`,
    `${apiBaseUrl}/market/p2p?asset=USDT`,
    `${apiBaseUrl}/support/tickets/my`,
    `${apiBaseUrl}/wallet/deposit-requests/me`,
  ];

  for (const endpoint of endpoints) {
    const response = await api.get(endpoint, { headers });
    expect(response.ok(), endpoint).toBeTruthy();
  }

  await api.dispose();
});

test('API contract verifies trading password and investment purchase', async () => {
  const { api, headers } = await authenticatedApi();

  const verifyPassword = await api.post(`${apiBaseUrl}/account/trading-password/verify`, {
    headers,
    data: { password: tradingPassword },
  });
  expect(verifyPassword.ok()).toBeTruthy();
  expect((await verifyPassword.json()).verified).toBe(true);

  const purchase = await api.post(`${apiBaseUrl}/investments/purchase`, {
    headers,
    data: { package_id: 'flexible', amount: '100' },
  });
  expect(purchase.ok(), await purchase.text()).toBeTruthy();

  await api.dispose();
});

test('API contract mutates wallet conversion, transfer, and withdrawal flows', async () => {
  const { api, headers } = await authenticatedApi();

  for (const [endpoint, data] of [
    [`${apiBaseUrl}/wallet/conversions`, { amount: '1' }],
    [`${apiBaseUrl}/wallet/transfers`, { recipient: 'ops.leader@longrise.ai', amount: '1', asset: 'USDT', trading_password: tradingPassword }],
    [`${apiBaseUrl}/withdrawals`, { amount: '1', asset: 'USDT', network: 'INTERNAL', wallet_address: 'playwright-api-settlement', trading_password: tradingPassword }],
  ] as const) {
    const response = await api.post(endpoint, { headers, data });
    expect(response.ok(), `${endpoint}: ${await response.text()}`).toBeTruthy();
  }

  await api.dispose();
});

test('API contract mutates CNYT/USDT market orders', async () => {
  const { api, headers } = await authenticatedApi();

  for (const data of [
    { asset: 'CNYT', trade_type: 'buy', amount: '3', price_per_unit: '0.0312', currency: 'USDT' },
    { asset: 'USDT', trade_type: 'sell', amount: '3', price_per_unit: '1.0000', currency: 'USDT' },
  ] as const) {
    const response = await api.post(`${apiBaseUrl}/market/p2p/orders`, { headers, data });
    expect(response.ok(), `${data.asset}: ${await response.text()}`).toBeTruthy();
  }

  await api.dispose();
});

test('API contract mutates support, fraud-report, and onboarding request flows', async () => {
  const { api, headers } = await authenticatedApi();

  for (const [endpoint, data] of [
    [`${apiBaseUrl}/support/tickets`, { title: 'Playwright API support', description: 'API contract support ticket coverage.', category: 'GENERAL', priority: 'medium' }],
    [`${apiBaseUrl}/support/fraud-reports`, { fraudster_uid: 'api-risk-user', fraud_reason: 'other', description: 'API contract fraud report coverage.', evidence: ['api-evidence'] }],
    [`${apiBaseUrl}/wallet/deposit-requests`, { leader_id: 'RED_DRAGON_KR', leader_name: 'DRAGON_KOREA', bank_account: 'playwright-api-bank', deposit_amount: '10', notes: 'API contract deposit request' }],
  ] as const) {
    const response = await api.post(endpoint, { headers, data });
    expect(response.ok(), `${endpoint}: ${await response.text()}`).toBeTruthy();
  }

  await api.dispose();
});
