#!/bin/bash

echo "🚀 Building Formula Private - Island Archive..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build for GitHub Pages
echo "🔨 Building for GitHub Pages..."
cd apps/webapp
pnpm build:ghpages

# Copy to docs folder for GitHub Pages
echo "📁 Copying to docs folder..."
rm -rf ../../docs
cp -r dist-ghpages ../../docs

# Create .nojekyll file
echo "📄 Creating .nojekyll file..."
touch ../../docs/.nojekyll

echo "✅ Build complete! Files are ready in docs/ folder"
echo "🌐 Deploy to GitHub Pages:"
echo "   1. Commit and push the docs/ folder"
echo "   2. Enable GitHub Pages in repository settings"
echo "   3. Set source to 'Deploy from a branch' -> 'main' -> '/docs'"
echo ""
echo "🔗 Your Mini App will be available at:"
echo "   https://acqu1red.github.io/formulaprivate/island.html"
