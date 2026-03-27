import { GoogleGenerativeAI } from '@google/generative-ai';
import { translate } from '@vitalets/google-translate-api';

// Bad words list - translated English text වලට check කරනවා
const BAD_WORDS = [
    'stupid', 'idiot', 'dumb', 'fool', 'hate', 'ugly', 'trash', 'garbage',
    'shut up', 'loser', 'moron', 'pathetic', 'useless', 'worthless', 'disgusting',
    'terrible', 'horrible', 'awful', 'worst', 'suck', 'crap', 'damn', 'hell',
    'bloody', 'rubbish', 'nonsense', 'bullshit', 'shit', 'fuck', 'ass', 'bitch',
    'bastard', 'retard', 'freak', 'weirdo', 'kill', 'die', 'death', 'destroy'
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
const containsBadWords = (text) => {
    const lowerText = text.toLowerCase();
    for (const word of BAD_WORDS) {
        if (lowerText.includes(word.toLowerCase())) {
            return { found: true, word };
        }
    }
    return { found: false, word: null };
};

// Free Google Translate (no API key needed)
const translateToEnglish = async (text) => {
    try {
        const result = await translate(text, { to: 'en' });
        return result.text;
    } catch (error) {
        console.log('Translation failed:', error.message);
        return text; // Original text return කරනවා
    }
};

// Gemini harmful content check only (quota save කරනවා)
const checkHarmfulWithGemini = async (genAI, englishText) => {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest'];

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Is the following English comment harmful, offensive, or contains hate speech, profanity, or insults? 

Comment: "${englishText}"

Reply with ONLY a valid JSON object:
{
  "isInappropriate": true or false,
  "reason": "short reason if inappropriate, empty string if appropriate"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            if (error.message?.includes('429') || error.message?.includes('quota')) {
                console.log(`Gemini quota exceeded on ${modelName}.`);
                continue;
            }
            console.log(`Gemini ${modelName} failed: ${error.message}`);
        }
    }
    return null;
};

export const checkInappropriateContent = async (req, res, next) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return next();
        }

        // Step 1: Translate to English (free - no API key needed)
        const translatedComment = await translateToEnglish(comment);
        const isAlreadyEnglish = translatedComment.trim().toLowerCase() === comment.trim().toLowerCase();

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

        // Step 3: Local bad word check on ENGLISH text
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
