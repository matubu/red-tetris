#!/bin/sh

esbuild src/app.js --outfile=build/app.cjs \
	--platform=node --format=cjs --target=node16.8 \
	--banner:js="#!/usr/bin/env node" \
	--bundle --minify --legal-comments=none \
	--define:process.env.MONGODB_USER=\'$MONGODB_USER\' \
	--define:process.env.MONGODB_PASS=\'$MONGODB_PASS\' \
	--define:process.env.HTTPS_PRIVKEY=\'$HTTPS_PRIVKEY\' \
	--define:process.env.HTTPS_CERT=\'$HTTPS_CERT\' \
	--define:process.env.HTTPS=1

chmod 777 build/app.cjs