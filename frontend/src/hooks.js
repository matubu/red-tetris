import { minify } from 'html-minifier'
import { prerendering } from '$app/env'
 
const minification_options = {
	collapseBooleanAttributes: true,
	collapseInlineTagWhitespace: true,
	collapseWhitespace: true,
	decodeEntities: true,
	html5: true,
	minifyCSS: true,
	minifyJS: true,
	minifyURLs: true,
	removeAttributeQuotes: true,
	removeComments: true,
	removeEmptyAttributes: true,
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	removeTagWhitespace: true,
	sortAttributes: true,
	sortClassName: true,
	useShortDoctype: true
};
 
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event)
	
	if (prerendering && response.headers.get('content-type') === 'text/html')
	{
		const html = await response.text();
		const minified = minify(html, minification_options)
		const replaced = minified
			.replace(/import { start } from "[^"]*";/g, 'import {start} from "/bundle.js";')
			.replaceAll(/<link href=[^>]* rel=modulepreload>/g, '')
		return new Response(replaced, {
			status: response.status,
			headers: response.headers
		})
	}
	
	return response
}