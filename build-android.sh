#!/bin/bash
# Script to prepare Android build

# Create build directory
mkdir -p android-build

# Copy essential files
cp -R app android-build/
cp -R assets android-build/
cp -R components android-build/
cp -R store android-build/
cp -R types android-build/
cp -R utils android-build/
cp app.json android-build/
cp tsconfig.json android-build/
cp package.json android-build/
cp eas.json android-build/
cp README.md android-build/

# Create a zip file for uploading
cd android-build
zip -r ../secure-chat-app.zip .
cd ..

echo "Build package created: secure-chat-app.zip"
echo "Upload this package to an online APK builder service" 