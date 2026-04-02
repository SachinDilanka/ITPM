import { translate } from '@vitalets/google-translate-api';

// Bad words list - translated English text වලට check කරනවා
const BAD_WORDS = [
    'stupid', 'idiot', 'dumb', 'fool', 'hate', 'ugly', 'trash', 'garbage',
    'shut up', 'loser', 'moron', 'pathetic', 'useless', 'worthless', 'disgusting',
    'terrible', 'horrible', 'awful', 'worst', 'suck', 'crap', 'damn', 'hell',
    'bloody', 'rubbish', 'nonsense', 'bullshit', 'shit', 'fuck', 'ass', 'bitch',
    'bastard', 'retard', 'freak', 'weirdo', 'kill', 'die', 'death', 'destroy'
];

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

        // Step 2: Local bad word check on ENGLISH text
        const localCheck = containsBadWords(translatedComment);
        if (localCheck.found) {
            return res.status(400).json({
                success: false,
                message: '🚫 Your comment is harmful. Please write a respectful comment.',
                reason: 'Contains inappropriate language'
            });
        }

        // Step 3: Save translated English comment to req.body
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
