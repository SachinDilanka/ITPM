import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are KnowVerse AI, a friendly and helpful academic assistant for university students.
Your role:
- Answer academic questions across all subjects clearly and concisely.
- Help students understand concepts, solve problems, and study effectively.
- If a question is not academic, politely redirect the student to focus on studies.
- Keep responses well-structured using short paragraphs or bullet points.
- Be encouraging and supportive in tone.
- If you don't know something, say so honestly rather than guessing.
- Do not generate harmful, inappropriate, or misleading content.`;

const MAX_HISTORY = 20;

// @desc    Chat with AI assistant
// @route   POST /api/chatbot
// @access  Private
export const chatWithAI = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        if (message.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Message too long. Please keep it under 2000 characters.',
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'AI service is not configured. Please contact the administrator.',
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const trimmedHistory = history.slice(-MAX_HISTORY);

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood! I\'m KnowVerse AI, ready to help you with your academic questions. How can I assist you today?' }] },
                ...trimmedHistory.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })),
            ],
        });

        const result = await chat.sendMessage(message.trim());
        const reply = result.response.text();

        res.status(200).json({
            success: true,
            data: {
                reply,
            },
        });
    } catch (error) {
        console.error('Chatbot error:', error.message);

        if (error.message?.includes('SAFETY')) {
            return res.status(400).json({
                success: false,
                message: 'Your message was flagged by safety filters. Please rephrase.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'AI service temporarily unavailable. Please try again.',
        });
    }
};
