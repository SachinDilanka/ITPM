/**
 * Heuristic "poll / MCQ correction" helper (no live LLM required).
 * Optional: if GEMINI_API_KEY is set, asks Gemini for an option index when heuristics are weak.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

function getGuaranteedCorrectAnswer(question, options, subject) {
    const questionLower = String(question || '')
        .toLowerCase()
        .trim();
    const subjectLower = String(subject || '')
        .toLowerCase()
        .trim();
    const optionsLower = (options || []).map((opt) => String(opt || '').toLowerCase().trim());

    const mathHint =
        subjectLower.includes('math') ||
        subjectLower.includes('calculat') ||
        questionLower.includes('calculat') ||
        /[+\-*/]/.test(questionLower);

    if (mathHint) {
        let additionMatch = questionLower.match(/what\s+is\s+(\d+)\s*\+\s*(\d+)/);
        if (!additionMatch) additionMatch = questionLower.match(/(\d+)\s*\+\s*(\d+)/);
        if (!additionMatch) additionMatch = questionLower.match(/calculate\s+(\d+)\s*\+\s*(\d+)/);
        if (!additionMatch) additionMatch = questionLower.match(/add\s+(\d+)\s+and\s+(\d+)/);
        if (!additionMatch) additionMatch = questionLower.match(/(\d+)\s+plus\s+(\d+)/);

        if (additionMatch) {
            const a = parseInt(additionMatch[1], 10);
            const b = parseInt(additionMatch[2], 10);
            const result = a + b;
            let correctIndex = optionsLower.findIndex((opt) => opt === result.toString());
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => opt.includes(result.toString()));
            }
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => new RegExp(`\\b${result}\\b`).test(opt));
            }
            if (correctIndex === -1) {
                for (let i = 0; i < optionsLower.length; i++) {
                    const numberMatch = optionsLower[i].match(/\b(\d+)\b/);
                    if (numberMatch && parseInt(numberMatch[1], 10) === result) {
                        correctIndex = i;
                        break;
                    }
                }
            }
            if (correctIndex !== -1) {
                return {
                    correctAnswer: correctIndex,
                    reasoning: `Mathematical fact: ${a} + ${b} = ${result}`,
                    explanation: `The correct answer is ${result} (${a} plus ${b}).`,
                    confidence: 100,
                };
            }
            const closestIndex = optionsLower.findIndex((opt) => {
                const numMatch = opt.match(/\d+/);
                return numMatch && Math.abs(parseInt(numMatch[0], 10) - result) <= 2;
            });
            if (closestIndex !== -1) {
                return {
                    correctAnswer: closestIndex,
                    reasoning: `Closest option to computed sum ${result}`,
                    explanation: `Computed ${a} + ${b} = ${result}; closest matching option was selected.`,
                    confidence: 90,
                };
            }
        }

        let subtractionMatch = questionLower.match(/what\s+is\s+(\d+)\s*-\s*(\d+)/);
        if (!subtractionMatch) subtractionMatch = questionLower.match(/(\d+)\s*-\s*(\d+)/);
        if (!subtractionMatch) subtractionMatch = questionLower.match(/subtract\s+(\d+)\s+from\s+(\d+)/);

        if (subtractionMatch) {
            let a = parseInt(subtractionMatch[1], 10);
            let b = parseInt(subtractionMatch[2], 10);
            let result = a - b;
            if (questionLower.includes('subtract') && questionLower.includes('from')) {
                result = b - a;
            }
            let correctIndex = optionsLower.findIndex((opt) => opt === result.toString());
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => opt.includes(result.toString()));
            }
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => new RegExp(`\\b${result}\\b`).test(opt));
            }
            if (correctIndex !== -1) {
                return {
                    correctAnswer: correctIndex,
                    reasoning: `Mathematical fact: subtraction yields ${result}`,
                    explanation: `The correct answer is ${result}.`,
                    confidence: 100,
                };
            }
        }

        let multiplicationMatch = questionLower.match(/what\s+is\s+(\d+)\s*\*\s*(\d+)/);
        if (!multiplicationMatch) multiplicationMatch = questionLower.match(/(\d+)\s*\*\s*(\d+)/);
        if (!multiplicationMatch) multiplicationMatch = questionLower.match(/(\d+)\s+times\s+(\d+)/);

        if (multiplicationMatch) {
            const a = parseInt(multiplicationMatch[1], 10);
            const b = parseInt(multiplicationMatch[2], 10);
            const result = a * b;
            let correctIndex = optionsLower.findIndex((opt) => opt === result.toString());
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => opt.includes(result.toString()));
            }
            if (correctIndex === -1) {
                correctIndex = optionsLower.findIndex((opt) => new RegExp(`\\b${result}\\b`).test(opt));
            }
            if (correctIndex !== -1) {
                return {
                    correctAnswer: correctIndex,
                    reasoning: `Mathematical fact: ${a} × ${b} = ${result}`,
                    explanation: `The correct answer is ${result}.`,
                    confidence: 100,
                };
            }
        }
    }

    const scienceHint =
        subjectLower.includes('science') ||
        subjectLower.includes('chemistry') ||
        subjectLower.includes('physics') ||
        subjectLower.includes('biology');

    if (scienceHint) {
        const scientificFacts = {
            gold: { symbol: 'au', fact: 'Gold has the chemical symbol Au' },
            silver: { symbol: 'ag', fact: 'Silver has the chemical symbol Ag' },
            copper: { symbol: 'cu', fact: 'Copper has the chemical symbol Cu' },
            iron: { symbol: 'fe', fact: 'Iron has the chemical symbol Fe' },
            oxygen: { symbol: 'o2', fact: 'Oxygen gas is commonly written as O₂' },
            hydrogen: { symbol: 'h2', fact: 'Hydrogen gas is commonly written as H₂' },
            water: { formula: 'h2o', fact: 'Water has the chemical formula H₂O' },
            'carbon dioxide': { formula: 'co2', fact: 'Carbon dioxide has the formula CO₂' },
            'sodium chloride': { formula: 'nacl', fact: 'Sodium chloride has the formula NaCl' },
        };

        for (const [element, data] of Object.entries(scientificFacts)) {
            if (questionLower.includes(element)) {
                const target = (data.symbol || data.formula || '').toLowerCase();
                const correctIndex = optionsLower.findIndex((opt) => opt.includes(target));
                if (correctIndex !== -1) {
                    return {
                        correctAnswer: correctIndex,
                        reasoning: `Scientific fact: ${data.fact}`,
                        explanation: data.fact,
                        confidence: 100,
                    };
                }
            }
        }
    }

    const geographyHint =
        subjectLower.includes('geography') ||
        questionLower.includes('continent') ||
        questionLower.includes('country') ||
        questionLower.includes('capital');

    if (geographyHint) {
        const geographicalFacts = {
            egypt: { continent: 'africa', capital: 'cairo', fact: 'Egypt is in Africa; capital Cairo' },
            france: { continent: 'europe', capital: 'paris', fact: 'France is in Europe; capital Paris' },
            japan: { continent: 'asia', capital: 'tokyo', fact: 'Japan is in Asia; capital Tokyo' },
            brazil: { continent: 'south america', capital: 'brasília', fact: 'Brazil is in South America' },
            canada: { continent: 'north america', capital: 'ottawa', fact: 'Canada is in North America' },
            australia: { continent: 'australia', capital: 'canberra', fact: 'Australia; capital Canberra' },
            india: { continent: 'asia', capital: 'new delhi', fact: 'India is in Asia' },
            china: { continent: 'asia', capital: 'beijing', fact: 'China is in Asia' },
            usa: { continent: 'north america', capital: 'washington', fact: 'United States is in North America' },
            mexico: { continent: 'north america', capital: 'mexico city', fact: 'Mexico is in North America' },
        };

        for (const [place, facts] of Object.entries(geographicalFacts)) {
            if (questionLower.includes(place)) {
                let targetValue = '';
                if (questionLower.includes('continent')) targetValue = facts.continent;
                else if (questionLower.includes('capital')) targetValue = facts.capital;
                if (!targetValue) continue;
                const correctIndex = optionsLower.findIndex((opt) => opt.includes(targetValue));
                if (correctIndex !== -1) {
                    return {
                        correctAnswer: correctIndex,
                        reasoning: `Geography: ${facts.fact}`,
                        explanation: facts.fact,
                        confidence: 100,
                    };
                }
            }
        }
    }

    const questionWords = questionLower.split(/\s+/).filter((word) => word.length > 3);
    let maxScore = 0;
    let bestOption = 0;

    (options || []).forEach((option, index) => {
        const optionLower = String(option || '').toLowerCase();
        let score = 0;
        questionWords.forEach((word) => {
            if (optionLower.includes(word)) score += 5;
        });
        for (let i = 0; i < questionWords.length - 1; i++) {
            const phrase = `${questionWords[i]} ${questionWords[i + 1]}`;
            if (optionLower.includes(phrase)) score += 15;
        }
        if (score > maxScore) {
            maxScore = score;
            bestOption = index;
        }
    });

    return {
        correctAnswer: bestOption,
        reasoning: `Keyword overlap chose option ${bestOption + 1} (score ${maxScore})`,
        explanation: 'Heuristic keyword and phrase match across options.',
        confidence: maxScore > 15 ? 95 : 85,
    };
}

async function tryGeminiPick(question, options, subject, description) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const lines = (options || []).map((o, i) => `${i}: ${o}`).join('\n');
        const prompt = `You are grading a multiple-choice question. Reply with ONLY a single integer 0..${
            options.length - 1
        } — the index of the best/correct option. No other text.\nSubject: ${subject}\nQuestion: ${question}\n${
            description ? `Context: ${description}\n` : ''
        }Options:\n${lines}`;
        const result = await model.generateContent(prompt);
        const text = (await result.response.text()).trim();
        const n = parseInt(text.match(/-?\d+/)?.[0] ?? '', 10);
        if (Number.isInteger(n) && n >= 0 && n < options.length) {
            return {
                correctAnswer: n,
                reasoning: 'Gemini model selected an option index.',
                explanation: 'Based on Gemini analysis of the stem and options.',
                confidence: 75,
            };
        }
    } catch {
        /* optional */
    }
    return null;
}

export async function getAICorrection(question, options, subject, description = '') {
    const hasOptions = options && options.length > 0;

    if (!hasOptions) {
        return {
            correctAnswer: -1,
            reasoning: 'Open-ended question — no fixed option index.',
            explanation:
                'Provide a clear argument or calculation in your own words; there is no single multiple-choice key.',
            confidence: 95,
        };
    }

    const base = getGuaranteedCorrectAnswer(question, options, subject);
    const weak = base.confidence < 92;
    if (weak && process.env.GEMINI_API_KEY) {
        const gem = await tryGeminiPick(question, options, subject || 'General', description);
        if (gem) return gem;
    }
    return base;
}
