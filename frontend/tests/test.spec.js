import { expect, test } from '@playwright/test';


test('create game', async ({ page, browserName }) => {

	const USERNAME = `testuser-${browserName}`;
	const ROOMNAME = `testroom-${browserName}`;

	await page.goto('/');

	// Check presence of form
	await page.waitForLoadState();
	await page.waitForTimeout(1000);

	await expect(page.locator('input').first()).toBeVisible();

	let button = page.locator('button').first()
	await expect(button).toBeVisible();
	await expect(button).toHaveText('PLAY');
	
	// Login
	await page.fill('input', USERNAME);
	await page.waitForTimeout(100);
	await page.locator('button').click();

	await page.waitForLoadState('domcontentloaded');
	
	await expect(page).toHaveURL('/rooms');
	expect(await page.evaluate(() => localStorage.user)).toBe(USERNAME);
	
	// Create room
	await page.fill('input', ROOMNAME);
	await page.locator('button').click();

	await page.waitForLoadState('domcontentloaded');

	await expect(page).toHaveURL(`/room#${ROOMNAME}`);

	await page.waitForTimeout(1000);

	// Start game
	await page.locator('"START"').click();

	await page.waitForTimeout(1000);

	// Play
	for (let i = 0; i < 4; ++i)
		await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Space');

	await page.waitForTimeout(2000);
})
