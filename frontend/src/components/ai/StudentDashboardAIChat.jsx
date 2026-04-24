import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { postDashboardAiChatApi } from '../../api/aiApi';

const starterPrompts = [
    'Explain this semester\'s hardest concept in simple Sinhala + English.',
    'Give me a 5-day study plan for exams.',
    'What is the best way to memorize theory subjects?',
];

const StudentDashboardAIChat = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRef = useRef(null);
    const listRef = useRef(null);

    const canSend = useMemo(() => {
        const text = input.trim();
        return text.length > 0 && text.length <= 2000 && !loading;
    }, [input, loading]);

    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, loading]);

    useEffect(() => {
        const onEsc = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [open]);

    const askQuestion = async (value) => {
        const question = String(value || '').trim();
        if (!question || loading) return;

        setError('');
        setLoading(true);
        const userMessage = { role: 'user', text: question, id: `u-${Date.now()}` };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        try {
            const res = await postDashboardAiChatApi(question);
            const answer =
                res?.data?.data?.answer ||
                res?.data?.answer ||
                'I could not generate an answer right now. Please try again.';

            const botMessage = {
                role: 'assistant',
                text: String(answer).trim(),
                id: `a-${Date.now()}`,
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setError(err?.response?.data?.message || 'AI request failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        if (!canSend) return;
        await askQuestion(input);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? 'Close AI chat' : 'Open AI chat'}
                title={open ? 'Close AI chat' : 'Ask AI'}
                style={{
                    position: 'fixed',
                    right: 24,
                    bottom: 24,
                    zIndex: 1200,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: '1px solid rgba(108,99,255,0.55)',
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.95), rgba(0,210,255,0.9))',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 24px rgba(7, 12, 38, 0.45)',
                    cursor: 'pointer',
                }}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-modal="false"
                    aria-label="AI chat panel"
                    style={{
                        position: 'fixed',
                        right: 24,
                        bottom: 90,
                        width: 'min(92vw, 380px)',
                        height: 'min(72vh, 560px)',
                        zIndex: 1200,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 16,
                        border: '1px solid rgba(108,99,255,0.25)',
                        background: 'linear-gradient(180deg, rgba(19, 24, 54, 0.98), rgba(14, 18, 44, 0.98))',
                        boxShadow: '0 24px 40px rgba(0, 0, 0, 0.45)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: '0.9rem 1rem',
                            borderBottom: '1px solid rgba(108,99,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <Bot size={16} color='var(--primary-light)' />
                            <strong style={{ fontSize: '0.92rem' }}>KnowVerse AI Tutor</strong>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div
                        ref={listRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                        }}
                    >
                        {messages.length === 0 && (
                            <>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
                                    Ask anything about studies, notes, exams, or concepts.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {starterPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => askQuestion(prompt)}
                                            disabled={loading}
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid rgba(108,99,255,0.28)',
                                                background: 'rgba(108,99,255,0.12)',
                                                color: 'var(--text-secondary)',
                                                borderRadius: 10,
                                                padding: '0.55rem 0.65rem',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '88%',
                                    padding: '0.55rem 0.65rem',
                                    borderRadius: 12,
                                    fontSize: '0.84rem',
                                    lineHeight: 1.45,
                                    whiteSpace: 'pre-wrap',
                                    background:
                                        msg.role === 'user'
                                            ? 'linear-gradient(135deg, rgba(108,99,255,0.85), rgba(0,210,255,0.75))'
                                            : 'rgba(255,255,255,0.06)',
                                    border:
                                        msg.role === 'user'
                                            ? '1px solid rgba(108,99,255,0.45)'
                                            : '1px solid rgba(255,255,255,0.12)',
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                AI is thinking...
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ color: '#fca5a5', fontSize: '0.78rem', padding: '0 0.9rem 0.6rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} style={{ padding: '0.8rem', borderTop: '1px solid rgba(108,99,255,0.2)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                maxLength={2000}
                                style={{
                                    flex: 1,
                                    borderRadius: 10,
                                    border: '1px solid rgba(108,99,255,0.35)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.84rem',
                                    padding: '0.55rem 0.65rem',
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                aria-label="Send question"
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    border: '1px solid rgba(108,99,255,0.55)',
                                    background: canSend
                                        ? 'linear-gradient(135deg, rgba(108,99,255,0.95), rgba(0,210,255,0.9))'
                                        : 'rgba(255,255,255,0.08)',
                                    color: canSend ? '#fff' : 'var(--text-muted)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: canSend ? 'pointer' : 'not-allowed',
                                }}
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default StudentDashboardAIChat;
