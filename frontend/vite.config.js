import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/socket.io': {
				target: 'ws://localhost:4000',
				ws: true
			}
		}
	}
};

export default config;
