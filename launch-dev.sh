#!/usr/bin/env bash

(cd backend && npm i)
(cd frontend && npm i)

(export $(grep -o '^[^#]*' .env) && cd backend && npm run dev) &
(cd frontend && npm run dev) &

wait
