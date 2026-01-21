#!/bin/sh

echo "--- Startup Script ---"
node check-env.js

echo "--- Running Migrations ---"
npx prisma migrate deploy

echo "--- Starting Server ---"
npm start
