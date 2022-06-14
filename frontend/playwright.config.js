/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: "npm run dev",
		url: 'http://localhost:3000/',
		reuseExistingServer: true
	},
	use: {
		baseURL: 'http://localhost:3000/',
	}
};

export default config;
