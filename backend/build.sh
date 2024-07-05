#!/bin/sh

esbuild src/app.js --outfile=build/app.cjs \
	--platform=node --format=cjs --target=node16.8 \
	--banner:js="#!/usr/bin/env node" \
	--bundle --minify --legal-comments=none \
	--define:process.env.MONGODB_URI=\'$MONGODB_URI\'

chmod 777 build/app.cjs
