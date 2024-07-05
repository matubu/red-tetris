release: cd backend && npm i && npm run build && cd ../frontend && npm i && npm run build
static: /:frontend/build
worker: cd backend && node build/app.cjs 2>&1 | cat
