import { expect, type Page, type Route, test } from '@playwright/test';

const MOCK_USER = {
  user: {
    id: 'user-settings-audit',
    email: 'settings-audit@example.com',
    name: 'Settings Audit User',
    image: null,
    role: 'user',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-05-19T00:00:00Z',
    updatedAt: '2026-05-19T00:00:00Z',
  },
  session: {
    id: 'session-settings-audit',
    userId: 'user-settings-audit',
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    token: 'mock-token',
    createdAt: '2026-05-19T00:00:00Z',
    updatedAt: '2026-05-19T00:00:00Z',
  },
};

async function screenshot(page: Page, name: string) {
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `../../.codex/tmp/playwright-screenshots/${name}.png`,
    fullPage: true,
  });
}

async function assertNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
}

async function setupApiMocks(page: Page) {
  await page.route('**/api/**', async (route: Route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    const respond = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (path.includes('/api/auth/')) return respond(200, MOCK_USER);
    if (path.startsWith('/api/notifications')) return respond(200, { notifications: [], unreadCount: 0 });
    if (path === '/api/auth/smoke-test-status') return respond(200, { enabled: false });
    if (path === '/api/projects') return respond(200, { projects: [], nextCursor: null });
    if (path === '/api/credentials' && method === 'GET') {
      return respond(200, [
        {
          id: 'cred-hetzner',
          provider: 'hetzner',
          name: 'Hetzner',
          createdAt: '2026-04-19T00:00:00Z',
          updatedAt: '2026-04-19T00:00:00Z',
        },
      ]);
    }
    if (path === '/api/credentials/validate' && method === 'POST') {
      return respond(200, { valid: true, provider: 'hetzner', message: 'hetzner credential validated.' });
    }
    if (path === '/api/credentials' && method === 'POST') {
      return respond(200, { id: 'cred-hetzner', provider: 'hetzner', connected: true });
    }

    return respond(200, {});
  });
}

test.describe('Settings Hetzner validation audit', () => {
  test('update form validation actions fit mobile and desktop', async ({ page }, testInfo) => {
    await setupApiMocks(page);
    await page.goto('/settings/cloud-provider');
    await page.waitForTimeout(1000);

    const suffix = testInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    await expect(page.getByText('Hetzner')).toBeVisible();
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByLabel('Hetzner API Token').fill(`hetzner-${'token-'.repeat(42)}`);
    await expect(page.getByRole('button', { name: 'Test connection' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Token' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await screenshot(page, `settings-hetzner-validation-${suffix}`);
    await assertNoOverflow(page);

    await page.getByRole('button', { name: 'Test connection' }).click();
    await expect(page.getByText('hetzner credential validated.')).toBeVisible();
    await screenshot(page, `settings-hetzner-validation-success-${suffix}`);
    await assertNoOverflow(page);
  });
});
