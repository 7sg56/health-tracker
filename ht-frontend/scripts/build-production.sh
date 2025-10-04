#!/bin/bash

# Production Build Script for HealthTracker Frontend
# This script builds the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting HealthTracker Frontend Production Build"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Load production environment variables
if [ -f .env.production ]; then
    echo "📄 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.production file found. Using default values."
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check || {
    echo "❌ TypeScript type checking failed. Please fix type errors and try again."
    exit 1
}

# Run linting
echo "🔍 Running ESLint..."
npm run lint || {
    echo "❌ Linting failed. Please fix linting errors and try again."
    exit 1
}

# Run tests
echo "🧪 Running tests..."
npm run test -- --passWithNoTests --watchAll=false || {
    echo "❌ Tests failed. Please fix failing tests and try again."
    exit 1
}

# Build the application
echo "🏗️  Building application..."
npm run build || {
    echo "❌ Build failed. Please check the build logs and try again."
    exit 1
}

# Analyze bundle size (optional)
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📊 Analyzing bundle size..."
    ANALYZE=true npm run build
fi

# Generate build report
echo "📋 Generating build report..."
BUILD_SIZE=$(du -sh .next | cut -f1)
STATIC_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1 || echo "N/A")

cat > build-report.txt << EOF
HealthTracker Frontend Build Report
==================================
Build Date: $(date)
Node Version: $(node -v)
npm Version: $(npm -v)
Environment: production

Build Sizes:
- Total Build Size: $BUILD_SIZE
- Static Assets: $STATIC_SIZE

Build Configuration:
- Next.js Version: $(npm list next --depth=0 | grep next@ | cut -d'@' -f2)
- TypeScript: Enabled
- ESLint: Passed
- Tests: Passed

Environment Variables:
- API Base URL: ${NEXT_PUBLIC_API_BASE_URL:-"Not set"}
- App URL: ${NEXT_PUBLIC_APP_URL:-"Not set"}
- Analytics: ${NEXT_PUBLIC_ENABLE_ANALYTICS:-"false"}
- PWA: ${NEXT_PUBLIC_ENABLE_PWA:-"false"}

Build Output:
- Location: .next/
- Type: $([ -d ".next/standalone" ] && echo "Standalone" || echo "Standard")
- Static Export: $([ -d "out" ] && echo "Yes" || echo "No")
EOF

echo "✅ Build completed successfully!"
echo ""
echo "📋 Build Summary:"
echo "   Total Size: $BUILD_SIZE"
echo "   Static Assets: $STATIC_SIZE"
echo "   Output: .next/"
echo ""
echo "📄 Detailed report saved to: build-report.txt"
echo ""
echo "🚀 Ready for deployment!"

# Optional: Create deployment package
if [ "$CREATE_PACKAGE" = "true" ]; then
    echo "📦 Creating deployment package..."
    tar -czf healthtracker-frontend-$(date +%Y%m%d-%H%M%S).tar.gz \
        .next \
        public \
        package.json \
        package-lock.json \
        next.config.ts \
        .env.production
    echo "✅ Deployment package created!"
fi

echo ""
echo "🎉 Production build process completed successfully!"