// Stages/Sentences data structure

const STAGES = {
    workbook: [
        {
            id: '1.1',
            number: '1.1',
            sentence: 'لم تنشر الحكومة كلام رئيس البلدية في الجريدة الجديدة',
            category: 'workbook'
        },
        {
            id: '1.6',
            number: '1.6',
            sentence: 'متى بحث الوزراء الجدد في وضع سيارتي الرئيس؟',
            category: 'workbook'
        },
        {
            id: '1.8',
            number: '1.8',
            sentence: 'في هذا القصر التقى امس الوزيران في محاولة لايجاد حل للازمة',
            category: 'workbook'
        },
        {
            id: '2.1',
            number: '2.1',
            sentence: 'حضر معلمونا الجلسة وهذه مطالبهم',
            category: 'workbook'
        },
        {
            id: '2.02',
            number: '2.02',
            sentence: 'قرار زوال دولتكم مرهون بتنفيذكم مجططاتكم في القدس',
            category: 'workbook'
        },
        {
            id: '2.03',
            number: '2.03',
            sentence: 'مع الاسف الشديد وضعنا الصحي كارثي',
            category: 'workbook'
        },
        {
            id: '2.3',
            number: '2.3',
            sentence: 'هذا الحصار قرصنة دولية واضحة',
            category: 'workbook'
        },
        {
            id: '2.4',
            number: '2.4',
            sentence: 'في هذه اللجنة قاض مشهور',
            category: 'workbook'
        },
        {
            id: '2.9',
            number: '2.9',
            sentence: 'على شفتيه ابتسام مطبوع وفي عينيه بريق ساذج',
            category: 'workbook'
        },
        {
            id: '2.12',
            number: '2.12',
            sentence: 'من ابرز ظاهرات الشخصية اللبنانية ظاهرة الانتفاد',
            category: 'workbook'
        },
        {
            id: '2.13',
            number: '2.13',
            sentence: 'التقدم العلمي جوهره تحرر المجتمع من الوهم والجهل',
            category: 'workbook'
        },
        {
            id: '3.0',
            number: '3.0',
            sentence: 'المقصود هو ان اشتراك الاخوان في هذا المهرجان ممنوع',
            category: 'workbook'
        },
        {
            id: '3.2',
            number: '3.2',
            sentence: 'يعرف الجميع ان هذه الدولة هي اغنى دول العالم.',
            category: 'workbook'
        },
        {
            id: '3.17',
            number: '3.17',
            sentence: 'في راي المراقبين ان ازمة الشرق الاوسط ينبغي ان يبحث فيها الرئيسان في اجتماعهما القريب.',
            category: 'workbook'
        },
        {
            id: 'extra',
            number: 'extra',
            sentence: 'بلغني انه ابتداء من اليوم تزداد اجور السفر في جميع طائرات هذه الشريكة',
            category: 'workbook'
        }
    ],
    midterm: [
        {
            id: '1',
            number: '1',
            sentence: 'ثقوا بانفسكم، غالبا هذا هو الفرق بين الفشل والنخاح',
            category: 'midterm'
        }
    ]
};

// Get all stages sorted by number
function getAllStages() {
    const allStages = [...STAGES.workbook, ...STAGES.midterm];
    // Sort by number (handle numeric and decimal numbers)
    return allStages.sort((a, b) => {
        const numA = parseFloat(a.number);
        const numB = parseFloat(b.number);
        return numA - numB;
    });
}

// Get stage by ID
function getStageById(stageId) {
    const allStages = getAllStages();
    return allStages.find(s => s.id === stageId);
}

// Search stages
function searchStages(query) {
    const allStages = getAllStages();
    const lowerQuery = query.toLowerCase();
    return allStages.filter(stage => 
        stage.number.includes(query) || 
        stage.sentence.toLowerCase().includes(lowerQuery)
    );
}







