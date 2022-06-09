import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// package: {
		// 	exports: ['index.js']
		// }
		// browser: {
		// 	hydrate: false,
		// },
		vite: {
			build: {
				assetsInlineLimit: 4096 * 4096,
				write: false,
				rollupOptions: {
				  output: {
					format: "iife",
				  },
				},
			  },
			// worker: {
			// 	rollupOptions: {
			// 		output: {
			// 		manualChunks: undefined,
			// 		},
			// 	}
			// }
			// worker: {
			// 	rollupOptions: {
			// 	  output: {
			// 		inlineDynamicImports: true,
			// 		compact: true
			// // 		manualChunks: false,
			// // 		inlineDynamicImports: true,
			// // 		entryFileNames: '[name].js',   // currently does not work for the legacy bundle
			// // 		assetFileNames: '[name].[ext]', // currently does not work for images
			// 	  },
			// 	}
			// }
		// 	ssr: {
		// 		noExternal: true
		// 	}
		}
	}
};

export default config;
