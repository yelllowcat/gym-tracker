#!/bin/bash

# Ensure we are in the client directory
cd "$(dirname "$0")"

# Check for EXPO_TOKEN
if [ -z "$EXPO_TOKEN" ]; then
  echo "⚠️  EXPO_TOKEN environment variable is not set."
  echo "   EAS CLI requires authentication even for local builds to validate the project."
  echo "   Please run this script with your token:"
  echo "   EXPO_TOKEN=your_token_here ./build-with-docker.sh"
  echo ""
  echo "   You can generate a token at: https://expo.dev/settings/access-tokens"
  exit 1
fi

echo "🐳 Building Docker image for Android Build..."
docker build -t gym-tracker-builder .

echo "🚀 Starting build container..."
# Create output directory
mkdir -p output

# Run the build
docker run --rm \
  -e EXPO_TOKEN="$EXPO_TOKEN" \
  -v "$(pwd)/output:/app/output" \
  gym-tracker-builder

# Fix permissions of the output file (since Docker creates it as root)
echo "🔧 Fixing file permissions..."
docker run --rm \
  -v "$(pwd)/output:/data" \
  alpine chown -R $(id -u):$(id -g) /data

echo "✅ Build complete! Check the 'output' directory for your APK."
