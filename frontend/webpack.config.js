import fs from 'fs';
import path from 'path';
import webpack from 'webpack';

const file = fs.readFileSync('./build/_app/immutable/manifest.json')
const manifest = JSON.parse(file)
const filename = manifest['.svelte-kit/runtime/client/start.js'].file

console.log(`./build/_app/immutable/${filename}`)

export default {
	mode: 'production',

	entry: `./build/_app/immutable/${filename}`,

	output: {
		filename: 'bundle.js',
		path: path.resolve('static')
	},
	
	// "compilerOptions": {
	// 	"module": "commonjs",
	// 	"target": "esnext",
	// 	"lib": ["es2015", "webworker"],
	// 	"noImplicitAny": true,
	// 	"preserveConstEnums": true,
	// 	"outDir": "./dist",
	// 	"moduleResolution": "node"
	//   },

	// target: ["web", "es2020"],	  

	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		})
	]
}