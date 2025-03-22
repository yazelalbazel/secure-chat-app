# PowerShell script to prepare Android build

# Create build directory
New-Item -Path "android-build" -ItemType Directory -Force

# Copy essential files
Copy-Item -Path "app" -Destination "android-build" -Recurse -Force
Copy-Item -Path "assets" -Destination "android-build" -Recurse -Force
Copy-Item -Path "components" -Destination "android-build" -Recurse -Force
Copy-Item -Path "store" -Destination "android-build" -Recurse -Force
Copy-Item -Path "types" -Destination "android-build" -Recurse -Force
Copy-Item -Path "utils" -Destination "android-build" -Recurse -Force
Copy-Item -Path "app.json" -Destination "android-build" -Force
Copy-Item -Path "tsconfig.json" -Destination "android-build" -Force
Copy-Item -Path "package.json" -Destination "android-build" -Force
Copy-Item -Path "eas.json" -Destination "android-build" -Force
if (Test-Path "README.md") {
    Copy-Item -Path "README.md" -Destination "android-build" -Force
}

# Create a simple README if it doesn't exist
if (-not (Test-Path "android-build/README.md")) {
    "# Secure Chat App" | Out-File -FilePath "android-build/README.md"
}

Write-Host "Build directory created: android-build"
Write-Host "Zip this directory and upload to an online APK builder service" 