#!/bin/bash

# GitHub Infrastructure Setup Script for Plonter App
# This script sets up the complete GitHub infrastructure

set -e

echo "🚀 Setting up GitHub infrastructure for Plonter App..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="plonter-app"
GITHUB_USERNAME="${1:-$USER}"  # Use first argument or current user
DESCRIPTION="Educational Arabic syntax analyzer with Hebrew interface"

echo -e "${BLUE}Repository Name:${NC} $REPO_NAME"
echo -e "${BLUE}GitHub Username:${NC} $GITHUB_USERNAME"
echo -e "${BLUE}Description:${NC} $DESCRIPTION"
echo

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Please install it first:${NC}"
    echo "   macOS: brew install gh"
    echo "   Ubuntu: sudo apt install gh"
    echo "   Or visit: https://cli.github.com/"
    echo
    echo -e "${YELLOW}📋 Manual Steps (run after installing gh):${NC}"
    echo "1. gh auth login"
    echo "2. gh repo create $REPO_NAME --public --description '$DESCRIPTION'"
    echo "3. git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "4. git push -u origin main"
    echo "5. gh repo edit --enable-pages --pages-source-path '/' --pages-source-branch main"
    exit 1
fi

# Authenticate with GitHub if not already done
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 Please authenticate with GitHub:${NC}"
    gh auth login
fi

# Create the repository
echo -e "${BLUE}📦 Creating GitHub repository...${NC}"
gh repo create "$REPO_NAME" \
    --public \
    --description "$DESCRIPTION" \
    --homepage "https://$GITHUB_USERNAME.github.io/$REPO_NAME" \
    --add-readme=false

# Add remote origin
echo -e "${BLUE}🔗 Adding remote origin...${NC}"
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push to GitHub
echo -e "${BLUE}⬆️  Pushing code to GitHub...${NC}"
git push -u origin main

# Enable GitHub Pages
echo -e "${BLUE}🌐 Enabling GitHub Pages...${NC}"
gh repo edit --enable-pages --pages-source-path '/' --pages-source-branch main

# Wait a moment for GitHub Pages to be ready
echo -e "${YELLOW}⏳ Waiting for GitHub Pages to initialize...${NC}"
sleep 10

# Update package.json with correct repository URLs
echo -e "${BLUE}📝 Updating package.json with repository info...${NC}"
sed -i.bak "s|https://github.com/username/plonter-app|https://github.com/$GITHUB_USERNAME/$REPO_NAME|g" package.json
rm package.json.bak

# Commit the package.json update
git add package.json
git commit -m "UPDATE: Fix repository URLs in package.json"
git push

echo -e "${GREEN}✅ GitHub infrastructure setup complete!${NC}"
echo
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "${BLUE}Repository URL:${NC} https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo -e "${BLUE}Live Demo URL:${NC} https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo -e "${BLUE}Local Server:${NC} http://localhost:8080"
echo
echo -e "${YELLOW}⏰ Note: GitHub Pages may take a few minutes to be fully available.${NC}"
echo -e "${YELLOW}🔄 If the live demo shows 404, wait 2-3 minutes and refresh.${NC}"