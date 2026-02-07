# פלונטר - Arabic Syntax Analysis Tool

## Description

**פלונטר** (Plonter) is an educational web application designed to teach the fundamentals of Arabic syntax analysis in Hebrew. The app provides interactive exercises where students can analyze Arabic sentences by identifying parts of speech, their grammatical properties, and syntactic relationships.

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

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plonter-app
```

2. Open `index.html` in a web browser:
```bash
open index.html
# or
python -m http.server 8000  # for local server
```

## Development Workflow

This project is set up for collaborative development with the following workflow:

### For Feature Requests & Bug Reports
1. **Email requests** to the project maintainer with:
   - Clear description of the feature/bug
   - Expected behavior
   - Screenshots if applicable

### For Developers
1. **Git Workflow**: Standard Git flow with feature branches
2. **Code Structure**: Modular JavaScript with clear separation of concerns
3. **Documentation**: All major functions are documented
4. **Testing**: Manual testing with provided sentence sets

### AI Agent Integration
This project is prepared for AI agent assistance:
- Clear modular structure for easy code understanding
- Comprehensive documentation for context
- Standardized coding patterns for consistency
- Git-ready for version control and collaboration

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

## Contact

For questions, feature requests, or bug reports, please contact the project maintainer.