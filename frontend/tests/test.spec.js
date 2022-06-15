import { expect, test } from '@playwright/test';


test('create game', async ({ page, browserName }) => {

	const USERNAME = `user-${browserName}`;
	const ROOMNAME = `room-${browserName}`;

	await page.goto('/');

	// Check presence of form
	await page.waitForLoadState();
	await page.waitForTimeout(500);

	await expect(page.locator('input').first()).toBeVisible();

	let button = page.locator('button').first();
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

});

function generateUsername(isInvalid) {
	let		result		= '';
	let		charset		= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
	if (isInvalid)
		charset = '{}[];:.,<>/?@#$%^&*()~=+~`\\|';
	let length = charset.length;
	for ( let i = 0; i < 8; i++ ) {
		result += charset.charAt(Math.floor(Math.random() * length));
	}
	return result;
}

test('input username', async ({ page, browserName }) => {
	
	await page.goto('/');

	let randomName = '';
	let button = page.locator('button').first();

	await expect(button).toBeVisible();
	await expect(button).toHaveText('PLAY');

	for (let i = 0 ; i < 10 ; i++)
	{
		await page.waitForLoadState();
		await page.waitForTimeout(500);

		await expect(page.locator('input').first()).toBeVisible();

		// Try random names :
		let isInvalid = (i % 2) ? true : false;
		randomName = generateUsername(isInvalid);
		await page.fill('input', randomName);
		if (isInvalid)
			await expect(page.locator('.error')).toHaveText('Username should only contains [a-z][0-9]_-');
		else {
			let isVisible = await page.locator('.error').isVisible();
			await expect(isVisible).toBe(false);
		}
	}
});
