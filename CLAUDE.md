# Plonter — Project-Specific Context

## Architecture (do not break)
- Words must stay on **one horizontal line** (flex-wrap: nowrap). The arch/roof SVG draws lines between word positions — if words wrap to multiple lines, all arch math breaks.
- `overflow: visible` on `.sentence-container` is critical for desktop roof display. Mobile overrides this with `overflow-x: auto` for horizontal scroll, which per CSS spec forces `overflow-y` to auto too. Roofs survive via `padding-top` (60-100px). **Deeply nested roofs may clip on mobile.**
- All JS files (app.js, combinations.js, partsOfSpeech.js, stages.js, word.js) are layout-agnostic. CSS-only changes are safe for responsive work.

## Testing
```bash
python3 test_roofs.py              # Desktop only (1280x900)
python3 test_roofs.py --mobile     # Mobile only (375x667)
python3 test_roofs.py --all        # Both
python3 test_mobile_screenshots.py # Screenshots at 5 viewports for visual review
```
- test_roofs.py uses port **8765**, test_mobile_screenshots.py uses port **8766**. Don't collide.
- After ANY CSS change, run `--all` to catch regressions. Arch SVG coordinates depend on word spacing, font size, gap, and padding.

## Mobile breakpoints (css/style.css, appended after line 1608)
- **768px**: Horizontal scroll, full-width details panel, 44px touch targets
- **600px**: Header scaling, 2-col modal grids, single-col forms
- **480px**: Ultra-compact, single-col everything, stacked buttons, hidden subtitle

## Key Code Map (app.js ~3500 lines)
- **Data structures** (line ~9-11): `words[]`, `combinations[]`, `arches[]`
- **Arch object**: `{id, wordId1, wordId2, height, syntacticRole, isMainRoof, model, isClause, externalRole, isPending}`
- **Combination object**: `{wordId1, posId1, wordId2, posId2, complete, type, isDemonstrative}`
- **Arch creation flow**: `handleWordClickForArch()` (line ~763) → first click sets `firstArchClick`, second click calls `createArch()` (line ~827) or `createSingleWordArch()` (line ~794)
- **Height calculation**: `calculateArchHeight()` (line ~866) — base 80px, minus 40px per nesting level
- **SVG rendering**: `renderArches()` (line ~889-1211) — draws vertical+horizontal lines for each roof, labels, hit areas
- **Syntactic role modal**: `openSyntacticRoleModal()` (line ~1227-1422) — 3-column grid of 9 roles, clause upgrade checkbox
- **POS details saving**: `savePartOfSpeechDetails()` (line ~3279-3427)
- **POS detail panel creation**: `createGenderNumberSelector()` (line ~2620) — uses class `gender-number-cell-btn`
- **Combination validation**: `combinations.js` — `checkAdjacency()` (line ~4-12), `validateCombination()` (line ~58+)
- **First-click indicator**: Halo rectangle SVG at line ~1220-1257

## Known Bugs & Patterns (discovered Feb 2026)

### FIXED (v3): CSS selector mismatch → `.gender-number-cell-btn` used consistently now.
### FIXED (v3): SVG scroll compensation → all calculations add `scrollLeft`/`scrollTop`.
### FIXED (v3): Arch word order → normalized in `createArch()` (wordId1 < wordId2).
### FIXED (v3): Single-word arch height → uses `calculateArchHeight()` now.
### FIXED (v3): Adjacency → phrase-aware via `getPhraseSpan()` in combinations.js.
### FIXED (v3): Matryoshka hierarchy → `validateArchHierarchy()` blocks partial overlaps.
### FIXED (v3): First-click indicator → halo rectangle, not dashed line.
### FIXED (v3): Roof menu → 3 expandable categories (נושא/נשוא, משלימי פועל, רכיבים ישירים).
### FIXED (v3.1): Adjective/demonstrative defaults → now get gender/number/definiteness on creation.

### Default details only applied to nouns (LESSON)
`selectPartOfSpeech()` and `getDefaultDetails()` originally only set defaults for nouns. Adjectives/demonstratives got empty details, causing combination validation to fail with "missing gender". **Lesson**: any POS type that participates in combination validation (needs gender/number/definiteness) MUST get defaults on creation.

### Amitai's design principles (from his emails)
- **Hierarchical roofs only** — matryoshka/babushka nesting. No partial overlaps. A word alone in a roof group can't create more roofs.
- **Selection order is irrelevant** — only which words are selected matters, not click order.
- **Roof menu should be category-based**: נושא/נשוא, משלימי פועל (מושא/תיאור), רכיבים ישירים (גרעין + לוואי variants). Expandable, touch-friendly.
- **Visual selection = halo rectangle**, not dashed line. Rectangle above word up to future roof height.

## Files that are NOT tracked in git
- `fix_roof_system.py` — utility script, untracked
- `test_screenshots/` — generated output, untracked
