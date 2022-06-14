import { expect, test } from '@playwright/test';

test('index page has input', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('input').first()).toBeVisible();
});

test('index page has button', async ({ page }) => {
	await page.goto('/');

	let button = page.locator('button').first()
	await expect(button).toBeVisible();
	await expect(button).toHaveText('PLAY');
})

test('login', async ({ page }) => {
	await page.goto('/');

	await page.fill('input', 'myname');
	await page.click('button');
	await page.screenshot({path: 'screenshot.png'});
})