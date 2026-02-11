# Roof System Bug Fixes - Plonter App

## Summary
All bugs in the roof/bracket (גג) system for syntactic analysis have been successfully fixed.

## Bugs Fixed

### 1. Screen Freezes After Creating One Roof ✓
**Problem**: After creating one roof, the screen would freeze and users couldn't interact with the app anymore.

**Root Cause**: The `openSyntacticRoleModalForNewArch()` function was creating complex event handler reassignments that conflicted with each other, leaving the app in an inconsistent state.

**Solution**:
- Simplified `openSyntacticRoleModalForNewArch()` to delegate to `openSyntacticRoleModal()` instead of duplicating logic
- Added proper cleanup code in both save and cancel handlers to reset state variables:
  - `firstArchClick = null`
  - `archCreationMode = false`
  - Removed `.arch-selected` class from all word blocks
  - Cleared `modal._currentArch`

**Files Modified**:
- `/js/app.js` (lines 1194-1198, 1337-1347, 1358-1365)

---

### 2. Lines Appear in Wrong/Flipped Positions ✓
**Problem**: Vertical and horizontal lines of roofs were appearing in incorrect positions, especially in RTL (right-to-left) mode.

**Root Cause**: The positioning logic was confused about RTL coordinates. In RTL Arabic:
- Words flow right-to-left in reading order
- BUT on screen: left side = smaller x coordinate, right side = larger x coordinate
- The code was mixing up these two concepts

**Solution**:
Fixed the edge calculation logic for both single-word and two-word roofs:

**Single word roofs**:
```javascript
// OLD (wrong):
rightEdge = rect1.left - containerRect.left;  // Wrong!
leftEdge = rect1.left + rect1.width - containerRect.left;

// NEW (correct):
leftEdge = rect1.left - containerRect.left;  // Left edge = smaller x
rightEdge = rect1.left + rect1.width - containerRect.left;  // Right edge = larger x
```

**Two-word roofs**:
```javascript
// OLD (wrong):
rightEdge = firstRect.left - containerRect.left;
leftEdge = secondRect.left + secondRect.width - containerRect.left;

// NEW (correct):
rightEdge = firstRect.left + firstRect.width - containerRect.left;  // Rightmost position
leftEdge = secondRect.left - containerRect.left;  // Leftmost position
```

**Files Modified**:
- `/js/app.js` (lines 939-964, 999-1063)

---

### 3. Horizontal Top Line Not Visible ✓
**Problem**: The horizontal line at the top of the roof was not visible or was being clipped.

**Root Cause**:
1. SVG `overflow` property was not set to `visible`, causing lines to be clipped at container boundaries
2. Insufficient padding at the top of the sentence container

**Solution**:
- Set `svg.style.overflow = 'visible'` on the arch SVG element
- Added `padding-top: 100px` to `.sentence-container` in CSS
- Added `overflow-y: visible` to `.sentence-container` to allow roofs to extend above

**Files Modified**:
- `/js/app.js` (line 902)
- `/css/style.css` (lines 66, 72)

---

### 4. Role Label Cut Off ✓
**Problem**: Syntactic role labels (like "לוואי צירוף יחס") were being cut off because the label background was too narrow.

**Root Cause**: The label background width was hardcoded to 70px, which is too narrow for longer Hebrew text.

**Solution**:
Implemented dynamic width calculation:
```javascript
// Calculate dynamic width based on text length
const estimatedTextWidth = labelText.length * 9;  // ~9px per Hebrew char
const labelWidth = Math.max(70, estimatedTextWidth + 20);  // Min 70px, with 20px padding
```

The label background now adjusts to fit the text with proper padding.

**Files Modified**:
- `/js/app.js` (lines 1082-1087)

---

## Testing Recommendations

1. **Basic roof creation**:
   - Click word A, then word C → select a syntactic role → verify roof appears correctly
   - Create multiple roofs in sequence → verify no freezing

2. **Single-word roofs**:
   - Click word A, click word A again → select role → verify roof over single word

3. **Visual verification**:
   - Check that vertical lines appear at the correct edges of words
   - Verify horizontal line is visible at the top
   - Confirm all role labels are fully visible, even long ones like "לוואי צירוף יחס"

4. **Nested roofs**:
   - Create a roof over multiple words
   - Create smaller roofs inside → verify they appear lower (shorter vertical lines)

5. **Edit and delete**:
   - Click role label → verify menu opens and can change role
   - Enable delete mode → click roof → verify it deletes

6. **Cancel behavior**:
   - Click word to start creating roof
   - Dismiss modal without selecting → verify can immediately create another roof

---

## Technical Details

### RTL Coordinate System
- **Reading order**: Right-to-left (first word on right, last word on left)
- **Screen coordinates**: Left = smaller x, Right = larger x
- **Word indexing**: Lower index = appears first (on right), higher index = appears later (on left)

### Roof Structure
```
     ┌─── label ───┐
     │             │
  ┌──┴─────────────┴──┐
  │                   │
  │  word1    word2   │
```

- Left vertical line: at leftmost position (smaller x)
- Horizontal line: spans from left to right
- Right vertical line: at rightmost position (larger x)
- Label: centered, with dynamic width

---

## Files Modified

1. **app.js** (`/js/app.js`):
   - Simplified `openSyntacticRoleModalForNewArch()`
   - Fixed RTL positioning logic for roof edges
   - Fixed vertical line coordinates
   - Added SVG overflow property
   - Implemented dynamic label width
   - Added cleanup code in modal handlers

2. **style.css** (`/css/style.css`):
   - Added top padding to sentence container
   - Enabled vertical overflow for roofs

3. **fix_roof_system.py** (script to apply fixes):
   - Automated all the fixes above

---

## Status: ✓ COMPLETE

All reported bugs have been fixed and the roof system should now work correctly.
