#!/bin/bash

# Setup Verification Script for Plonter App Infrastructure
# This script verifies that all components are working correctly

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Plonter App Infrastructure...${NC}"
echo

# Function to check if URL is accessible
check_url() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    if curl -Is --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name: Accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: Not accessible${NC}"
        return 1
    fi
}

# Check local files
echo -e "${BLUE}📁 Checking local files...${NC}"
required_files=(
    "index.html"
    "css/style.css"
    "js/app.js"
    "js/stages.js"
    "js/partsOfSpeech.js"
    "js/word.js"
    "js/combinations.js"
    "package.json"
    "README.md"
    "DEPLOYMENT.md"
    "setup-github.sh"
    "dev-server.sh"
    ".nojekyll"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        ((missing_files++))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo -e "${RED}⚠️  $missing_files required files are missing!${NC}"
fi

echo

# Check Git configuration
echo -e "${BLUE}🔧 Checking Git configuration...${NC}"
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
    
    # Check for commits
    if git log --oneline -n 1 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Has commits${NC}"
        echo -e "${BLUE}   Latest: $(git log --oneline -n 1)${NC}"
    else
        echo -e "${YELLOW}⚠️  No commits yet${NC}"
    fi
    
    # Check for remote
    if git remote get-url origin > /dev/null 2>&1; then
        remote_url=$(git remote get-url origin)
        echo -e "${GREEN}✅ Remote configured${NC}"
        echo -e "${BLUE}   Origin: $remote_url${NC}"
        
        # Extract GitHub username and repo name
        if [[ $remote_url =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
            github_username="${BASH_REMATCH[1]}"
            repo_name="${BASH_REMATCH[2]}"
            echo -e "${BLUE}   Parsed: $github_username/$repo_name${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No remote configured${NC}"
        echo -e "${YELLOW}   Run: ./setup-github.sh [username]${NC}"
    fi
else
    echo -e "${RED}❌ Not a Git repository${NC}"
fi

echo

# Check local development server
echo -e "${BLUE}🌐 Checking local development capabilities...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python3 available${NC}"
    echo -e "${BLUE}   Version: $(python3 --version)${NC}"
else
    echo -e "${RED}❌ Python3 not found${NC}"
fi

# Check if development server script is executable
if [ -x "dev-server.sh" ]; then
    echo -e "${GREEN}✅ Development server script executable${NC}"
else
    echo -e "${YELLOW}⚠️  Development server script not executable${NC}"
    echo -e "${YELLOW}   Run: chmod +x dev-server.sh${NC}"
fi

# Test if we can start a server on an available port
test_port=8090
if ! lsof -Pi :$test_port -sTCP:LISTEN -t > /dev/null 2>&1; then
    echo -e "${BLUE}🧪 Testing local server startup...${NC}"
    python3 -m http.server $test_port > /dev/null 2>&1 &
    test_server_pid=$!
    sleep 2
    
    if check_url "http://localhost:$test_port" "Local test server" 5; then
        echo -e "${GREEN}✅ Local server test passed${NC}"
    else
        echo -e "${RED}❌ Local server test failed${NC}"
    fi
    
    kill $test_server_pid > /dev/null 2>&1 || true
else
    echo -e "${YELLOW}⚠️  Port $test_port in use, skipping server test${NC}"
fi

echo

# Check GitHub Pages (if remote is configured)
if [ -n "${github_username:-}" ] && [ -n "${repo_name:-}" ]; then
    echo -e "${BLUE}🌍 Checking GitHub Pages deployment...${NC}"
    github_pages_url="https://$github_username.github.io/$repo_name"
    
    echo -e "${BLUE}   Testing: $github_pages_url${NC}"
    if check_url "$github_pages_url" "GitHub Pages" 15; then
        echo -e "${GREEN}✅ GitHub Pages is live!${NC}"
        echo -e "${BLUE}   🎉 Live Demo: $github_pages_url${NC}"
    else
        echo -e "${YELLOW}⚠️  GitHub Pages not yet available${NC}"
        echo -e "${YELLOW}   • May take 2-10 minutes after first push${NC}"
        echo -e "${YELLOW}   • Check repository settings → Pages${NC}"
        echo -e "${YELLOW}   • URL will be: $github_pages_url${NC}"
    fi
fi

echo

# Summary
echo -e "${BLUE}📋 Infrastructure Summary:${NC}"
if [ -n "${github_username:-}" ] && [ -n "${repo_name:-}" ]; then
    echo -e "${GREEN}GitHub Repository:${NC} https://github.com/$github_username/$repo_name"
    echo -e "${GREEN}Live Demo URL:${NC} https://$github_username.github.io/$repo_name"
else
    echo -e "${YELLOW}GitHub Repository:${NC} Not yet configured"
    echo -e "${YELLOW}Live Demo URL:${NC} Will be available after GitHub setup"
fi
echo -e "${GREEN}Local Development:${NC} ./dev-server.sh (Port 8080 by default)"
echo -e "${GREEN}Documentation:${NC} README.md, DEPLOYMENT.md"

echo
echo -e "${GREEN}🎯 Next Steps:${NC}"
if [ -z "${github_username:-}" ]; then
    echo -e "${YELLOW}1. Run: ./setup-github.sh [your-github-username]${NC}"
    echo -e "${YELLOW}2. Wait 2-3 minutes for GitHub Pages${NC}"
    echo -e "${YELLOW}3. Test the live demo URL${NC}"
else
    echo -e "${GREEN}1. Start local development: ./dev-server.sh${NC}"
    echo -e "${GREEN}2. Make changes and test locally${NC}"
    echo -e "${GREEN}3. Push changes: git add . && git commit -m 'YOUR MESSAGE' && git push${NC}"
    echo -e "${GREEN}4. Check live demo updates automatically${NC}"
fi

echo -e "${BLUE}📚 For more info, see: DEPLOYMENT.md${NC}"