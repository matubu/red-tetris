import { devices } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	testMatch: /.spec.js/,
	webServer: {
		command: "npm run dev",
		port: 3000,
		reuseExistingServer: true
	},
	use: {
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		}
	]
};

export default config;
