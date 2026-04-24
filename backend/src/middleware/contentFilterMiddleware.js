import { translate } from '@vitalets/google-translate-api';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Bad words list - translated English text වලට check කරනවා
const BAD_WORDS = [
    'stupid', 'idiot', 'dumb', 'fool', 'hate', 'ugly', 'trash', 'garbage',
    'shut up', 'loser', 'moron', 'pathetic', 'useless', 'worthless', 'disgusting',
    'terrible', 'horrible', 'awful', 'worst', 'suck', 'crap', 'damn', 'hell',
    'bloody', 'rubbish', 'nonsense', 'bullshit', 'shit', 'fuck', 'ass', 'bitch',
    'bastard', 'retard', 'freak', 'weirdo', 'kill', 'die', 'death', 'destroy'
];

// Sinhala + transliterated abusive keywords (kept short and stem-based on purpose)
const BAD_WORDS_SI = [
    'මෝඩ', 'බූරු', 'ගොන්', 'පක', 'හුත්', 'වේසි', 'පලයන්',
    'moda', 'gon', 'pakaya', 'hutto', 'wesi'
];

// Check for excessive symbols/emojis
const hasExcessiveSymbolsOrEmojis = (text) => {
    // Emoji regex pattern
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    
    // Special symbol regex (excluding normal punctuation)
    const specialSymbolRegex = /[~`!@#$%^&*()_+=\[\]{};:"\|<>/?€£¥₹§¶•ªº]/g;
    
    // Count emojis
    const emojiMatches = text.match(new RegExp(emojiRegex, 'gu')) || [];
    if (emojiMatches.length > 3) {
        return { invalid: true, reason: 'Too many emojis (max 3 allowed)' };
    }
    
    // Count special symbols
    const symbolMatches = text.match(specialSymbolRegex) || [];
    const symbolCount = symbolMatches.length;
    const textLength = text.length;
    
    // If more than 30% of text is symbols, reject
    if (textLength > 0 && (symbolCount / textLength) > 0.3) {
        return { invalid: true, reason: 'Too many special symbols' };
    }
    
    return { invalid: false };
};

// Local bad word check function
const normalizeForMatch = (text) => String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const containsBadWords = (text) => {
    const lowerText = normalizeForMatch(text);
    for (const word of BAD_WORDS) {
        if (lowerText.includes(normalizeForMatch(word))) {
            return { found: true, word };
        }
    }
    return { found: false, word: null };
};

const containsBadWordsSinhala = (text) => {
    const lowerText = normalizeForMatch(text);
    for (const word of BAD_WORDS_SI) {
        if (lowerText.includes(normalizeForMatch(word))) {
            return { found: true, word };
        }
    }
    return { found: false, word: null };
};

// Free Google Translate (no API key needed)
const translateToEnglish = async (text) => {
    try {
        let result = await translate(text, { to: 'en' });
        const autoText = String(result?.text || text).trim();
        const hasSinhalaChars = /[\u0D80-\u0DFF]/u.test(String(text));

        // If auto detection fails for Sinhala, force source language as 'si'.
        if (hasSinhalaChars && autoText.toLowerCase() === String(text).trim().toLowerCase()) {
            try {
                const forced = await translate(text, { from: 'si', to: 'en' });
                if (forced?.text) {
                    result = forced;
                }
            } catch {
                // Ignore and keep auto-detected result.
            }
        }

        return {
            translatedText: result?.text || text,
            detectedLanguage: result?.from?.language?.iso || 'auto'
        };
    } catch (error) {
        console.log('Translation failed:', error.message);
        return {
            translatedText: text,
            detectedLanguage: 'unknown'
        }; // Original text return කරනවා
    }
};

const checkHarmfulWithGemini = async (genAI, text) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a moderation classifier.\n` +
            `Return ONLY JSON with this shape: {"isInappropriate": boolean, "reason": string}.\n` +
            `Classify whether the text contains harassment, hate, abuse, threats, or explicit profanity.\n` +
            `Text: "${String(text).replace(/"/g, '\\"')}"`;

        const result = await model.generateContent(prompt);
        const raw = (await result.response.text()).trim();
        const jsonStart = raw.indexOf('{');
        const jsonEnd = raw.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
            return null;
        }
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        return {
            isInappropriate: Boolean(parsed?.isInappropriate),
            reason: parsed?.reason || ''
        };
    } catch (error) {
        console.log('Gemini moderation skipped:', error.message);
        return null;
    }
};

export const checkInappropriateContent = async (req, res, next) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return next();
        }

        // Step 1: Translate to English (free - no API key needed)
        const { translatedText, detectedLanguage } = await translateToEnglish(comment);
        const translatedComment = String(translatedText || comment).trim();
        const isAlreadyEnglish = String(detectedLanguage).toLowerCase() === 'en';

        console.log(`🌐 Original: "${comment}" → English: "${translatedComment}"`);

        // Step 2: Check for excessive symbols/emojis
        const symbolCheck = hasExcessiveSymbolsOrEmojis(comment);
        if (symbolCheck.invalid) {
            return res.status(400).json({
                success: false,
                message: '🚫 Your comment contains too many symbols or emojis. Please use normal text.',
                reason: symbolCheck.reason
            });
        }

        // Step 3: Local bad word checks on BOTH original and translated text
        const localSinhalaCheck = containsBadWordsSinhala(comment);
        if (localSinhalaCheck.found) {
            return res.status(400).json({
                success: false,
                message: '🚫 Your comment is harmful. Please write a respectful comment.',
                reason: 'Contains inappropriate language'
            });
        }

        const localCheck = containsBadWords(translatedComment);
        if (localCheck.found) {
            return res.status(400).json({
                success: false,
                message: '🚫 Your comment is harmful. Please write a respectful comment.',
                reason: 'Contains inappropriate language'
            });
        }

        // Step 4: Gemini harmful check on ENGLISH text (if API available)
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const analysis = await checkHarmfulWithGemini(genAI, translatedComment);

            if (analysis && analysis.isInappropriate === true) {
                return res.status(400).json({
                    success: false,
                    message: '🚫 Your comment is harmful. Please write a respectful comment.',
                    reason: analysis.reason || 'Harmful content detected'
                });
            }
        }

        // Step 5: Save translated English comment to req.body

        if (!isAlreadyEnglish) {
            req.body.originalComment = comment;          // Original language save
            req.body.comment = translatedComment;         // English translation save
        }

        next();

    } catch (error) {
        console.error('Content filter error:', error.message);
        next();
    }
};
