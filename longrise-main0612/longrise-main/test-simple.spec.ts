import { expect, test, request, type Page } from '@playwright/test';

const apiBaseUrl = process.env.E2E_API_URL || 'http://localhost:8000/api/v1';
const tokenKey = process.env.E2E_TOKEN_STORAGE_KEY || 'longrise_token';
const userEmail = 'ops.smoke@longrise.ai';
const userPassword = 'Longrise!2026';

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
}

test('one-click Smoke account login works against real API', async ({ page }) => {
  await loginAsSmoke(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem('longrise_token'));
  expect(token).toBeTruthy();
});
