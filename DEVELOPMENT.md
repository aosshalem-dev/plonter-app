# Development Guide - פלונטר

## Development Workflow for Collaborative Environment

This guide is designed for a development workflow where feature requests come via email and are implemented by AI agents or human developers.

## Request Processing Workflow

### 1. Feature Request Format

**Email Subject**: `[PLONTER] Feature Request: [Brief Description]`

**Email Content Should Include**:
```
Feature Type: [Bug Fix | New Feature | Enhancement | Content Update]
Priority: [High | Medium | Low]
Description: [Detailed description of request]
Expected Behavior: [What should happen]
Current Behavior: [What currently happens - for bugs]
Screenshots: [If applicable]
Affected Files: [If known]
```

### 2. Development Process

1. **Triage**: Categorize request type and priority
2. **Analysis**: Understand requirements and affected components
3. **Implementation**: Make necessary code changes
4. **Testing**: Verify changes work correctly
5. **Documentation**: Update relevant docs
6. **Commit**: Create clear commit message
7. **Deploy**: Update live version (if applicable)

## Common Development Tasks

### Adding New Sentences

**File**: `js/stages.js`

**Process**:
1. Add new entry to appropriate category:
```javascript
STAGES.workbook.push({
    id: 'unique-id',          // Unique identifier
    number: '3.5',            // Display number
    sentence: 'Arabic text',   // The Arabic sentence
    category: 'workbook'      // workbook or midterm
});
```

2. Test by loading the sentence in the app
3. Commit: `git commit -m "Add sentence 3.5 to workbook exercises"`

### Modifying Grammar Rules

**File**: `js/partsOfSpeech.js`

**Common Changes**:
- Adding new part-of-speech types
- Modifying grammatical properties
- Updating verb forms or other options

**Example - Adding New Verb Time**:
```javascript
// In PARTS_OF_SPEECH.verb.details.time.options
options: ['עבר', 'עתיד', 'עתיד מנצוב', 'עתיד מג\'זום', 'ציווי', 'NEW_TIME']
```

### Updating Validation Rules

**File**: `js/combinations.js`

**Common Tasks**:
- Fixing false positive/negative validations
- Adding new syntactic relationship types
- Modifying agreement rules

**Example - New Validation Rule**:
```javascript
function validateNewCombination(part1, part2) {
    // Validation logic here
    return {
        valid: true/false,
        complete: true/false,
        message: 'Hebrew explanation',
        type: 'valid'/'invalid'/'incomplete'
    };
}
```

### UI/UX Improvements

**File**: `css/style.css`, `js/app.js`

**Common Changes**:
- Layout improvements
- Color scheme adjustments
- Responsive design fixes
- User interaction enhancements

### Bug Fixes

**Process**:
1. **Reproduce**: Confirm the bug exists
2. **Locate**: Find the responsible code
3. **Fix**: Implement solution
4. **Test**: Verify fix works and doesn't break other features
5. **Document**: Update relevant documentation

## Testing Guidelines

### Manual Testing Checklist

**Basic Functionality**:
- [ ] Welcome screen loads correctly
- [ ] Can select and load sentences
- [ ] Words are clickable and interactive
- [ ] Part-of-speech modal opens and functions
- [ ] Grammatical properties can be set
- [ ] Visual connections work properly
- [ ] Validation provides appropriate feedback

**Cross-browser Testing**:
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

**RTL/Hebrew Testing**:
- [ ] Hebrew text displays correctly
- [ ] Right-to-left layout works
- [ ] Arabic text renders properly
- [ ] Mixed Hebrew-Arabic content aligns correctly

### Regression Testing

Before any release:
1. **Test All Sentences**: Verify each sentence loads correctly
2. **Grammar Rules**: Test major grammatical combinations
3. **UI Elements**: Check all interactive components
4. **Validation**: Ensure validation rules work as expected

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for new features
- `feature/description` - Individual feature branches
- `hotfix/description` - Urgent bug fixes

### Commit Message Format
```
[TYPE] Brief description

Longer explanation if needed.

Fixes: #issue-number (if applicable)
```

**Types**: FEAT, FIX, STYLE, REFACTOR, TEST, DOCS

**Examples**:
```
FEAT: Add search functionality to sentence selection
FIX: Correct noun-adjective validation for dual number  
STYLE: Improve mobile responsive layout
DOCS: Update API documentation for Word class
```

### Release Process
1. **Feature Complete**: All planned features implemented
2. **Testing**: Complete manual testing cycle
3. **Documentation**: Update README and technical docs
4. **Tag Release**: `git tag v1.x.x`
5. **Deploy**: Update production version

## AI Agent Guidelines

When working with AI agents on this project:

### Providing Context
- Always include relevant file contents
- Explain the Hebrew-Arabic educational context
- Specify RTL (right-to-left) requirements
- Include validation rule context

### Code Review Points
- **RTL Compatibility**: Ensure new code works with right-to-left layout
- **Hebrew Text**: Verify Hebrew interface text is correct
- **Grammar Accuracy**: Validate linguistic rules are academically sound
- **User Experience**: Consider student and instructor perspectives

### Common AI Agent Tasks
1. **Content Updates**: Adding new sentences or exercises
2. **Bug Fixes**: Correcting validation logic or UI issues
3. **Feature Implementation**: Adding new grammatical analysis tools
4. **Documentation**: Updating guides and API documentation
5. **Refactoring**: Improving code structure and maintainability

## File Organization

```
plonter-app/
├── index.html              # Main application entry point
├── css/
│   └── style.css          # All application styles
├── js/
│   ├── app.js            # Main application controller
│   ├── stages.js         # Sentence data and management
│   ├── partsOfSpeech.js  # Grammar definitions
│   ├── word.js           # Word model and methods
│   └── combinations.js   # Syntactic validation rules
├── docs/                 # Additional documentation
├── README.md            # Project overview and usage
├── TECHNICAL_DOCS.md    # Detailed technical documentation  
├── DEVELOPMENT.md       # This file - development workflow
├── .gitignore           # Git ignore rules
└── package.json         # Project metadata (optional)
```

## Performance Guidelines

### Code Efficiency
- **Minimize DOM Manipulation**: Batch updates where possible
- **Event Listener Management**: Proper cleanup to prevent memory leaks
- **Selective Rendering**: Only update changed elements
- **Data Structure Optimization**: Use appropriate data structures for lookups

### Load Time Optimization
- **Minimal Dependencies**: Keep the app lightweight
- **CSS Organization**: Efficient selector usage
- **JavaScript Bundling**: Consider bundling for production (optional)
- **Asset Optimization**: Optimize any images or resources

## Accessibility Considerations

- **Keyboard Navigation**: Ensure all interactions work without mouse
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Maintain sufficient contrast for readability
- **Text Size**: Ensure text is readable at various zoom levels

## Internationalization Notes

Currently supports:
- **Hebrew Interface**: All UI text in Hebrew
- **Arabic Content**: Sentences to be analyzed
- **RTL Layout**: Proper right-to-left text flow

Future considerations:
- **Multiple Languages**: Interface in other languages
- **Font Support**: Enhanced Arabic font rendering
- **Input Methods**: Better support for Arabic input

## Security Considerations

As a client-side only application:
- **No Server Components**: No backend security concerns
- **Local Storage**: Consider data privacy for any cached information
- **XSS Prevention**: Sanitize any dynamic content (though minimal risk)
- **HTTPS**: Serve over HTTPS in production environments