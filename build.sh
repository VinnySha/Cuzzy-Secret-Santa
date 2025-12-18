#!/bin/bash
# Build script for production deployment
# This builds the React frontend and prepares the Flask backend

echo "🔨 Building React frontend..."
npm install
npm run build

echo "✅ Build complete! The dist/ folder is ready for deployment."

