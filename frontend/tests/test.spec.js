import { expect, test } from '@playwright/test';


test('create game', async ({ page, browserName }) => {

	const USERNAME = `user-${browserName}`;
	const ROOMNAME = `room-${browserName}`;

	await page.goto('/');

	// Check presence of form
	await page.waitForLoadState();
	await page.waitForTimeout(500);

	await expect(page.locator('input').first()).toBeVisible();

	let button = page.locator('button').first()
	await expect(button).toBeVisible();
	await expect(button).toHaveText('PLAY');

	// Login
	await page.fill('input', USERNAME);
	await page.locator('button').click();

	await page.waitForLoadState('domcontentloaded');
	
	await expect(page).toHaveURL('/rooms');
	expect(await page.evaluate(() => localStorage.user)).toBe(USERNAME);
	
	// Create room
	await page.fill('input', ROOMNAME);
	await page.locator('button').click();

	await page.waitForLoadState('domcontentloaded');

	await expect(page).toHaveURL(`/room#${ROOMNAME}`);

	// Start game
	await page.locator('"START"').click();

	// Play
	for (let i = 0; i < 4; ++i)
		await page.keyboard.press('ArrowLeft');
	for (let i = 0; i < 4; ++i)
		await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Space');

})

// test('create game', async ({ page, browserName }) => {

// }
