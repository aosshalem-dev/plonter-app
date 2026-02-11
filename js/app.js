// Main application logic

// Application state
let currentSentence = ""; // Current sentence being analyzed
let currentStageId = null; // Current stage ID
let words = [];
let currentWordId = null;
let currentPartOfSpeechId = null;
let combinations = []; // Array of {posId1, posId2, wordId1, wordId2, complete}
let deleteMode = false; // Delete mode state (for both parts of speech and arches)
let arches = []; // Array of arch/roof data: {id, wordId1, wordId2, height, syntacticRole, isMainRoof, model, isClause, externalRole}
let currentPosCategory = null; // For hierarchical selection
let logicalConnectionMode = false; // Logical connection mode
let firstArchClick = null; // Store first click for two-click arch creation
let archCreationMode = false; // Track if we're in arch creation mode
let logicalConnections = []; // Array of logical connections: {id, wordId1, posId1, wordId2, posId2, type, splitPoint}

// Transliteration: Hebrew to Arabic
function transliterateHebrewToArabic(hebrewText) {
    const transliterationMap = {
        // Two-character combinations (with apostrophe)
        'ט\'': 'ظ', 'ת\'': 'ث', 'ד\'': 'ذ', 'צ\'': 'ض', 'ח\'': 'خ', 'ע\'': 'غ',
        'ב\'': 'ب', 'ג\'': 'ج', 'ז\'': 'ز', 'פ\'': 'ف',
        // Final letters (with apostrophe)
        'ן\'': 'ن', 'ם\'': 'م', 'ף\'': 'ف', 'ץ\'': 'ص', 'ך\'': 'خ',
        // Regular letters
        'א': 'ا', 'ב': 'ب', 'ג': 'ج', 'ד': 'د', 'ה': 'ه', 'ו': 'و', 'ז': 'ز',
        'ח': 'ح', 'ט': 'ط', 'י': 'ي', 'כ': 'ك', 'ל': 'ل', 'מ': 'م', 'נ': 'ن',
        'ס': 'س', 'ע': 'ع', 'פ': 'ف', 'צ': 'ص', 'ק': 'ق', 'ר': 'ر', 'ש': 'ش', 'ת': 'ت',
        // Final letters (without apostrophe - map to regular)
        'ן': 'ن', 'ם': 'م', 'ף': 'פ', 'ץ': 'צ', 'ך': 'כ'
    };
    
    let arabic = '';
    for (let i = 0; i < hebrewText.length; i++) {
        // Check for two-character combinations first (like ט' or ן')
        if (i < hebrewText.length - 1) {
            const twoChar = hebrewText.substr(i, 2);
            if (transliterationMap[twoChar]) {
                arabic += transliterationMap[twoChar];
                i++; // Skip next character
                continue;
            }
        }
        // Single character
        arabic += transliterationMap[hebrewText[i]] || hebrewText[i];
    }
    return arabic;
}

// Get column index for part of speech type (for coloring)
function getPartOfSpeechColumnIndex(type) {
    const typeToColumn = {
        'demonstrative': 0,
        'personalPronoun': 0,
        'relativePronoun': 0,
        'noun': 1,
        'adjective': 1,
        'verb': 2,
        'adverb': 2,
        'preposition': 3,
        'conjunction': 3,
        'subordinating': 3,
        'negation': 3,
        'questionWord': 3
    };
    return typeToColumn[type] !== undefined ? typeToColumn[type] : 0;
}

// Initialize the application
function init() {
    setupEventListeners();
    initWelcomeScreen();
}

// Initialize welcome screen
function initWelcomeScreen() {
    renderStages();
    setupWelcomeScreenListeners();
}

// Render stages on welcome screen
function renderStages() {
    // Render workbook stages
    const workbookContainer = document.getElementById('stages-workbook');
    workbookContainer.innerHTML = '';
    
    STAGES.workbook.forEach(stage => {
        const stageItem = createStageItem(stage);
        workbookContainer.appendChild(stageItem);
    });
    
    // Render midterm stages
    const midtermContainer = document.getElementById('stages-midterm');
    midtermContainer.innerHTML = '';
    
    STAGES.midterm.forEach(stage => {
        const stageItem = createStageItem(stage);
        midtermContainer.appendChild(stageItem);
    });
}

// Create stage item element
function createStageItem(stage) {
    const item = document.createElement('div');
    item.className = 'stage-item';
    item.innerHTML = `
        <div class="stage-number">${stage.number}</div>
        <div class="stage-sentence">${stage.sentence}</div>
    `;
    item.onclick = () => startStage(stage);
    return item;
}

// Start a stage (enter game mode)
function startStage(stage) {
    currentStageId = stage.id;
    currentSentence = stage.sentence;
    
    // Parse sentence into words
    const sentenceWords = currentSentence.split(/\s+/).filter(word => word.trim());
    words = sentenceWords.map((word, index) => createWord(`word_${index}`, word));
    
    // Reset state
    combinations = [];
    arches = [];
    deleteMode = false;
    firstArchClick = null;
    archCreationMode = false;
    
    // Switch screens
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    renderSentence();
    updateModeButtons();
}

// Setup welcome screen event listeners
function setupWelcomeScreenListeners() {
    // Search functionality
    const searchInput = document.getElementById('stage-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            filterStages(query);
        });
    }
    
    // Back to menu button
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            document.getElementById('welcome-screen').style.display = 'block';
            document.getElementById('game-screen').style.display = 'none';
        };
    }
}

// Filter stages by search query
function filterStages(query) {
    if (!query.trim()) {
        renderStages();
        return;
    }
    
    const filtered = searchStages(query);
    
    // Clear containers
    document.getElementById('stages-workbook').innerHTML = '';
    document.getElementById('stages-midterm').innerHTML = '';
    
    // Render filtered results
    filtered.forEach(stage => {
        const stageItem = createStageItem(stage);
        const container = stage.category === 'workbook' 
            ? document.getElementById('stages-workbook')
            : document.getElementById('stages-midterm');
        container.appendChild(stageItem);
    });
}

// Toggle delete mode (for both parts of speech and arches)
function toggleDeleteMode() {
    deleteMode = !deleteMode;
    logicalConnectionMode = false;
    firstArchClick = null;
    archCreationMode = false;
    const btn = document.getElementById('delete-mode-btn');
    if (btn) {
        btn.classList.toggle('active', deleteMode);
    }
    updateModeButtons();
    renderSentence();
}

// Toggle logical connection mode
function toggleLogicalConnectionMode() {
    logicalConnectionMode = !logicalConnectionMode;
    deleteMode = false;
    pencilMode = false;
    firstArchClick = null;
    updateModeButtons();
    renderSentence();
}

// Update mode button states
function updateModeButtons() {
    const logicalBtn = document.getElementById('logical-connection-mode-btn');
    const deleteBtn = document.getElementById('delete-mode-btn');
    
    if (logicalBtn) {
        logicalBtn.classList.toggle('active', logicalConnectionMode);
    }
    if (deleteBtn) {
        deleteBtn.classList.toggle('active', deleteMode);
    }
}

// Update model indicator in top right corner
function updateModelIndicator() {
    const indicator = document.getElementById('model-indicator');
    if (!indicator) return;
    
    // Find main roof arch with model
    const mainRoof = arches.find(a => a.isMainRoof && a.model);
    if (mainRoof && mainRoof.model) {
        const modelNames = { 'A': 'א', 'B': 'ב', 'C': 'ג' };
        indicator.textContent = `דגם ${modelNames[mainRoof.model] || mainRoof.model}`;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// Render the sentence with words and their parts of speech
function renderSentence() {
    const container = document.getElementById('sentence-container');
    container.innerHTML = '';
    
    // Update model indicator
    updateModelIndicator();

    // Create a wrapper for word and its parts
    words.forEach((word, index) => {
        const wordWrapper = document.createElement('div');
        wordWrapper.className = 'word-wrapper';
        wordWrapper.dataset.wordId = word.id;

        // Word block (just the word)
        const wordBlock = document.createElement('div');
        wordBlock.className = 'word-block';
        
        const wordText = document.createElement('div');
        wordText.className = 'word-text';
        wordText.textContent = word.text;
        
        // Add click handler for arch creation (click on words directly, not parts of speech)
        if (!deleteMode && !logicalConnectionMode) {
            wordBlock.style.cursor = 'pointer';
            wordBlock.onclick = (e) => {
                e.stopPropagation();
                handleWordClickForArch(word.id);
            };
        }
        
        // Mark as selected if this word is the first click
        if (firstArchClick && firstArchClick.wordId === word.id) {
            wordBlock.classList.add('arch-selected');
        }

        wordBlock.appendChild(wordText);
        wordWrapper.appendChild(wordBlock);

        // Add button (outside word block)
        const addBtn = document.createElement('button');
        addBtn.className = 'add-pos-btn';
        addBtn.innerHTML = '+';
        addBtn.onclick = (e) => {
            e.stopPropagation();
            openPartOfSpeechModal(word.id);
        };
        wordWrapper.appendChild(addBtn);

        // Parts of speech container (outside the word block)
        const partsContainer = document.createElement('div');
        partsContainer.className = 'word-parts-container';
        
        if (word.hasPartOfSpeech()) {
            word.partsOfSpeech.forEach(pos => {
                const partTag = document.createElement('div');
                partTag.className = 'part-tag';
                const columnIndex = getPartOfSpeechColumnIndex(pos.type);
                partTag.classList.add(`pos-column-${columnIndex}`);
                partTag.dataset.wordId = word.id;
                partTag.dataset.posId = pos.id;
                
                if (deleteMode) {
                    partTag.classList.add('delete-mode');
                    partTag.onclick = (e) => {
                        e.stopPropagation();
                        deletePartOfSpeech(word.id, pos.id);
                    };
                } else {
                    partTag.onclick = (e) => {
                        e.stopPropagation();
                        handlePartClick(word.id, pos.id);
                    };
                }

                const partType = document.createElement('span');
                partType.className = 'part-type';
                partType.textContent = getPartOfSpeechName(pos.type);

                // Edit button (always visible, except in delete mode)
                if (!deleteMode) {
                    const editBtn = document.createElement('span');
                    editBtn.className = 'edit-icon';
                    editBtn.innerHTML = '✏️';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        openDetailsPanel(word.id, pos.id);
                    };
                    partTag.appendChild(partType);
                    partTag.appendChild(editBtn);
                } else {
                    partTag.appendChild(partType);
                }

                // Delete button (only in delete mode)
                if (deleteMode) {
                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'delete-icon';
                    deleteBtn.innerHTML = '✕';
                    partTag.appendChild(deleteBtn);
                }

                partsContainer.appendChild(partTag);
            });
        }

        wordWrapper.appendChild(partsContainer);
        container.appendChild(wordWrapper);
    });

    // Render combination lines
    setTimeout(() => {
        renderCombinationLines();
        renderArches();
        renderLogicalConnections();
    }, 50);
}

// Delete part of speech
function deletePartOfSpeech(wordId, posId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    // Remove combinations involving this part
    combinations = combinations.filter(c => 
        !(c.wordId1 === wordId && c.posId1 === posId) &&
        !(c.wordId2 === wordId && c.posId2 === posId)
    );

    // Remove the part of speech
    word.removePartOfSpeech(posId);

    // Close panel if it was open for this part
    if (currentWordId === wordId && currentPartOfSpeechId === posId) {
        closeDetailsPanel();
    }

    renderSentence();
}

// Handle click on a part of speech (for combinations or arches)
function handlePartClick(wordId, posId) {
    // Handle logical connection mode
    if (logicalConnectionMode) {
        if (firstArchClick) {
            // Second click - create logical connection
            if (firstArchClick.wordId === wordId && firstArchClick.posId === posId) {
                // Same part clicked - cancel
                firstArchClick = null;
                document.querySelectorAll('.part-tag').forEach(tag => tag.classList.remove('arch-selected'));
                return;
            }
            openLogicalConnectionModal(firstArchClick.wordId, firstArchClick.posId, wordId, posId);
            firstArchClick = null;
            document.querySelectorAll('.part-tag').forEach(tag => tag.classList.remove('arch-selected'));
            return;
        } else {
            // First click - store selection
            firstArchClick = { wordId, posId };
            const partTag = document.querySelector(`[data-word-id="${wordId}"][data-pos-id="${posId}"]`);
            if (partTag) {
                partTag.classList.add('arch-selected');
            }
            return;
        }
    }
    
    // Pencil mode is handled by handleWordClick, not here
    
    // Normal combination mode
    // Find if there's already a selection
    const existingSelection = document.querySelector('.part-tag.selected');
    
    if (existingSelection) {
        const selectedWordId = existingSelection.dataset.wordId;
        const selectedPosId = existingSelection.dataset.posId;
        
        // Don't allow same part to be selected twice
        if (selectedWordId === wordId && selectedPosId === posId) {
            existingSelection.classList.remove('selected');
            return;
        }
        
        // Try to create combination (allow multiple combinations)
        // Determine which word is rightmost (first in RTL) - that's word1
        const word1Index = words.findIndex(w => w.id === selectedWordId);
        const word2Index = words.findIndex(w => w.id === wordId);
        
        // In RTL, smaller index = appears first (right side)
        let word1, word2, pos1, pos2, finalWordId1, finalWordId2, finalPosId1, finalPosId2;
        
        if (word1Index <= word2Index) {
            // selectedWordId is rightmost (first)
            word1 = words.find(w => w.id === selectedWordId);
            word2 = words.find(w => w.id === wordId);
            pos1 = word1.getPartOfSpeech(selectedPosId);
            pos2 = word2.getPartOfSpeech(posId);
            finalWordId1 = selectedWordId;
            finalWordId2 = wordId;
            finalPosId1 = selectedPosId;
            finalPosId2 = posId;
        } else {
            // wordId is rightmost (first)
            word1 = words.find(w => w.id === wordId);
            word2 = words.find(w => w.id === selectedWordId);
            pos1 = word1.getPartOfSpeech(posId);
            pos2 = word2.getPartOfSpeech(selectedPosId);
            finalWordId1 = wordId;
            finalWordId2 = selectedWordId;
            finalPosId1 = posId;
            finalPosId2 = selectedPosId;
        }
        
        const result = validateCombination(pos1, pos2, finalWordId1, finalWordId2, words);
        
        if (result.valid && result.complete) {
            // Valid combination - add line (don't remove existing combinations)
            addCombination(finalWordId1, finalPosId1, finalWordId2, finalPosId2, true, result.type, result.isDemonstrative);
            showValidationMessage(result.message, 'info');
        } else if (result.valid && !result.complete) {
            // Valid but incomplete - show warning (yellow state)
            addCombination(finalWordId1, finalPosId1, finalWordId2, finalPosId2, false, 'incomplete', result.isDemonstrative);
            showValidationMessage(result.message, 'warning');
        } else {
            // Invalid combination
            showValidationMessage(result.message, 'error');
        }
        
        // Clear selection
        existingSelection.classList.remove('selected');
        renderSentence();
    } else {
        // Select this part
        const partTag = document.querySelector(`[data-word-id="${wordId}"][data-pos-id="${posId}"]`);
        if (partTag) {
            partTag.classList.add('selected');
        }
    }
}

// Add a combination between two parts of speech (allow multiple)
function addCombination(wordId1, posId1, wordId2, posId2, complete, combinationType = null, isDemonstrative = false) {
    // Check if this exact combination already exists
    const exists = combinations.some(c =>
        (c.wordId1 === wordId1 && c.posId1 === posId1 && c.wordId2 === wordId2 && c.posId2 === posId2) ||
        (c.wordId1 === wordId2 && c.posId1 === posId2 && c.wordId2 === wordId1 && c.posId2 === posId1)
    );

    if (!exists) {
        combinations.push({
            wordId1: wordId1,
            posId1: posId1,
            wordId2: wordId2,
            posId2: posId2,
            complete: complete,
            type: combinationType || (complete ? 'valid' : 'incomplete'),
            isDemonstrative: isDemonstrative
        });
    }
}

// Delete combination (for delete mode)
function deleteCombination(wordId1, posId1, wordId2, posId2) {
    combinations = combinations.filter(c =>
        !(c.wordId1 === wordId1 && c.posId1 === posId1 && c.wordId2 === wordId2 && c.posId2 === posId2) &&
        !(c.wordId1 === wordId2 && c.posId1 === posId2 && c.wordId2 === wordId1 && c.posId2 === posId1)
    );
    renderSentence();
}

// Find chains of connected words (adjacent connections form a chain)
function findCombinationChains() {
    const chains = [];
    const processed = new Set();
    
    // Helper to create unique key for combination
    function getCombKey(comb) {
        const id1 = `${comb.wordId1}_${comb.posId1}`;
        const id2 = `${comb.wordId2}_${comb.posId2}`;
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    }
    
    // Build chains by finding connected adjacent words
    combinations.forEach(comb => {
        const combKey = getCombKey(comb);
        if (processed.has(combKey)) return;
        
        // Start a new chain
        const chain = [comb];
        processed.add(combKey);
        
        // Try to extend chain by finding connections to the last word in chain
        let extended = true;
        while (extended) {
            extended = false;
            const lastComb = chain[chain.length - 1];
            const lastWordId = lastComb.wordId2;
            const lastPosId = lastComb.posId2;
            const lastWordIndex = words.findIndex(w => w.id === lastWordId);
            
            // Find next connection from last word
            combinations.forEach(nextComb => {
                const nextKey = getCombKey(nextComb);
                if (processed.has(nextKey)) return;
                
                // Check if this connection starts from the last word
                if (nextComb.wordId1 === lastWordId && nextComb.posId1 === lastPosId) {
                    const nextWordIndex = words.findIndex(w => w.id === nextComb.wordId2);
                    // Only add if words are adjacent (chain continuity)
                    if (Math.abs(lastWordIndex - nextWordIndex) === 1) {
                        chain.push(nextComb);
                        processed.add(nextKey);
                        extended = true;
                    }
                }
            });
        }
        
        chains.push(chain);
    });
    
    return chains;
}

// Render combination lines between connected parts (as chains)
function renderCombinationLines() {
    // Remove existing SVG lines
    const existingSvg = document.getElementById('combination-lines-svg');
    if (existingSvg) {
        existingSvg.remove();
    }

    // Clear any previous incomplete phrase messages
    clearIncompleteMessages();

    const container = document.getElementById('sentence-container');
    if (!container || combinations.length === 0) return;

    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'combination-lines-svg';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = deleteMode ? 'auto' : 'none';
    svg.style.zIndex = '1'; // Behind badges (badges are z-index 10)

    const containerRect = container.getBoundingClientRect();

    // Find chains and render as continuous paths
    const chains = findCombinationChains();
    
    chains.forEach(chain => {
        const points = [];
        const combTypes = [];
        
        // Collect all points in chain
        chain.forEach((comb, index) => {
            const part1 = document.querySelector(`[data-word-id="${comb.wordId1}"][data-pos-id="${comb.posId1}"]`);
            const part2 = document.querySelector(`[data-word-id="${comb.wordId2}"][data-pos-id="${comb.posId2}"]`);
            
            if (part1 && part2) {
                const rect1 = part1.getBoundingClientRect();
                const rect2 = part2.getBoundingClientRect();
                
                const x1 = rect1.left + rect1.width / 2 - containerRect.left;
                const y1 = rect1.top + rect1.height / 2 - containerRect.top;
                const x2 = rect2.left + rect2.width / 2 - containerRect.left;
                const y2 = rect2.top + rect2.height / 2 - containerRect.top;
                
                if (index === 0) {
                    points.push({ x: x1, y: y1 });
                }
                points.push({ x: x2, y: y2 });
                combTypes.push(comb);
                
                // Add glow effect to connected badges
                part1.classList.add('connected');
                part2.classList.add('connected');
                
                // Add border color based on combination validity (for entire chain)
                const chain = findCombinationChains().find(c => c.includes(comb));
                const allValid = chain ? chain.every(c => c.complete && c.type === 'valid') : comb.complete && comb.type === 'valid';
                const hasInvalid = chain ? chain.some(c => c.type === 'invalid' || (!c.complete && c.type !== 'incomplete')) : comb.type === 'invalid';
                
                // No special color for demonstrative - treat like any other combination
                if (!allValid) {
                    // Yellow border if combination is not valid
                    part1.style.borderColor = '#fbbf24';
                    part1.style.borderWidth = '3px';
                    part2.style.borderColor = '#fbbf24';
                    part2.style.borderWidth = '3px';
                } else if (allValid) {
                    // Green border if valid
                    part1.style.borderColor = '#10b981';
                    part1.style.borderWidth = '3px';
                    part2.style.borderColor = '#10b981';
                    part2.style.borderWidth = '3px';
                }
            }
        });
        
        // Draw continuous path through all points
        if (points.length >= 2) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M ${points[0].x} ${points[0].y}`;
            
            for (let i = 1; i < points.length; i++) {
                pathData += ` L ${points[i].x} ${points[i].y}`;
            }
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            
            // Determine color from chain (use first comb's type, or mixed if different)
            // Check if entire chain is valid (all complete and valid)
            const allValid = combTypes.every(c => c.complete && c.type === 'valid');
            const hasInvalid = combTypes.some(c => c.type === 'invalid' || (!c.complete && c.type !== 'incomplete'));

            let strokeColor = '#48bb78'; // Green default (valid)
            let strokeWidth = 5;

            const hasDemonstrative = combTypes.some(c => c.isDemonstrative);

            // Check if combination ends with preposition (needs completion)
            const endsWithPreposition = checkCombinationEndsWithPreposition(chain, combTypes);

            // Check for incomplete phrase - ends with preposition needs noun/nominal phrase
            if (endsWithPreposition) {
                strokeColor = '#fbbf24'; // Yellow
                strokeWidth = 5;
                // Show orange message about incomplete phrase
                showIncompleteMessage('הצירוף מחכה לשם עצם או צירוף שמני שיופיע אחרי מילית היחס');
                // Apply yellow border to all connected badges in this chain
                applyYellowBorderToChain(chain, container);
            } else if (hasDemonstrative) {
                strokeColor = '#6b46c1';
                strokeWidth = 6;
            } else if (!allValid) {
                // Yellow if chain is not valid
                strokeColor = '#fbbf24';
                strokeWidth = 5;
                // Apply yellow border to all connected badges in this chain
                applyYellowBorderToChain(chain, container);
            } else if (allValid) {
                // Green if all valid
                strokeColor = '#10b981';
                strokeWidth = 5;
            }
            
            path.setAttribute('stroke', strokeColor);
            path.setAttribute('stroke-width', strokeWidth);
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.classList.add('combination-line');
            
            if (deleteMode) {
                path.style.cursor = 'pointer';
                path.onclick = () => {
                    // Delete all combinations in chain
                    chain.forEach(comb => {
                        deleteCombination(comb.wordId1, comb.posId1, comb.wordId2, comb.posId2);
                    });
                };
            }
            
            svg.appendChild(path);
        }
    });
    
    // Add dashed line for demonstrative pointing to noun/nominal phrase
    combinations.forEach(comb => {
        if (comb.isDemonstrative) {
            const word1 = words.find(w => w.id === comb.wordId1);
            const word2 = words.find(w => w.id === comb.wordId2);
            const pos1 = word1?.getPartOfSpeech(comb.posId1);
            const pos2 = word2?.getPartOfSpeech(comb.posId2);
            
            // Check if demonstrative points to noun or nominal phrase
            if (pos1?.type === 'demonstrative' && (pos2?.type === 'noun' || pos2?.type === 'adjective')) {
                const part1 = document.querySelector(`[data-word-id="${comb.wordId1}"][data-pos-id="${comb.posId1}"]`);
                const part2 = document.querySelector(`[data-word-id="${comb.wordId2}"][data-pos-id="${comb.posId2}"]`);
                
                if (part1 && part2) {
                    const rect1 = part1.getBoundingClientRect();
                    const rect2 = part2.getBoundingClientRect();
                    
                    const x1 = rect1.left + rect1.width / 2 - containerRect.left;
                    const y1 = rect1.top + rect1.height / 2 - containerRect.top;
                    const x2 = rect2.left + rect2.width / 2 - containerRect.left;
                    const y2 = rect2.top + rect2.height / 2 - containerRect.top;
                    
                    // Create dashed line (same color as combination)
                    const dashedLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    dashedLine.setAttribute('x1', x1);
                    dashedLine.setAttribute('y1', y1);
                    dashedLine.setAttribute('x2', x2);
                    dashedLine.setAttribute('y2', y2);
                    dashedLine.setAttribute('stroke', '#6b46c1');
                    dashedLine.setAttribute('stroke-width', '3');
                    dashedLine.setAttribute('stroke-dasharray', '5,5');
                    dashedLine.style.opacity = '0.7';
                    
                    svg.appendChild(dashedLine);
                }
            }
        }
    });
    
    if (svg.children.length > 0) {
        container.style.position = 'relative';
        container.appendChild(svg);
    }
}

// ========== ARCH/ROOF SYSTEM ==========

// Handle word click for arch creation
function handleWordClickForArch(wordId) {
    if (deleteMode || logicalConnectionMode) return;
    
    if (firstArchClick) {
        // Second click
        if (firstArchClick.wordId === wordId) {
            // Same word clicked - create arch covering just this word
            createSingleWordArch(wordId);
            firstArchClick = null;
            document.querySelectorAll('.word-block').forEach(block => block.classList.remove('arch-selected'));
            return;
        }
        // Different word - create arch between two words
        createArch(firstArchClick.wordId, wordId);
        firstArchClick = null;
        document.querySelectorAll('.word-block').forEach(block => block.classList.remove('arch-selected'));
        return;
    } else {
        // First click - store selection and show visual indicator
        firstArchClick = { wordId };
        archCreationMode = true;
        const wordBlock = document.querySelector(`[data-word-id="${wordId}"] .word-block`);
        if (wordBlock) {
            wordBlock.classList.add('arch-selected');
        }
        renderSentence(); // Re-render to show visual indicator
        return;
    }
}

// Create arch covering a single word
function createSingleWordArch(wordId) {
    // Check if arch already exists for this word
    const exists = arches.some(a =>
        (a.wordId1 === wordId && a.wordId2 === wordId)
    );

    if (exists) {
        showValidationMessage('גג כבר קיים על המילה הזו', 'warning');
        return;
    }

    const height = 80; // Base height for single word arch

    const arch = {
        id: `arch_${Date.now()}_${Math.random()}`,
        wordId1: wordId,
        wordId2: wordId, // Same word for single-word arch
        height: height,
        syntacticRole: null,
        isMainRoof: false,
        model: null,
        isClause: false,
        externalRole: null,
        validation: null,
        clauseValidation: null,
        isPending: true // Mark as pending until role is selected
    };

    // Open syntactic role modal immediately (required - no arch without role)
    openSyntacticRoleModalForNewArch(arch);
}

// Create an arch between two words
function createArch(wordId1, wordId2) {
    // Check if arch already exists
    const exists = arches.some(a =>
        (a.wordId1 === wordId1 && a.wordId2 === wordId2) ||
        (a.wordId1 === wordId2 && a.wordId2 === wordId1)
    );

    if (exists) {
        showValidationMessage('קשת כבר קיימת בין המילים האלה', 'warning');
        return;
    }

    // Calculate height with nesting logic
    const height = calculateArchHeight(wordId1, wordId2);

    const arch = {
        id: `arch_${Date.now()}_${Math.random()}`,
        wordId1: wordId1,
        wordId2: wordId2,
        height: height,
        syntacticRole: null, // Will be set by modal
        isMainRoof: false,
        model: null,
        isClause: false,
        externalRole: null,
        validation: null,
        clauseValidation: null,
        isPending: true // Mark as pending until role is selected
    };

    // Reset click state
    firstArchClick = null;
    archCreationMode = false;

    // Immediately open syntactic role modal (required - no arch without role)
    openSyntacticRoleModalForNewArch(arch);
}

// Calculate arch height with nesting logic
function calculateArchHeight(wordId1, wordId2) {
    const index1 = words.findIndex(w => w.id === wordId1);
    const index2 = words.findIndex(w => w.id === wordId2);
    const start = Math.min(index1, index2);
    const end = Math.max(index1, index2);
    
    // Find arches that contain this arch (nested)
    const containingArches = arches.filter(a => {
        const aIndex1 = words.findIndex(w => w.id === a.wordId1);
        const aIndex2 = words.findIndex(w => w.id === a.wordId2);
        const aStart = Math.min(aIndex1, aIndex2);
        const aEnd = Math.max(aIndex1, aIndex2);
        
        return aStart < start && aEnd > end;
    });
    
    // Base height: 120px (higher), decrease by 40px for each nesting level
    const baseHeight = 120;
    const nestingLevel = containingArches.length;
    return baseHeight - (nestingLevel * 40);
}

// Render arches as rectangular roofs with vertical and horizontal lines
function renderArches() {
    // Remove existing arch SVG
    const existingSvg = document.getElementById('arch-svg');
    if (existingSvg) {
        existingSvg.remove();
    }
    
    const container = document.getElementById('sentence-container');
    if (!container || arches.length === 0) return;
    
    // Create SVG container for arches
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'arch-svg';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '2'; // Above combination lines, below badges
    svg.style.overflow = 'visible'; // Ensure lines aren't clipped
    
    const containerRect = container.getBoundingClientRect();
    
    arches.forEach(arch => {
        // Re-validate if it's a main roof or clause
        if (arch.isMainRoof && arch.model) {
            arch.validation = validateSentenceModel(arch);
        }
        if (arch.isClause && arch.model) {
            arch.clauseValidation = validateSentenceModel(arch);
        }
        
        // Get word blocks (not parts of speech)
        const wordWrapper1 = container.querySelector(`[data-word-id="${arch.wordId1}"]`);
        const wordWrapper2 = container.querySelector(`[data-word-id="${arch.wordId2}"]`);
        
        if (wordWrapper1 && wordWrapper2) {
            const wordBlock1 = wordWrapper1.querySelector('.word-block');
            const wordBlock2 = wordWrapper2.querySelector('.word-block');
            
            if (wordBlock1 && wordBlock2) {
                const rect1 = wordBlock1.getBoundingClientRect();
                const rect2 = wordBlock2.getBoundingClientRect();
                
                // Get indices to determine direction
                const index1 = words.findIndex(w => w.id === arch.wordId1);
                const index2 = words.findIndex(w => w.id === arch.wordId2);
                
                // Check if single word arch (same word clicked twice) or two words
                const isSingleWord = arch.wordId1 === arch.wordId2;
                
                // In RTL: smaller index = appears first (right side), larger index = appears later (left side)
                // Determine right and left edges (RTL: right is smaller x, left is larger x)
                // For RTL Arabic: draw from RIGHT edge of first word to LEFT edge of second word
                let leftEdge, rightEdge, leftY, rightY;
                
                if (isSingleWord) {
                    // Single word: rectangle without bottom (two vertical lines connected by horizontal line on top)
                    // In RTL: left side of screen = smaller x, right side = larger x
                    // For word boundary: left edge (smaller x) to right edge (larger x)
                    leftEdge = rect1.left - containerRect.left; // Left edge of word
                    rightEdge = rect1.left + rect1.width - containerRect.left; // Right edge of word
                    leftY = rect1.top - containerRect.top;
                    rightY = rect1.top - containerRect.top;
                } else {
                    // Two words: roof spans from the rightmost word to the leftmost word
                    // In RTL: words flow right-to-left, but on screen, left side = smaller x, right side = larger x
                    // We want to draw from the outer edges of both words
                    const firstIndex = Math.min(index1, index2);
                    const secondIndex = Math.max(index1, index2);

                    // Get the word blocks for first and second
                    const firstWordId = firstIndex === index1 ? arch.wordId1 : arch.wordId2;
                    const secondWordId = secondIndex === index2 ? arch.wordId2 : arch.wordId1;
                    const firstRect = firstWordId === arch.wordId1 ? rect1 : rect2;
                    const secondRect = secondWordId === arch.wordId2 ? rect2 : rect1;

                    // For RTL: first word (lower index) appears on right side of screen (higher x)
                    // second word (higher index) appears on left side of screen (lower x)
                    // Draw from right edge of first word to left edge of second word
                    rightEdge = firstRect.left + firstRect.width - containerRect.left; // Right edge of first word (rightmost position)
                    leftEdge = secondRect.left - containerRect.left; // Left edge of second word (leftmost position)
                    rightY = firstRect.top - containerRect.top;
                    leftY = secondRect.top - containerRect.top;
                }
                
                // Roof height
                const roofY = Math.min(rightY, leftY) - arch.height;
                const roofHeight = 6; // Height of the roof rectangle
                
                // Check if arch matches combinations below
                const matchesCombination = checkArchMatchesCombinations(arch);
                
                // Determine stroke color based on validation and combination matching
                let strokeColor = '#667eea'; // Default blue
                let strokeWidth = 3;
                
                if (!matchesCombination && (arch.syntacticRole || arch.isClause || arch.isMainRoof)) {
                    // Yellow if arch doesn't match combinations below
                    strokeColor = '#fbbf24'; // Yellow
                    strokeWidth = 3;
                } else if (arch.isMainRoof && arch.validation) {
                strokeColor = arch.validation.color;
                    strokeWidth = 4;
                } else if (arch.isClause && arch.clauseValidation) {
                    strokeColor = arch.clauseValidation.color;
                    strokeWidth = 3;
            } else if (arch.isMainRoof) {
                strokeColor = getModelColor(arch.model);
                    strokeWidth = 4;
                }
                
                // Create group for this arch
                const archGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                archGroup.dataset.archId = arch.id;
                archGroup.style.pointerEvents = 'auto';
                
                if (isSingleWord) {
                    // Single word: rectangle without bottom (two vertical lines + horizontal line on top)
                    // Left vertical line (at left edge)
                    const verticalLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    verticalLine1.setAttribute('x1', leftEdge);
                    verticalLine1.setAttribute('y1', leftY);
                    verticalLine1.setAttribute('x2', leftEdge);
                    verticalLine1.setAttribute('y2', roofY);
                    verticalLine1.setAttribute('stroke', strokeColor);
                    verticalLine1.setAttribute('stroke-width', strokeWidth);

                    // Top horizontal line (connects left to right)
                    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    horizontalLine.setAttribute('x1', leftEdge);
                    horizontalLine.setAttribute('y1', roofY);
                    horizontalLine.setAttribute('x2', rightEdge);
                    horizontalLine.setAttribute('y2', roofY);
                    horizontalLine.setAttribute('stroke', strokeColor);
                    horizontalLine.setAttribute('stroke-width', strokeWidth);

                    // Right vertical line (at right edge)
                    const verticalLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    verticalLine2.setAttribute('x1', rightEdge);
                    verticalLine2.setAttribute('y1', roofY);
                    verticalLine2.setAttribute('x2', rightEdge);
                    verticalLine2.setAttribute('y2', rightY);
                    verticalLine2.setAttribute('stroke', strokeColor);
                    verticalLine2.setAttribute('stroke-width', strokeWidth);

                    archGroup.appendChild(verticalLine1);
                    archGroup.appendChild(horizontalLine);
                    archGroup.appendChild(verticalLine2);
                } else {
                    // Two words: large roof over both words
                    // Left vertical line (at leftmost position)
                    const verticalLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    verticalLine1.setAttribute('x1', leftEdge);
                    verticalLine1.setAttribute('y1', leftY);
                    verticalLine1.setAttribute('x2', leftEdge);
                    verticalLine1.setAttribute('y2', roofY);
                    verticalLine1.setAttribute('stroke', strokeColor);
                    verticalLine1.setAttribute('stroke-width', strokeWidth);

                    // Horizontal roof line (spans from left to right)
                    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    horizontalLine.setAttribute('x1', leftEdge);
                    horizontalLine.setAttribute('y1', roofY);
                    horizontalLine.setAttribute('x2', rightEdge);
                    horizontalLine.setAttribute('y2', roofY);
                    horizontalLine.setAttribute('stroke', strokeColor);
                    horizontalLine.setAttribute('stroke-width', strokeWidth);

                    // Right vertical line (at rightmost position)
                    const verticalLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    verticalLine2.setAttribute('x1', rightEdge);
                    verticalLine2.setAttribute('y1', roofY);
                    verticalLine2.setAttribute('x2', rightEdge);
                    verticalLine2.setAttribute('y2', rightY);
                    verticalLine2.setAttribute('stroke', strokeColor);
                    verticalLine2.setAttribute('stroke-width', strokeWidth);

                    archGroup.appendChild(verticalLine1);
                    archGroup.appendChild(horizontalLine);
                    archGroup.appendChild(verticalLine2);
                }
                
                // Add label button above arch for syntactic role
                // Change names based on model: נשוא א', נושא א'
                let labelText = arch.externalRole || arch.syntacticRole || '';
                if (arch.isMainRoof && arch.model) {
                    const modelNames = { 'A': 'א', 'B': 'ב', 'C': 'ג' };
                    if (arch.syntacticRole === 'נשוא') {
                        labelText = `נשוא ${modelNames[arch.model]}`;
                    } else if (arch.syntacticRole === 'נושא') {
                        labelText = `נושא ${modelNames[arch.model]}`;
                    } else if (!labelText) {
                        labelText = `דגם ${modelNames[arch.model]}`;
                    }
                } else if (!labelText && arch.model) {
                    const modelNames = { 'A': 'א', 'B': 'ב', 'C': 'ג' };
                    labelText = `דגם ${modelNames[arch.model]}`;
                }
                if (labelText) {
                    const labelY = roofY - 25;
                    const labelX = (rightEdge + leftEdge) / 2;

                    // Calculate dynamic width based on text length
                    // Approximate: Hebrew chars are ~8-10px each at 11px font
                    const estimatedTextWidth = labelText.length * 9;
                    const labelWidth = Math.max(70, estimatedTextWidth + 20); // Min 70px, with 20px padding

                    const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    labelBg.setAttribute('x', labelX - (labelWidth / 2));
                    labelBg.setAttribute('y', labelY - 12);
                    labelBg.setAttribute('width', labelWidth);
                    labelBg.setAttribute('height', 24);
                    labelBg.setAttribute('rx', 4);
                    labelBg.setAttribute('fill', 'white');
                    labelBg.setAttribute('stroke', strokeColor);
                    labelBg.setAttribute('stroke-width', '2');
                    labelBg.style.cursor = 'pointer';

                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', labelX);
                    label.setAttribute('y', labelY + 4);
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('font-size', '11px');
                    label.setAttribute('font-weight', 'bold');
                    label.setAttribute('fill', strokeColor);
                    label.style.cursor = 'pointer';
                    label.textContent = labelText;
                    
                    // Click handler for label - open syntactic role modal
                    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    labelGroup.style.cursor = 'pointer';
                    labelGroup.onclick = (e) => {
                        e.stopPropagation();
                        openSyntacticRoleModal(arch);
                    };
                    
                    labelGroup.appendChild(labelBg);
                    labelGroup.appendChild(label);
                    archGroup.appendChild(labelGroup);
                }
                
                // Interaction handlers
                if (deleteMode) {
                    archGroup.style.cursor = 'pointer';
                    archGroup.onclick = (e) => {
                        e.stopPropagation();
                        const wasMainRoof = arch.isMainRoof;
                    arches = arches.filter(a => a.id !== arch.id);
                        // If all arches deleted or main roof deleted, ask for model again
                        if (arches.length === 0 || (wasMainRoof && !arches.find(a => a.isMainRoof))) {
                            // Reset all main roof flags
                            arches.forEach(a => {
                                a.isMainRoof = false;
                                a.model = null;
                            });
                            // If no arches left, will be handled by updateModelIndicator
                        }
                    renderSentence();
                };
                } else {
                    archGroup.style.cursor = 'pointer';
                    // Click to edit
                    archGroup.onclick = (e) => {
                        // Don't trigger if clicking on label (handled separately)
                        if (e.target.tagName === 'g' && e.target.querySelector('text')) return;
                        e.stopPropagation();
                        if (arch.isClause) {
                            openClauseModal(arch);
                        } else {
                            openSyntacticRoleModal(arch);
                        }
                    };
                }
                
                svg.appendChild(archGroup);
            }
        }
    });
    
    // Add visual indicator for first click (vertical line from selected word)
    if (firstArchClick && archCreationMode) {
        const wordWrapper = container.querySelector(`[data-word-id="${firstArchClick.wordId}"]`);
        if (wordWrapper) {
            const wordBlock = wordWrapper.querySelector('.word-block');
            if (wordBlock) {
                const rect = wordBlock.getBoundingClientRect();
                const rightEdge = rect.left - containerRect.left;
                const y = rect.top - containerRect.top;
                
                // Animated vertical line indicator
                const indicatorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                indicatorLine.setAttribute('x1', rightEdge);
                indicatorLine.setAttribute('y1', y);
                indicatorLine.setAttribute('x2', rightEdge);
                indicatorLine.setAttribute('y2', y - 100);
                indicatorLine.setAttribute('stroke', '#667eea');
                indicatorLine.setAttribute('stroke-width', '3');
                indicatorLine.setAttribute('stroke-dasharray', '5,5');
                indicatorLine.style.opacity = '0.6';
                indicatorLine.style.animation = 'pulse 1s infinite';
                
                svg.appendChild(indicatorLine);
            }
        }
    }
    
    if (svg.children.length > 0) {
        container.style.position = 'relative';
        container.appendChild(svg);
    }
}

// Get color for sentence model
function getModelColor(model) {
    if (!model) return '#667eea'; // Default blue
    // Colors will be set based on validation: Blue (incomplete), Red (error), Green (valid)
    return '#667eea'; // Will be updated by validation
}

// Open syntactic role modal for a NEW arch (pending arch - only added if role selected)
function openSyntacticRoleModalForNewArch(pendingArch) {
    // Simply open the modal with the pending arch - it will handle everything
    openSyntacticRoleModal(pendingArch);
}

// Open modal to select syntactic role for arch (with clause upgrade option)
function openSyntacticRoleModal(arch) {
    const isPendingArch = arch.isPending;

    // Create or get syntactic role selection modal
    let modal = document.getElementById('syntactic-role-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'syntactic-role-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>בחר חלק תחבירי</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="clause-mode-toggle" />
                        <span>מצב פסוקית (שדרוג לפסוקית)</span>
                    </label>
                </div>
                <div class="syntactic-role-options" id="syntactic-role-buttons">
                    <div class="role-grid">
                        <div class="role-column role-column-green">
                            <button class="role-btn role-subject-predicate" data-role="נושא">נושא</button>
                            <button class="role-btn role-subject-predicate" data-role="נשוא">נשוא</button>
                            <button class="role-btn role-subject-predicate" data-role="מושא">מושא</button>
                        </div>
                        <div class="role-column role-column-purple">
                            <button class="role-btn role-object-description" data-role="תיאור">תיאור</button>
                            <button class="role-btn role-object-description" data-role="גרעין">גרעין</button>
                            <button class="role-btn role-object-description" data-role="לוואי סומך">לוואי סומך</button>
                        </div>
                        <div class="role-column role-column-blue">
                            <button class="role-btn role-nucleus-adjunct" data-role="לוואי שם תואר">לוואי שם תואר</button>
                            <button class="role-btn role-nucleus-adjunct" data-role="לוואי צירוף יחס">לוואי צירוף יחס</button>
                            <button class="role-btn role-nucleus-adjunct" data-role="לוואי כינוי רמז">לוואי כינוי רמז</button>
                        </div>
                    </div>
                </div>
                <div id="clause-model-options" style="display: none; margin-top: 15px;">
                    <label>מבנה פנימי (מודל):</label>
                    <div class="model-options">
                        <button class="model-btn clause-model-btn" data-model="A">דגם A</button>
                        <button class="model-btn clause-model-btn" data-model="B">דגם B</button>
                        <button class="model-btn clause-model-btn" data-model="C">דגם C</button>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="save-syntactic-role">שמור</button>
                    <button class="btn btn-secondary" id="cancel-syntactic-role">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Clause mode toggle
        modal.querySelector('#clause-mode-toggle').addEventListener('change', (e) => {
            const clauseOptions = modal.querySelector('#clause-model-options');
            clauseOptions.style.display = e.target.checked ? 'block' : 'none';

            // Update button labels
            const buttons = modal.querySelectorAll('.role-btn');
            buttons.forEach(btn => {
                const role = btn.dataset.role;
                if (role) {
                    if (e.target.checked) {
                        btn.textContent = `פסוקית ${role}`;
                    } else {
                        btn.textContent = role;
                    }
                }
            });
        });

        // Model selection for clauses
        modal.querySelectorAll('.clause-model-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.clause-model-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
        });

        // Role selection
        modal.querySelectorAll('.role-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
        });
    }

    // Store arch reference
    modal._currentArch = arch;

    // Setup save button handler
    modal.querySelector('#save-syntactic-role').onclick = () => {
        const currentArch = modal._currentArch;
        const selectedBtn = modal.querySelector('.role-btn.selected');
        if (!selectedBtn || !selectedBtn.dataset.role) {
            showValidationMessage('יש לבחור חלק תחבירי', 'error');
            return;
        }

        const role = selectedBtn.dataset.role;
        const isClauseMode = modal.querySelector('#clause-mode-toggle').checked;

        if (isClauseMode) {
            currentArch.isClause = true;
            currentArch.externalRole = role;
            currentArch.syntacticRole = null;

            // Get selected model
            const selectedModelBtn = modal.querySelector('.clause-model-btn.selected');
            if (selectedModelBtn) {
                currentArch.model = selectedModelBtn.dataset.model;
                currentArch.clauseValidation = validateSentenceModel(currentArch);
            }
        } else {
            currentArch.isClause = false;
            currentArch.syntacticRole = role;
            currentArch.externalRole = null;
        }

        // If this was a pending arch, add it to the array
        if (currentArch.isPending) {
            delete currentArch.isPending;
            arches.push(currentArch);
        }

        // Clean up arch creation state to allow creating more arches
        firstArchClick = null;
        archCreationMode = false;
        document.querySelectorAll('.word-block').forEach(block => block.classList.remove('arch-selected'));

        // Clean up modal state
        modal._currentArch = null;

        renderSentence();
        modal.classList.remove('show');
        showValidationMessage(isClauseMode ? `פסוקית ${role} נבחרה` : `חלק תחבירי נבחר: ${role}`, 'info');
    };

    // Setup cancel/close handlers
    const cancelHandler = () => {
        const currentArch = modal._currentArch;
        if (currentArch && currentArch.isPending) {
            // Pending arch was not saved - show message
            showValidationMessage('יצירת גג בוטלה - לא נבחר תפקיד תחבירי', 'warning');
        }

        // Clean up arch creation state to allow creating more arches
        firstArchClick = null;
        archCreationMode = false;
        document.querySelectorAll('.word-block').forEach(block => block.classList.remove('arch-selected'));

        // Clean up modal state
        modal._currentArch = null;

        modal.classList.remove('show');
    };

    modal.querySelector('.close').onclick = cancelHandler;
    modal.querySelector('#cancel-syntactic-role').onclick = cancelHandler;

    // Handle click outside modal
    modal.onclick = (e) => {
        if (e.target === modal) {
            cancelHandler();
        }
    };
    
    // Set current state
    const clauseToggle = modal.querySelector('#clause-mode-toggle');
    clauseToggle.checked = arch.isClause || false;
    clauseToggle.dispatchEvent(new Event('change'));
    
    // Highlight current role
    modal.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('selected');
        const currentRole = arch.isClause ? arch.externalRole : arch.syntacticRole;
        if (btn.dataset.role === currentRole) {
            btn.classList.add('selected');
        }
    });
    
    // Highlight current model if clause
    if (arch.isClause && arch.model) {
        modal.querySelectorAll('.clause-model-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.model === arch.model) {
                btn.classList.add('selected');
            }
        });
    }
    
    modal.classList.add('show');
}

// Validate sentence model (A, B, or C) with strict index-based validation
function validateSentenceModel(arch) {
    const isClause = arch.isClause;
    const isMainRoof = arch.isMainRoof;
    
    if (!isMainRoof && !isClause) {
        return { valid: false, color: '#667eea', message: 'לא הוגדר גג ראשי או פסוקית' };
    }
    
    if (!arch.model) {
        return { valid: false, color: '#3b82f6', message: 'חסר מודל משפט - יש לבחור דגם A, B או C' };
    }
    
    const word1 = words.find(w => w.id === arch.wordId1);
    const word2 = words.find(w => w.id === arch.wordId2);
    
    if (!word1 || !word2) {
        return { valid: false, color: '#667eea', message: 'חסרות מילים' };
    }
    
    // Get word indices (linear position in sentence)
    const index1 = words.findIndex(w => w.id === arch.wordId1);
    const index2 = words.findIndex(w => w.id === arch.wordId2);
    
    // Find all parts of speech for both words
    const pos1List = word1.partsOfSpeech;
    const pos2List = word2.partsOfSpeech;
    
    if (pos1List.length === 0 || pos2List.length === 0) {
        return { valid: false, color: '#3b82f6', message: 'חסרים חלקי דיבר - יש להוסיף תגי PoS למילים' };
    }
    
    // Model A (Verbal Sentence / جملة فعلية): Predicate (Verb) before Subject (Noun/Pronoun)
    if (arch.model === 'A') {
        // Required: 1 Predicate (Must be a Verb) and 1 Subject (Noun/Pronoun)
        const predicate = pos1List.find(p => p.type === 'verb') || pos2List.find(p => p.type === 'verb');
        const subject = pos1List.find(p => p.type === 'noun' || p.type === 'personalPronoun') || 
                       pos2List.find(p => p.type === 'noun' || p.type === 'personalPronoun');
        
        // Component Type Check: Predicate must be Verb
        if (!predicate) {
            return { valid: false, color: '#3b82f6', message: 'מודל A דורש פועל (נשוא) - חסר תג פועל' };
        }
        
        if (predicate.type !== 'verb') {
            return { valid: false, color: '#ef4444', message: 'במודל A, הנשוא חייב להיות פועל - לא ניתן לסמן שם עצם כנשוא' };
        }
        
        if (!subject) {
            return { valid: false, color: '#3b82f6', message: 'מודל A דורש נושא (שם עצם או כינוי גוף) - חסר תג נושא' };
        }
        
        // Get indices of predicate and subject
        const predWord = predicate === pos1List.find(p => p.type === 'verb') ? word1 : word2;
        const subjWord = subject === pos1List.find(p => p.type === 'noun' || p.type === 'personalPronoun') ? word1 : word2;
        const predIndex = words.findIndex(w => w.id === predWord.id);
        const subjIndex = words.findIndex(w => w.id === subjWord.id);
        
        // Order Rule: Index of Predicate MUST BE LESS than Index of Subject
        if (predIndex >= subjIndex) {
            return { valid: false, color: '#ef4444', message: 'במודל A, הפועל (נשוא) חייב לבוא לפני הנושא. מיקום הפועל: ' + predIndex + ', מיקום הנושא: ' + subjIndex };
        }
        
        // Check agreement (gender, number) between subject and predicate
        const agreementIssues = checkSubjectPredicateAgreement(subject, predicate);
        if (agreementIssues.length > 0) {
            return { valid: false, color: '#ef4444', message: `חוסר התאמה: ${agreementIssues.join(', ')}` };
    }
    
        return { valid: true, color: '#10b981', message: 'מודל A תקין - נשוא פועלי לפני נושא' };
    }
    
    // Model B (Nominal Sentence / جملة اسمية): Subject (Mubtada) before Predicate (Khabar)
    if (arch.model === 'B') {
        // Required: 1 Subject (Mubtada - Noun) and 1 Predicate (Khabar - non-verb)
        const subject = pos1List.find(p => p.type === 'noun') || pos2List.find(p => p.type === 'noun');
        // Predicate can be noun, adjective, or other non-verb
        const predicate = pos1List.find(p => p.type !== 'verb' && p !== subject) || 
                         pos2List.find(p => p.type !== 'verb' && p !== subject);
        
        if (!subject) {
            return { valid: false, color: '#3b82f6', message: 'מודל B דורש נושא (מתחיל) - חסר תג שם עצם' };
        }
        
        if (!predicate) {
            return { valid: false, color: '#3b82f6', message: 'מודל B דורש נשוא (חבר) - חסר נשוא' };
        }
        
        // Get indices
        const subjWord = subject === pos1List.find(p => p.type === 'noun') ? word1 : word2;
        const predWord = predicate === pos1List.find(p => p !== subject && p.type !== 'verb') ? word1 : word2;
        const subjIndex = words.findIndex(w => w.id === subjWord.id);
        const predIndex = words.findIndex(w => w.id === predWord.id);
        
        // Order Rule: Index of Subject MUST BE LESS than Index of Predicate
        if (subjIndex >= predIndex) {
            return { valid: false, color: '#ef4444', message: 'במודל B, הנושא (מתחיל) חייב לבוא לפני הנשוא (חבר). מיקום הנושא: ' + subjIndex + ', מיקום הנשוא: ' + predIndex };
        }
        
        // Check agreement if predicate is adjective
        if (predicate.type === 'adjective') {
            const agreementIssues = checkNounAdjectiveAgreement(subject, predicate);
            if (agreementIssues.length > 0) {
                return { valid: false, color: '#ef4444', message: `חוסר התאמה: ${agreementIssues.join(', ')}` };
            }
        }
        
        return { valid: true, color: '#10b981', message: 'מודל B תקין - נושא לפני נשוא שמני' };
    }
    
    // Model C (Inverted Nominal / شبه جملة): Predicate (Prepositional Phrase/Adverb) before Subject (Noun)
    if (arch.model === 'C') {
        // Required: 1 Predicate (Must be Preposition or Adverb) and 1 Subject (Noun)
        const predicate = pos1List.find(p => p.type === 'preposition' || p.type === 'adverb') || 
                         pos2List.find(p => p.type === 'preposition' || p.type === 'adverb');
        const subject = pos1List.find(p => p.type === 'noun') || pos2List.find(p => p.type === 'noun');
        
        if (!predicate) {
            return { valid: false, color: '#3b82f6', message: 'מודל C דורש נשוא (מילית יחס או תואר פועל) - חסר תג נשוא' };
        }
        
        // Component Type Check: Predicate must be Preposition or Adverb
        if (predicate.type !== 'preposition' && predicate.type !== 'adverb') {
            return { valid: false, color: '#ef4444', message: 'במודל C, הנשוא חייב להיות מילית יחס או תואר פועל - לא ניתן לסמן שם עצם כנשוא' };
        }
        
        if (!subject) {
            return { valid: false, color: '#3b82f6', message: 'מודל C דורש נושא (שם עצם) - חסר תג שם עצם' };
        }
        
        // Get indices
        const predWord = predicate === pos1List.find(p => p.type === 'preposition' || p.type === 'adverb') ? word1 : word2;
        const subjWord = subject === pos1List.find(p => p.type === 'noun') ? word1 : word2;
        const predIndex = words.findIndex(w => w.id === predWord.id);
        const subjIndex = words.findIndex(w => w.id === subjWord.id);
        
        // Order Rule: Index of Predicate MUST BE LESS than Index of Subject
        if (predIndex >= subjIndex) {
            return { valid: false, color: '#ef4444', message: 'במודל C, הנשוא חייב לבוא לפני הנושא. מיקום הנשוא: ' + predIndex + ', מיקום הנושא: ' + subjIndex };
        }
        
        return { valid: true, color: '#10b981', message: 'מודל C תקין - נשוא מילית יחס/תואר פועל לפני נושא' };
    }
    
    return { valid: false, color: '#667eea', message: 'מודל לא מוכר' };
}

// Check agreement between subject and predicate (for Model A)
function checkSubjectPredicateAgreement(subject, predicate) {
    const issues = [];
    
    // Check number agreement (if predicate has number info)
    if (predicate.details.personGender) {
        // Extract number from personGender (e.g., "נסתר" = singular, "נסתרים" = plural)
        const predNumber = Array.isArray(predicate.details.personGender) 
            ? predicate.details.personGender[0] 
            : predicate.details.personGender;
        
        const subjNumber = subject.details.number;
        
        if (subjNumber && predNumber) {
            const isPredPlural = predNumber.includes('ים') || predNumber.includes('ות');
            const isSubjPlural = subjNumber === 'רבים' || subjNumber === 'רבות';
            
            if (isPredPlural !== isSubjPlural && !predNumber.includes('נסתר') && !predNumber.includes('נסתרת')) {
                // Allow some flexibility, but check if clearly mismatched
            }
        }
    }
    
    // Check gender agreement
    if (predicate.details.personGender && subject.details.gender) {
        const predGender = Array.isArray(predicate.details.personGender) 
            ? predicate.details.personGender[0] 
            : predicate.details.personGender;
        const subjGender = Array.isArray(subject.details.gender) 
            ? subject.details.gender[0] 
            : subject.details.gender;
        
        const isPredFem = predGender && (predGender.includes('ת') || predGender === 'נסתרת' || predGender === 'נוכחת');
        const isSubjFem = subjGender === 'נקבה';
        
        if (isPredFem !== isSubjFem && !predGender.includes('נסתר')) {
            issues.push('מין');
        }
    }
    
    return issues;
}

// Check if combination chain ends with preposition (incomplete prepositional phrase)
function checkCombinationEndsWithPreposition(chain, combTypes) {
    if (chain.length === 0) return false;

    // Get the last combination in the chain
    const lastComb = chain[chain.length - 1];
    const word2 = words.find(w => w.id === lastComb.wordId2);
    const pos2 = word2?.getPartOfSpeech(lastComb.posId2);
    
    // Check if last part is preposition (incomplete - waiting for noun)
    if (pos2?.type === 'preposition') {
        return true;
    }
    
    // Also check if any combination in the chain is incomplete and involves a preposition
    // This handles cases like nominal phrase + preposition (ولد كبير في)
    for (const comb of combTypes) {
        if (!comb.complete || comb.type === 'incomplete') {
            const word1 = words.find(w => w.id === comb.wordId1);
            const word2 = words.find(w => w.id === comb.wordId2);
            const pos1 = word1?.getPartOfSpeech(comb.posId1);
            const pos2 = word2?.getPartOfSpeech(comb.posId2);
            
            // If this combination involves a preposition and is incomplete
            if ((pos1?.type === 'preposition' || pos2?.type === 'preposition') && 
                (comb.type === 'incomplete' || !comb.complete)) {
                return true;
            }
        }
    }
    
    return false;
}

// Apply yellow border to all connected badges in a chain (for incomplete phrases)
function applyYellowBorderToChain(chain, container) {
    chain.forEach(comb => {
        const part1 = container.querySelector(`[data-word-id="${comb.wordId1}"][data-pos-id="${comb.posId1}"]`);
        const part2 = container.querySelector(`[data-word-id="${comb.wordId2}"][data-pos-id="${comb.posId2}"]`);

        if (part1) {
            part1.style.borderColor = '#fbbf24';
            part1.style.borderWidth = '3px';
            part1.classList.add('incomplete-chain');
        }
        if (part2) {
            part2.style.borderColor = '#fbbf24';
            part2.style.borderWidth = '3px';
            part2.classList.add('incomplete-chain');
        }
    });
}

// Check if arch matches combinations below it
function checkArchMatchesCombinations(arch) {
    const word1 = words.find(w => w.id === arch.wordId1);
    const word2 = words.find(w => w.id === arch.wordId2);
    
    if (!word1 || !word2) return true; // If words don't exist, don't show error
    
    // Check if there are combinations between the words covered by this arch
    const index1 = words.findIndex(w => w.id === arch.wordId1);
    const index2 = words.findIndex(w => w.id === arch.wordId2);
    const start = Math.min(index1, index2);
    const end = Math.max(index1, index2);
    
    // Find all combinations between words in this arch range
    const archCombinations = combinations.filter(c => {
        const cIndex1 = words.findIndex(w => w.id === c.wordId1);
        const cIndex2 = words.findIndex(w => w.id === c.wordId2);
        return (cIndex1 >= start && cIndex1 <= end) && (cIndex2 >= start && cIndex2 <= end);
    });
    
    // If there are no combinations, arch is valid (no mismatch)
    if (archCombinations.length === 0) return true;
    
    // Check if combinations are complete (green) - if all are complete, arch matches
    const allComplete = archCombinations.every(c => c.complete && c.type === 'valid');
    
    return allComplete;
}

// Check agreement between noun and adjective (for Model B with adjective predicate)
function checkNounAdjectiveAgreement(noun, adjective) {
    const issues = [];
    
    // Use existing validation from combinations.js
    const requiredFields = ['gender', 'number', 'definiteness'];
    
    for (const field of requiredFields) {
        if (noun.details[field] && adjective.details[field]) {
            const nounVal = Array.isArray(noun.details[field]) ? noun.details[field] : [noun.details[field]];
            const adjVal = Array.isArray(adjective.details[field]) ? adjective.details[field] : [adjective.details[field]];
            
            if (!nounVal.some(v => adjVal.includes(v))) {
                const fieldNames = {
                    gender: 'מין',
                    number: 'מספר',
                    definiteness: 'יידוע'
                };
                issues.push(fieldNames[field] || field);
            }
        }
    }
    
    return issues;
}

// Open modal to manage arch properties (main roof, clause)
function openArchPropertiesModal(arch) {
    let modal = document.getElementById('arch-properties-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'arch-properties-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>תכונות גג</h3>
                <div class="arch-properties">
                    <div class="property-group">
                        <label>
                            <input type="checkbox" id="arch-is-main-roof" />
                            גג ראשי (רמת משפט)
                        </label>
                    </div>
                    <div class="property-group">
                        <label>
                            <input type="checkbox" id="arch-is-clause" />
                            פסוקית משנה
                        </label>
                    </div>
                    <div id="regular-arch-options" style="margin-top: 15px;">
                        <label>חלק תחבירי (לגגות רגילים):</label>
                        <select id="arch-syntactic-role" class="form-control">
                            <option value="">בחר חלק תחבירי</option>
                            <option value="נושא">נושא</option>
                            <option value="נשוא">נשוא</option>
                            <option value="מושא">מושא</option>
                            <option value="תיאור">תיאור</option>
                            <option value="גרעין">גרעין</option>
                            <option value="לוואי סומך">לוואי סומך</option>
                            <option value="לוואי שם תואר">לוואי שם תואר</option>
                            <option value="לוואי צירוף יחס">לוואי צירוף יחס</option>
                        </select>
                    </div>
                    <div id="main-roof-options" style="display: none; margin-top: 15px;">
                        <label>בחר מודל משפט:</label>
                        <div class="model-options">
                            <button class="model-btn" data-model="A">מודל A (משפט פועלי)<br/>פועל → שם עצם</button>
                            <button class="model-btn" data-model="B">מודל B (משפט שמני)<br/>שם עצם → נשוא</button>
                            <button class="model-btn" data-model="C">מודל C (משפט הפוך)<br/>מילית יחס → שם עצם</button>
                        </div>
                    </div>
                    <div id="clause-options" style="display: none; margin-top: 15px;">
                        <label>תפקיד חיצוני (במשפט האב):</label>
                        <div class="clause-role-options">
                            <button class="clause-role-btn" data-role="נשוא" style="background: #3b82f6; color: white;">נשוא</button>
                            <button class="clause-role-btn" data-role="מושא" style="background: #3b82f6; color: white;">מושא</button>
                            <button class="clause-role-btn" data-role="תיאור" style="background: #10b981; color: white;">תיאור</button>
                            <button class="clause-role-btn" data-role="מושא" style="background: #10b981; color: white;">מושא</button>
                            <button class="clause-role-btn" data-role="לוואי סומך" style="background: #fbbf24; color: white;">לוואי סומך</button>
                            <button class="clause-role-btn" data-role="גרעין" style="background: #fbbf24; color: white;">גרעין</button>
                            <button class="clause-role-btn" data-role="לוואי צירוף יחס" style="background: #fbbf24; color: white;">לוואי צירוף יחס</button>
                            <button class="clause-role-btn" data-role="לוואי שם תואר" style="background: #fbbf24; color: white;">לוואי שם תואר</button>
                        </div>
                        <label style="margin-top: 15px;">מבנה פנימי (מודל):</label>
                        <div class="model-options">
                            <button class="model-btn clause-model-btn" data-model="A">מודל A</button>
                            <button class="model-btn clause-model-btn" data-model="B">מודל B</button>
                            <button class="model-btn clause-model-btn" data-model="C">מודל C</button>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="save-arch-properties">שמור</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('arch-properties-modal').classList.remove('show')">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.classList.remove('show');
        
        // Toggle main roof options
        modal.querySelector('#arch-is-main-roof').addEventListener('change', (e) => {
            const options = modal.querySelector('#main-roof-options');
            options.style.display = e.target.checked ? 'block' : 'none';
            if (!e.target.checked) {
                arch.isMainRoof = false;
                arch.model = null;
            }
        });
        
        // Toggle clause options
        modal.querySelector('#arch-is-clause').addEventListener('change', (e) => {
            const options = modal.querySelector('#clause-options');
            const regularOptions = modal.querySelector('#regular-arch-options');
            options.style.display = e.target.checked ? 'block' : 'none';
            regularOptions.style.display = e.target.checked ? 'none' : 'block';
            if (!e.target.checked) {
                arch.isClause = false;
                arch.externalRole = null;
                arch.model = null;
            }
        });
        
        // Toggle main roof options
        modal.querySelector('#arch-is-main-roof').addEventListener('change', (e) => {
            const regularOptions = modal.querySelector('#regular-arch-options');
            regularOptions.style.display = e.target.checked ? 'none' : 'block';
        });
        
        // Model selection for main roof
        modal.querySelectorAll('#main-roof-options .model-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('#main-roof-options .model-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                arch.model = btn.dataset.model;
            };
        });
        
        // Model selection for clause
        modal.querySelectorAll('.clause-model-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.clause-model-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                arch.model = btn.dataset.model;
            };
        });
        
        // Clause role selection
        modal.querySelectorAll('.clause-role-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.clause-role-btn').forEach(b => {
                    b.style.opacity = '1';
                    b.style.transform = 'scale(1)';
                });
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(0.95)';
                arch.externalRole = btn.dataset.role;
            };
        });
        
        // Save button
        modal.querySelector('#save-arch-properties').onclick = () => {
            arch.isMainRoof = modal.querySelector('#arch-is-main-roof').checked;
            arch.isClause = modal.querySelector('#arch-is-clause').checked;
            
            if (arch.isClause) {
                // externalRole is set by button clicks above
            } else if (!arch.isMainRoof) {
                // Regular arch - set syntactic role
                arch.syntacticRole = modal.querySelector('#arch-syntactic-role').value || null;
            }
            
            // Validate if main roof or clause
            if (arch.isMainRoof && arch.model) {
                arch.validation = validateSentenceModel(arch);
            }
            if (arch.isClause && arch.model) {
                arch.clauseValidation = validateSentenceModel(arch);
            }
            
            // Reset firstArchClick to allow creating more arches
            firstArchClick = null;
            
            renderSentence();
            modal.classList.remove('show');
            showValidationMessage('תכונות הגג עודכנו', 'info');
        };
    }
    
    // Set current values
    modal.querySelector('#arch-is-main-roof').checked = arch.isMainRoof || false;
    modal.querySelector('#arch-is-clause').checked = arch.isClause || false;
    modal.querySelector('#main-roof-options').style.display = arch.isMainRoof ? 'block' : 'none';
    modal.querySelector('#clause-options').style.display = arch.isClause ? 'block' : 'none';
    modal.querySelector('#regular-arch-options').style.display = (!arch.isMainRoof && !arch.isClause) ? 'block' : 'none';
    
            // Highlight selected clause role button if exists
            if (arch.externalRole) {
                modal.querySelectorAll('.clause-role-btn').forEach(btn => {
                    if (btn.dataset.role === arch.externalRole) {
                        btn.style.opacity = '0.7';
                        btn.style.transform = 'scale(0.95)';
                    }
                });
            }
    
    if (arch.syntacticRole) {
        modal.querySelector('#arch-syntactic-role').value = arch.syntacticRole;
    }
    
    // Highlight selected model
    if (arch.model) {
        modal.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.model === arch.model) {
                btn.classList.add('selected');
            }
        });
    }
    
    modal.classList.add('show');
}

// Open modal to manage clause properties
function openClauseModal(arch) {
    let modal = document.getElementById('clause-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'clause-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>ניהול פסוקית</h3>
                <div class="clause-properties">
                    <div class="form-group">
                        <label>תפקיד חיצוני (במשפט האב):</label>
                        <select id="clause-external-role-edit" class="form-control">
                            <option value="">בחר תפקיד</option>
                            <option value="מושא">מושא</option>
                            <option value="תיאור">תיאור</option>
                            <option value="לוואי שם תואר">לוואי שם תואר</option>
                            <option value="לוואי צירוף יחס">לוואי צירוף יחס</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>מבנה פנימי (מודל):</label>
                        <div class="model-options">
                            <button class="model-btn clause-model-btn" data-model="A">מודל A</button>
                            <button class="model-btn clause-model-btn" data-model="B">מודל B</button>
                            <button class="model-btn clause-model-btn" data-model="C">מודל C</button>
                        </div>
                    </div>
                    ${arch.clauseValidation ? `<div class="validation-info" style="margin-top: 15px; padding: 10px; border-radius: 5px; background: ${arch.clauseValidation.color === '#10b981' ? '#d4edda' : arch.clauseValidation.color === '#ef4444' ? '#f8d7da' : '#d1ecf1'};">
                        <strong>ולידציה:</strong> ${arch.clauseValidation.message}
                    </div>` : ''}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="save-clause">שמור</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('clause-modal').classList.remove('show')">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.classList.remove('show');
        
        // Model selection
        modal.querySelectorAll('.clause-model-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.clause-model-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                arch.model = btn.dataset.model;
            };
        });
        
        // Save button
        modal.querySelector('#save-clause').onclick = () => {
            arch.externalRole = modal.querySelector('#clause-external-role-edit').value;
            
            if (arch.model) {
                arch.clauseValidation = validateSentenceModel(arch);
            }
            
            renderSentence();
            modal.classList.remove('show');
            showValidationMessage('תכונות הפסוקית עודכנו', 'info');
        };
    }
    
    // Set current values
    if (arch.externalRole) {
        modal.querySelector('#clause-external-role-edit').value = arch.externalRole;
    }
    
    // Highlight selected model
    if (arch.model) {
        modal.querySelectorAll('.clause-model-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.model === arch.model) {
                btn.classList.add('selected');
            }
        });
    }
    
    modal.classList.add('show');
}

// Open model selection modal immediately after arch creation
function openModelSelectionModal(arch) {
    let modal = document.getElementById('model-selection-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'model-selection-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>בחר דגם משפט</h3>
                <div class="model-options">
                    <button class="model-btn" data-model="A">דגם A (משפט פועלי)<br/>פועל → שם עצם</button>
                    <button class="model-btn" data-model="B">דגם B (משפט שמני)<br/>שם עצם → נשוא</button>
                    <button class="model-btn" data-model="C">דגם C (משפט הפוך)<br/>מילית יחס → שם עצם</button>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('model-selection-modal').classList.remove('show')">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.classList.remove('show');
        
        // Model selection
        modal.querySelectorAll('.model-btn').forEach(btn => {
            btn.onclick = () => {
                const model = btn.dataset.model;
                arch.model = model;
                arch.isMainRoof = true;
                
                // Validate immediately
                arch.validation = validateSentenceModel(arch);
                
                modal.classList.remove('show');
                
                // Now open syntactic role selection
                openSyntacticRoleModal(arch);
            };
        });
    }
    
    modal.classList.add('show');
}

// Open modal to select sentence model for arch
function openArchModelModal(arch) {
    // Create or get model selection modal
    let modal = document.getElementById('arch-model-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'arch-model-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>בחר מודל משפט</h3>
                <div class="model-options">
                    <button class="model-btn" data-model="A">מודל A (משפט פועלי)<br/>פועל → שם עצם</button>
                    <button class="model-btn" data-model="B">מודל B (משפט שמני)<br/>שם עצם → נשוא</button>
                    <button class="model-btn" data-model="C">מודל C (משפט הפוך)<br/>מילית יחס → שם עצם</button>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('arch-model-modal').classList.remove('show')">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.close').onclick = () => modal.classList.remove('show');
        
        // Model selection
        modal.querySelectorAll('.model-btn').forEach(btn => {
            btn.onclick = () => {
                const model = btn.dataset.model;
                arch.isMainRoof = true;
                arch.model = model;
                
                // Validate the model
                const validation = validateSentenceModel(arch);
                arch.validation = validation;
                
                // Update arch color
                renderSentence();
                
                modal.classList.remove('show');
                showValidationMessage(validation.message, validation.valid ? 'info' : 'error');
            };
        });
    }
    
    modal.classList.add('show');
}

// Open modal for logical connection type selection
function openLogicalConnectionModal(wordId1, posId1, wordId2, posId2) {
    let modal = document.getElementById('logical-connection-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'logical-connection-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>בחר סוג קשר לוגי</h3>
                <div class="logical-options">
                    <button class="logical-btn" data-type="between-sentences">אופציה א: בין שני משפטים<br/>דורש נושא ונשוא בשני הצדדים</button>
                    <button class="logical-btn" data-type="coordination">אופציה ב: תיאום/תמורה<br/>דורש התאמה במין, מספר, יחסה, יידוע</button>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('logical-connection-modal').classList.remove('show')">ביטול</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.classList.remove('show');
        
        modal.querySelectorAll('.logical-btn').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
                createLogicalConnection(wordId1, posId1, wordId2, posId2, type);
                modal.classList.remove('show');
            };
        });
    }
    
    modal.classList.add('show');
}

// Create logical connection
function createLogicalConnection(wordId1, posId1, wordId2, posId2, type) {
    const word1 = words.find(w => w.id === wordId1);
    const word2 = words.find(w => w.id === wordId2);
    const pos1 = word1?.getPartOfSpeech(posId1);
    const pos2 = word2?.getPartOfSpeech(posId2);
    
    if (!pos1 || !pos2) return;
    
    let validation = null;
    
    if (type === 'between-sentences') {
        // Option A: Both sides must have Subject and Predicate
        // For now, just check if both are valid PoS (can be enhanced)
        validation = {
            valid: true,
            message: 'קשר לוגי בין משפטים נוצר'
        };
    } else if (type === 'coordination') {
        // Option B: Must match PoS Type, Case, Gender, Number, Definiteness
        if (pos1.type !== pos2.type) {
            validation = {
                valid: false,
                message: 'קשר תיאום דורש אותו סוג חלק דיבר'
            };
        } else {
            // Check matching attributes
            const mismatches = [];
            if (pos1.details.gender && pos2.details.gender && pos1.details.gender !== pos2.details.gender) {
                mismatches.push('מין');
            }
            if (pos1.details.number && pos2.details.number && pos1.details.number !== pos2.details.number) {
                mismatches.push('מספר');
            }
            if (pos1.details.definiteness && pos2.details.definiteness && pos1.details.definiteness !== pos2.details.definiteness) {
                mismatches.push('יידוע');
            }
            
            const cases1 = pos1.details.cases || pos1.details.case;
            const cases2 = pos2.details.cases || pos2.details.case;
            if (cases1 && cases2) {
                const arr1 = Array.isArray(cases1) ? cases1 : [cases1];
                const arr2 = Array.isArray(cases2) ? cases2 : [cases2];
                if (!arraysIntersect(arr1, arr2)) {
                    mismatches.push('יחסה');
                }
            }
            
            if (mismatches.length > 0) {
                validation = {
                    valid: false,
                    message: `חוסר התאמה ב${mismatches.join(', ')}`
                };
            } else {
                validation = {
                    valid: true,
                    message: 'קשר תיאום/תמורה תקין'
                };
            }
        }
    }
    
    if (validation && validation.valid) {
        const index1 = words.findIndex(w => w.id === wordId1);
        const index2 = words.findIndex(w => w.id === wordId2);
        const splitPoint = (index1 + index2) / 2;
        
        logicalConnections.push({
            id: `logical_${Date.now()}_${Math.random()}`,
            wordId1: wordId1,
            posId1: posId1,
            wordId2: wordId2,
            posId2: posId2,
            type: type,
            splitPoint: splitPoint
        });
        
        showValidationMessage(validation.message, 'info');
        renderSentence();
    } else if (validation) {
        showValidationMessage(validation.message, 'error');
    }
}

// Render logical connection icons (+)
function renderLogicalConnections() {
    // Remove existing logical connection icons
    document.querySelectorAll('.logical-connection-icon').forEach(icon => icon.remove());
    
    if (logicalConnections.length === 0) return;
    
    const container = document.getElementById('sentence-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    logicalConnections.forEach(logical => {
        const word1 = words.find(w => w.id === logical.wordId1);
        const word2 = words.find(w => w.id === logical.wordId2);
        const index1 = words.findIndex(w => w.id === logical.wordId1);
        const index2 = words.findIndex(w => w.id === logical.wordId2);
        
        if (word1 && word2 && index1 !== -1 && index2 !== -1) {
            // Find split point between words
            const wordWrapper1 = container.querySelector(`[data-word-id="${logical.wordId1}"]`);
            const wordWrapper2 = container.querySelector(`[data-word-id="${logical.wordId2}"]`);
            
            if (wordWrapper1 && wordWrapper2) {
                const rect1 = wordWrapper1.getBoundingClientRect();
                const rect2 = wordWrapper2.getBoundingClientRect();
                
                // Calculate midpoint
                const midX = (rect1.left + rect2.left) / 2 - containerRect.left + (rect1.width + rect2.width) / 4;
                const midY = Math.min(rect1.top, rect2.top) - containerRect.top - 30;
                
                // Create + icon
                const icon = document.createElement('div');
                icon.className = 'logical-connection-icon';
                icon.innerHTML = '+';
                icon.style.position = 'absolute';
                icon.style.left = `${midX}px`;
                icon.style.top = `${midY}px`;
                icon.style.transform = 'translate(-50%, -50%)';
                icon.style.width = '30px';
                icon.style.height = '30px';
                icon.style.background = '#667eea';
                icon.style.color = 'white';
                icon.style.borderRadius = '50%';
                icon.style.display = 'flex';
                icon.style.alignItems = 'center';
                icon.style.justifyContent = 'center';
                icon.style.fontSize = '20px';
                icon.style.fontWeight = 'bold';
                icon.style.cursor = 'pointer';
                icon.style.zIndex = '15';
                
                container.appendChild(icon);
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').classList.remove('show');
        };
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    };

    // Delete mode button
    const deleteBtn = document.getElementById('delete-mode-btn');
    if (deleteBtn) {
        deleteBtn.onclick = toggleDeleteMode;
    }
    
    // Logical connection mode button
    const logicalBtn = document.getElementById('logical-connection-mode-btn');
    if (logicalBtn) {
        logicalBtn.onclick = toggleLogicalConnectionMode;
    }
}

// Open part of speech selection modal (original grid layout)
function openPartOfSpeechModal(wordId) {
    currentWordId = wordId;
    const modal = document.getElementById('pos-modal');
    const optionsContainer = document.getElementById('pos-options');
    
    optionsContainer.innerHTML = '';
    
    const options = getPartOfSpeechOptions();
    options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'pos-option';
        // Add column class (0-3) for different colors
        const columnIndex = getPartOfSpeechColumnIndex(option.key);
        optionDiv.classList.add(`pos-column-${columnIndex}`);
        optionDiv.textContent = option.name;
        optionDiv.onclick = () => selectPartOfSpeech(option.key);
        optionsContainer.appendChild(optionDiv);
    });

    modal.classList.add('show');
}

// Select a part of speech
function selectPartOfSpeech(type) {
    if (!currentWordId) return;

    const word = words.find(w => w.id === currentWordId);
    if (!word) return;

    let defaultDetails = {};
    
    // Set default noun details
    if (type === 'noun') {
        defaultDetails = getDefaultNounDetails();
    }
    
    // Add the part of speech
    word.addPartOfSpeech(type, defaultDetails);

    // Close modal
    document.getElementById('pos-modal').classList.remove('show');

    // Check if particle - skip settings menu
    if (isParticleType(type)) {
        // Particles don't need settings, just add and render
        renderSentence();
        return;
    }

    // Open details panel for non-particles
    const newPos = word.partsOfSpeech[word.partsOfSpeech.length - 1];
    openDetailsPanel(word.id, newPos.id);

    // Re-render
    renderSentence();
}

// Open details panel for a part of speech (side panel, not covering)
function openDetailsPanel(wordId, posId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    const pos = word.getPartOfSpeech(posId);
    if (!pos) return;

    openDetailsPanelWithDetails(wordId, posId, pos.details || {});
}

// Helper: Create multi-value input with '+' button
function createMultiValueInput(key, detail, currentValues, container) {
    const values = Array.isArray(currentValues) ? currentValues : (currentValues ? [currentValues] : []);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-value-wrapper';
    wrapper.dataset.fieldKey = key;
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    wrapper.appendChild(label);
    
    const valuesContainer = document.createElement('div');
    valuesContainer.className = 'multi-values-container';
    
    // Add existing values
    values.forEach((value, index) => {
        const valueInput = createSingleValueInput(key, detail, value, index, valuesContainer);
        valuesContainer.appendChild(valueInput);
    });
    
    // Add '+' button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-value-btn';
    addBtn.innerHTML = '+';
    addBtn.onclick = () => {
        const newInput = createSingleValueInput(key, detail, '', values.length, valuesContainer);
        valuesContainer.appendChild(newInput);
        newInput.querySelector('input, select').focus();
    };
    wrapper.appendChild(valuesContainer);
    wrapper.appendChild(addBtn);
    
    container.appendChild(wrapper);
    return wrapper;
}

// Helper: Create single value input (for multi-value fields)
function createSingleValueInput(key, detail, value, index, container) {
    const valueWrapper = document.createElement('div');
    valueWrapper.className = 'single-value-item';
    valueWrapper.dataset.index = index;
    
    let input;
    if (detail.type === 'text' || (detail.type === 'text' && detail.multi)) {
        input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.placeholder = detail.placeholder || 'הזן ' + detail.label.toLowerCase();
        
        // Add transliteration for root field
        if (key === 'root') {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const hebrewText = input.value;
                    const arabicText = transliterateHebrewToArabic(hebrewText);
                    input.value = arabicText;
                }
            });
        }
    } else if (detail.type === 'select' || detail.type === 'multiselect') {
        input = document.createElement('select');
        detail.options.forEach(option => {
            const optionEl = document.createElement('option');
            // Handle both string options and object options (with value/label)
            if (typeof option === 'object' && option.value !== undefined) {
                optionEl.value = option.value;
                optionEl.textContent = option.label || option.value;
                if (value === option.value) {
                    optionEl.selected = true;
                }
            } else {
                optionEl.value = option;
                optionEl.textContent = option;
                if (value === option) {
                    optionEl.selected = true;
                }
            }
            input.appendChild(optionEl);
        });
    }
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-value-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => {
        valueWrapper.remove();
    };
    
    valueWrapper.appendChild(input);
    valueWrapper.appendChild(removeBtn);
    
    if (container) {
        container.appendChild(valueWrapper);
    }
    
    return valueWrapper;
}

// Helper: Create multi-checkbox field with Arabic diacritics for cases
function createMultiCheckboxFieldWithDiacritics(key, detail, currentValues, container) {
    const values = Array.isArray(currentValues) ? currentValues : (currentValues ? [currentValues] : []);
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group checkbox-group';
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    formGroup.appendChild(label);
    
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'checkboxes-container';
    
    // Case labels with Arabic diacritics
    const caseLabels = {
        'יחסה ראשונה': 'יחסה ראשונה - _ُ (צ׳מה)',
        'יחסה שנייה': 'יחסה שנייה - _َ (פתחה)',
        'יחסה שלישית': 'יחסה שלישית - _ِ (כסרה)'
    };
    
    detail.options.forEach(option => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `detail_${key}_${option}`;
        checkbox.value = option;
        checkbox.checked = values.includes(option);
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', `detail_${key}_${option}`);
        checkboxLabel.textContent = caseLabels[option] || option;
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(checkboxLabel);
        checkboxesContainer.appendChild(checkboxItem);
    });
    
    formGroup.appendChild(checkboxesContainer);
    container.appendChild(formGroup);
    return formGroup;
}

// Scroll panel to next section or save button after selection
function scrollPanelToNextSection(currentElement) {
    const panel = document.getElementById('details-panel');
    if (!panel) return;

    // Find the next sibling form group after the current element's parent form group
    let parentFormGroup = currentElement.closest('.form-group');
    if (parentFormGroup) {
        const nextSection = parentFormGroup.nextElementSibling;
        if (nextSection) {
            // Scroll to the next section with smooth animation
            setTimeout(() => {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            // No next section, scroll to save button
            const saveBtn = document.getElementById('save-details-btn');
            if (saveBtn) {
                setTimeout(() => {
                    saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }
}

// Helper: Create gender/number selector like verb forms (single selection, 6 buttons)
function createGenderNumberSelector(key, detail, currentValues, container) {
    // currentValues can be object {gender, number} or array/string
    let currentGender = 'זכר';
    let currentNumber = 'יחיד';
    
    if (typeof currentValues === 'object' && currentValues !== null && !Array.isArray(currentValues)) {
        currentGender = currentValues.gender || 'זכר';
        currentNumber = currentValues.number || 'יחיד';
    } else if (typeof currentValues === 'string') {
        // Try to parse from string
        if (currentValues.includes('זכר')) currentGender = 'זכר';
        if (currentValues.includes('נקבה')) currentGender = 'נקבה';
        if (currentValues.includes('יחיד')) currentNumber = 'יחיד';
        if (currentValues.includes('זוגי')) currentNumber = 'זוגי';
        if (currentValues.includes('רבים') || currentValues.includes('רבות')) currentNumber = currentValues.includes('רבות') ? 'רבות' : 'רבים';
    }
    
    // Get current combination value
    const currentValue = `${currentGender} ${currentNumber === 'רבות' ? 'רבות' : currentNumber}`;
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group gender-number-group';
    formGroup.dataset.fieldKey = 'gender_number';
    
    const label = document.createElement('label');
    label.textContent = detail.label || 'מין ומספר';
    formGroup.appendChild(label);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'gender-number-container-2x3';
    
    // Create table: 2 columns (זכר/נקבה), 3 rows (יחיד/זוגי/ריבוי)
    const table = document.createElement('table');
    table.className = 'gender-number-table-2x3';
    
    // Header row
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    const maleHeader = document.createElement('th');
    maleHeader.textContent = 'זכר';
    headerRow.appendChild(maleHeader);
    const femaleHeader = document.createElement('th');
    femaleHeader.textContent = 'נקבה';
    headerRow.appendChild(femaleHeader);
    table.appendChild(headerRow);
    
    // Data rows: יחיד, זוגי, ריבוי
    const rows = [
        { number: 'יחיד', maleSymbol: '👔', femaleSymbol: '🎀', maleLabel: 'יחיד', femaleLabel: 'יחידה', femaleNumber: 'יחיד' },
        { number: 'זוגי', maleSymbol: '👔👔', femaleSymbol: '🎀🎀', maleLabel: 'זוגי', femaleLabel: 'זוגי', femaleNumber: 'זוגי' },
        { number: 'רבים', maleSymbol: '👔👔👔👔👔', femaleSymbol: '🎀🎀🎀🎀🎀', maleLabel: 'רבים', femaleLabel: 'רבות', femaleNumber: 'רבות' }
    ];
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        // Row header
        const rowHeader = document.createElement('td');
        rowHeader.className = 'number-header';
        rowHeader.textContent = row.number === 'רבים' ? 'ריבוי' : row.number;
        tr.appendChild(rowHeader);
        
        // Male cell
        const maleCell = document.createElement('td');
        const maleBtn = document.createElement('button');
        maleBtn.type = 'button';
        maleBtn.className = 'gender-number-cell-btn';
        maleBtn.dataset.gender = 'זכר';
        maleBtn.dataset.number = row.number;
        maleBtn.innerHTML = `<span class="symbol">${row.maleSymbol}</span><span class="label-text">${row.maleLabel}</span>`;
        
        // Check if selected
        if (currentGender === 'זכר' && currentNumber === row.number) {
            maleBtn.classList.add('selected');
        }
        
        maleBtn.onclick = () => {
            // Single selection - deselect all others, select this one
            buttonsContainer.querySelectorAll('.gender-number-cell-btn').forEach(b => b.classList.remove('selected'));
            maleBtn.classList.add('selected');
            // Scroll to bottom of the table after selection
            scrollPanelToNextSection(buttonsContainer);
        };
        maleCell.appendChild(maleBtn);
        tr.appendChild(maleCell);

        // Female cell
        const femaleCell = document.createElement('td');
        const femaleBtn = document.createElement('button');
        femaleBtn.type = 'button';
        femaleBtn.className = 'gender-number-cell-btn';
        femaleBtn.dataset.gender = 'נקבה';
        femaleBtn.dataset.number = row.femaleNumber || row.number;
        femaleBtn.innerHTML = `<span class="symbol">${row.femaleSymbol}</span><span class="label-text">${row.femaleLabel}</span>`;

        // Check if selected
        const femaleNumber = row.femaleNumber || row.number;
        if (currentGender === 'נקבה' && currentNumber === femaleNumber) {
            femaleBtn.classList.add('selected');
        }

        femaleBtn.onclick = () => {
            // Single selection - deselect all others, select this one
            buttonsContainer.querySelectorAll('.gender-number-cell-btn').forEach(b => b.classList.remove('selected'));
            femaleBtn.classList.add('selected');
            // Scroll to bottom of the table after selection
            scrollPanelToNextSection(buttonsContainer);
        };
        femaleCell.appendChild(femaleBtn);
        tr.appendChild(femaleCell);
        
        table.appendChild(tr);
    });
    
    buttonsContainer.appendChild(table);
    
    formGroup.appendChild(buttonsContainer);
    container.appendChild(formGroup);
    return formGroup;
}

// Helper: Create multi-checkbox field (for cases)
function createMultiCheckboxField(key, detail, currentValues, container) {
    const values = Array.isArray(currentValues) ? currentValues : (currentValues ? [currentValues] : detail.default || []);
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group checkbox-group';
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    formGroup.appendChild(label);
    
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'checkboxes-container';
    
    detail.options.forEach(option => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `detail_${key}_${option}`;
        checkbox.value = option;
        checkbox.checked = values.includes(option);
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', `detail_${key}_${option}`);
        checkboxLabel.textContent = option;
        
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkboxLabel);
        checkboxesContainer.appendChild(checkboxWrapper);
    });
    
    formGroup.appendChild(checkboxesContainer);
    container.appendChild(formGroup);
}

// Helper: Create verb time buttons (עבר, עתיד, עתיד מנצוב, עתיד מג'זום, ציווי)
function createVerbTimeButtons(key, detail, currentValues, voice, container) {
    const values = Array.isArray(currentValues) ? currentValues : (currentValues ? [currentValues] : []);
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group verb-time-group';
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    formGroup.appendChild(label);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'verb-time-container';
    
    // Time options
    const timeOptions = [
        { value: 'עבר', label: 'עבר' },
        { value: 'עתיד', label: 'עתיד' },
        { value: 'עתיד מנצוב', label: 'עתיד מנצוב' },
        { value: 'עתיד מג\'זום', label: 'עתיד מג\'זום' },
        { value: 'ציווי', label: 'ציווי' }
    ];
    
    timeOptions.forEach(option => {
        // Skip ציווי if voice is סביל
        if (option.value === 'ציווי' && voice === 'סביל') {
            return;
        }
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'verb-time-btn';
        btn.dataset.value = option.value;
        btn.textContent = option.label;
        
        if (values.includes(option.value)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => {
            // Allow multiple selections for homonymy
            btn.classList.toggle('selected');
        };
        
        buttonsContainer.appendChild(btn);
    });
    
    formGroup.appendChild(buttonsContainer);
    container.appendChild(formGroup);
    return formGroup;
}

// Helper: Create verb voice button (פעיל/סביל) - large toggle
function createVerbVoiceButton(key, detail, currentValue, container) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group verb-voice-group';
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    formGroup.appendChild(label);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'verb-voice-container';
    
    const activeBtn = document.createElement('button');
    activeBtn.type = 'button';
    activeBtn.className = 'verb-voice-btn';
    activeBtn.dataset.value = 'פעיל';
    activeBtn.textContent = 'פעיל';
    activeBtn.id = `detail_${key}_active`;
    
    const passiveBtn = document.createElement('button');
    passiveBtn.type = 'button';
    passiveBtn.className = 'verb-voice-btn';
    passiveBtn.dataset.value = 'סביל';
    passiveBtn.textContent = 'סביל';
    passiveBtn.id = `detail_${key}_passive`;
    
    // Set initial state
    if (currentValue === 'סביל') {
        passiveBtn.classList.add('selected');
    } else {
        activeBtn.classList.add('selected');
    }
    
    // Toggle behavior - only one can be selected
    activeBtn.onclick = () => {
        activeBtn.classList.add('selected');
        passiveBtn.classList.remove('selected');
        // Disable ציווי if switching to סביל
        const timeButtons = container.querySelectorAll('.verb-time-btn[data-value="ציווי"]');
        timeButtons.forEach(btn => {
            if (passiveBtn.classList.contains('selected')) {
                btn.disabled = true;
                btn.classList.remove('selected');
            } else {
                btn.disabled = false;
            }
        });
    };
    
    passiveBtn.onclick = () => {
        passiveBtn.classList.add('selected');
        activeBtn.classList.remove('selected');
        // Disable ציווי when passive
        const timeButtons = container.querySelectorAll('.verb-time-btn[data-value="ציווי"]');
        timeButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
        });
    };
    
    buttonsContainer.appendChild(activeBtn);
    buttonsContainer.appendChild(passiveBtn);
    formGroup.appendChild(buttonsContainer);
    container.appendChild(formGroup);
    return formGroup;
}

// Helper: Create verb form buttons (10 Arabic forms)
function createVerbFormButtons(key, detail, currentValues, container) {
    const values = Array.isArray(currentValues) ? currentValues : (currentValues ? [currentValues] : []);
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group verb-forms-group';
    
    const label = document.createElement('label');
    label.textContent = detail.label;
    formGroup.appendChild(label);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'verb-forms-container';
    
    detail.options.forEach(form => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'verb-form-btn';
        btn.dataset.value = form.value;
        btn.innerHTML = `<span class="form-number">${form.value}</span><span class="form-arabic">${form.arabic}</span>`;
        
        if (values.includes(form.value)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => {
            btn.classList.toggle('selected');
        };
        
        buttonsContainer.appendChild(btn);
    });
    
    formGroup.appendChild(buttonsContainer);
    container.appendChild(formGroup);
}

// Open details panel with specific details (for demonstrative case updates)
function openDetailsPanelWithDetails(wordId, posId, detailsToShow) {
    currentWordId = wordId;
    currentPartOfSpeechId = posId;
    
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    const pos = word.getPartOfSpeech(posId);
    if (!pos) return;

    const panel = document.getElementById('details-panel');
    const title = document.getElementById('details-panel-title');
    const form = document.getElementById('details-panel-form');

    title.textContent = `פרטי ${getPartOfSpeechName(pos.type)}`;
    form.innerHTML = '';

    const detailsStructure = getPartOfSpeechDetails(pos.type);
    const bonusStructure = getPartOfSpeechBonus(pos.type);
    const details = detailsToShow || pos.details || {};

    // Create required fields container
    const requiredContainer = document.createElement('div');
    requiredContainer.className = 'details-required-fields';

    // Special handling: gender and number together for nouns/adjectives/demonstratives
    const hasGenderNumber = (pos.type === 'noun' || pos.type === 'adjective' || pos.type === 'demonstrative') &&
                           (detailsStructure.gender || detailsStructure.number);
    
    if (hasGenderNumber) {
        // Create combined gender/number selector
        const combinedDetail = { label: 'מין ומספר', type: 'combined' };
        createGenderNumberSelector('gender_number', combinedDetail, {
            gender: details.gender || 'זכר',
            number: details.number || 'יחיד'
        }, requiredContainer);
    }

    Object.keys(detailsStructure).forEach(key => {
        const detail = detailsStructure[key];
        
        // Skip gender/number if we already created combined selector
        if (hasGenderNumber && (key === 'gender' || key === 'number')) {
            return;
        }
        
        // Handle verb forms (10 Arabic buttons) - special case
        if (key === 'binyan' && detail.type === 'multiselect') {
            createVerbFormButtons(key, detail, details[key], requiredContainer);
        }
        // Handle verb time as buttons (like binyan)
        else if (key === 'time' && pos.type === 'verb' && detail.type === 'multiselect') {
            createVerbTimeButtons(key, detail, details[key], details.voice || 'פעיל', requiredContainer);
        }
        // Handle verb voice (active/passive) - large toggle button
        else if (key === 'voice' && pos.type === 'verb') {
            createVerbVoiceButton(key, detail, details[key] || 'פעיל', requiredContainer);
        }
        // Handle multi-value fields (with '+' button)
        else if (detail.multi || detail.type === 'multiselect') {
            createMultiValueInput(key, detail, details[key], requiredContainer);
        }
        // Handle definiteness as binary toggle buttons
        else if (key === 'definiteness' && (pos.type === 'noun' || pos.type === 'adjective' || pos.type === 'personalPronoun')) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group definiteness-group';
            
            const label = document.createElement('label');
            label.textContent = detail.label;
            formGroup.appendChild(label);
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'definiteness-buttons';
            
            const definiteBtn = document.createElement('button');
            definiteBtn.type = 'button';
            definiteBtn.className = 'definiteness-btn';
            definiteBtn.dataset.value = 'מיודע';
            definiteBtn.innerHTML = '<span class="definiteness-indicator"></span><span class="definiteness-text">מיודע</span>';
            definiteBtn.id = `detail_${key}_definite`;
            
            const indefiniteBtn = document.createElement('button');
            indefiniteBtn.type = 'button';
            indefiniteBtn.className = 'definiteness-btn';
            indefiniteBtn.dataset.value = 'לא מיודע';
            indefiniteBtn.innerHTML = '<span class="definiteness-indicator"></span><span class="definiteness-text">לא מיודע</span>';
            indefiniteBtn.id = `detail_${key}_indefinite`;
            
            // Set initial state - default to 'מיודע'
            const currentValue = details[key] || 'מיודע';
            if (currentValue === 'מיודע') {
                definiteBtn.classList.add('selected');
                definiteBtn.querySelector('.definiteness-indicator').style.backgroundColor = '#3b82f6';
            } else {
                indefiniteBtn.classList.add('selected');
                indefiniteBtn.querySelector('.definiteness-indicator').style.backgroundColor = '#3b82f6';
            }
            
            // Toggle behavior - only one can be selected
            definiteBtn.onclick = () => {
                definiteBtn.classList.add('selected');
                indefiniteBtn.classList.remove('selected');
                definiteBtn.querySelector('.definiteness-indicator').style.backgroundColor = '#3b82f6';
                indefiniteBtn.querySelector('.definiteness-indicator').style.backgroundColor = 'transparent';
                // Scroll to next section
                scrollPanelToNextSection(buttonsContainer);
            };

            indefiniteBtn.onclick = () => {
                indefiniteBtn.classList.add('selected');
                definiteBtn.classList.remove('selected');
                indefiniteBtn.querySelector('.definiteness-indicator').style.backgroundColor = '#3b82f6';
                definiteBtn.querySelector('.definiteness-indicator').style.backgroundColor = 'transparent';
                // Scroll to next section
                scrollPanelToNextSection(buttonsContainer);
            };
            
            buttonsContainer.appendChild(definiteBtn);
            buttonsContainer.appendChild(indefiniteBtn);
            formGroup.appendChild(buttonsContainer);
            requiredContainer.appendChild(formGroup);
        }
        // Handle regular select
        else if (detail.type === 'select') {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = detail.label;
            label.setAttribute('for', `detail_${key}`);

            const input = document.createElement('select');
            input.id = `detail_${key}`;
            
            detail.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                if (details[key] === option) {
                    optionEl.selected = true;
                }
                input.appendChild(optionEl);
            });

            // Special handling for demonstrative number change
            if (key === 'number' && pos.type === 'demonstrative') {
                input.onchange = () => {
                    const tempDetails = { ...details };
                    const detailsStructure = getPartOfSpeechDetails(pos.type);
                    Object.keys(detailsStructure).forEach(detailKey => {
                        const detailInput = document.getElementById(`detail_${detailKey}`);
                        if (detailInput && detailInput.value) {
                            tempDetails[detailKey] = detailInput.value;
                        }
                    });
                    tempDetails.number = input.value;
                    setTimeout(() => {
                        openDetailsPanelWithDetails(currentWordId, currentPartOfSpeechId, tempDetails);
                    }, 50);
                };
            }

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            requiredContainer.appendChild(formGroup);
        }
        // Handle text input
        else {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = detail.label;
            label.setAttribute('for', `detail_${key}`);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `detail_${key}`;
            input.value = details[key] || '';
            input.placeholder = 'הזן ' + detail.label.toLowerCase();
            
            // Add transliteration for root field
            if (key === 'root') {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const hebrewText = input.value;
                        const arabicText = transliterateHebrewToArabic(hebrewText);
                        input.value = arabicText;
                    }
                });
            }

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            requiredContainer.appendChild(formGroup);
        }
    });

    form.appendChild(requiredContainer);

    // Create bonus fields container (case - optional, or demonstrative case if dual)
    const shouldShowBonus = Object.keys(bonusStructure).length > 0 || 
                           (pos.type === 'demonstrative' && details.number === 'זוגי');
    
    if (shouldShowBonus) {
        const bonusContainer = document.createElement('div');
        bonusContainer.className = 'details-bonus-fields';

        const bonusTitle = document.createElement('div');
        bonusTitle.className = 'bonus-title';
        bonusTitle.textContent = 'בונוס (אופציונלי)';
        bonusContainer.appendChild(bonusTitle);

        // Show case for demonstrative if dual
        if (pos.type === 'demonstrative' && details.number === 'זוגי') {
            const caseStructure = { case: { label: 'יחסה', type: 'select', options: ['יחסה ראשונה', 'יחסה שנייה', 'יחסה שלישית'] } };
            Object.keys(caseStructure).forEach(key => {
                const detail = caseStructure[key];
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group bonus-group';

                const label = document.createElement('label');
                label.textContent = detail.label;
                label.setAttribute('for', `detail_${key}`);

                if (detail.type === 'select') {
                    const input = document.createElement('select');
                    input.id = `detail_${key}`;
                    
                    detail.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option;
                        optionEl.textContent = option;
                        if (details[key] === option) {
                            optionEl.selected = true;
                        }
                        input.appendChild(optionEl);
                    });

                    formGroup.appendChild(label);
                    formGroup.appendChild(input);
                    bonusContainer.appendChild(formGroup);
                }
            });
        }

        // Show other bonus fields
        Object.keys(bonusStructure).forEach(key => {
            const detail = bonusStructure[key];
            
            // Handle multi-checkbox (for cases)
            if (detail.type === 'multicheckbox') {
                createMultiCheckboxFieldWithDiacritics(key, detail, details[key], bonusContainer);
            }
            // Handle regular select
            else if (detail.type === 'select') {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group bonus-group';

                const label = document.createElement('label');
                label.textContent = detail.label;
                label.setAttribute('for', `detail_${key}`);

                const input = document.createElement('select');
                input.id = `detail_${key}`;
                
                detail.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option;
                    if (details[key] === option) {
                        optionEl.selected = true;
                    }
                    input.appendChild(optionEl);
                });

                formGroup.appendChild(label);
                formGroup.appendChild(input);
                bonusContainer.appendChild(formGroup);
            }
        });

        form.appendChild(bonusContainer);
    }

    // Show panel
    panel.classList.add('show');
    document.body.classList.add('panel-open');

    // Scroll to top of the panel when opening
    setTimeout(() => {
        panel.scrollTop = 0;
        const formContainer = document.getElementById('details-panel-form');
        if (formContainer) {
            formContainer.scrollTop = 0;
        }
    }, 50);
    
    // Add click handler for clicking outside the panel
    const handleOutsideClick = (e) => {
        // Don't handle clicks on buttons, inputs, or inside the panel
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || 
            e.target.closest('.details-panel')) {
            return;
        }
        
        if (panel.classList.contains('show')) {
            // Clicked outside the panel
            closeDetailsPanel();
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    
    // Remove any existing listener and add new one
    document.removeEventListener('click', handleOutsideClick);
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
}


// Check if there are unsaved changes in the details panel
function hasUnsavedChanges() {
    if (!currentWordId || !currentPartOfSpeechId) return false;
    
    const word = words.find(w => w.id === currentWordId);
    if (!word) return false;
    
    const pos = word.getPartOfSpeech(currentPartOfSpeechId);
    if (!pos) return false;
    
    // Check if any form values differ from saved values
    const detailsStructure = getPartOfSpeechDetails(pos.type);
    const bonusStructure = getPartOfSpeechBonus(pos.type);
    const savedDetails = pos.details || {};
    
    // Check required fields
    for (const key of Object.keys(detailsStructure)) {
        const detail = detailsStructure[key];
        const input = document.getElementById(`detail_${key}`);
        if (input) {
            if (input.type === 'checkbox') {
                if (input.checked !== (savedDetails[key] === true)) {
                    return true;
                }
            } else if (input.value !== (savedDetails[key] || '')) {
                return true;
            }
        }
        
        // Check definiteness buttons
        if (key === 'definiteness') {
            const definiteBtn = document.getElementById('detail_definiteness_definite');
            const indefiniteBtn = document.getElementById('detail_definiteness_indefinite');
            if (definiteBtn && indefiniteBtn) {
                const currentValue = definiteBtn.classList.contains('selected') ? 'מיודע' : 'לא מיודע';
                if (currentValue !== (savedDetails[key] || 'לא מיודע')) {
                    return true;
                }
            }
        }
        
        // Check gender/number selector
        if (key === 'gender' || key === 'number') {
            const genderNumberGroup = document.querySelector('[data-field-key="gender_number"]');
            if (genderNumberGroup) {
                const selectedButton = genderNumberGroup.querySelector('.gender-number-btn.selected');
                if (selectedButton) {
                    const currentGender = selectedButton.dataset.gender;
                    const currentNumber = selectedButton.dataset.number;
                    if (currentGender !== (savedDetails.gender || 'זכר') || 
                        currentNumber !== (savedDetails.number || 'יחיד')) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// Close details panel with save prompt
function closeDetailsPanel(forceClose = false) {
    if (!forceClose && hasUnsavedChanges()) {
        // Scroll to bottom of panel to show save button
        const panel = document.getElementById('details-panel');
        const saveBtn = document.getElementById('save-details-btn');
        if (saveBtn && panel) {
            setTimeout(() => {
                saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        
        // Ask user if they want to save
        const shouldSave = confirm('יש שינויים שלא נשמרו. האם לשמור את השינויים?');
        if (shouldSave) {
            savePartOfSpeechDetails();
            return;
        }
    }
    
    const panel = document.getElementById('details-panel');
    panel.classList.remove('show');
    document.body.classList.remove('panel-open');
    currentWordId = null;
    currentPartOfSpeechId = null;
}

// Save part of speech details
function savePartOfSpeechDetails() {
    if (!currentWordId || !currentPartOfSpeechId) return;

    const word = words.find(w => w.id === currentWordId);
    if (!word) return;

    const pos = word.getPartOfSpeech(currentPartOfSpeechId);
    if (!pos) return;

    const detailsStructure = getPartOfSpeechDetails(pos.type);
    const bonusStructure = getPartOfSpeechBonus(pos.type);
    const newDetails = {};

    // Save required fields
    Object.keys(detailsStructure).forEach(key => {
        const detail = detailsStructure[key];
        
        // Handle multi-value fields
        if (detail.multi || detail.type === 'multiselect') {
            const wrapper = document.querySelector(`[data-field-key="${key}"]`);
            if (wrapper) {
                const values = [];
                const inputs = wrapper.querySelectorAll('.single-value-item input, .single-value-item select');
                inputs.forEach(input => {
                    if (input.value) {
                        values.push(input.value);
                    }
                });
                if (values.length > 0) {
                    newDetails[key] = values.length === 1 ? values[0] : values;
                }
            }
        }
        // Handle verb forms (multi-select buttons)
        else if (key === 'binyan' && detail.type === 'multiselect') {
            const form = document.getElementById('details-panel-form');
            const selectedButtons = form ? form.querySelectorAll('.verb-form-btn.selected') : [];
            const values = Array.from(selectedButtons).map(btn => btn.dataset.value).filter(v => v);
            if (values.length > 0) {
                newDetails[key] = values.length === 1 ? values[0] : values;
            }
        }
        // Handle verb time buttons
        else if (key === 'time' && pos.type === 'verb') {
            const form = document.getElementById('details-panel-form');
            const selectedButtons = form ? form.querySelectorAll('.verb-time-btn.selected') : [];
            const values = Array.from(selectedButtons).map(btn => btn.dataset.value).filter(v => v);
            if (values.length > 0) {
                newDetails[key] = values.length === 1 ? values[0] : values;
            }
        }
        // Handle verb voice button
        else if (key === 'voice' && pos.type === 'verb') {
            const form = document.getElementById('details-panel-form');
            const selectedBtn = form ? form.querySelector('.verb-voice-btn.selected') : null;
            if (selectedBtn) {
                newDetails[key] = selectedBtn.dataset.value;
            }
        }
        // Skip gender/number - handled separately below
        if (key === 'gender' || key === 'number') {
            return;
        }
        
        // Handle regular select/input
        if (!newDetails[key]) {
            const input = document.getElementById(`detail_${key}`);
            if (input && input.value) {
                newDetails[key] = input.value;
            }
        }
    });
    
    // Handle combined gender/number selector (single selection)
    const genderNumberGroup = document.querySelector('[data-field-key="gender_number"]');
    if (genderNumberGroup && (pos.type === 'noun' || pos.type === 'adjective' || pos.type === 'demonstrative')) {
        const selectedButton = genderNumberGroup.querySelector('.gender-number-btn.selected');
        if (selectedButton) {
            newDetails.gender = selectedButton.dataset.gender;
            newDetails.number = selectedButton.dataset.number;
        } else {
            // Default if nothing selected
            newDetails.gender = 'זכר';
            newDetails.number = 'יחיד';
        }
    }
    
    // Handle definiteness binary buttons
    const definiteBtn = document.getElementById('detail_definiteness_definite');
    const indefiniteBtn = document.getElementById('detail_definiteness_indefinite');
    if (definiteBtn && indefiniteBtn) {
        if (definiteBtn.classList.contains('selected')) {
            newDetails.definiteness = 'מיודע';
        } else if (indefiniteBtn.classList.contains('selected')) {
            newDetails.definiteness = 'לא מיודע';
        } else {
            // Default to 'מיודע' if nothing selected
            newDetails.definiteness = 'מיודע';
        }
    }

    // Save bonus fields
    Object.keys(bonusStructure).forEach(key => {
        const detail = bonusStructure[key];
        
        // Handle multi-checkbox (cases)
        if (detail.type === 'multicheckbox') {
            const values = [];
            detail.options.forEach(option => {
                const checkbox = document.getElementById(`detail_${key}_${option}`);
                if (checkbox && checkbox.checked) {
                    values.push(option);
                }
            });
            if (values.length > 0) {
                newDetails[key] = values;
            }
        }
        // Handle regular select
        else {
            const input = document.getElementById(`detail_${key}`);
            if (input && input.value) {
                newDetails[key] = input.value;
            }
        }
    });

    // Save demonstrative case if dual
    if (pos.type === 'demonstrative' && newDetails.number === 'זוגי') {
        const caseInput = document.getElementById('detail_case');
        if (caseInput && caseInput.value) {
            newDetails.case = caseInput.value;
        }
    } else if (pos.type === 'demonstrative') {
        // Remove case if not dual
        delete newDetails.case;
    }

    word.updatePartOfSpeechDetails(currentPartOfSpeechId, newDetails);

    // Check and update combinations that involve this part of speech
    updateCombinationsForPartOfSpeech(currentWordId, currentPartOfSpeechId);

    // Re-render
    renderSentence();
    
    // Close panel
    closeDetailsPanel();
}

// Update combinations when part of speech details are edited
function updateCombinationsForPartOfSpeech(wordId, posId) {
    // Find all combinations involving this part of speech
    const affectedCombinations = combinations.filter(c => 
        (c.wordId1 === wordId && c.posId1 === posId) ||
        (c.wordId2 === wordId && c.posId2 === posId)
    );
    
    // Re-validate each combination
    affectedCombinations.forEach(comb => {
        const word1 = words.find(w => w.id === comb.wordId1);
        const word2 = words.find(w => w.id === comb.wordId2);
        const pos1 = word1?.getPartOfSpeech(comb.posId1);
        const pos2 = word2?.getPartOfSpeech(comb.posId2);
        
        if (pos1 && pos2) {
            const result = validateCombination(pos1, pos2, comb.wordId1, comb.wordId2, words);
            
            // Update combination status
            comb.complete = result.valid && result.complete;
            comb.type = result.valid && result.complete ? 'valid' : (result.valid ? 'incomplete' : 'invalid');
            
            // If combination is now invalid, remove it
            if (!result.valid) {
                combinations = combinations.filter(c => c !== comb);
            }
        }
    });
}

// Show validation message
function showValidationMessage(message, type = 'info') {
    const container = document.getElementById('validation-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `validation-message ${type}`;
    messageDiv.textContent = message;

    container.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Show persistent incomplete phrase message (orange)
function showIncompleteMessage(message) {
    const container = document.getElementById('validation-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'validation-message warning incomplete-phrase-message';
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
}

// Clear incomplete phrase messages
function clearIncompleteMessages() {
    document.querySelectorAll('.incomplete-phrase-message').forEach(msg => msg.remove());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
