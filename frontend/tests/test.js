import { expect, test } from '@playwright/test';

test('index page has input', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('input').first()).toBeVisible();
});
