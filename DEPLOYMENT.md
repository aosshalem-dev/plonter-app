# 🚀 Deployment & Infrastructure Guide

This document outlines the complete deployment infrastructure for the Plonter Arabic Syntax Analyzer.

## 📋 Quick Start

### Initial Setup (One-time)

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Or download from: https://cli.github.com/
   ```

2. **Run the setup script**:
   ```bash
   ./setup-github.sh [your-github-username]
   ```

3. **Verify deployment**:
   - Check repository: `https://github.com/[username]/plonter-app`
   - Test live demo: `https://[username].github.io/plonter-app`
   - Test local server: `http://localhost:8080`

## 🌐 Infrastructure Components

### 1. GitHub Repository
- **Public repository** with professional structure
- **Main branch** for production deployments
- **Feature branches** for development work
- **Issues tracking** for bug reports and feature requests

### 2. GitHub Pages Deployment
- **Automatic deployment** from main branch
- **Custom domain support** (optional)
- **HTTPS enabled** by default
- **Live demo** updates on every push

### 3. Local Development Server
- **Python HTTP server** for instant local testing
- **Hot reload** capability (refresh browser to see changes)
- **Port 8080** by default (configurable)
- **Identical behavior** to production environment

## 🔄 Development Workflow

### For Feature Development

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start local development server**:
   ```bash
   npm run dev
   # or
   python -m http.server 8080
   ```

3. **Make changes and test locally**:
   - Edit files in your preferred editor
   - Refresh browser to see changes
   - Test in multiple browsers/devices

4. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "FEATURE: Your descriptive commit message"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**:
   - Go to GitHub repository
   - Create PR from feature branch to main
   - Add description and screenshots
   - Request review if working in team

6. **Deploy to production**:
   ```bash
   git checkout main
   git pull origin main
   git merge feature/your-feature-name
   git push origin main
   ```

### For Hotfixes

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/urgent-fix-name
   ```

2. **Make minimal necessary changes**
3. **Test thoroughly**
4. **Push and merge immediately**:
   ```bash
   git checkout main
   git merge hotfix/urgent-fix-name
   git push origin main
   ```

## 🤖 AI Agent Integration

This project is optimized for AI agent assistance:

### Email-to-Implementation Workflow

1. **Receive email request** with:
   - Clear feature description
   - Expected behavior
   - Screenshots/mockups (if applicable)

2. **AI Agent processes request**:
   - Creates feature branch
   - Implements changes
   - Tests locally
   - Pushes to GitHub
   - Creates pull request

3. **Human review** (optional):
   - Review PR on GitHub
   - Test live demo
   - Approve or request changes

4. **Automatic deployment**:
   - Merge triggers GitHub Pages rebuild
   - Live demo updates within 2-3 minutes

### Communication Format

**For feature requests**, email should include:
```
Subject: [PLONTER] Feature Request: [Brief Description]

Description:
- What feature you want
- How it should work
- Why it's needed

Acceptance Criteria:
- [ ] Specific behavior 1
- [ ] Specific behavior 2
- [ ] Testing requirements

Priority: High/Medium/Low
```

**For bug reports**:
```
Subject: [PLONTER] Bug Report: [Brief Description]

Steps to Reproduce:
1. Go to...
2. Click on...
3. See error

Expected: What should happen
Actual: What actually happens
Browser: Chrome/Firefox/Safari
URL: [specific page if relevant]
```

## 🧪 Testing Strategy

### Manual Testing Checklist

**Before every deployment:**
- [ ] Load main page successfully
- [ ] Select exercise category works
- [ ] Can choose and load sentences
- [ ] Word clicking and analysis works
- [ ] Grammatical properties can be set
- [ ] Syntactic relationships can be drawn
- [ ] Search functionality works
- [ ] Responsive design on mobile
- [ ] RTL Hebrew text displays correctly

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Performance Testing
- [ ] Page loads within 3 seconds
- [ ] No JavaScript errors in console
- [ ] Smooth interactions on all devices
- [ ] Large sentences render properly

## 📊 Monitoring & Analytics

### GitHub Insights
- **Traffic analytics** via GitHub repository insights
- **Popular content** tracking
- **Referrer information**
- **Clone/download statistics**

### Error Tracking
- Browser console errors (manual monitoring)
- User feedback via GitHub Issues
- Email reports for critical issues

## 🔧 Configuration Files

### Package.json Scripts
```json
{
  "scripts": {
    "start": "python -m http.server 8000",
    "dev": "python -m http.server 8080",
    "serve": "python3 -m http.server 8080"
  }
}
```

### GitHub Pages Configuration
- **Source**: Deploy from main branch / root
- **Custom domain**: Optional (configure in repository settings)
- **Enforce HTTPS**: Enabled
- **Build source**: Static HTML/CSS/JS (no Jekyll)

## 🚨 Troubleshooting

### Common Issues

**GitHub Pages shows 404**:
- Wait 2-3 minutes after first push
- Check repository settings → Pages
- Verify index.html is in root directory

**Local server not working**:
```bash
# Check if port is in use
lsof -i :8080

# Try different port
python -m http.server 8081
```

**Permission issues with setup script**:
```bash
chmod +x setup-github.sh
```

**Git authentication problems**:
```bash
gh auth status
gh auth login
```

### Emergency Rollback

If deployment breaks the live demo:
```bash
# Find last working commit
git log --oneline

# Revert to working commit
git revert [commit-hash]
git push origin main
```

## 📞 Support

For technical issues:
1. Check this documentation first
2. Search existing GitHub Issues
3. Create new Issue with detailed description
4. For urgent issues, email directly

---

**Last Updated**: {{ current_date }}
**Version**: 1.0.0