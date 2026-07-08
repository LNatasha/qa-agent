---
type: example
name: Playwright Login Test
domains: [web]
tags: [playwright, e2e, login, typescript]
---

Complete Playwright test for a login flow using TypeScript.

## Code

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('valid credentials → redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'correctpassword');
    await page.click('[data-testid="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid password → error message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('[data-testid="error"]')).toContainText('Invalid credentials');
  });
});
```
