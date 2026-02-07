# פלונטר - Arabic Syntax Analysis Tool

[![Deploy to GitHub Pages](https://github.com/zvishalem/plonter-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/zvishalem/plonter-app/actions/workflows/deploy.yml)

## 🌟 Live Demo

**🚀 [Try it now: https://zvishalem.github.io/plonter-app](https://zvishalem.github.io/plonter-app)**

## Description

**פלונטר** (Plonter) is an educational web application designed to teach the fundamentals of Arabic syntax analysis in Hebrew. The app provides interactive exercises where students can analyze Arabic sentences by identifying parts of speech, their grammatical properties, and syntactic relationships.

## 🚀 Quick Start

### For Users
Just visit the **[Live Demo](https://zvishalem.github.io/plonter-app)** - no installation needed!

### For Developers
```bash
# Clone the repository
git clone https://github.com/zvishalem/plonter-app.git
cd plonter-app

# Start local development server
./dev-server.sh

# Open browser to: http://localhost:8080
```

### For Contributors
```bash
# Set up complete GitHub infrastructure
./setup-github.sh [your-github-username]

# Verify everything works
./verify-setup.sh
```

📚 **Full documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup guide.

## What it Does

- **Interactive Syntax Analysis**: Students analyze Arabic sentences word by word
- **Part of Speech Identification**: Each word can be tagged with multiple grammatical categories (noun, verb, preposition, etc.)
- **Grammatical Properties**: Detailed grammatical information for each word (gender, number, definiteness, verb forms, etc.)
- **Syntactic Relationships**: Visual connections between words showing grammatical relationships
- **Exercise Categories**: Two main categories - "חוברת" (Workbook) and "תרגיל אמצע" (Midterm Exercise)
- **Hebrew Interface**: All interface text is in Hebrew, but analyzes Arabic sentences

## Features

### Core Functionality
- **Sentence Selection**: Choose from pre-defined Arabic sentences organized by difficulty
- **Word Analysis**: Click on words to add grammatical annotations
- **Part of Speech Tagging**: Comprehensive Hebrew taxonomy for Arabic grammar:
  - שם עצם (Noun)
  - שם תואר (Adjective) 
  - פועל (Verb)
  - כינוי רמז (Demonstrative)
  - כינוי גוף (Personal Pronoun)
  - מילית יחס (Preposition)
  - And more...

### Advanced Features
- **Homonymy Support**: Multiple grammatical interpretations per word
- **Syntactic Validation**: Real-time validation of grammatical relationships
- **Visual Connections**: SVG-based arches showing syntactic relationships
- **Search Functionality**: Search through available sentences
- **Hebrew-Arabic Transliteration**: Built-in transliteration system

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **No Backend**: Pure static application, no database
- **Responsive Design**: Works on desktop and mobile
- **RTL Support**: Right-to-left layout for Hebrew interface

## File Structure

```
├── index.html          # Main application page
├── css/
│   └── style.css      # Application styles with RTL support
├── js/
│   ├── app.js         # Main application logic
│   ├── stages.js      # Sentence data and stage management
│   ├── partsOfSpeech.js # Grammatical definitions and hierarchies
│   ├── word.js        # Word data model and methods
│   └── combinations.js # Syntactic validation rules
└── docs/              # Documentation and project info
```

## Installation & Development

### 🌐 No Installation Needed for Users
The app runs entirely in your browser - just visit the **[Live Demo](https://zvishalem.github.io/plonter-app)**!

### 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zvishalem/plonter-app.git
   cd plonter-app
   ```

2. **Start development server**:
   ```bash
   # Easy way (recommended)
   ./dev-server.sh
   
   # Manual way
   python -m http.server 8080
   
   # Using npm scripts
   npm run dev
   ```

3. **Open in browser**: http://localhost:8080

### 🔧 Complete Infrastructure Setup

For contributors setting up GitHub infrastructure:

```bash
# One-time setup (requires GitHub CLI)
./setup-github.sh [your-github-username]

# Verify everything works
./verify-setup.sh
```

This sets up:
- ✅ GitHub repository with proper structure
- ✅ GitHub Pages deployment (live demo)  
- ✅ Local development server
- ✅ CI/CD workflows
- ✅ Professional documentation

## Development Workflow

This project uses a modern, AI-assisted development workflow optimized for rapid iteration and collaboration.

### 🤖 AI Agent Integration

**Email-to-Implementation Pipeline**:
1. **Send feature request** via email with clear description
2. **AI agent processes** request and creates implementation
3. **Automatic deployment** to live demo for immediate testing
4. **GitHub tracking** with full audit trail

**Communication Format**:
```
Subject: [PLONTER] Feature: [Brief Description]

Description:
- What you want to add/change
- How it should work  
- Why it's needed

Acceptance Criteria:
- [ ] Specific behavior 1
- [ ] Specific behavior 2
```

### 👨‍💻 Developer Workflow

**Standard Development Process**:
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Start local development
./dev-server.sh

# 3. Make changes and test locally
# Edit files, refresh browser to see changes

# 4. Commit and push
git add .
git commit -m "FEATURE: Your descriptive message"  
git push origin feature/your-feature-name

# 5. Create pull request on GitHub
# 6. Merge to main triggers automatic deployment
```

**Infrastructure Features**:
- ✅ **GitHub Pages**: Automatic deployment on every push
- ✅ **Local Development**: Hot reload with Python server
- ✅ **CI/CD Pipeline**: Automated testing and validation
- ✅ **Professional Structure**: Proper branching and documentation
- ✅ **Security**: No sensitive data exposure

## Usage Guide

### For Students
1. **Select Exercise**: Choose from "חוברת" or "תרגיל אמצע"
2. **Pick Sentence**: Select an Arabic sentence to analyze
3. **Analyze Words**: Click on each word to add grammatical information
4. **Set Properties**: Fill in detailed grammatical properties
5. **Create Relationships**: Draw connections between related words
6. **Validate**: System provides real-time feedback on accuracy

### For Instructors
- **Add Sentences**: Modify `js/stages.js` to add new exercises
- **Customize Grammar**: Adjust `js/partsOfSpeech.js` for different grammatical frameworks
- **Validation Rules**: Update `js/combinations.js` for specific syntactic rules

## Linguistic Framework

The application uses a Hebrew-language interface to teach Arabic grammar, featuring:

### Parts of Speech (Hebrew Labels)
- **שם עצם** (Noun) - with gender, number, definiteness, case
- **שם תואר** (Adjective) - with agreement features
- **פועל** (Verb) - with root, binyan (form), tense, voice, person/gender
- **כינוי רמז** (Demonstrative) - with gender/number agreement
- **מילית יחס** (Preposition) - governing case
- And others...

### Syntactic Relationships
- **מימי** (MIMI Agreement) - gender, number, case, definiteness matching
- **סמיכות** (Construct State) - noun-noun possessive relationships
- **צירופי יחס** (Prepositional Phrases) - preposition + noun combinations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes with clear commit messages
4. Test thoroughly with existing sentences
5. Submit a pull request with description of changes

## License

This educational tool is designed for academic use in Arabic language instruction.

## 🏗️ Infrastructure

### Production Environment
- **Live Demo**: https://zvishalem.github.io/plonter-app
- **Repository**: https://github.com/zvishalem/plonter-app  
- **CI/CD**: GitHub Actions with automated testing
- **Hosting**: GitHub Pages (free, reliable, global CDN)

### Development Environment  
- **Local Server**: `./dev-server.sh` (Port 8080)
- **Hot Reload**: Refresh browser to see changes
- **Testing**: Manual testing with comprehensive checklist
- **Documentation**: README.md, DEPLOYMENT.md, inline code docs

### Key Scripts
- `./setup-github.sh` - Complete GitHub infrastructure setup
- `./dev-server.sh` - Local development server management
- `./verify-setup.sh` - Infrastructure verification
- `npm run dev` - Alternative development server

## 📞 Contact & Support

### For Feature Requests & Bug Reports
- **GitHub Issues**: https://github.com/zvishalem/plonter-app/issues
- **Email**: Send requests with detailed description
- **Live Demo**: Test at https://zvishalem.github.io/plonter-app

### For Technical Issues
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) documentation
2. Run `./verify-setup.sh` for diagnostics
3. Search existing GitHub Issues  
4. Create new Issue with detailed description