#!/bin/bash

# Ensure we are in the client directory
cd "$(dirname "$0")"

echo "🐳 Building Docker image for Android Build..."
docker build -t gym-tracker-builder .

echo "🚀 Starting build container..."
# Create output directory
mkdir -p output

# Run the build
# We mount the output directory to get the APK back
# We mount the current directory as read-only (except output) to ensure clean build or copy? 
# Actually, the Dockerfile copies source. Let's just run the build.
# If you want to use the local .env files, ensure they are copied or passed.

docker run --rm \
  -v "$(pwd)/output:/app/output" \
  gym-tracker-builder

echo "✅ Build complete! Check the 'output' directory for your APK."
