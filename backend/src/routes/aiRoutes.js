import express from 'express';
import { getAICorrection } from '../services/pollCorrectionService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const defaultOpenAiUrl = 'https://api.openai.com/v1/chat/completions';

const callOpenAiChat = async (messages) => {
    const apiKey = (process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) {
        const err = new Error('AI is not configured (set OPENAI_API_KEY in backend/.env).');
        err.statusCode = 501;
        throw err;
    }

    const url = (process.env.OPENAI_API_URL || defaultOpenAiUrl).trim();
    const model = (process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini').trim();

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.4,
                max_tokens: 700,
            }),
            signal: AbortSignal.timeout(60000),
        });
    } catch (e) {
        const err = new Error(e.message || 'Network error calling OpenAI API');
        err.statusCode = 502;
        throw err;
    }

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch {
        const err = new Error(`OpenAI returned non-JSON (${response.status})`);
        err.statusCode = response.status >= 400 ? response.status : 502;
        throw err;
    }

    if (!response.ok) {
        const message = data?.error?.message || response.statusText || 'OpenAI request failed';
        const err = new Error(message);
        err.statusCode = response.status;
        throw err;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
        const err = new Error('OpenAI returned an empty response.');
        err.statusCode = 502;
        throw err;
    }

    return content.trim();
};

router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'AI Correction Service',
        version: '1.0.0',
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
});

router.post('/correct-poll', async (req, res) => {
    try {
        const { question, options, subject, description } = req.body || {};

        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid input. Question is required.',
            });
        }

        const opts = Array.isArray(options)
            ? options.map((o) => (typeof o === 'string' ? o : o?.text || '')).filter(Boolean)
            : [];

        const hasOptions = opts.length > 0;

        const analysis = await getAICorrection(
            question,
            hasOptions ? opts : [],
            subject || 'General',
            description || ''
        );

        return res.json({
            success: true,
            data: {
                correctAnswer: analysis.correctAnswer,
                confidence: analysis.confidence,
                reasoning: analysis.reasoning,
                explanation: analysis.explanation,
                timestamp: new Date().toISOString(),
                hasOptions,
            },
        });
    } catch (error) {
        console.error('AI correction error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get AI correction. Please try again.',
        });
    }
});

router.post('/chat', protect, async (req, res) => {
    try {
        const question = String(req.body?.message || '').trim();

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required.',
            });
        }

        if (question.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Question is too long (max 2000 characters).',
            });
        }

        const userName = req.user?.name || 'Student';
        const messages = [
            {
                role: 'system',
                content:
                    'You are KnowVerse AI Tutor. Give concise, accurate, student-friendly answers. Use step-by-step format when useful, and mention if you are uncertain.',
            },
            {
                role: 'user',
                content: `Student name: ${userName}\nQuestion: ${question}`,
            },
        ];

        const answer = await callOpenAiChat(messages);

        return res.status(200).json({
            success: true,
            data: {
                answer,
                model: (process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini').trim(),
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('AI chat error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get AI response. Please try again.',
        });
    }
});

export default router;
