# Technical Documentation - פלונטר

## Architecture Overview

פלונטר is a single-page application built with vanilla JavaScript following a modular architecture. The app uses a component-based approach without a framework, making it lightweight and easy to understand.

## Core Components

### 1. Data Layer (`js/stages.js`)

**Purpose**: Contains all sentence data and stage management functions.

**Key Data Structure**:
```javascript
const STAGES = {
    workbook: [...],  // חוברת exercises
    midterm: [...]    // תרגיל אמצע exercises
};
```

**Key Functions**:
- `getAllStages()` - Returns all sentences sorted by number
- `getStageById(id)` - Retrieves specific sentence by ID
- `searchStages(query)` - Filters sentences by content or number

### 2. Grammar System (`js/partsOfSpeech.js`)

**Purpose**: Defines the complete Hebrew-Arabic grammatical taxonomy.

**Key Features**:
- **Hierarchical Structure**: Three main categories (noun, verb, particle) with subtypes
- **Detailed Properties**: Each POS has configurable grammatical features
- **Homonymy Support**: Multiple values per grammatical feature
- **Validation Rules**: Default values and constraints

**Data Structures**:
```javascript
// Main hierarchy
const POS_HIERARCHY = {
    noun: { name: 'שם', subTypes: {...} },
    verb: { name: 'פועל', subTypes: {...} },
    particle: { name: 'מילית', subTypes: {...} }
};

// Detailed properties for each POS
const PARTS_OF_SPEECH = {
    verb: {
        name: 'פועل',
        details: {
            root: { type: 'text', multi: true },
            binyan: { type: 'multiselect', options: VERB_FORMS },
            // ... more properties
        }
    }
    // ... other POS definitions
};
```

### 3. Word Model (`js/word.js`)

**Purpose**: Defines the Word class and methods for managing word-level data.

**Class Structure**:
```javascript
class Word {
    constructor(id, text) {
        this.id = id;
        this.text = text;
        this.partsOfSpeech = []; // Array of grammatical analyses
    }
    
    addPartOfSpeech(type, details) // Add grammatical annotation
    removePartOfSpeech(posId)       // Remove annotation
    updatePartOfSpeechDetails(posId, details) // Update properties
    normalizeDetails(type, details) // Handle homonymy arrays
}
```

**Key Features**:
- **Multiple Analyses**: Each word can have multiple grammatical interpretations
- **Normalization**: Converts single values to arrays for homonymy support
- **Unique IDs**: Each part-of-speech gets a unique identifier

### 4. Syntactic Validation (`js/combinations.js`)

**Purpose**: Implements grammatical validation rules for word relationships.

**Core Validation Function**:
```javascript
function validateCombination(part1, part2, wordId1, wordId2, words) {
    // Returns: { valid, complete, message, type }
}
```

**Validation Types**:
- **Adjacency Check**: Words must be directly adjacent
- **Agreement Rules**: מימי (MIMI) matching for noun-adjective
- **Construct State**: סמיכות validation for noun-noun
- **Demonstrative**: כינוי רמז + noun agreement
- **Prepositional Phrases**: מילית יחס + noun combinations

**Helper Functions**:
- `valuesMatch(value1, value2)` - Handles homonymy in comparisons
- `arraysIntersect(arr1, arr2)` - Checks case agreement
- `calculateDefiniteness()` - Recursive definiteness calculation

### 5. Main Application (`js/app.js`)

**Purpose**: Coordinates all components and manages application state.

**Application State**:
```javascript
let currentSentence = "";      // Current Arabic sentence
let currentStageId = null;     // Current exercise ID
let words = [];                // Array of Word objects
let combinations = [];         // Syntactic relationships
let arches = [];              // Visual arch data
let logicalConnections = [];   // Logical relationship data
```

**Key Functions**:
- `init()` - Application initialization
- `loadStage(stageId)` - Load specific exercise
- `renderSentence()` - Display sentence with interactive words
- `showPartOfSpeechModal()` - Grammar selection interface
- `validateCombinations()` - Real-time syntactic validation

## User Interface Flow

### 1. Welcome Screen
- Display exercise categories (חוברת, תרגיל אמצע)
- Search functionality for sentences
- Navigation to specific exercises

### 2. Analysis Screen
- **Word Interaction**: Click words to add grammatical annotations
- **Modal Interface**: Hierarchical part-of-speech selection
- **Details Panel**: Detailed grammatical property configuration
- **Visual Feedback**: Color-coded parts of speech with column-based theming

### 3. Validation System
- **Real-time Feedback**: Immediate validation of grammatical relationships
- **Visual Indicators**: Color-coded connections (valid/invalid/incomplete)
- **Error Messages**: Contextual Hebrew explanations

## Data Flow

1. **Sentence Selection**: User chooses from STAGES data
2. **Word Tokenization**: Sentence split into interactive Word objects
3. **Grammar Assignment**: User adds parts of speech with properties
4. **Relationship Creation**: User draws connections between words
5. **Validation**: System validates relationships using combination rules
6. **Visual Feedback**: UI updates with validation results

## Styling and Theming

### CSS Architecture
- **RTL Support**: Complete right-to-left layout
- **Component-based**: Modular CSS with clear component boundaries
- **Color Coding**: Four-column color scheme for part-of-speech categories
- **Responsive**: Mobile-friendly design

### Color Scheme by Grammar Category:
- **Column 0** (Blue): כינוי רמז, כינוי גוף
- **Column 1** (Purple): שם עצם, שם תואר  
- **Column 2** (Green): פועל, תואר הפועל
- **Column 3** (Orange): מילית יחס, מילת שאלה

## Extensibility Points

### Adding New Sentences
Modify `js/stages.js`:
```javascript
STAGES.workbook.push({
    id: 'new-id',
    number: 'X.Y', 
    sentence: 'Arabic sentence text',
    category: 'workbook'
});
```

### Adding Grammar Rules
Extend `js/combinations.js`:
```javascript
function validateNewRule(part1, part2) {
    // Custom validation logic
    return { valid, complete, message, type };
}
```

### Custom Part-of-Speech Types
Update `js/partsOfSpeech.js`:
```javascript
PARTS_OF_SPEECH.newType = {
    name: 'Hebrew Name',
    details: { /* property definitions */ }
};
```

## Performance Considerations

- **No External Dependencies**: Vanilla JS for fast loading
- **Client-side Only**: No server requirements
- **Efficient DOM Updates**: Selective re-rendering
- **Memory Management**: Cleanup of event listeners and objects

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+)
- **Mobile Support**: Responsive design for tablets and phones
- **RTL Support**: Full right-to-left text and layout support
- **SVG Graphics**: Vector-based relationship visualization

## Development Guidelines

### Code Style
- **Modular Functions**: Single responsibility principle
- **Clear Naming**: Hebrew comments with English function names
- **Consistent Patterns**: Standardized data structures
- **Error Handling**: Graceful degradation

### Testing Approach
- **Manual Testing**: Use provided sentence sets
- **Validation Testing**: Test all grammatical combination rules
- **UI Testing**: Cross-browser and device testing
- **Regression Testing**: Ensure changes don't break existing functionality

## AI Agent Integration Notes

This codebase is optimized for AI agent collaboration:

1. **Clear Documentation**: Comprehensive inline and external docs
2. **Modular Architecture**: Easy to understand and modify components
3. **Consistent Patterns**: Standardized approaches throughout
4. **Git-Ready**: Proper version control structure
5. **Self-Contained**: No external dependencies to manage