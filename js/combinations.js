// Combination rules and validation

// Check adjacency: words must be directly adjacent (no skipping)
function checkAdjacency(wordId1, wordId2, words) {
    const index1 = words.findIndex(w => w.id === wordId1);
    const index2 = words.findIndex(w => w.id === wordId2);
    
    if (index1 === -1 || index2 === -1) return false;
    
    // Only allow direct adjacency (exactly 1 position apart)
    return Math.abs(index1 - index2) === 1;
}

// Calculate definiteness recursively (for Idafa chains, suffix pronouns)
function calculateDefiniteness(word, pos, words, combinations) {
    // Suffix pronouns make noun definite
    if (pos.details.suffixPronoun) {
        return 'מיודע';
    }
    
    // Check if part of Idafa chain
    const idafaConnections = combinations.filter(c => 
        (c.wordId1 === word.id && c.posId1 === pos.id) ||
        (c.wordId2 === word.id && c.posId2 === pos.id)
    ).filter(c => {
        const otherWordId = c.wordId1 === word.id ? c.wordId2 : c.wordId1;
        const otherWord = words.find(w => w.id === otherWordId);
        const otherPos = otherWord?.partsOfSpeech.find(p => 
            p.id === (c.wordId1 === word.id ? c.posId2 : c.posId1)
        );
        return otherPos?.type === 'noun';
    });
    
    if (idafaConnections.length > 0) {
        // In Idafa, the last noun's definiteness determines the chain
        // For now, return the word's own definiteness
        return pos.details.definiteness || 'לא מיודע';
    }
    
    return pos.details.definiteness || 'לא מיודע';
}

// Check if at least one value matches (for homonymy support)
function valuesMatch(value1, value2) {
    const arr1 = Array.isArray(value1) ? value1 : [value1];
    const arr2 = Array.isArray(value2) ? value2 : [value2];
    
    return arr1.some(v1 => arr2.some(v2 => v1 === v2));
}

// Check if arrays have any intersection (for cases)
function arraysIntersect(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    return arr1.some(v => arr2.includes(v));
}

// Check if two parts of speech can be combined
function validateCombination(part1, part2, wordId1, wordId2, words) {
    const type1 = part1.type;
    const type2 = part2.type;

    // Check adjacency first - words must be directly adjacent
    if (wordId1 && wordId2 && words) {
        if (!checkAdjacency(wordId1, wordId2, words)) {
            return {
                valid: false,
                complete: false,
                message: 'צירוף אפשרי רק בין מילים סמוכות זו לזו',
                type: 'invalid'
            };
        }
    }

    // Rule: Demonstrative + Noun (LKR - לוואי כינוי רמז)
    if ((type1 === 'demonstrative' && type2 === 'noun') ||
        (type1 === 'noun' && type2 === 'demonstrative')) {
        return validateDemonstrativeNounMatch(part1, part2, wordId1, wordId2, words);
    }

    // Rule 1: Noun + Adjective - must match in מימי (gender, case, number, definiteness)
    if ((type1 === 'noun' && type2 === 'adjective') || 
        (type1 === 'adjective' && type2 === 'noun')) {
        return validateNounAdjectiveMatch(part1, part2);
    }

    // Rule 2: Noun + Noun (סמיכות) - first must be indefinite
    if (type1 === 'noun' && type2 === 'noun') {
        return validateNounNounMatch(part1, part2);
    }

    // Rule 3: Preposition + Noun/Demonstrative - valid but incomplete until noun added
    if ((type1 === 'preposition' && (type2 === 'noun' || type2 === 'demonstrative')) ||
        ((type1 === 'noun' || type1 === 'demonstrative') && type2 === 'preposition')) {
        const nounPart = type1 === 'noun' || type1 === 'demonstrative' ? part1 : part2;
        const prepPart = type1 === 'preposition' ? part1 : part2;
        
        // If preposition connects to noun, it's complete
        if (nounPart.type === 'noun') {
            return {
                valid: true,
                complete: true,
                message: 'צירוף תקין - מילית יחס + שם עצם',
                type: 'valid'
            };
        }
        
        // Preposition + demonstrative is incomplete
        return {
            valid: true,
            complete: false,
            message: 'צירוף תקין אך לא שלם - חייב להוסיף שם עצם',
            type: 'incomplete'
        };
    }

    // Default: combination not yet implemented
    return {
        valid: false,
        complete: false,
        message: 'צירוף זה לא מוגדר עדיין במערכת',
        type: 'unknown'
    };
}

// Validate demonstrative + noun combination (LKR)
function validateDemonstrativeNounMatch(part1, part2, wordId1, wordId2, words) {
    const demonstrative = part1.type === 'demonstrative' ? part1 : part2;
    const noun = part1.type === 'noun' ? part1 : part2;
    
    // Check Gender, Number match
    if (!valuesMatch(demonstrative.details.gender, noun.details.gender)) {
        return {
            valid: false,
            complete: false,
            message: 'חוסר התאמה במין בין כינוי הרמז לשם העצם',
            type: 'invalid'
        };
    }
    
    if (!valuesMatch(demonstrative.details.number, noun.details.number)) {
        return {
            valid: false,
            complete: false,
            message: 'חוסר התאמה במספר בין כינוי הרמז לשם העצם',
            type: 'invalid'
        };
    }
    
    // Check Case if dual
    if (demonstrative.details.number === 'זוגי' || noun.details.number === 'זוגי') {
        const demoCase = demonstrative.details.cases || demonstrative.details.case;
        const nounCase = noun.details.cases || noun.details.case;
        
        if (demoCase && nounCase && !arraysIntersect(
            Array.isArray(demoCase) ? demoCase : [demoCase],
            Array.isArray(nounCase) ? nounCase : [nounCase]
        )) {
            return {
                valid: false,
                complete: false,
                message: 'חוסר התאמה ביחסה בין כינוי הרמז לשם העצם',
                type: 'invalid'
            };
        }
    }
    
    // Definiteness filter: Block if noun is Indefinite
    const nounDefiniteness = calculateDefiniteness(
        words?.find(w => w.id === (part1.type === 'noun' ? wordId1 : wordId2)),
        noun,
        words || [],
        []
    );
    
    if (nounDefiniteness === 'לא מיודע') {
        return {
            valid: false,
            complete: false,
            message: 'מה אומר לנו סטטוס הלא-מיודע על מבנה המשפט? האם זה צירוף או משפט?',
            type: 'invalid',
            isDemonstrative: true
        };
    }
    
    // Valid connection
    return {
        valid: true,
        complete: true,
        message: 'צירוף תקין - כינוי רמז + שם עצם',
        type: 'valid',
        isDemonstrative: true
    };
}

// Validate noun-adjective combination (מימי match)
function validateNounAdjectiveMatch(part1, part2) {
    const noun = part1.type === 'noun' ? part1 : part2;
    const adjective = part1.type === 'adjective' ? part1 : part2;

    const requiredFields = ['gender', 'number', 'definiteness'];
    const mismatches = [];

    for (const field of requiredFields) {
        if (noun.details[field] && adjective.details[field]) {
            // Support homonymy: check if at least one value matches
            if (!valuesMatch(noun.details[field], adjective.details[field])) {
                mismatches.push(field);
            }
        } else if (!noun.details[field] || !adjective.details[field]) {
            // Missing required detail
            return {
                valid: false,
                complete: false,
                message: `חסרים פרטים נדרשים (${field})`,
                type: 'incomplete'
            };
        }
    }
    
    // Check cases if both have cases (support homonymy)
    const nounCases = noun.details.cases || noun.details.case;
    const adjCases = adjective.details.cases || adjective.details.case;
    if (nounCases && adjCases) {
        const nounCasesArr = Array.isArray(nounCases) ? nounCases : [nounCases];
        const adjCasesArr = Array.isArray(adjCases) ? adjCases : [adjCases];
        
        if (!arraysIntersect(nounCasesArr, adjCasesArr)) {
            mismatches.push('cases');
        }
    }

    if (mismatches.length > 0) {
        const fieldNames = {
            gender: 'מין',
            case: 'יחסה',
            number: 'מספר',
            definiteness: 'יידוע'
        };
        const mismatchNames = mismatches.map(f => fieldNames[f] || f).join(', ');
        return {
            valid: false,
            complete: false,
            message: `חוסר התאמה ב${mismatchNames}`,
            type: 'invalid'
        };
    }

    return {
        valid: true,
        complete: true,
        message: 'צירוף תקין - מימי תואמים',
        type: 'valid'
    };
}

// Validate noun-noun combination (סמיכות)
function validateNounNounMatch(part1, part2) {
    // First noun must be indefinite for סמיכות
    if (part1.details.definiteness === 'מיודע') {
        return {
            valid: false,
            complete: false,
            message: 'לסמיכות, שם העצם הראשון חייב להיות לא מיודע',
            type: 'invalid'
        };
    }

    // Check if details are provided
    if (!part1.details.definiteness) {
        return {
            valid: false,
            complete: false,
            message: 'חסרים פרטים נדרשים (יידוע)',
            type: 'incomplete'
        };
    }

    return {
        valid: true,
        complete: true,
        message: 'צירוף תקין - תבנית סמיכות',
        type: 'valid'
    };
}

// Get combination type description
function getCombinationTypeDescription(part1, part2) {
    const type1 = part1.type;
    const type2 = part2.type;

    if ((type1 === 'noun' && type2 === 'adjective') || 
        (type1 === 'adjective' && type2 === 'noun')) {
        return 'שם עצם + שם תואר';
    }

    if (type1 === 'noun' && type2 === 'noun') {
        return 'שם עצם + שם עצם (סמיכות)';
    }

    if ((type1 === 'preposition' && type2 === 'demonstrative') ||
        (type1 === 'demonstrative' && type2 === 'preposition')) {
        return 'מילית יחס + כינוי רמז';
    }

    return 'צירוף אחר';
}

