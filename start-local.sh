#!/bin/bash

echo "Starting Accounting System in Production Mode..."
echo ""
export NODE_ENV=production

echo "Building React app..."
cd client
npm run build
cd ..

echo ""
echo "Starting server..."
echo "Server will be available at: http://localhost:5000"
echo "To share on LAN, use your computer's IP address"
echo ""

node server/index.js

